import { useEffect, useState } from 'react'
import api from '../lib/api'

type Account = { _id: string; type: string; sortCode: string; accountNumber: string }
type Card = { _id: string; account: string; number: string; expiryMonth: number; expiryYear: number }

export default function Settings() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cards, setCards] = useState<Card[]>([])

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
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

