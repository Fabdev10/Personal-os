import React, { createContext, useContext, useEffect, useState } from 'react'
import { get, post } from '../services/api'

interface User {
  id: string
  email: string
  username?: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, username?: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    get('/api/auth/me')
      .then(res => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const res = await post('/api/auth/login', { email, password })
    setUser(res.user)
  }

  async function register(email: string, password: string, username?: string) {
    await post('/api/auth/register', { email, password, username })
  }

  async function logout() {
    await post('/api/auth/logout', {})
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
