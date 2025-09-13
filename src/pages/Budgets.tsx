import { useEffect, useState } from 'react'
import api from '../lib/api'

type Usage = Record<string, { limit: number; spent: number }>

export default function Budgets() {
  const [usage, setUsage] = useState<Usage>({})
  const [category, setCategory] = useState('Food')
  const [limit, setLimit] = useState(0)

  const load = async () => {
    const r = await api.get('/api/budgets/usage')
    setUsage(r.data)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    await api.post('/api/budgets', { category, limit })
    setCategory('')
    setLimit(0)
    await load()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Budgets</h1>
      <div className="card p-4 flex flex-wrap gap-2 items-center">
        <input className="input max-w-xs" placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
        <input className="input max-w-xs" type="number" min={0} placeholder="Limit (pence)" value={limit} onChange={e => setLimit(parseInt(e.target.value||'0'))} />
        <button className="btn" onClick={save}>Save</button>
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

