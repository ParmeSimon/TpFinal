import { useEffect, useMemo, useState } from 'react'
import { cancelBooking, confirmBooking, listAll, rejectBooking, updateBooking } from '../../api/bookings'
import { listRooms } from '../../api/rooms'
import type { BookingDTO, RoomDTO } from '../../api/types'

const DAY_SHORT = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.']
const pad = (n: number) => String(n).padStart(2, '0')
function fmtSlot(b: BookingDTO) {
  const s = new Date(b.startTime), e = new Date(b.endTime)
  return `${DAY_SHORT[s.getDay()]} ${s.getDate()} · ${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`
}

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'En attente', CONFIRMED: 'Confirmée', CANCELLED: 'Annulée', REJECTED: 'Rejetée',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: 'var(--orange)', CONFIRMED: 'var(--green)', CANCELLED: 'var(--grey-1)', REJECTED: 'var(--red-soft-fg)',
}

interface EditState {
  id: number
  roomId: number
  date: string  // yyyy-mm-dd
  start: string // HH:MM
  end: string   // HH:MM
  attendees: number
  purpose: string
}

function toEditState(b: BookingDTO): EditState {
  const s = new Date(b.startTime), e = new Date(b.endTime)
  return {
    id: b.id,
    roomId: b.roomId,
    date: `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`,
    start: `${pad(s.getHours())}:${pad(s.getMinutes())}`,
    end: `${pad(e.getHours())}:${pad(e.getMinutes())}`,
    attendees: b.attendees ?? 1,
    purpose: b.purpose ?? '',
  }
}

export default function AdminBookings() {
  const [list, setList] = useState<BookingDTO[]>([])
  const [rooms, setRooms] = useState<RoomDTO[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState<EditState | null>(null)
  const [editErr, setEditErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function load(silent = false) {
    if (!silent) setLoading(true)
    try {
      const [b, r] = await Promise.all([listAll(), listRooms()])
      setList(b); setRooms(r)
      if (silent) setErr(null)
    } catch (e: any) {
      if (!silent) setErr(e.response?.data?.message || 'Erreur')
    } finally {
      if (!silent) setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  // live refresh every 15s (paused while editing to avoid clobbering the form)
  useEffect(() => {
    if (edit) return
    const t = setInterval(() => load(true), 15000)
    return () => clearInterval(t)
  }, [edit])

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
  async function cancel(id: number) {
    if (!window.confirm('Annuler cette réservation ?')) return
    try { await cancelBooking(id); load() } catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
  }

  const editRoom = useMemo(() => rooms.find(r => r.id === edit?.roomId), [rooms, edit])

  async function saveEdit() {
    if (!edit) return
    if (edit.end <= edit.start) { setEditErr('La fin doit être après le début'); return }
    if (edit.attendees < 1) { setEditErr('Le nombre de participants doit être supérieur à 0'); return }
    if (editRoom && edit.attendees > editRoom.capacity) {
      setEditErr(`Le nombre de participants (${edit.attendees}) dépasse la capacité de la salle (${editRoom.capacity})`); return
    }
    setSaving(true); setEditErr(null)
    try {
      await updateBooking(edit.id, {
        roomId: edit.roomId,
        startTime: `${edit.date}T${edit.start}:00`,
        endTime: `${edit.date}T${edit.end}:00`,
        purpose: edit.purpose,
        attendees: edit.attendees,
      })
      setEdit(null); load()
    } catch (e: any) {
      setEditErr(e.response?.data?.message || 'Erreur lors de la modification')
    } finally {
      setSaving(false)
    }
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

      {/* toutes les réservations — admin peut modifier / annuler */}
      <div style={{ padding: '0 40px 60px' }}>
        <div className="heading-mont" style={{ fontSize: 16, color: 'var(--navy)', marginBottom: 16 }}>Toutes les réservations</div>
        {!loading && (
          <div className="table-wrap">
            <div className="table-head">
              <div style={{ width: 150, flex: 'none' }}>Utilisateur</div>
              <div style={{ flex: 1 }}>Salle</div>
              <div style={{ width: 220, flex: 'none' }}>Créneau</div>
              <div style={{ width: 70, flex: 'none' }}>Pers.</div>
              <div style={{ width: 110, flex: 'none' }}>Statut</div>
              <div style={{ width: 190, flex: 'none', textAlign: 'right' }}>Action</div>
            </div>
            {list.length === 0 && (
              <div className="table-row" style={{ justifyContent: 'center', color: 'var(--grey-1)' }}>Aucune réservation.</div>
            )}
            {list.map(b => {
              const cancellable = b.status === 'PENDING' || b.status === 'CONFIRMED'
              return (
                <div key={b.id} className="table-row">
                  <div style={{ width: 150, flex: 'none', fontWeight: 700, color: 'var(--navy)' }}>{b.userEmail.split('@')[0]}</div>
                  <div style={{ flex: 1, fontWeight: 700, color: 'var(--navy)' }}>{b.roomName}</div>
                  <div style={{ width: 220, flex: 'none', color: 'var(--text-2)', fontWeight: 600 }}>{fmtSlot(b)}</div>
                  <div style={{ width: 70, flex: 'none', fontWeight: 700, color: 'var(--navy)' }}>{b.attendees ?? '—'}</div>
                  <div style={{ width: 110, flex: 'none', fontWeight: 800, fontSize: 12, color: STATUS_COLOR[b.status] }}>{STATUS_LABEL[b.status] ?? b.status}</div>
                  <div style={{ width: 190, flex: 'none', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="btn btn-ghost" onClick={() => { setEdit(toEditState(b)); setEditErr(null) }}>Modifier</button>
                    <button className="btn btn-outline-red" disabled={!cancellable} onClick={() => cancel(b.id)}>Annuler</button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* modal édition (admin) */}
      {edit && (
        <div onClick={() => setEdit(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(13,16,45,.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div onClick={e => e.stopPropagation()} style={{ width: 440, background: '#fff', borderRadius: 12, padding: '26px 30px 28px', boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="heading-mont" style={{ fontSize: 17, color: 'var(--navy)' }}>Modifier la réservation</div>
              <span style={{ color: 'var(--grey-3)', fontSize: 18, cursor: 'pointer' }} onClick={() => setEdit(null)}>✕</span>
            </div>

            <label className="field-label">Salle</label>
            <select className="input" value={edit.roomId} onChange={e => setEdit({ ...edit, roomId: Number(e.target.value) })} style={{ marginBottom: 16 }}>
              {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (capacité {r.capacity})</option>)}
            </select>

            <label className="field-label">Date</label>
            <input type="date" className="input" value={edit.date} onChange={e => setEdit({ ...edit, date: e.target.value })} style={{ marginBottom: 16 }} />

            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="field-label">Début</label>
                <input type="time" step={900} className="input" value={edit.start} onChange={e => setEdit({ ...edit, start: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label">Fin</label>
                <input type="time" step={900} className="input" value={edit.end} onChange={e => setEdit({ ...edit, end: e.target.value })} />
              </div>
              <div style={{ width: 96, flex: 'none' }}>
                <label className="field-label">Participants</label>
                <input type="number" min={1} max={editRoom?.capacity} className="input" value={edit.attendees} onChange={e => setEdit({ ...edit, attendees: Number(e.target.value) })} />
              </div>
            </div>

            <label className="field-label">Motif</label>
            <textarea className="textarea" value={edit.purpose} maxLength={255} onChange={e => setEdit({ ...edit, purpose: e.target.value })} style={{ minHeight: 60, marginBottom: 18 }} />

            {editErr && <div className="error-msg">{editErr}</div>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-red" style={{ flex: 1 }} disabled={saving} onClick={saveEdit}>{saving ? '...' : 'Enregistrer'}</button>
              <button className="btn btn-ghost" onClick={() => setEdit(null)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}