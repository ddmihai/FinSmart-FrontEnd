import { useEffect, useState } from 'react'
import api from '../lib/api'
import { parsePoundsToPence } from '../lib/money'
import Progress from '../components/Progress'

type Goal = { _id: string; name: string; target: number; saved: number }
type Account = { _id: string; type: string }

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [form, setForm] = useState({ name: '', target: '' })
  const [deposit, setDeposit] = useState<{ goalId: string; accountId: string; amount: string }>({ goalId: '', accountId: '', amount: '' })
  const [err, setErr] = useState<string | null>(null)

  const load = async () => {
    const g = await api.get('/api/goals')
    setGoals(g.data)
    const a = await api.get('/api/accounts')
    setAccounts(a.data)
    if (a.data[0]) setDeposit(d => ({ ...d, accountId: a.data[0]._id }))
  }
  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      setErr(null)
      const target = parsePoundsToPence(form.target)
      if (target == null) throw new Error('Enter a valid target')
      await api.post('/api/goals', { name: form.name, target })
      setForm({ name: '', target: '' })
      await load()
    } catch (e: any) { setErr(e?.message || e.response?.data?.error || 'Failed') }
  }

  const doDeposit = async () => {
    try {
      const amt = parsePoundsToPence(deposit.amount)
      if (amt == null) throw new Error('Enter a valid amount')
      await api.post(`/api/goals/${deposit.goalId}/deposit`, { accountId: deposit.accountId, amount: amt })
      setDeposit({ goalId: '', accountId: deposit.accountId, amount: '' })
      await load()
    } catch (e: any) { setErr(e?.message || e.response?.data?.error || 'Failed') }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Savings Goals</h1>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div className="card p-4 grid gap-2 md:grid-cols-3">
        <input className="input" placeholder="Goal name" value={form.name} onChange={e=>setForm({ ...form, name: e.target.value })} />
        <input className="input" placeholder="Target (£)" type="number" step="0.01" min={0.01} value={form.target} onChange={e=>setForm({ ...form, target: e.target.value })} />
        <button className="btn" onClick={create}>Create Goal</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {goals.map(g => (
          <div key={g._id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">{g.name}</div>
              <div className="text-sm opacity-80">£{(g.saved/100).toFixed(2)} / £{(g.target/100).toFixed(2)}</div>
            </div>
            <div className="mt-3"><Progress value={g.saved} max={g.target} /></div>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <select className="input" value={deposit.goalId === g._id ? deposit.accountId : (accounts[0]?._id || '')} onChange={e=>setDeposit({ goalId: g._id, accountId: e.target.value, amount: deposit.amount })}>
                {accounts.map(a => <option key={a._id} value={a._id}>{a.type}</option>)}
              </select>
              <input className="input" placeholder="Amount (£)" type="number" step="0.01" min={0.01} value={deposit.goalId === g._id ? deposit.amount : ''} onChange={e=>setDeposit({ goalId: g._id, accountId: deposit.accountId || (accounts[0]?._id || ''), amount: e.target.value })} />
              <button className="btn" onClick={doDeposit}>Deposit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

