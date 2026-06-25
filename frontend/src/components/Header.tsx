import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Header({ admin = false }: { admin?: boolean }) {
  const { user, isAdmin } = useAuth()
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
            <button
              type="button"
              className="nav-back"
              onClick={() => nav('/rooms')}
              title="Revenir à l'espace réservation"
              style={{ background: 'none', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 9, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}
            >
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(251,45,28,.3)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                </svg>
              </span>
              Espace réservation
            </button>
            <NavLink to="/admin/bookings" className={({isActive}) => isActive ? 'active' : ''}>Réservations</NavLink>
            <NavLink to="/admin/rooms" className={({isActive}) => isActive ? 'active' : ''}>Salles</NavLink>
              <NavLink to="/admin/users" className={({isActive})=> isActive ? 'active' : ''}> Utilisateurs</NavLink>
          </>
        ) : (
          <>
            <NavLink to="/rooms" end className={({isActive}) => isActive ? 'active' : ''}>Catalogue</NavLink>
            <NavLink to="/bookings" className={({isActive}) => isActive ? 'active' : ''}>Mes réservations</NavLink>
            {isAdmin && <NavLink to="/admin/bookings" className={({isActive}) => isActive ? 'active' : ''}>Admin</NavLink>}
          </>
        )}
        {user ? (
          <button className={`user-chip ${admin ? 'navy' : ''}`} onClick={() => nav('/profile')} title="Mon profil">
            {displayName}
            <span className="avatar" style={user.avatarUrl ? { background: `center/cover no-repeat url(${user.avatarUrl})` } : undefined}>
              {!user.avatarUrl && initials}
            </span>
          </button>
        ) : (
          <button className="user-chip" onClick={() => nav('/login')}>Connexion</button>
        )}
      </nav>
    </div>
  )
}