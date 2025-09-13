import { useEffect, useState } from 'react'
import api from '../lib/api'

type Account = { _id: string; type: string; balance: number; sortCode: string; accountNumber: string }
type Tx = { _id: string; name: string; amount: number; type: string; createdAt: string }

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [recent, setRecent] = useState<Tx[]>([])

  useEffect(() => {
    (async () => {
      const a = await api.get('/api/accounts')
      setAccounts(a.data)
      if (a.data[0]) {
        const t = await api.get(`/api/transactions?accountId=${a.data[0]._id}`)
        setRecent(t.data.slice(0, 5))
      }
    })()
  }, [])

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {accounts.map(a => (
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
    </div>
  )
}

