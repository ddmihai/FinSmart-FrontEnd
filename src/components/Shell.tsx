import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { BarChart2, CreditCard, Home, LineChart, LogOut, Receipt, Settings as SettingsIcon } from 'lucide-react'

export default function Shell() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      <aside className="p-4 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
        <Link to="/" className="font-semibold text-xl">FinSmart</Link>
        <nav className="mt-6 flex gap-2 lg:block">
          <NavItem to="/" icon={<Home size={18} />}>Dashboard</NavItem>
          <NavItem to="/transactions" icon={<Receipt size={18} />}>Transactions</NavItem>
          <NavItem to="/budgets" icon={<CreditCard size={18} />}>Budgets</NavItem>
          <NavItem to="/analytics" icon={<BarChart2 size={18} />}>Analytics</NavItem>
          <NavItem to="/settings" icon={<SettingsIcon size={18} />}>Settings</NavItem>
        </nav>
      </aside>
      <main className="p-4 lg:p-8">
        <header className="flex items-center justify-between mb-6">
          <div />
          <div className="flex items-center gap-3">
            {user && <span className="text-sm opacity-80">{user.email}</span>}
            <button className="btn" onClick={logout}><LogOut size={16}/> Logout</button>
          </div>
        </header>
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

