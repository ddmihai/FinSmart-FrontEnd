import { Navigate, Route, Routes } from 'react-router-dom'
import React, { Suspense, lazy } from 'react'
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Budgets = lazy(() => import('./pages/Budgets'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))
const Transfers = lazy(() => import('./pages/Transfers'))
const Goals = lazy(() => import('./pages/Goals'))
const Insights = lazy(() => import('./pages/Insights'))
const Diagnostics = lazy(() => import('./pages/Diagnostics'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))
import { useAuth } from './state/AuthContext'
import LoadingOverlay from './components/Loading'
import Shell from './components/Shell'

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingOverlay text="Checking your session…" />
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
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
          <Route path="/diagnostics" element={<Protected><Diagnostics /></Protected>} />
          <Route path="/about" element={<Protected><About /></Protected>} />
          <Route path="/contact" element={<Protected><Contact /></Protected>} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  )
}
