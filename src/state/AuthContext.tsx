import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { ensureCsrf, setAccessToken } from '../lib/api'

type User = { id: string; email: string; name: string }

type AuthContextType = {
  user: User | null
  accessToken: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setAccessToken(accessToken)
  }, [accessToken])

  // Bootstrap session on initial load using refresh cookie
  useEffect(() => {
    (async () => {
      try {
        await ensureCsrf()
        const r = await api.post('/api/auth/refresh')
        const token = r.data?.accessToken
        if (token) setToken(token)
        if (token) {
          const me = await api.get('/api/auth/me')
          setUser(me.data)
        }
      } catch {
        setUser(null)
        setToken(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/api/auth/login', { email, password })
    setUser(res.data.user)
    setToken(res.data.accessToken)
  }

  const signup = async (email: string, name: string, password: string) => {
    const res = await api.post('/api/auth/signup', { email, name, password })
    setUser(res.data.user)
    setToken(res.data.accessToken)
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    setUser(null)
    setToken(null)
  }

  const value = useMemo(() => ({ user, accessToken, loading, login, signup, logout }), [user, accessToken, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
