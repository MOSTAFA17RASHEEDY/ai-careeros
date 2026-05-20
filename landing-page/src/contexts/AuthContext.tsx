import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

interface User {
  id: string
  name: string
  email: string
  tier?: string
}

interface Usage {
  aiCallsThisMonth: number
  limit: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  usage: Usage | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  refreshUsage: () => Promise<void>
  upgradeTo: (tier: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [usage, setUsage] = useState<Usage | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => {
        setUser(data.user)
        setUsage(data.usage)
      })
      .catch(() => { localStorage.removeItem('token'); setToken(null) })
      .finally(() => setLoading(false))
  }, [token])

  const refreshUsage = async () => {
    if (!token) return
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsage(data.usage)
        if (data.user) setUser(data.user)
      }
    } catch {}
  }

  const upgradeTo = async (tier: string) => {
    const res = await fetch(`${API_BASE}/ai/upgrade`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tier }),
    })
    if (!res.ok) throw new Error('Upgrade failed')
    await refreshUsage()
  }

  const setAuthData = (data: any) => {
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    setUsage(data.usage)
  }

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Login failed') }
    const data = await res.json()
    setAuthData(data)
    navigate('/app/dashboard')
  }

  const signup = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Signup failed') }
    const data = await res.json()
    setAuthData(data)
    navigate('/app/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null); setUser(null); setUsage(null)
    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, token, usage, login, signup, logout, loading, refreshUsage, upgradeTo }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
