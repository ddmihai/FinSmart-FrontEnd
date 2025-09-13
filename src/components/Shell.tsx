import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { BarChart2, CreditCard, Home, LineChart, LogOut, Receipt, Settings as SettingsIcon, Send, Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function Shell() {
  const { user, logout } = useAuth()
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])

  const load = async () => {
    try {
      const r = await api.get('/api/notifications')
      setItems(r.data)
      setUnread(r.data.filter((x: any) => !x.read).length)
    } catch {}
  }
  useEffect(() => {
    let id: any
    if (user) {
      load()
      id = setInterval(load, 15000)
    }
    return () => { if (id) clearInterval(id) }
  }, [user])

  const markAll = async () => {
    try {
      await api.post('/api/notifications/read', { ids: items.map((i) => i._id) })
      await load()
    } catch {}
  }
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
        <Link to="/" className="font-semibold text-xl">FinSmart</Link>
        <nav className="mt-6 flex gap-2 lg:block">
          <NavItem to="/" icon={<Home size={18} />}>Dashboard</NavItem>
          <NavItem to="/transactions" icon={<Receipt size={18} />}>Transactions</NavItem>
          <NavItem to="/transfers" icon={<Send size={18} />}>Transfers</NavItem>
          <NavItem to="/budgets" icon={<CreditCard size={18} />}>Budgets</NavItem>
          <NavItem to="/goals" icon={<CreditCard size={18} />}>Goals</NavItem>
          <NavItem to="/insights" icon={<LineChart size={18} />}>Insights</NavItem>
          <NavItem to="/notifications" icon={<Bell size={18} />}>Notifications</NavItem>
          <NavItem to="/analytics" icon={<BarChart2 size={18} />}>Analytics</NavItem>
          <NavItem to="/settings" icon={<SettingsIcon size={18} />}>Settings</NavItem>
        </nav>
      </aside>
      <main className="p-4 lg:p-8">
        <header className="flex items-center justify-between mb-6">
          <div />
          <div className="flex items-center gap-3">
            {user && <span className="text-sm opacity-80">{user.email}</span>}
            <button className="relative" onClick={() => setOpen(!open)} aria-label="Notifications">
              <Bell />
              {unread > 0 && <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1">{unread}</span>}
            </button>
            <button className="btn" onClick={logout}><LogOut size={16}/> Logout</button>
          </div>
        </header>
        {open && (
          <div className="card p-4 mb-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <button className="text-sm underline" onClick={markAll}>Mark all read</button>
            </div>
            <ul className="mt-2 space-y-2 max-h-64 overflow-auto">
              {items.map((n) => (
                <li key={n._id} className={`border rounded-md p-2 ${n.read ? 'opacity-60' : ''}`}>
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.body && <div className="text-xs opacity-80">{n.body}</div>}
                  <div className="text-[10px] opacity-60">{new Date(n.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  )
}

function NavItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <NavLink to={to} end className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-200/60 dark:hover:bg-gray-700/60'}`}>
      {icon}<span>{children}</span>
    </NavLink>
  )
}
