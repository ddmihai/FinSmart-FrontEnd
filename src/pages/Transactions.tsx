import { useEffect, useState } from 'react'
import api, { apiBaseUrl } from '../lib/api'
import Modal from '../components/Modal'
import { parsePoundsToPence, formatPenceToPounds } from '../lib/money'
import { required } from '../lib/validation'
import { Calendar, Search as SearchIcon, PlusCircle, FileDown, FileSpreadsheet, Share2, Eye, EyeOff, ShieldBan, History as HistoryIcon, Trash2, Undo2 } from 'lucide-react'

type Account = { _id: string; type: string }
type Tx = { _id: string; name: string; amount: number; type: string; createdAt: string; note?: string; category?: string }
type Budget = { _id: string; category: string; limit: number }

export default function Transactions() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState<string>('')
  const [rows, setRows] = useState<Tx[]>([])
  const [q, setQ] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [expense, setExpense] = useState<any>({ name: '', category: '', amount: '', note: '' })
  const [expenseErr, setExpenseErr] = useState<string | null>(null)
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [flagOpen, setFlagOpen] = useState<string | null>(null)
  const [includeHidden, setIncludeHidden] = useState(false)
  const [hiddenOnly, setHiddenOnly] = useState(false)
  const [blocked, setBlocked] = useState<any[]>([])
  const [blockedOpen, setBlockedOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [editTx, setEditTx] = useState<{ id: string; name: string; category: string; note: string } | null>(null)

  useEffect(() => {
    (async () => {
      const a = await api.get('/api/accounts')
      setAccounts(a.data)
      const first = a.data[0]?._id || ''
      setAccountId(first)
      // Load available budget categories for the dropdown
      try {
        const b = await api.get('/api/budgets')
        setBudgets(b.data || [])
      } catch {/* ignore if budgets API unavailable */}
    })()
  }, [])

  const load = async () => {
    if (!accountId) return
    const r = await api.get('/api/transactions', { params: { accountId, q, from, to, includeHidden: includeHidden ? 1 : undefined, hiddenOnly: hiddenOnly ? 1 : undefined } })
    setRows(r.data)
    try { const bl = await api.get('/api/transactions/blocked'); setBlocked(bl.data) } catch {}
    try { const h = await api.get('/api/transactions/history'); setHistory(h.data) } catch {}
  }
  useEffect(() => { load() }, [accountId])
  useEffect(() => { load() }, [includeHidden, hiddenOnly])

  const downloadPdf = async () => {
    if (!accountId) return
    try {
      const res = await api.get('/api/statements/download', { params: { accountId }, responseType: 'blob' })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'statement.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e: any) {
      alert(e.response?.data?.error || 'Download failed')
    }
  }

  const addExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accountId) return
    try {
      setExpenseErr(null)
      if (!required(expense.name, 2)) throw new Error('Name is required')
      const pence = parsePoundsToPence(expense.amount)
      if (pence == null) throw new Error('Enter a valid amount (e.g., 12.34)')
      await api.post('/api/transactions/expense', { accountId, amount: pence, name: expense.name, category: expense.category || undefined, note: expense.note || undefined })
      setExpenseOpen(false)
      setExpense({ name: '', category: '', amount: '', note: '' })
      await load()
    } catch (err: any) {
      setExpenseErr(err?.message || err.response?.data?.error || 'Failed to add expense')
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Transactions</h1>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm opacity-80 mb-1">Account</label>
          <select className="input" value={accountId} onChange={e => setAccountId(e.target.value)}>
          {accounts.map(a => <option key={a._id} value={a._id}>{a.type}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm opacity-80 mb-1">Search</label>
          <div className="relative">
            <input className="input pr-10" placeholder="Search name" value={q} onChange={e => setQ(e.target.value)} />
            <SearchIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm opacity-80 mb-1">From date</label>
          <div className="relative">
            <input className="input pr-10 max-w-[160px] sm:max-w-none" type="date" value={from} onChange={e => setFrom(e.target.value)} />
            {!from && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-60 sm:hidden">YYYY-MM-DD</span>}
            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm opacity-80 mb-1">To date</label>
          <div className="relative">
            <input className="input pr-10 max-w-[160px] sm:max-w-none" type="date" value={to} onChange={e => setTo(e.target.value)} />
            {!to && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-60 sm:hidden">YYYY-MM-DD</span>}
            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none" />
          </div>
        </div>
        <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap items-center gap-2">
          <button className="btn" onClick={load}><SearchIcon size={16}/> Search</button>
          <button className="btn" onClick={() => setExpenseOpen(true)}><PlusCircle size={16}/> Add Expense</button>
          <button className="btn-secondary" onClick={downloadPdf}><FileDown size={16}/> PDF</button>
          <button className="btn" onClick={async () => {
            try {
              const res = await api.get('/api/statements/export', { params: { accountId }, responseType: 'blob' })
              const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
              const a = document.createElement('a'); a.href = url; a.download = 'statement.csv'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
            } catch (e: any) {
              alert(e.response?.data?.error || 'Export failed')
            }
          }}><FileSpreadsheet size={16}/> CSV</button>
          <button className="btn-secondary" onClick={async () => {
            try {
              const r = await api.post('/api/statements/share', { accountId, ttlHours: 24, filters: { accountId } })
              const url = `${apiBaseUrl}/api/statements/shared/${r.data.token}`
              setShareUrl(url); alert('Share link created')
            } catch (e: any) { alert(e.response?.data?.error || 'Share failed') }
          }}><Share2 size={16}/> Share</button>
          {shareUrl && <div className="mt-2 text-sm">Share URL: <a className="underline" href={shareUrl} target="_blank" rel="noreferrer">{shareUrl}</a></div>}
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={includeHidden} onChange={e=>{setIncludeHidden(e.target.checked); if (hiddenOnly && e.target.checked===false) setHiddenOnly(false)}}/> <Eye size={14}/> Include hidden</label>
            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={hiddenOnly} onChange={e=>{setHiddenOnly(e.target.checked); if (e.target.checked) setIncludeHidden(true)}}/> <EyeOff size={14}/> Hidden only</label>
            <button type="button" className="btn-ghost" onClick={()=> setBlockedOpen(true)}><ShieldBan size={16}/> Blocked merchants</button>
            <button type="button" className="btn-ghost" onClick={()=> setHistoryOpen(true)}><HistoryIcon size={16}/> History</button>
          </div>
        </div>
      </div>
      <Modal open={expenseOpen} onClose={() => setExpenseOpen(false)} title="Add Expense">
        <form onSubmit={addExpense} className="space-y-3">
          {expenseErr && <div className="text-sm text-red-600">{expenseErr}</div>}
          <input className="input" placeholder="Name" value={expense.name} onChange={e=>setExpense({ ...expense, name: e.target.value })} required />
          <div>
            <label className="block text-sm opacity-80 mb-1">Category (optional)</label>
            <select className="input" value={expense.category} onChange={e=>setExpense({ ...expense, category: e.target.value })}>
              <option value="">— None —</option>
              {budgets.map((b) => (
                <option key={b._id} value={b.category}>{b.category}</option>
              ))}
            </select>
            {budgets.length === 0 && (
              <div className="text-xs opacity-70 mt-1">No categories yet. Create one in Budgets.</div>
            )}
          </div>
          <input className="input" type="number" step="0.01" min={0.01} placeholder="Amount (£)" value={expense.amount} onChange={e=>setExpense({ ...expense, amount: e.target.value })} required />
          <input className="input" placeholder="Note (optional)" value={expense.note} onChange={e=>setExpense({ ...expense, note: e.target.value })} />
          <button className="btn w-full" type="submit">Add</button>
        </form>
      </Modal>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="text-left px-3 py-2">Date</th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Note</th>
              <th className="text-right px-3 py-2">Amount</th>
              <th className="text-right px-3 py-2">Flag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2">{r.createdAt.slice(0,10)}</td>
                <td className="px-3 py-2">{r.name}{r.category ? <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-white/10">{r.category}</span> : null}</td>
                <td className="px-3 py-2 text-sm opacity-80 max-w-[280px] truncate" title={r.note}>{r.note || '—'}</td>
                <td className={`px-3 py-2 text-right ${r.type.includes('expense') || r.type.includes('out') ? 'text-red-600' : 'text-green-600'}`}>{r.type.includes('expense') || r.type.includes('out') ? '-' : '+'}{formatPenceToPounds(r.amount)}</td>
                <td className="px-3 py-2 text-right relative">
                  <button className="btn-secondary" onClick={()=> setFlagOpen(flagOpen === r._id ? null : r._id)}>Flag</button>
                  {flagOpen === r._id && (
                    <div className="absolute right-0 mt-2 z-50 w-56 rounded-xl border border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur shadow-lg text-left">
                      <button className="block w-full text-left px-3 py-2 hover:bg-white/10" onClick={async ()=>{ await api.post(`/api/transactions/${r._id}/hide`); setFlagOpen(null); await load(); }}>Hide from statements</button>
                      <button className="block w-full text-left px-3 py-2 hover:bg-white/10" onClick={async ()=>{ await api.post(`/api/transactions/${r._id}/block-merchant`); setFlagOpen(null); alert('Merchant blocked for future expenses') }}>Block this merchant</button>
                      <button className="block w-full text-left px-3 py-2 hover:bg-white/10" onClick={()=> setFlagOpen(null)}>Cancel</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Blocked merchants modal */}
      <Modal open={blockedOpen} onClose={()=> setBlockedOpen(false)} title="Blocked merchants">
        <div className="space-y-2 max-h-72 overflow-auto">
          {blocked.length === 0 && <div className="text-sm opacity-70">No blocked merchants.</div>}
          {blocked.map((b) => (
            <div key={b._id} className="flex items-center justify-between gap-3 px-2 py-1 rounded-lg hover:bg-white/5">
              <div>
                <div className="text-sm font-medium">{b.name}</div>
                <div className="text-xs opacity-60">Blocked {new Date(b.createdAt).toLocaleString()}</div>
              </div>
              <button className="btn-secondary" onClick={async ()=> { try { await api.delete(`/api/transactions/blocked/${b._id}`); const bl = await api.get('/api/transactions/blocked'); setBlocked(bl.data) } catch {} }}><Trash2 size={14}/> Remove</button>
            </div>
          ))}
        </div>
      </Modal>

      {/* History modal */}
      <Modal open={historyOpen} onClose={()=> setHistoryOpen(false)} title="Visibility & rules history">
        <div className="space-y-2 max-h-80 overflow-auto">
          {history.length === 0 && <div className="text-sm opacity-70">No recent actions.</div>}
          {history.map((h) => (
            <div key={h._id} className="flex items-center justify-between gap-3 px-2 py-1 rounded-lg hover:bg-white/5">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{h.type.replaceAll('_',' ')}{h.merchant ? `: ${h.merchant}` : ''}{h.txId ? ` (tx ${String(h.txId).slice(-6)})` : ''}</div>
                <div className="text-xs opacity-60">{new Date(h.createdAt).toLocaleString()}</div>
              </div>
              {h.type === 'hide_tx' && h.txId && <button className="btn-secondary" onClick={async ()=> { try { await api.post(`/api/transactions/${h.txId}/unhide`); await load() } catch {} }}><Undo2 size={14}/> Unhide</button>}
              {h.type === 'block_merchant' && h.merchant && <button className="btn-secondary" onClick={async ()=> { try { const bl = await api.get('/api/transactions/blocked'); const m = (bl.data||[]).find((x:any)=> x.name===h.merchant); if (m) { await api.delete(`/api/transactions/blocked/${m._id}`); } await load() } catch {} }}><Undo2 size={14}/> Unblock</button>}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  )
}
