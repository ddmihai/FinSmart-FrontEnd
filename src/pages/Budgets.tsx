import { useEffect, useState } from 'react'
import api from '../lib/api'
import { parsePoundsToPence } from '../lib/money'
import Modal from '../components/Modal'

type Usage = Record<string, { limit: number; spent: number }>
type Budget = { _id: string; category: string; limit: number }

export default function Budgets() {
  const [usage, setUsage] = useState<Usage>({})
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [category, setCategory] = useState('Food')
  const [limit, setLimit] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const load = async () => {
    const r = await api.get('/api/budgets/usage')
    setUsage(r.data)
    const b = await api.get('/api/budgets')
    setBudgets(b.data)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    try {
      setErr(null)
      const p = parsePoundsToPence(limit)
      if (p == null) throw new Error('Enter a valid limit (e.g., 250.00)')
      await api.post('/api/budgets', { category, limit: p })
      setCategory('')
      setLimit('')
      await load()
      setToast('Budget created')
      setTimeout(()=>setToast(null), 2000)
    } catch (e: any) { setErr(e?.message || e.response?.data?.error || 'Failed') }
  }

  const update = async (id: string, newLimitStr: string) => {
    try {
      const p = parsePoundsToPence(newLimitStr)
      if (p == null) throw new Error('Invalid')
      await api.patch(`/api/budgets/${id}`, { limit: p })
      await load()
      setToast('Budget updated')
      setTimeout(()=>setToast(null), 2000)
    } catch {}
  }

  const remove = async (id: string) => {
    await api.delete(`/api/budgets/${id}`)
    await load()
    setToast('Budget deleted')
    setTimeout(()=>setToast(null), 2000)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Budgets</h1>
      <div className="card p-4 flex flex-wrap gap-2 items-center">
        {err && <div className="text-sm text-red-600 w-full">{err}</div>}
        <input className="input max-w-xs" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        <input className="input max-w-xs" type="number" step="0.01" min={0} placeholder="Limit (£)" value={limit} onChange={e => setLimit(e.target.value)} />
        <button className="btn" onClick={save}>Save</button>
      </div>
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="px-4 py-2 rounded-lg shadow-md bg-gray-900 text-white">{toast}</div>
        </div>
      )}
      {/** Delete confirm modal for mobile Safari where window.confirm can be blocked */}
      {/** We render this after the toast block for z-order */}
      {/* @ts-ignore Modal is a simple client component */}
      <Modal open={Boolean((confirmId as any))} onClose={() => setConfirmId(null)} title="Delete budget?">
        <div className="space-y-3">
          <p className="text-sm opacity-80">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button className="btn" onClick={() => { if (confirmId) remove(confirmId); setConfirmId(null) }}>Delete</button>
            <button className="btn" onClick={() => setConfirmId(null)}>Cancel</button>
          </div>
        </div>
      </Modal>
      <div className="card p-4">
        <h2 className="font-semibold mb-2">Current Budgets</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left px-3 py-2">Category</th>
              <th className="text-left px-3 py-2">Limit (£)</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(b => (
              <tr key={b._id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2">{b.category}</td>
                <td className="px-3 py-2">
                  <input className="input max-w-[140px]" defaultValue={(b.limit/100).toFixed(2)} onBlur={e => update(b._id, e.target.value)} />
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="btn" onClick={() => setConfirmId(b._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Object.entries(usage).map(([cat, u]) => (
          <div key={cat} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{cat}</div>
              <div className="text-sm opacity-80">Limit £{(u.limit/100).toFixed(2)}</div>
            </div>
            <div className="mt-3">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className={`h-2 rounded-full ${u.spent > u.limit ? 'bg-red-600' : 'bg-blue-600'}`} style={{ width: `${Math.min(100, (u.spent / Math.max(1,u.limit))*100)}%` }} />
              </div>
              <div className="mt-1 text-sm opacity-80">Spent £{(u.spent/100).toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
