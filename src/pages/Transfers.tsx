import { useEffect, useState } from 'react'
import api from '../lib/api'
import { parsePoundsToPence } from '../lib/money'
import { isValidAccountNumber, isValidSortCode, required } from '../lib/validation'

type Account = { _id: string; type: string }
type Recipient = { _id: string; name: string; sortCode: string; accountNumber: string; count: number; lastUsedAt: string }

export default function Transfers() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fromAccountId, setFromAccountId] = useState('')
  const [tab, setTab] = useState<'send'|'frequent'|'find'>('send')
  const [form, setForm] = useState<any>({ toName: '', toSortCode: '', toAccountNumber: '', amount: '', reference: '' })
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [query, setQuery] = useState('')
  const [result, setResult] = useState<any | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      const a = await api.get('/api/accounts')
      setAccounts(a.data)
      const first = a.data[0]?._id || ''
      setFromAccountId(first)
      await loadRecipients()
    })()
  }, [])

  const loadRecipients = async () => {
    const r = await api.get('/api/transfers/recipients')
    setRecipients(r.data)
  }

  const send = async () => {
    try {
      setErr(null)
      if (!required(form.toName, 2)) throw new Error('Recipient name required')
      if (!isValidSortCode(form.toSortCode)) throw new Error('Sort code must be like 12-34-56')
      if (!isValidAccountNumber(form.toAccountNumber)) throw new Error('Account number must be 8 digits')
      const pence = parsePoundsToPence(form.amount)
      if (pence == null) throw new Error('Enter a valid amount (e.g., 12.34)')
      await api.post('/api/transfers/send', { fromAccountId, toName: form.toName, toSortCode: form.toSortCode, toAccountNumber: form.toAccountNumber, amount: pence, reference: form.reference })
      alert('Sent!')
      setForm({ toName: '', toSortCode: '', toAccountNumber: '', amount: '', reference: '' })
      await loadRecipients()
    } catch (e: any) {
      setErr(e?.message || e.response?.data?.error || 'Transfer failed')
    }
  }

  const search = async () => {
    try {
      let r
      if (query.includes('@')) r = await api.get('/api/transfers/find-user', { params: { email: query } })
      else r = await api.get('/api/transfers/find-user', { params: { name: query } })
      setResult(r.data)
    } catch (e: any) {
      setResult(null)
      alert(e.response?.data?.error || 'No user found')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transfers</h1>
      <div className="flex gap-2">
        <button className={`btn ${tab==='send'?'':'opacity-70'}`} onClick={()=>setTab('send')}>Send</button>
        <button className={`btn ${tab==='frequent'?'':'opacity-70'}`} onClick={()=>setTab('frequent')}>Frequently Paid</button>
        <button className={`btn ${tab==='find'?'':'opacity-70'}`} onClick={()=>setTab('find')}>Find User</button>
      </div>

      {tab==='send' && (
        <div className="card p-4 space-y-3">
          <select className="input" value={fromAccountId} onChange={e=>setFromAccountId(e.target.value)}>
            {accounts.map(a => <option key={a._id} value={a._id}>{a.type}</option>)}
          </select>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <input className="input" placeholder="Recipient name" value={form.toName} onChange={e=>setForm({...form, toName: e.target.value})} />
          <input className="input" placeholder="Sort code (12-34-56)" pattern="\d{2}-\d{2}-\d{2}" value={form.toSortCode} onChange={e=>setForm({...form, toSortCode: e.target.value})} />
          <input className="input" placeholder="Account number (8 digits)" pattern="\d{8}" value={form.toAccountNumber} onChange={e=>setForm({...form, toAccountNumber: e.target.value})} />
          <input className="input" type="number" step="0.01" min={0.01} placeholder="Amount (£)" value={form.amount} onChange={e=>setForm({...form, amount: e.target.value})} />
          <input className="input" placeholder="Reference (optional)" value={form.reference} onChange={e=>setForm({...form, reference: e.target.value})} />
          <button className="btn" onClick={send}>Send money</button>
        </div>
      )}

      {tab==='frequent' && (
        <div className="card p-4">
          <ul className="space-y-2">
            {recipients.map(r => (
              <li key={r._id} className="border rounded p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-sm opacity-80">{r.sortCode} • {r.accountNumber} — {r.count}x</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn" onClick={() => { setTab('send'); setForm({ ...form, toName: r.name, toSortCode: r.sortCode, toAccountNumber: r.accountNumber }) }}>Transfer again</button>
                  <button className="btn" onClick={async () => { await api.delete(`/api/transfers/recipients/${r._id}`); await loadRecipients() }}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tab==='find' && (
        <div className="card p-4 space-y-3">
          <input className="input" placeholder="Search by email or name" value={query} onChange={e=>setQuery(e.target.value)} />
          <button className="btn" onClick={search}>Find</button>
          {result && (
            <div className="mt-3 border rounded p-3">
              <div className="font-medium">{result.user.name} ({result.user.email})</div>
              {result.account ? (
                <div className="text-sm opacity-80">{result.account.sortCode} • {result.account.accountNumber}</div>
              ) : (
                <div className="text-sm opacity-80">No public account details</div>
              )}
              {result.account && <button className="btn mt-2" onClick={() => { setTab('send'); setForm({ ...form, toName: result.user.name, toSortCode: result.account.sortCode, toAccountNumber: result.account.accountNumber }) }}>Use recipient</button>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
