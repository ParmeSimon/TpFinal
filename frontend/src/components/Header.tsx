import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Header({ admin = false }: { admin?: boolean }) {
  const { user, isAdmin, logout } = useAuth()
  const nav = useNavigate()
  const initials = user ? (user.firstName[0] + (user.lastName[0] ?? '')).toUpperCase() : '?'
  const displayName = user ? `${user.firstName} ${user.lastName[0] ?? ''}.` : 'Invité'

  return (
    <div className="ek-header">
      <div className="brand">
        <img src="/assets/ekod-logo-navy.svg" alt="EKOD" />
        <div className="sep" />
        <span className="sub">
          Réservation<br />de salles
          {admin && <span className="admin-badge">ADMIN</span>}
        </span>
      </div>
      <nav className="ek-nav">
        {admin ? (
          <>
            <NavLink to="/admin/bookings" className={({isActive}) => isActive ? 'active' : ''}>Réservations</NavLink>
            <NavLink to="/admin/rooms" className={({isActive}) => isActive ? 'active' : ''}>Salles</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/rooms" end className={({isActive}) => isActive ? 'active' : ''}>Catalogue</NavLink>
            <NavLink to="/bookings" className={({isActive}) => isActive ? 'active' : ''}>Mes réservations</NavLink>
            {isAdmin && <NavLink to="/admin/bookings" className={({isActive}) => isActive ? 'active' : ''}>Admin</NavLink>}
          </>
        )}
        {user ? (
          <button className={`user-chip ${admin ? 'navy' : ''}`} onClick={logout} title="Se déconnecter">
            {displayName}
            <span className="avatar">{initials}</span>
          </button>
        ) : (
          <button className="user-chip" onClick={() => nav('/login')}>Connexion</button>
        )}
      </nav>
    </div>
  )
}