import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { ensureCsrf, setAccessToken, getDiagnostics, setCanRefresh } from '../lib/api'

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
        const diag = await getDiagnostics()
        if (diag?.cookies?.hasRefreshToken) {
          const r = await api.post('/api/auth/refresh')
          const token = r.data?.accessToken
          if (token) {
            // Immediately apply token to axios defaults for subsequent calls
            setAccessToken(token)
            setToken(token)
            const me = await api.get('/api/auth/me')
            setUser(me.data)
          }
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
    setAccessToken(res.data.accessToken)
    setToken(res.data.accessToken)
    setCanRefresh(true)
  }

  const signup = async (email: string, name: string, password: string) => {
    const res = await api.post('/api/auth/signup', { email, name, password })
    setUser(res.data.user)
    setAccessToken(res.data.accessToken)
    setToken(res.data.accessToken)
    setCanRefresh(true)
  }

  const logout = async () => {
    await api.post('/api/auth/logout')
    setUser(null)
    setToken(null)
    setCanRefresh(false)
  }

  const value = useMemo(() => ({ user, accessToken, loading, login, signup, logout }), [user, accessToken, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
