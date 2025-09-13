import { useEffect, useState } from 'react'
import api from '../lib/api'
import { parsePoundsToPence } from '../lib/money'

type Account = { _id: string; type: string; sortCode: string; accountNumber: string }
type Card = { _id: string; account: string; number: string; expiryMonth: number; expiryYear: number }
type CardExt = Card & { frozen?: boolean; dailyLimit?: number; weeklyLimit?: number }
type LimitChange = { _id: string; dailyLimit?: number; weeklyLimit?: number; createdAt: string }

export default function Settings() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cards, setCards] = useState<CardExt[]>([])
  const [changes, setChanges] = useState<Record<string, LimitChange[]>>({})
  const [newAccType, setNewAccType] = useState<'Basic'|'Credit'|'Platinum'|'Gold'>('Basic')
  const [logoutPolicy, setLogoutPolicy] = useState<'immediate'|'onClose'|'idle30m'>('immediate')
  const [reveal, setReveal] = useState<{ id: string | null; password: string; details?: any; err?: string }>({ id: null, password: '' })

  const load = async () => {
    const a = await api.get('/api/accounts')
    setAccounts(a.data)
    const c = await api.get('/api/accounts/cards')
    setCards(c.data)
    // fetch changes per card (best-effort)
    const map: Record<string, LimitChange[]> = {}
    await Promise.all(c.data.map(async (card: any) => {
      try { const r = await api.get(`/api/cards/${card._id}/limit-changes`); map[card._id] = r.data } catch {}
    }))
    setChanges(map)
    try { const p = await api.get('/api/settings/logout-policy'); setLogoutPolicy(p.data?.policy || 'immediate') } catch {}
  }
  useEffect(() => { load() }, [])

  const replace = async (accountId: string) => {
    await api.post(`/api/accounts/${accountId}/replace-card`)
    await load()
  }

  const toggleFreeze = async (cardId: string, frozen?: boolean) => {
    if (frozen) await api.post(`/api/cards/${cardId}/unfreeze`)
    else await api.post(`/api/cards/${cardId}/freeze`)
    await load()
  }

  const createAccount = async () => {
    await api.post('/api/accounts', { type: newAccType })
    await load()
  }

  const setLimits = async (cardId: string, daily: string, weekly: string) => {
    const dailyP = daily ? parsePoundsToPence(daily) : null
    const weeklyP = weekly ? parsePoundsToPence(weekly) : null
    await api.post(`/api/cards/${cardId}/limits`, { dailyLimit: dailyP ?? undefined, weeklyLimit: weeklyP ?? undefined })
    await load()
  }

  const doReveal = async () => {
    if (!reveal.id) return
    try {
      const r = await api.post(`/api/cards/${reveal.id}/reveal`, { password: reveal.password })
      setReveal({ ...reveal, details: r.data, err: undefined })
      setTimeout(() => setReveal({ id: null, password: '' }), 10000)
    } catch (e: any) {
      setReveal({ ...reveal, err: e.response?.data?.error || 'Reveal failed' })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Accounts</h2>
          <div className="flex flex-wrap gap-2 items-center mb-3">
            <select className="input" value={newAccType} onChange={e=>setNewAccType(e.target.value as any)}>
              <option>Basic</option>
              <option>Credit</option>
              <option>Platinum</option>
              <option>Gold</option>
            </select>
            <button className="btn" onClick={createAccount}>Create account</button>
          </div>
          <ul className="space-y-2">
            {accounts.map(a => (
              <li key={a._id} className="border rounded-lg p-3 border-gray-200 dark:border-gray-700">
                <div className="font-semibold">{a.type}</div>
                <div className="text-sm opacity-80">{a.sortCode} • {a.accountNumber}</div>
                <button className="btn mt-2" onClick={() => replace(a._id)}>Replace Card</button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Active Cards</h2>
          <ul className="space-y-2">
            {cards.map(c => (
              <li key={c._id} className="border rounded-lg p-3 border-gray-200 dark:border-gray-700">
                <div className="font-mono">•••• •••• •••• {c.number.slice(-4)}</div>
                <div className="text-sm opacity-80">Exp {String(c.expiryMonth).padStart(2,'0')}/{c.expiryYear}</div>
                <div className="mt-3 grid sm:grid-cols-2 gap-3 items-center">
                  <button className="btn" onClick={() => toggleFreeze(c._id, c.frozen)}> {c.frozen ? 'Unfreeze' : 'Freeze'} </button>
                  <button className="btn" onClick={() => setReveal({ id: c._id, password: '' })}>Reveal</button>
                </div>
                <div className="mt-3 grid sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-sm opacity-80 mb-1">Daily limit (£)</label>
                    <input id={`daily-${c._id}`} className="input" defaultValue={c.dailyLimit ? (c.dailyLimit/100).toFixed(2) : ''} placeholder="e.g., 500.00" />
                  </div>
                  <div>
                    <label className="block text-sm opacity-80 mb-1">Weekly limit (£)</label>
                    <input id={`weekly-${c._id}`} className="input" defaultValue={c.weeklyLimit ? (c.weeklyLimit/100).toFixed(2) : ''} placeholder="e.g., 2000.00" />
                  </div>
                  <div className="sm:col-span-2">
                    <button className="btn" onClick={() => {
                      const d = (document.getElementById(`daily-${c._id}`) as HTMLInputElement)?.value || ''
                      const w = (document.getElementById(`weekly-${c._id}`) as HTMLInputElement)?.value || ''
                      setLimits(c._id, d, w)
                    }}>Save Limits</button>
                  </div>
                </div>
                {changes[c._id] && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-1">Recent limit changes</div>
                    <ul className="text-sm divide-y divide-white/10">
                      {changes[c._id].map(ch => (
                        <li key={ch._id} className="py-2 flex items-center justify-between">
                          <span>{new Date(ch.createdAt).toLocaleString()} — Daily: {ch.dailyLimit ?? '—'} / Weekly: {ch.weeklyLimit ?? '—'}</span>
                          <button className="underline" onClick={async ()=>{ await api.delete(`/api/cards/limit-changes/${ch._id}`); await load() }}>Delete</button>
                        </li>
                      ))}
                      {changes[c._id].length === 0 && <li className="py-2 opacity-70">No changes yet</li>}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-4 md:col-span-2">
          <h2 className="font-semibold mb-2">Logout Preferences</h2>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="radio" name="logoutp" checked={logoutPolicy==='immediate'} onChange={()=>setLogoutPolicy('immediate')} /> Logout immediately (default)</label>
            <label className="flex items-center gap-2"><input type="radio" name="logoutp" checked={logoutPolicy==='onClose'} onChange={()=>setLogoutPolicy('onClose')} /> Logout when browser closes</label>
            <label className="flex items-center gap-2"><input type="radio" name="logoutp" checked={logoutPolicy==='idle30m'} onChange={()=>setLogoutPolicy('idle30m')} /> Auto-logout after 30 minutes of inactivity</label>
            <button className="btn mt-2" onClick={async ()=>{ await api.post('/api/settings/logout-policy', { policy: logoutPolicy }); alert('Saved'); }}>Save Preference</button>
          </div>
        </div>
      </div>
      {reveal.id && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="card p-4 w-full max-w-md">
            <h3 className="font-semibold mb-2">Confirm password to reveal</h3>
            {reveal.err && <div className="text-sm text-red-600">{reveal.err}</div>}
            {!reveal.details ? (
              <>
                <input className="input" type="password" placeholder="Password" value={reveal.password} onChange={e=>setReveal({ ...reveal, password: e.target.value })} />
                <div className="mt-2 flex gap-2">
                  <button className="btn" onClick={doReveal}>Reveal</button>
                  <button className="btn" onClick={()=>setReveal({ id: null, password: '' })}>Cancel</button>
                </div>
              </>
            ) : (
              <div className="mt-2">
                <div className="font-mono">{reveal.details.number}</div>
                <div>CVV: {reveal.details.cvv}</div>
                <div>Exp: {String(reveal.details.expiryMonth).padStart(2,'0')}/{reveal.details.expiryYear}</div>
                <div className="text-sm opacity-80 mt-2">Auto-hiding in ~10 seconds</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
