import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import Transfers from './pages/Transfers'
import Goals from './pages/Goals'
import Insights from './pages/Insights'
import { useAuth } from './state/AuthContext'
import Shell from './components/Shell'

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<Shell />}>
        <Route path="/" element={<Protected><Dashboard /></Protected>} />
        <Route path="/transactions" element={<Protected><Transactions /></Protected>} />
        <Route path="/transfers" element={<Protected><Transfers /></Protected>} />
        <Route path="/budgets" element={<Protected><Budgets /></Protected>} />
        <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
        <Route path="/settings" element={<Protected><Settings /></Protected>} />
        <Route path="/goals" element={<Protected><Goals /></Protected>} />
        <Route path="/insights" element={<Protected><Insights /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
