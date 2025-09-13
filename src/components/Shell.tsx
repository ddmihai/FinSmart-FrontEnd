import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { BarChart2, CreditCard, Home, LineChart, LogOut, Receipt, Settings as SettingsIcon, Send, Bell, Menu } from 'lucide-react'
import { useEffect, useState } from 'react'
import api from '../lib/api'

export default function Shell() {
  const { user, logout } = useAuth()
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<any[]>([])
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-gray-100">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 sticky top-0 z-40 bg-slate-900/80 backdrop-blur">
        <button aria-label="Open navigation" onClick={() => setMobileNavOpen(true)} className="p-2 rounded-lg hover:bg-white/10">
          <Menu />
        </button>
        <Link to="/" className="font-semibold text-lg">FinSmart</Link>
        <button className="relative p-2 rounded-lg hover:bg-white/10" onClick={() => setOpen(!open)} aria-label="Notifications">
          <Bell />
          {unread > 0 && <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1">{unread}</span>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
        <aside className="hidden md:block p-4 border-r border-white/10 sticky top-0 h-screen">
          <Link to="/" className="font-semibold text-xl">FinSmart</Link>
          <nav className="mt-6 space-y-1">
            <NavItem to="/" icon={<Home size={18} />}>Dashboard</NavItem>
            <NavItem to="/transactions" icon={<Receipt size={18} />}>Transactions</NavItem>
            <NavItem to="/transfers" icon={<Send size={18} />}>Transfers</NavItem>
            <NavItem to="/budgets" icon={<CreditCard size={18} />}>Budgets</NavItem>
            <NavItem to="/goals" icon={<CreditCard size={18} />}>Goals</NavItem>
            <NavItem to="/insights" icon={<LineChart size={18} />}>Insights</NavItem>
            <NavItem to="/analytics" icon={<BarChart2 size={18} />}>Analytics</NavItem>
            <NavItem to="/settings" icon={<SettingsIcon size={18} />}>Settings</NavItem>
            <NavItem to="/diagnostics" icon={<SettingsIcon size={18} />}>Diagnostics</NavItem>
          </nav>
        </aside>
        <main className="p-4 md:p-8 pb-24">
          <header className="hidden md:flex items-center justify-end mb-6 gap-3">
            {user && <span className="text-sm opacity-80">{user.email}</span>}
            <button className="relative p-2 rounded-lg hover:bg-white/10" onClick={() => setOpen(!open)} aria-label="Notifications">
              <Bell />
              {unread > 0 && <span className="absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1">{unread}</span>}
            </button>
            <button className="btn" onClick={logout}><LogOut size={16}/> Logout</button>
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
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileNavOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-slate-900 p-4 border-r border-white/10">
            <div className="flex items-center justify-between">
              <Link to="/" className="font-semibold text-lg" onClick={() => setMobileNavOpen(false)}>FinSmart</Link>
              <button className="p-2 rounded-lg hover:bg-white/10" onClick={() => setMobileNavOpen(false)}>Close</button>
            </div>
            <nav className="mt-6 space-y-1" onClick={() => setMobileNavOpen(false)}>
              <NavItem to="/" icon={<Home size={18} />}>Dashboard</NavItem>
              <NavItem to="/transactions" icon={<Receipt size={18} />}>Transactions</NavItem>
              <NavItem to="/transfers" icon={<Send size={18} />}>Transfers</NavItem>
              <NavItem to="/budgets" icon={<CreditCard size={18} />}>Budgets</NavItem>
              <NavItem to="/goals" icon={<CreditCard size={18} />}>Goals</NavItem>
              <NavItem to="/insights" icon={<LineChart size={18} />}>Insights</NavItem>
              <NavItem to="/analytics" icon={<BarChart2 size={18} />}>Analytics</NavItem>
              <NavItem to="/settings" icon={<SettingsIcon size={18} />}>Settings</NavItem>
              <NavItem to="/diagnostics" icon={<SettingsIcon size={18} />}>Diagnostics</NavItem>
            </nav>
          </div>
        </div>
      )}

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/90 backdrop-blur border-t border-white/10" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-4">
          <BottomItem to="/" label="Home" icon={<Home size={18} />} />
          <BottomItem to="/transactions" label="Tx" icon={<Receipt size={18} />} />
          <BottomItem to="/transfers" label="Send" icon={<Send size={18} />} />
          <BottomItem to="/settings" label="Settings" icon={<SettingsIcon size={18} />} />
        </div>
      </div>
    </div>
  )
}

function NavItem({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <NavLink to={to} end className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-white/10'}`}>
      {icon}<span>{children}</span>
    </NavLink>
  )
}

function BottomItem({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <NavLink to={to} end className={({ isActive }) => `flex flex-col items-center justify-center py-2 ${isActive ? 'text-blue-400' : 'text-gray-300'}`}>
      {icon}
      <span className="text-[11px] mt-1">{label}</span>
    </NavLink>
  )
}
