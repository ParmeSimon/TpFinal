import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../auth/AuthContext'

export default function Protected({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="center-page"><span className="spinner" />&nbsp; Chargement…</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/rooms" replace />
  return <>{children}</>
}