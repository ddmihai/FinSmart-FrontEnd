import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'

type Account = { _id: string; type: string }
type Tx = { _id: string; name: string; amount: number; type: string; createdAt: string }

export default function Transactions() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState<string>('')
  const [rows, setRows] = useState<Tx[]>([])
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  useEffect(() => {
    (async () => {
      const a = await api.get('/api/accounts')
      setAccounts(a.data)
      const first = a.data[0]?._id || ''
      setAccountId(first)
    })()
  }, [])

  const load = async () => {
    if (!accountId) return
    const r = await api.get('/api/transactions', { params: { accountId, q, from, to } })
    setRows(r.data)
  }
  useEffect(() => { load() }, [accountId])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <div className="grid gap-2 md:grid-cols-4">
        <select className="input" value={accountId} onChange={e => setAccountId(e.target.value)}>
          {accounts.map(a => <option key={a._id} value={a._id}>{a.type}</option>)}
        </select>
        <input className="input" placeholder="Search name" value={q} onChange={e => setQ(e.target.value)} />
        <input className="input" type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <input className="input" type="date" value={to} onChange={e => setTo(e.target.value)} />
        <div className="md:col-span-4">
          <button className="btn" onClick={load}>Search</button>
          <a className="btn ml-2" href={`/api/statements/download?accountId=${accountId}`} target="_blank">Download PDF</a>
        </div>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-right px-3 py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2">{r.createdAt.slice(0,10)}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className={`px-3 py-2 text-right ${r.type.includes('expense') || r.type.includes('out') ? 'text-red-600' : 'text-green-600'}`}>{r.type.includes('expense') || r.type.includes('out') ? '-' : '+'}£{(r.amount/100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

