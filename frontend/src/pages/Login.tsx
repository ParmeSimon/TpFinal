import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { login, register } from '../api/auth'
import { useAuth } from '../auth/AuthContext'

type Mode = 'login' | 'register'

export default function Login() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { setTokens } = useAuth()
  const nav = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setBusy(true)
    try {
      if (mode === 'register') {
        await register({ firstName, lastName, email, password })
      }
      const t = await login(email, password)
      await setTokens(t.accessToken, t.refreshToken)
      nav('/rooms')
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Identifiants invalides')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen">
      <TopBar />
      <div style={{ display: 'flex', minHeight: 600, flex: 1, flexWrap: 'wrap' }}>
        {/* left red */}
        <div style={{
          width: 560, background: 'var(--red)', color: '#fff',
          padding: '54px 56px', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', position: 'relative', overflow: 'hidden',
          flex: '1 1 360px'
        }}>
          <div style={{ position: 'absolute', right: -90, bottom: -90, width: 340, height: 340, border: '26px solid rgba(255,255,255,.12)', borderRadius: '50%' }} />
          <img src="/assets/ekod-logo-white.svg" alt="EKOD" style={{ height: 46, alignSelf: 'flex-start' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', opacity: .9, marginBottom: 16 }}>Espace réservation</div>
            <h1 className="heading-mont" style={{ fontSize: 38, lineHeight: 1.08, margin: '0 0 18px' }}>
              Réservez vos<br />salles en<br />quelques clics.
            </h1>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, opacity: .92, margin: 0, maxWidth: 380 }}>
              Connectez-vous avec votre compte EKOD pour consulter les salles disponibles, choisir un créneau et suivre vos demandes.
            </p>
          </div>
          <div style={{ position: 'relative', fontSize: 12, opacity: .8 }}>CCI Le Mans Sarthe</div>
        </div>

        {/* right form */}
        <div style={{ flex: 1, padding: '56px 80px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff', minWidth: 340 }}>
          <button
            type="button"
            onClick={() => nav('/')}
            title="Retour à l'accueil"
            style={{ alignSelf: 'flex-start', background: 'none', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Montserrat', fontWeight: 700, fontSize: 14, color: 'var(--navy)', marginBottom: 26 }}
          >
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 7px rgba(251,45,28,.35)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M5 12l7 7M5 12l7-7" />
              </svg>
            </span>
            Retour à l'accueil
          </button>
          <div style={{ display: 'flex', gap: 30, borderBottom: '1px solid var(--border)', marginBottom: 34 }}>
            <button
              type="button"
              onClick={() => { setMode('login'); setErr(null) }}
              style={{
                background: 'none', border: 0, padding: '0 0 14px',
                fontFamily: 'Montserrat', fontWeight: mode === 'login' ? 800 : 700,
                fontSize: 16,
                color: mode === 'login' ? 'var(--red)' : 'var(--grey-3)',
                borderBottom: mode === 'login' ? '3px solid var(--red)' : '3px solid transparent',
                marginBottom: -1,
                cursor: 'pointer'
              }}
            >Connexion</button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErr(null) }}
              style={{
                background: 'none', border: 0, padding: '0 0 14px',
                fontFamily: 'Montserrat', fontWeight: mode === 'register' ? 800 : 700,
                fontSize: 16,
                color: mode === 'register' ? 'var(--red)' : 'var(--grey-3)',
                borderBottom: mode === 'register' ? '3px solid var(--red)' : '3px solid transparent',
                marginBottom: -1,
                cursor: 'pointer'
              }}
            >Inscription</button>
          </div>

          <form onSubmit={submit}>
            {mode === 'register' && (
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Prénom</label>
                  <input className="input" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="field-label">Nom</label>
                  <input className="input" required value={lastName} onChange={e => setLastName(e.target.value)} />
                </div>
              </div>
            )}

            <label className="field-label" style={{ marginTop: mode === 'register' ? 12 : 0 }}>Email</label>
            <input
              className="input"
              type="email"
              required
              placeholder="prenom.nom@ekod.school"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ marginBottom: 20 }}
            />

            <label className="field-label">Mot de passe</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPwd ? 'text' : 'password'}
                required
                minLength={mode === 'register' ? 8 : 1}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingRight: 80, marginBottom: 14 }}
              />
              <button
                type="button"
                onClick={() => setShowPwd(s => !s)}
                style={{
                  position: 'absolute', right: 14, top: 14,
                  background: 'none', border: 0, color: 'var(--red)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}
              >{showPwd ? 'Masquer' : 'Afficher'}</button>
            </div>

            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, fontSize: 12.5 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5C5C6A', fontWeight: 600 }}>
                  <input type="checkbox" style={{ width: 16, height: 16, accentColor: 'var(--red)' }} />
                  Se souvenir de moi
                </label>
                <span style={{ color: 'var(--red)', fontWeight: 700, cursor: 'pointer' }}>Mot de passe oublié ?</span>
              </div>
            )}

            {err && <div className="error-msg">{err}</div>}

            <button type="submit" className="btn btn-red btn-block" disabled={busy} style={{ marginTop: mode === 'register' ? 22 : 0, padding: 15 }}>
              {busy ? '...' : (mode === 'login' ? 'Se connecter' : "Créer mon compte")}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12.5, color: '#8A8A95', margin: '22px 0 0' }}>
              {mode === 'login'
                ? <>Pas encore de compte ? <b style={{ color: 'var(--navy)', cursor: 'pointer' }} onClick={() => setMode('register')}>Créez-en un</b> avec votre adresse EKOD.</>
                : <>Déjà inscrit ? <b style={{ color: 'var(--navy)', cursor: 'pointer' }} onClick={() => setMode('login')}>Connectez-vous</b>.</>
              }
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}