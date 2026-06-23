import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { me } from '../api/auth'
import type { UserDTO } from '../api/types'

interface AuthCtx {
  user: UserDTO | null
  loading: boolean
  isAdmin: boolean
  setTokens: (access: string, refresh: string) => Promise<void>
  logout: () => void
  reload: () => Promise<void>
}

const Ctx = createContext<AuthCtx | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(null)
  const [loading, setLoading] = useState(true)

  async function reload() {
    if (!localStorage.getItem('accessToken')) {
      setUser(null); setLoading(false); return
    }
    try {
      const u = await me()
      setUser(u)
    } catch {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  async function setTokens(access: string, refresh: string) {
    localStorage.setItem('accessToken', access)
    localStorage.setItem('refreshToken', refresh)
    await reload()
  }

  function logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
    window.location.href = '/login'
  }

  const isAdmin = !!user?.roles.includes('ADMIN')

  return (
    <Ctx.Provider value={{ user, loading, isAdmin, setTokens, logout, reload }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be inside AuthProvider')
  return v
}