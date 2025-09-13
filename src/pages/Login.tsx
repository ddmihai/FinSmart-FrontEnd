import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'
import { Mail, Lock, Loader2 } from 'lucide-react'

export default function Login() {
  const { login, accessToken } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (accessToken) nav('/') }, [accessToken])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await login(email, password)
      nav('/')
    } catch (e: any) {
      setError(e.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-semibold">Welcome to FinSmart</h1>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="relative">
          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          <input className="input pl-9 h-12 text-lg" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
          <input className="input pl-9 h-12 text-lg" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <button className="btn w-full h-12 text-lg shadow-lg hover:shadow-xl transition disabled:opacity-70" disabled={loading}>
          {loading && <Loader2 className="animate-spin" size={18} />} {loading ? 'Signing in…' : 'Login'}
        </button>
        <p className="text-sm opacity-90">No account? <Link to="/signup" className="underline">Sign up</Link></p>
      </form>
    </div>
  )
}
