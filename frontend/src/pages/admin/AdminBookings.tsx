import { useEffect, useMemo, useState } from 'react'
import { confirmBooking, listAll, rejectBooking } from '../../api/bookings'
import { listRooms } from '../../api/rooms'
import type { BookingDTO, RoomDTO } from '../../api/types'

const DAY_SHORT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
function fmtSlot(b: BookingDTO) {
  const s = new Date(b.startTime), e = new Date(b.endTime)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${DAY_SHORT[s.getDay()]} ${s.getDate()} · ${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`
}

export default function AdminBookings() {
  const [list, setList] = useState<BookingDTO[]>([])
  const [rooms, setRooms] = useState<RoomDTO[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const [b, r] = await Promise.all([listAll(), listRooms()])
      setList(b); setRooms(r)
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Erreur')
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const pending = useMemo(() => list.filter(b => b.status === 'PENDING'), [list])
  const todayConfirmed = useMemo(() => {
    const t = new Date(); t.setHours(0, 0, 0, 0)
    const tt = new Date(t); tt.setDate(tt.getDate() + 1)
    return list.filter(b => b.status === 'CONFIRMED' && new Date(b.startTime) >= t && new Date(b.startTime) < tt).length
  }, [list])

  const conflicts = useMemo(() => {
    const ids = new Set<number>()
    for (let i = 0; i < pending.length; i++) {
      for (const other of list) {
        if (other.id === pending[i].id) continue
        if (other.status !== 'CONFIRMED' && other.status !== 'PENDING') continue
        if (other.roomId !== pending[i].roomId) continue
        const s1 = new Date(pending[i].startTime).getTime(), e1 = new Date(pending[i].endTime).getTime()
        const s2 = new Date(other.startTime).getTime(), e2 = new Date(other.endTime).getTime()
        if (s1 < e2 && e1 > s2) ids.add(pending[i].id)
      }
    }
    return ids
  }, [pending, list])

  async function confirm(id: number) {
    try { await confirmBooking(id); load() } catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
  }
  async function reject(id: number) {
    try { await rejectBooking(id); load() } catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
  }

  return (
    <>
      <div className="ek-hero-red">
        <div className="eyebrow">Tableau de bord</div>
        <h1>Demandes à traiter</h1>
      </div>

      <div style={{ padding: '34px 40px 14px', display: 'flex', gap: 34, flexWrap: 'wrap' }}>
        <div className="stat-tile"><div className="num">{pending.length}</div><div className="label">demandes en attente</div></div>
        <div className="stat-tile"><div className="num">{todayConfirmed}</div><div className="label">confirmées aujourd'hui</div></div>
        <div className="stat-tile"><div className="num">{rooms.length}</div><div className="label">salles au catalogue</div></div>
        <div className="stat-tile"><div className="num">{conflicts.size}</div><div className="label">conflits détectés</div></div>
      </div>

      <div style={{ padding: '26px 40px 44px' }}>
        <div className="heading-mont" style={{ fontSize: 16, color: 'var(--navy)', marginBottom: 16 }}>En attente de validation</div>
        {err && <div className="error-msg">{err}</div>}
        {loading && <div className="center-page"><span className="spinner" />&nbsp; Chargement…</div>}

        {!loading && (
          <div className="table-wrap">
            <div className="table-head">
              <div style={{ width: 150, flex: 'none' }}>Étudiant</div>
              <div style={{ flex: 1 }}>Salle</div>
              <div style={{ width: 220, flex: 'none' }}>Créneau</div>
              <div style={{ flex: 1 }}>Motif</div>
              <div style={{ width: 230, flex: 'none', textAlign: 'right' }}>Action</div>
            </div>
            {pending.length === 0 && (
              <div className="table-row" style={{ justifyContent: 'center', color: 'var(--grey-1)' }}>
                Aucune demande en attente.
              </div>
            )}
            {pending.map(b => {
              const inConflict = conflicts.has(b.id)
              return (
                <div key={b.id} className={`table-row ${inConflict ? 'conflict' : ''}`}>
                  <div style={{ width: 150, flex: 'none', fontWeight: 700, color: 'var(--navy)' }}>{b.userEmail.split('@')[0]}</div>
                  <div style={{ flex: 1, fontWeight: 700, color: 'var(--navy)' }}>
                    {b.roomName}
                    {inConflict && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--red-soft-bg)', color: 'var(--red-soft-fg)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4, marginLeft: 8, letterSpacing: '.04em' }}>
                        ⚠ Conflit
                      </span>
                    )}
                  </div>
                  <div style={{ width: 220, flex: 'none', color: 'var(--text-2)', fontWeight: 600 }}>{fmtSlot(b)}</div>
                  <div style={{ flex: 1, color: '#6B6B7B' }}>{b.purpose || '—'}</div>
                  <div style={{ width: 230, flex: 'none', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-green" disabled={inConflict} onClick={() => confirm(b.id)}>Confirmer</button>
                    <button className="btn btn-outline-red" onClick={() => reject(b.id)}>Rejeter</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}