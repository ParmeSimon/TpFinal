import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Footer from '../components/Footer'
import { getPublicStats, type PublicStats } from '../api/stats'

export default function Landing() {
  const [stats, setStats] = useState<PublicStats | null>(null)
  useEffect(() => {
    getPublicStats().then(setStats).catch(() => {})
  }, [])
  return (
    <div className="screen">
      <TopBar />
      {/* header guest */}
      <div className="ek-header">
        <div className="brand">
          <img src="/assets/ekod-logo-navy.svg" alt="EKOD" />
          <div className="sep" />
          <span className="sub">Réservation<br />de salles</span>
        </div>
        <nav className="ek-nav">
          <Link to="/">Accueil</Link>
          <Link to="/rooms">Les salles</Link>
          <Link to="/login" className="btn btn-red" style={{ padding: '10px 22px', fontSize: 12, color: '#fff' }}>Connexion</Link>
        </nav>
      </div>

      {/* hero */}
      <div style={{
        position: 'relative',
        minHeight: 440,
        backgroundImage: 'url(/assets/schoolmates-smiling-joking.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,rgba(8,17,56,.92) 0%,rgba(8,17,56,.78) 42%,rgba(8,17,56,.30) 100%)' }} />
        <div style={{ position: 'relative', padding: '40px', maxWidth: 760, color: '#fff' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 16 }}>
            Espace réservation de salles
          </div>
          <h1 className="heading-mont" style={{ fontSize: 46, lineHeight: 1.04, margin: '0 0 18px', letterSpacing: '-.02em' }}>
            Réservez vos salles EKOD<br />en quelques clics
          </h1>
          <p style={{ fontSize: 15.5, lineHeight: 1.6, opacity: .9, margin: '0 0 28px', maxWidth: 540 }}>
            Consultez les salles disponibles, choisissez votre créneau sur le planning de la semaine et suivez vos demandes en temps réel.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to="/rooms" className="btn btn-red btn-lg">Découvrir les salles</Link>
            <Link to="/login" className="btn" style={{ border: '1.5px solid rgba(255,255,255,.5)', color: '#fff', background: 'transparent' }}>Se connecter</Link>
          </div>
        </div>
      </div>

      {/* red intro + stats */}
      <div style={{ background: 'var(--red)', color: '#fff', padding: '52px 40px', display: 'flex', gap: 56, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <h2 className="heading-mont" style={{ fontSize: 32, lineHeight: 1.1, margin: '0 0 18px' }}>
            Vos salles, disponibles<br />quand vous en avez besoin
          </h2>
          <p style={{ fontSize: 14.5, lineHeight: 1.65, opacity: .94, margin: 0, maxWidth: 560 }}>
            Un seul espace pour réserver les salles informatiques, studios créa, labs réseau et l'amphithéâtre du campus. Les demandes sont validées par l'équipe pédagogique et la détection de conflits évite les doubles réservations.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 30, flex: 'none', flexWrap: 'wrap' }}>
          <div className="stat-tile" style={{ boxShadow: '9px 9px 0 rgba(8,17,56,.45)' }}>
            <div className="num">{stats ? stats.totalRooms : '—'}</div>
            <div className="label" style={{ maxWidth: 130 }}>salles au catalogue</div>
          </div>
          <div className="stat-tile" style={{ boxShadow: '9px 9px 0 rgba(8,17,56,.45)' }}>
            <div className="num">{stats ? stats.availableRooms : '—'}</div>
            <div className="label" style={{ maxWidth: 130 }}>salles disponibles à la réservation</div>
          </div>
          <div className="stat-tile" style={{ boxShadow: '9px 9px 0 rgba(8,17,56,.45)' }}>
            <div className="num">{stats ? stats.confirmedBookings : '—'}</div>
            <div className="label" style={{ maxWidth: 130 }}>réservations confirmées</div>
          </div>
        </div>
      </div>

      {/* comment ça marche */}
      <div style={{ padding: '50px 40px 16px' }}>
        <h2 className="heading-mont" style={{ fontSize: 24, color: 'var(--navy)', margin: '0 0 28px' }}>Comment ça marche ?</h2>
        <div className="grid-3">
          {[
            { n: 1, t: 'Choisissez une salle', d: 'Filtrez le catalogue par capacité, équipement et disponibilité pour trouver la salle adaptée.', red: false },
            { n: 2, t: 'Sélectionnez un créneau', d: 'Visualisez le planning de la semaine, repérez les créneaux libres et indiquez votre motif.', red: false },
            { n: 3, t: "C'est validé", d: 'Votre demande passe en validation puis vous recevez la confirmation. Suivez tout depuis « Mes réservations ».', red: true },
          ].map(s => (
            <div key={s.n} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 26 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: s.red ? 'var(--red)' : 'var(--navy)',
                color: '#fff', fontFamily: 'Montserrat', fontWeight: 800,
                fontSize: 17, display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 16
              }}>{s.n}</div>
              <div className="heading-mont" style={{ fontSize: 16, color: 'var(--navy)', marginBottom: 8 }}>{s.t}</div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#6B6B7B', margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '36px 40px 48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
          <h2 className="heading-mont" style={{ fontSize: 24, color: 'var(--navy)', margin: 0 }}>Les salles les plus demandées</h2>
          <Link to="/rooms" style={{ fontSize: 13, color: 'var(--red)', fontWeight: 700 }}>Voir le catalogue ›</Link>
        </div>
        <div className="grid-3">
          <div className="room-card">
            <div className="cover room-stripe-navy">
              <div className="top-left"><span className="badge available">● Disponible</span></div>
              <div className="title">
                <div className="name">Salle B204</div>
                <div className="kind">Salle informatique · 24 pl.</div>
              </div>
            </div>
          </div>
          <div className="room-card">
            <div className="cover room-stripe-red">
              <div className="top-left">
                <span className="badge available" style={{ background: '#fff', color: 'var(--red)' }}>● Disponible</span>
              </div>
              <div className="title">
                <div className="name">Amphi Turing</div>
                <div className="kind">Amphithéâtre · 80 pl.</div>
              </div>
            </div>
          </div>
          <div className="room-card">
            <div className="cover room-stripe-navy">
              <div className="top-left"><span className="badge available">● Disponible</span></div>
              <div className="title">
                <div className="name">Studio D102</div>
                <div className="kind">Studio Créa / UX · 18 pl.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}