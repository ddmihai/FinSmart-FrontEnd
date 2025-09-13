import { FormEvent, useEffect, useState } from 'react'
import api from '../lib/api'
import { parsePoundsToPence } from '../lib/money'
import { isValidAccountNumber, isValidSortCode, required } from '../lib/validation'
import Modal from '../components/Modal'
import Progress from '../components/Progress'

type Account = { _id: string; type: string; balance: number; sortCode: string; accountNumber: string }
type Tx = { _id: string; name: string; amount: number; type: string; createdAt: string }

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [recent, setRecent] = useState<Tx[]>([])
  const [goals, setGoals] = useState<Array<{ _id: string; name: string; target: number; saved: number }>>([])
  const [accountId, setAccountId] = useState<string>('')
  const [open, setOpen] = useState<null | 'deposit' | 'expense' | 'income' | 'transfer'>(null)
  const [form, setForm] = useState<any>({ amount: '', name: '', note: '', toName: '', toSortCode: '', toAccountNumber: '' })
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const a = await api.get('/api/accounts')
      setAccounts(a.data)
      if (a.data[0]) setAccountId(a.data[0]._id)
      const g = await api.get('/api/goals')
      setGoals(g.data)
    })()
  }, [])

  useEffect(() => {
    (async () => {
      if (!accountId) return
      const t = await api.get(`/api/transactions?accountId=${accountId}`)
      setRecent(t.data.slice(0, 5))
      const a = await api.get('/api/accounts')
      setAccounts(a.data)
    })()
  }, [accountId])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!accounts[0] && !accountId) return
    const accId = accountId || accounts[0]._id
    try {
      setErr(null)
      const pence = parsePoundsToPence(form.amount)
      if (pence == null) throw new Error('Enter a valid amount (e.g., 12.34)')
      if (open === 'income' || open === 'expense') {
        if (!required(form.name, 2)) throw new Error('Name is required')
      }
      if (open === 'transfer') {
        if (!required(form.toName, 2)) throw new Error('Recipient name required')
        if (!isValidSortCode(form.toSortCode)) throw new Error('Sort code must be like 12-34-56')
        if (!isValidAccountNumber(form.toAccountNumber)) throw new Error('Account number must be 8 digits')
      }
      if (open === 'deposit') await api.post('/api/transactions/deposit', { accountId: accId, amount: pence, note: form.note })
      if (open === 'income') await api.post('/api/transactions/income', { accountId: accId, amount: pence, name: form.name, note: form.note })
      if (open === 'expense') await api.post('/api/transactions/expense', { accountId: accId, amount: pence, name: form.name, note: form.note })
      if (open === 'transfer') await api.post('/api/transfers/send', { fromAccountId: accId, toName: form.toName, toSortCode: form.toSortCode, toAccountNumber: form.toAccountNumber, amount: pence, reference: form.note })
      setOpen(null)
      const t = await api.get(`/api/transactions?accountId=${accId}`)
      setRecent(t.data.slice(0, 5))
      const a = await api.get('/api/accounts')
      setAccounts(a.data)
    } catch (err: any) {
      setErr(err?.message || err.response?.data?.error || 'Operation failed')
    }
  }

  return (
    <>
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <div className="mb-2">
        <select className="input max-w-xs" value={accountId} onChange={e => setAccountId(e.target.value)}>
          {accounts.map(a => <option key={a._id} value={a._id}>{a.type} — {a.sortCode} {a.accountNumber}</option>)}
        </select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {accounts.filter(a => a._id === (accountId || (accounts[0]?._id || ''))).map(a => (
          <div key={a._id} className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm opacity-80">{a.type}</div>
                <div className="text-2xl font-semibold">£{(a.balance/100).toFixed(2)}</div>
              </div>
              <div className="text-sm text-right opacity-80">
                <div>{a.sortCode}</div>
                <div>{a.accountNumber}</div>
              </div>
            </div>
            <div className="mt-3 flex gap-2 flex-wrap">
              <button className="btn" onClick={() => { setOpen('deposit'); setForm({ amount: '', note: '' }) }}>Deposit</button>
              <button className="btn" onClick={() => { setOpen('transfer'); setForm({ amount: '', toName: '', toSortCode: '', toAccountNumber: '', note: '' }) }}>Transfer</button>
              <button className="btn" onClick={() => { setOpen('income'); setForm({ amount: '', name: '', note: '' }) }}>Income</button>
              <button className="btn" onClick={() => { setOpen('expense'); setForm({ amount: '', name: '', note: '' }) }}>Expense</button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Recent transactions</h2>
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {recent.map(t => (
            <li key={t._id} className="py-2 flex items-center justify-between">
              <span>{t.name}</span>
              <span className={t.type.includes('expense') || t.type.includes('out') ? 'text-red-600' : 'text-green-600'}>
                {t.type.includes('expense') || t.type.includes('out') ? '-' : '+'}£{(t.amount/100).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-4">
        <h2 className="font-semibold mb-2">Savings Goals</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map(g => (
            <div key={g._id} className="border rounded p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">{g.name}</div>
                <div className="text-sm opacity-80">£{(g.saved/100).toFixed(2)} / £{(g.target/100).toFixed(2)}</div>
              </div>
              <div className="mt-2"><Progress value={g.saved} max={g.target} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Modal open={!!open} onClose={() => setOpen(null)} title={open ? open[0].toUpperCase() + open.slice(1) : ''}>
      <form onSubmit={submit} className="space-y-3">
        {err && <div className="text-sm text-red-600">{err}</div>}
        {(open === 'income' || open === 'expense') && (
          <input className="input" placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} required />
        )}
        {open === 'transfer' && (
          <>
            <input className="input" placeholder="Recipient name" value={form.toName || ''} onChange={e => setForm({ ...form, toName: e.target.value })} required />
            <input className="input" placeholder="Sort code (12-34-56)" pattern="\d{2}-\d{2}-\d{2}" value={form.toSortCode || ''} onChange={e => setForm({ ...form, toSortCode: e.target.value })} required />
            <input className="input" placeholder="Account number (8 digits)" pattern="\d{8}" value={form.toAccountNumber || ''} onChange={e => setForm({ ...form, toAccountNumber: e.target.value })} required />
          </>
        )}
        <input className="input" type="number" step="0.01" min={0.01} placeholder="Amount (£)" value={form.amount || ''} onChange={e => setForm({ ...form, amount: e.target.value })} required />
        <input className="input" placeholder="Note / Reference (optional)" value={form.note || ''} onChange={e => setForm({ ...form, note: e.target.value })} />
        <button className="btn w-full" type="submit">Submit</button>
      </form>
    </Modal>
    </>
  )
}
