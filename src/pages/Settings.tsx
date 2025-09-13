import { useEffect, useState } from 'react'
import api from '../lib/api'
import { parsePoundsToPence } from '../lib/money'

type Account = { _id: string; type: string; sortCode: string; accountNumber: string }
type Card = { _id: string; account: string; number: string; expiryMonth: number; expiryYear: number }
type CardExt = Card & { frozen?: boolean; dailyLimit?: number; weeklyLimit?: number }

export default function Settings() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cards, setCards] = useState<CardExt[]>([])
  const [reveal, setReveal] = useState<{ id: string | null; password: string; details?: any; err?: string }>({ id: null, password: '' })

  const load = async () => {
    const a = await api.get('/api/accounts')
    setAccounts(a.data)
    const c = await api.get('/api/accounts/cards')
    setCards(c.data)
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
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button className="btn" onClick={() => toggleFreeze(c._id, c.frozen)}> {c.frozen ? 'Unfreeze' : 'Freeze'} </button>
                  <button className="btn" onClick={() => setReveal({ id: c._id, password: '' })}>Reveal</button>
                </div>
                <div className="mt-2 flex gap-2 items-center text-sm">
                  <span>Daily limit (£):</span>
                  <input className="input max-w-[120px]" placeholder={c.dailyLimit ? (c.dailyLimit/100).toFixed(2) : '—'} onBlur={e => setLimits(c._id, e.target.value, '')} />
                  <span>Weekly (£):</span>
                  <input className="input max-w-[120px]" placeholder={c.weeklyLimit ? (c.weeklyLimit/100).toFixed(2) : '—'} onBlur={e => setLimits(c._id, '', e.target.value)} />
                </div>
              </li>
            ))}
          </ul>
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
