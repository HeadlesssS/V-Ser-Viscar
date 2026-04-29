import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest } from '../lib/api.js'

const AuthContext = createContext(null)

function normalizeUser(payload) {
  if (!payload) return null
  if (payload.user) return payload.user
  if (payload.data?.user) return payload.data.user
  if (payload.profile) return payload.profile
  if (payload.customer) return payload.customer
  return typeof payload === 'object' ? payload : null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('vsp_user')
      if (raw) setUser(JSON.parse(raw))
    } catch {
      // ignore
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    try {
      if (user) localStorage.setItem('vsp_user', JSON.stringify(user))
      else localStorage.removeItem('vsp_user')
    } catch {
      // ignore
    }
  }, [user])

  async function register({ name, email, password, phone }) {
    const payload = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: { name, email, password, phone },
    })
    setUser(normalizeUser(payload) ?? { name, email, phone })
    return payload
  }

  async function login({ email, password }) {
    const payload = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setUser(normalizeUser(payload) ?? { email })
    return payload
  }

  function logout() {
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, setUser, ready, register, login, logout }),
    [user, ready],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

