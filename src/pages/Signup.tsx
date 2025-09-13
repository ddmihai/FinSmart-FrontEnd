import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null)
    try {
      await signup(email, name, password)
      nav('/')
    } catch (e: any) {
      setError(e.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={onSubmit} className="card p-6 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">Create account</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="input" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="btn w-full" disabled={loading}>{loading ? 'Signing up…' : 'Sign up'}</button>
        <p className="text-sm opacity-80">Have an account? <Link to="/login" className="underline">Log in</Link></p>
      </form>
    </div>
  )
}

