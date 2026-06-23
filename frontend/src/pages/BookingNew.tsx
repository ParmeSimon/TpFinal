import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getRoom } from '../api/rooms'
import { createBooking, listAll, listMine } from '../api/bookings'
import type { BookingDTO, RoomDTO } from '../api/types'
import { useAuth } from '../auth/AuthContext'

const HOURS = Array.from({ length: 12 }, (_, i) => 8 + i) // 8..19
const ROW_PX = 46
const DAY_START = 8
const DAY_END = 20
const SNAP_MIN = 15 // resize step in minutes
const DAY_LABELS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']

function withMinutes(base: Date, totalMin: number) {
  const d = new Date(base)
  d.setHours(0, 0, 0, 0)
  d.setMinutes(totalMin)
  return d
}

function startOfWeek(d: Date) {
  const c = new Date(d)
  const day = (c.getDay() + 6) % 7 // monday=0
  c.setHours(0, 0, 0, 0)
  c.setDate(c.getDate() - day)
  return c
}

function addDays(d: Date, n: number) {
  const c = new Date(d); c.setDate(c.getDate() + n); return c
}

function toIsoLocal(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`
}

function fmtRange(start: Date, end: Date) {
  return `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}–${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`
}

const MONTHS = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

export default function BookingNew() {
  const { id } = useParams()
  const nav = useNavigate()
  const { isAdmin } = useAuth()
  const [room, setRoom] = useState<RoomDTO | null>(null)
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()))
  const [bookings, setBookings] = useState<BookingDTO[]>([])
  const [selStart, setSelStart] = useState<Date | null>(null)
  const [selEnd, setSelEnd] = useState<Date | null>(null)
  const [purpose, setPurpose] = useState('')
  const [participants, setParticipants] = useState(12)
  const [err, setErr] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [drag, setDrag] = useState<null | 'top' | 'bottom'>(null)
  const gridRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!id) return
    getRoom(Number(id)).then(setRoom).catch(e => setErr(e.response?.data?.message || 'Salle introuvable'))
  }, [id])

  // drag-resize of the selection
  useEffect(() => {
    if (!drag) return
    function onMove(ev: MouseEvent) {
      const grid = gridRef.current
      if (!grid || !selStart || !selEnd) return
      const rect = grid.getBoundingClientRect()
      const min = DAY_START * 60 + Math.round(((ev.clientY - rect.top) / ROW_PX) * 60 / SNAP_MIN) * SNAP_MIN
      const clamped = Math.max(DAY_START * 60, Math.min(DAY_END * 60, min))
      if (drag === 'top') {
        const endMin = selEnd.getHours() * 60 + selEnd.getMinutes()
        setSelStart(withMinutes(selStart, Math.min(clamped, endMin - SNAP_MIN)))
      } else {
        const startMin = selStart.getHours() * 60 + selStart.getMinutes()
        setSelEnd(withMinutes(selEnd, Math.max(clamped, startMin + SNAP_MIN)))
      }
    }
    function onUp() { setDrag(null) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [drag, selStart, selEnd])

  useEffect(() => {
    (isAdmin ? listAll() : listMine())
      .then(setBookings)
      .catch(() => {})
  }, [isAdmin])

  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart])

  const roomBookings = useMemo(() => {
    if (!room) return []
    return bookings.filter(b =>
      b.roomId === room.id &&
      (b.status === 'PENDING' || b.status === 'CONFIRMED') &&
      new Date(b.startTime) >= weekStart &&
      new Date(b.startTime) < addDays(weekStart, 7)
    )
  }, [bookings, room, weekStart])

  function pickSlot(day: Date, hour: number) {
    const s = new Date(day); s.setHours(hour, 0, 0, 0)
    const e = new Date(s); e.setHours(hour + 2)
    setSelStart(s); setSelEnd(e); setErr(null)
  }

  async function submit() {
    if (!room || !selStart || !selEnd) {
      setErr('Sélectionnez un créneau sur le planning'); return
    }
    setSubmitting(true); setErr(null)
    try {
      await createBooking({
        roomId: room.id,
        startTime: toIsoLocal(selStart),
        endTime: toIsoLocal(selEnd),
        purpose,
      })
      nav('/bookings')
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Erreur lors de la réservation')
    } finally {
      setSubmitting(false)
    }
  }

  if (!room) return <div className="center-page"><span className="spinner" />&nbsp; Chargement…</div>

  const weekEnd = addDays(weekStart, 5)
  const weekLabel = `Semaine du ${weekStart.getDate()} – ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`

  return (
    <>
      <div className="ek-hero-red" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 18 }}>
        <div>
          <div className="eyebrow">Nouvelle réservation</div>
          <h1 style={{ fontSize: 32 }}>{room.name} · choisissez un créneau</h1>
        </div>
        <div style={{ background: 'rgba(255,255,255,.16)', padding: '8px 16px', borderRadius: 6, fontSize: 12.5, fontWeight: 700 }}>
          {room.capacity} places · {room.description ? room.description.split(/[—.\n]/)[0].slice(0, 40) : 'Salle'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, flexWrap: 'wrap' }}>
        {/* calendar */}
        <div style={{ flex: 1, minWidth: 480, padding: '26px 30px 36px 40px', borderRight: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div className="heading-mont" style={{ fontSize: 16, color: 'var(--navy)' }}>{weekLabel}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="btn btn-ghost" style={{ width: 34, height: 34, padding: 0 }}>‹</button>
              <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="btn btn-ghost" style={{ height: 34, padding: '0 14px', fontSize: 12.5 }}>Aujourd'hui</button>
              <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="btn btn-ghost" style={{ width: 34, height: 34, padding: 0 }}>›</button>
            </div>
          </div>

          {/* day header */}
          <div style={{ display: 'flex', marginBottom: 0 }}>
            <div style={{ width: 58, flex: 'none' }} />
            <div style={{ flex: 1, display: 'flex', textAlign: 'center' }}>
              {days.map((d, i) => {
                const isSel = selStart && d.toDateString() === selStart.toDateString()
                return (
                  <div key={i} style={{ flex: 1, paddingBottom: 10 }}>
                    <div style={{ fontFamily: 'Montserrat', fontWeight: isSel ? 800 : 700, fontSize: 12.5, color: isSel ? 'var(--red)' : 'var(--navy)' }}>{DAY_LABELS[i]}</div>
                    <div style={{ fontSize: 11, fontWeight: isSel ? 700 : 600, color: isSel ? 'var(--red)' : 'var(--grey-3)' }}>{d.getDate()}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* grid body */}
          <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
            {/* time labels */}
            <div style={{ width: 58, flex: 'none' }}>
              {HOURS.map(h => (
                <div key={h} style={{ height: ROW_PX, fontSize: 10.5, color: 'var(--grey-3)', fontWeight: 600, paddingTop: 3, textAlign: 'right', paddingRight: 10 }}>
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>
            {/* columns */}
            <div ref={gridRef} style={{ flex: 1, display: 'flex', position: 'relative', userSelect: drag ? 'none' : 'auto', background: `repeating-linear-gradient(#ffffff,#ffffff ${ROW_PX - 1}px,#EFEFF2 ${ROW_PX - 1}px,#EFEFF2 ${ROW_PX}px)` }}>
              {days.map((day, i) => {
                const isSelDay = selStart && day.toDateString() === selStart.toDateString()
                return (
                  <div key={i} style={{ flex: 1, position: 'relative', borderLeft: '1px solid #EFEFF2', background: isSelDay ? 'rgba(251,45,28,.04)' : 'transparent' }}>
                    {/* click zones per hour */}
                    {HOURS.map(h => (
                      <div
                        key={h}
                        onClick={() => pickSlot(day, h)}
                        style={{ height: ROW_PX, cursor: 'pointer' }}
                        title={`${String(h).padStart(2, '0')}:00`}
                      />
                    ))}
                    {/* existing bookings */}
                    {roomBookings
                      .filter(b => new Date(b.startTime).toDateString() === day.toDateString())
                      .map(b => {
                        const s = new Date(b.startTime), e = new Date(b.endTime)
                        const top = (s.getHours() + s.getMinutes() / 60 - 8) * ROW_PX
                        const h = ((e.getTime() - s.getTime()) / 3600000) * ROW_PX
                        const color = b.status === 'CONFIRMED' ? 'var(--green)' : 'var(--orange)'
                        return (
                          <div key={b.id} style={{
                            position: 'absolute', left: 3, right: 3, top, height: h,
                            background: color, color: '#fff',
                            borderRadius: 5, padding: '6px 8px',
                            fontSize: 10.5, fontWeight: 700, overflow: 'hidden'
                          }}>
                            <div>{fmtRange(s, e)}</div>
                            <div style={{ opacity: .92, fontWeight: 600 }}>{b.purpose || '—'}</div>
                          </div>
                        )
                      })}
                    {/* selection overlay */}
                    {isSelDay && selStart && selEnd && (() => {
                      const top = (selStart.getHours() + selStart.getMinutes() / 60 - 8) * ROW_PX
                      const h = ((selEnd.getTime() - selStart.getTime()) / 3600000) * ROW_PX
                      const handle: React.CSSProperties = {
                        position: 'absolute', left: 0, right: 0, height: 10, cursor: 'ns-resize',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                      }
                      const grip = <span style={{ width: 22, height: 3, borderRadius: 2, background: 'rgba(255,255,255,.85)' }} />
                      return (
                        <div style={{
                          position: 'absolute', left: 3, right: 3, top, height: h,
                          background: 'var(--red)', color: '#fff',
                          border: '2px dashed rgba(255,255,255,.7)',
                          borderRadius: 5, padding: '6px 8px',
                          fontSize: 10.5, fontWeight: 800,
                          display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                        }}>
                          <div onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setDrag('top') }} style={{ ...handle, top: -1 }}>{grip}</div>
                          <div>{fmtRange(selStart, selEnd)}</div>
                          <div style={{ fontSize: 10, fontWeight: 700, opacity: .95 }}>✓ Votre sélection</div>
                          <div onMouseDown={e => { e.preventDefault(); e.stopPropagation(); setDrag('bottom') }} style={{ ...handle, bottom: -1 }}>{grip}</div>
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          </div>

          {/* legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 18, fontSize: 11.5, color: '#6B6B7B', fontWeight: 600, flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 13, height: 13, borderRadius: 3, background: 'var(--red)' }} />Votre sélection</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 13, height: 13, borderRadius: 3, background: 'var(--green)' }} />Confirmé</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 13, height: 13, borderRadius: 3, background: 'var(--orange)' }} />En attente</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 13, height: 13, borderRadius: 3, background: 'var(--grey-soft)', border: '1px solid var(--border-3)' }} />Occupé</span>
          </div>
        </div>

        {/* form panel */}
        <div style={{ width: 380, flex: 'none', padding: '26px 32px 32px', background: 'var(--bg-app)' }}>
          <div className="heading-mont" style={{ fontSize: 17, color: 'var(--navy)', marginBottom: 20 }}>Votre demande</div>

          <div className="card" style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--grey-1)', marginBottom: 5 }}>Salle</div>
            <div className="heading-mont" style={{ fontSize: 15, color: 'var(--navy)', marginBottom: 14 }}>{room.name}</div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--grey-1)', marginBottom: 5 }}>Date</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>
                  {selStart ? selStart.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '—'}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--grey-1)', marginBottom: 5 }}>Créneau</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input
                    type="time"
                    step={SNAP_MIN * 60}
                    className="input"
                    disabled={!selStart}
                    value={selStart ? `${String(selStart.getHours()).padStart(2, '0')}:${String(selStart.getMinutes()).padStart(2, '0')}` : ''}
                    onChange={e => {
                      if (!selStart || !selEnd || !e.target.value) return
                      const [h, m] = e.target.value.split(':').map(Number)
                      const ns = withMinutes(selStart, h * 60 + m)
                      if (ns < selEnd) { setSelStart(ns); setErr(null) }
                    }}
                    style={{ padding: '6px 8px', fontSize: 13, width: 92 }}
                  />
                  <span style={{ color: 'var(--grey-1)' }}>–</span>
                  <input
                    type="time"
                    step={SNAP_MIN * 60}
                    className="input"
                    disabled={!selEnd}
                    value={selEnd ? `${String(selEnd.getHours()).padStart(2, '0')}:${String(selEnd.getMinutes()).padStart(2, '0')}` : ''}
                    onChange={e => {
                      if (!selStart || !selEnd || !e.target.value) return
                      const [h, m] = e.target.value.split(':').map(Number)
                      const ne = withMinutes(selEnd, h * 60 + m)
                      if (ne > selStart) { setSelEnd(ne); setErr(null) }
                    }}
                    style={{ padding: '6px 8px', fontSize: 13, width: 92 }}
                  />
                </div>
              </div>
            </div>
          </div>

          <label className="field-label">Motif de la réservation</label>
          <textarea
            className="textarea"
            placeholder="Session de travail projet — groupe Dev Web B2."
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            maxLength={255}
            style={{ marginBottom: 18 }}
          />

          <label className="field-label">Nombre de participants</label>
          <input
            type="number"
            className="input"
            min={1}
            max={room.capacity}
            value={participants}
            onChange={e => setParticipants(Number(e.target.value))}
            style={{ marginBottom: 20 }}
          />

          <div className="info-msg" style={{ marginBottom: 20 }}>
            <span className="icon">ⓘ</span>
            <span>Votre demande sera créée avec le statut <b>En attente</b> et devra être validée par un administrateur.</span>
          </div>

          {err && <div className="error-msg">{err}</div>}

          <button onClick={submit} className="btn btn-red btn-block" disabled={submitting} style={{ padding: 15 }}>
            {submitting ? '...' : 'Confirmer la demande'}
          </button>
        </div>
      </div>
    </>
  )
}