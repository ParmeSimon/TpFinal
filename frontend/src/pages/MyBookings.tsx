import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cancelBooking, listMine } from '../api/bookings'
import type { BookingDTO, BookingStatus } from '../api/types'

const MONTHS_SHORT = ['Janv.', 'Févr.', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.', 'Oct.', 'Nov.', 'Déc.']

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: '● En attente',
  CONFIRMED: '● Confirmée',
  CANCELLED: '● Annulée',
  REJECTED: '● Rejetée',
}

type TabKey = 'all' | BookingStatus

function fmtTime(d: Date) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function MyBookings() {
  const nav = useNavigate()
  const [list, setList] = useState<BookingDTO[]>([])
  const [tab, setTab] = useState<TabKey>('all')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try { setList(await listMine()) }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const counts = useMemo(() => {
    const c = { all: list.length, PENDING: 0, CONFIRMED: 0, CANCELLED: 0, REJECTED: 0 } as Record<TabKey, number>
    list.forEach(b => { c[b.status] = (c[b.status] || 0) + 1 })
    return c
  }, [list])

  const filtered = useMemo(() => {
    const sorted = [...list].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    return tab === 'all' ? sorted : sorted.filter(b => b.status === tab)
  }, [list, tab])

  async function cancel(id: number) {
    if (!confirm('Annuler cette réservation ?')) return
    try { await cancelBooking(id); load() }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
  }

  return (
    <>
      <div className="ek-hero-red">
        <div className="eyebrow">Espace étudiant</div>
        <h1>Mes réservations</h1>
      </div>

      <div className="tabs">
        <div className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>Toutes <span className="count">{counts.all}</span></div>
        <div className={`tab ${tab === 'PENDING' ? 'active' : ''}`} onClick={() => setTab('PENDING')}>En attente <span className="count">{counts.PENDING || 0}</span></div>
        <div className={`tab ${tab === 'CONFIRMED' ? 'active' : ''}`} onClick={() => setTab('CONFIRMED')}>Confirmées <span className="count">{counts.CONFIRMED || 0}</span></div>
        <div className={`tab ${tab === 'CANCELLED' ? 'active' : ''}`} onClick={() => setTab('CANCELLED')}>Annulées <span className="count">{counts.CANCELLED || 0}</span></div>
        <div className={`tab ${tab === 'REJECTED' ? 'active' : ''}`} onClick={() => setTab('REJECTED')}>Rejetées <span className="count">{counts.REJECTED || 0}</span></div>
      </div>

      <div style={{ padding: '24px 40px 44px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {err && <div className="error-msg">{err}</div>}
        {loading && <div className="center-page"><span className="spinner" />&nbsp; Chargement…</div>}
        {!loading && filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--grey-1)' }}>Aucune réservation dans cette catégorie.</div>
        )}
        {filtered.map(b => {
          const s = new Date(b.startTime); const e = new Date(b.endTime)
          const past = e.getTime() < Date.now()
          return (
            <div key={b.id} className={`bk-row ${b.status}`}>
              <div className="date">
                <div className="d">{s.getDate()}</div>
                <div className="m">{MONTHS_SHORT[s.getMonth()]}</div>
              </div>
              <div className="sep" />
              <div className="info">
                <div className="title" style={b.status === 'CANCELLED' ? { textDecoration: 'line-through' } : undefined}>
                  {b.roomName}
                </div>
                <div className="sub">
                  {fmtTime(s)} – {fmtTime(e)} {b.purpose ? `· ${b.purpose}` : ''}
                </div>
              </div>
              <span className={`badge ${b.status}`}>{STATUS_LABEL[b.status]}</span>
              {(b.status === 'PENDING' || b.status === 'CONFIRMED') && !past
                ? <button className="link" onClick={() => cancel(b.id)}>Annuler</button>
                : b.status === 'REJECTED'
                  ? <button className="link" onClick={() => nav(`/rooms/${b.roomId}/book`)}>Re-réserver</button>
                  : past
                    ? <span className="link muted">Terminée</span>
                    : <span className="link muted">—</span>}
            </div>
          )
        })}
      </div>
    </>
  )
}