import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { setAccessToken } from '../lib/api'

type User = { id: string; email: string; name: string }

type AuthContextType = {
  user: User | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, name: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setToken] = useState<string | null>(null)

  useEffect(() => {
    setAccessToken(accessToken)
  }, [accessToken])

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

  const value = useMemo(() => ({ user, accessToken, login, signup, logout }), [user, accessToken])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

