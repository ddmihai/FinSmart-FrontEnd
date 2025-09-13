import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type Account = { _id: string; type: string }

export default function Insights() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState('')
  const [data, setData] = useState<{ incomeTotal: number; insights: Array<{ category: string; spent: number; percentage: number }> }>({ incomeTotal: 0, insights: [] })

  const load = async () => {
    if (!accountId) return
    const r = await api.get('/api/insights/category', { params: { accountId } })
    setData(r.data)
  }

  useEffect(() => {
    (async () => {
      const a = await api.get('/api/accounts')
      setAccounts(a.data)
      if (a.data[0]) setAccountId(a.data[0]._id)
    })()
  }, [])
  useEffect(() => { load() }, [accountId])

  const colors = ['#2563eb','#dc2626','#16a34a','#f59e0b','#7c3aed','#0ea5e9']
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Category Insights</h1>
      <select className="input max-w-xs" value={accountId} onChange={e=>setAccountId(e.target.value)}>
        {accounts.map(a => <option key={a._id} value={a._id}>{a.type}</option>)}
      </select>
      <div className="card p-4">
        <div className="mb-2 text-sm opacity-80">Income this month: £{(data.incomeTotal/100).toFixed(2)}</div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <ul className="space-y-1 text-sm">
              {data.insights.map((i) => (
                <li key={i.category} className="flex items-center justify-between">
                  <span>{i.category}</span>
                  <span>{i.percentage}% ( £{(i.spent/100).toFixed(2)} )</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.insights} dataKey="percentage" nameKey="category" outerRadius={100}>
                  {data.insights.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

