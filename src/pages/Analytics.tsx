import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Pie, PieChart, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts'
import { formatPenceToPounds } from '../lib/money'

type Account = { _id: string; type: string }

export default function Analytics() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountId, setAccountId] = useState('')
  const [data, setData] = useState<any>({ income: 0, expenses: 0, byCategory: {} })
  const [forecast, setForecast] = useState<{ balanceNow: number; projectedMonthEnd: number; series?: Array<{ date: string; balance: number }> } | null>(null)

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
    const r = await api.get('/api/analytics', { params: { accountId } })
    setData(r.data)
    try {
      const f = await api.get('/api/analytics/forecast', { params: { accountId } })
      setForecast(f.data)
    } catch {}
  }
  useEffect(() => { load() }, [accountId])

  const catData = Object.entries(data.byCategory || {}).map(([name, value]) => ({ name, value }))
  const incExp = [ { name: 'Income', value: data.income/100 }, { name: 'Expenses', value: data.expenses/100 } ]
  const colors = ['#2563eb','#dc2626','#16a34a','#f59e0b','#7c3aed']

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Analytics</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <select className="input" value={accountId} onChange={e => setAccountId(e.target.value)}>
          {accounts.map(a => <option key={a._id} value={a._id}>{a.type}</option>)}
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Income vs Expenses</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={incExp}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Spending by Category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={catData} dataKey="value" nameKey="name" outerRadius={90}>
                {catData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {forecast && (
        <div className="card p-4">
          <h2 className="font-semibold mb-2">Cashflow Forecast</h2>
          <div className="text-sm">Current balance: {formatPenceToPounds(forecast.balanceNow)}</div>
          <div className="text-sm">Projected month-end: {formatPenceToPounds(forecast.projectedMonthEnd)}</div>
          {forecast.series && (
            <div className="mt-2">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={forecast.series}>
                  <XAxis dataKey="date" hide/>
                  <YAxis hide/>
                  <Tooltip formatter={(v)=>formatPenceToPounds(Number(v))} labelFormatter={()=>''}/>
                  <Line type="monotone" dataKey="balance" stroke="#2563eb" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
