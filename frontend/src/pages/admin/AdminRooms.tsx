import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoom, deleteRoom, listRooms, updateRoom } from '../../api/rooms'
import { listAll } from '../../api/bookings'
import { listRoomFiles, uploadRoomFile, deleteRoomFile } from '../../api/files'
import type { BookingDTO, CreateRoomDTO, RoomDTO, RoomFileDTO } from '../../api/types'

function formatBytes(n: number): string {
  if (n < 1024) return `${n} o`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} Ko`
  return `${(n / 1024 / 1024).toFixed(1)} Mo`
}

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i) // 8..17 (slots up to 18h)
const ROW_PX = 44
const DAY_LABELS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM']
const MONTHS = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']

function startOfWeek(d: Date) {
  const c = new Date(d)
  const day = (c.getDay() + 6) % 7 // monday=0
  c.setHours(0, 0, 0, 0)
  c.setDate(c.getDate() - day)
  return c
}
function addDays(d: Date, n: number) { const c = new Date(d); c.setDate(c.getDate() + n); return c }
function fmtRange(start: Date, end: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(start.getHours())}:${p(start.getMinutes())}–${p(end.getHours())}:${p(end.getMinutes())}`
}

interface EditState {
  id: number | null
  name: string
  description: string
  capacity: number
  imageUrl: string
  available: boolean
  equipmentsText: string
}

const EMPTY: EditState = { id: null, name: '', description: '', capacity: 10, imageUrl: '', available: true, equipmentsText: '' }

export default function AdminRooms() {
  const [rooms, setRooms] = useState<RoomDTO[]>([])
  const [edit, setEdit] = useState<EditState | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [planning, setPlanning] = useState<RoomDTO | null>(null)
  const [bookings, setBookings] = useState<BookingDTO[]>([])
  const [files, setFiles] = useState<RoomFileDTO[]>([])
  const [fileBusy, setFileBusy] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()))
  const [now, setNow] = useState<Date>(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(t)
  }, [])

  async function load() {
    try { setRooms(await listRooms()) }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
  }
  useEffect(() => { load() }, [])

  function openPlanning(r: RoomDTO) {
    setPlanning(r); setEdit(null); setErr(null)
    setWeekStart(startOfWeek(new Date()))
    listAll().then(setBookings).catch(() => {})
  }
  function closePlanning() { setPlanning(null) }

  const days = useMemo(() => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const roomBookings = useMemo(() => {
    if (!planning) return []
    return bookings.filter(b =>
      b.roomId === planning.id &&
      (b.status === 'PENDING' || b.status === 'CONFIRMED') &&
      new Date(b.startTime) >= weekStart &&
      new Date(b.startTime) < addDays(weekStart, 7),
    )
  }, [bookings, planning, weekStart])

  function openCreate() { setEdit({ ...EMPTY }); setPlanning(null); setErr(null); setFiles([]) }
  function openEdit(r: RoomDTO) {
    setEdit({
      id: r.id,
      name: r.name,
      description: r.description ?? '',
      capacity: r.capacity,
      imageUrl: r.imageUrl ?? '',
      available: r.available,
      equipmentsText: (r.equipments ?? []).join(', '),
    })
    setPlanning(null)
    setErr(null)
    setFiles([])
    loadFiles(r.id)
  }
  function close() { setEdit(null); setFiles([]) }

  async function loadFiles(roomId: number) {
    try { setFiles(await listRoomFiles(roomId)) }
    catch { /* la salle peut ne pas avoir de fichiers */ }
  }

  async function onUploadFile(e: React.ChangeEvent<HTMLInputElement>, category: 'PHOTO' | 'DOCUMENT') {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !edit?.id) return
    setFileBusy(true); setErr(null)
    try {
      await uploadRoomFile(edit.id, file, category)
      await loadFiles(edit.id)
      load() // rafraîchit les covers du catalogue
    } catch (e: any) {
      setErr(e.response?.data?.message || "Échec de l'envoi du fichier")
    } finally {
      setFileBusy(false)
    }
  }

  async function removeFile(fileId: number) {
    if (!edit?.id || !confirm('Supprimer ce fichier ?')) return
    setFileBusy(true); setErr(null)
    try {
      await deleteRoomFile(edit.id, fileId)
      await loadFiles(edit.id)
      load()
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Suppression impossible')
    } finally {
      setFileBusy(false)
    }
  }

  async function save() {
    if (!edit) return
    setBusy(true); setErr(null)
    const dto: CreateRoomDTO = {
      name: edit.name,
      description: edit.description,
      capacity: edit.capacity,
      imageUrl: edit.imageUrl,
      available: edit.available,
      equipmentIds: [],
    }
    try {
      if (edit.id) await updateRoom(edit.id, dto)
      else await createRoom(dto)
      close(); load()
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Erreur d\'enregistrement')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: number) {
    if (!confirm('Supprimer cette salle ?')) return
    try { await deleteRoom(id); load() }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
  }

  async function toggleAvailable(r: RoomDTO) {
    setRooms(prev => prev.map(x => x.id === r.id ? { ...x, available: !x.available } : x))
    try {
      await updateRoom(r.id, {
        name: r.name,
        description: r.description ?? '',
        capacity: r.capacity,
        imageUrl: r.imageUrl ?? '',
        available: !r.available,
        equipmentIds: [],
      })
      load()
    } catch (e: any) {
      setErr(e.response?.data?.message || 'Erreur de mise à jour')
      load()
    }
  }

  return (
    <>
      <div className="ek-hero-red" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow">Catalogue</div>
          <h1>Gestion des salles</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ textAlign: 'right', color: '#fff' }}>
            <div className="heading-mont" style={{ fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
              {now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'capitalize', opacity: .9 }}>
              {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
          <button className="btn btn-white" onClick={openCreate}>+ Nouvelle salle</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 480, padding: '26px 30px 44px 40px' }}>
          {err && !edit && <div className="error-msg">{err}</div>}
          <div className="table-wrap">
            <div className="table-head">
              <div style={{ flex: 1.4 }}>Salle</div>
              <div style={{ width: 90, flex: 'none' }}>Capacité</div>
              <div style={{ flex: 1.6 }}>Équipements</div>
              <div style={{ width: 110, flex: 'none' }}>Dispo.</div>
              <div style={{ width: 90, flex: 'none', textAlign: 'right' }}>Actions</div>
            </div>
            {rooms.map(r => (
              <div key={r.id} className={`table-row ${edit?.id === r.id || planning?.id === r.id ? 'active' : ''}`}>
                <div style={{ flex: 1.4 }}>
                  <div className="heading-mont" onClick={() => openPlanning(r)} style={{ color: 'var(--navy)', cursor: 'pointer' }} title="Voir le planning de la semaine">{r.name}</div>
                  <div style={{ fontWeight: 600, color: 'var(--grey-1)', fontSize: 12 }}>{(r.description ?? '').split(/[—.\n]/)[0].slice(0, 40)}</div>
                </div>
                <div style={{ width: 90, flex: 'none', fontWeight: 700, color: 'var(--navy)' }}>{r.capacity}</div>
                <div style={{ flex: 1.6, color: '#6B6B7B', fontSize: 12 }}>{(r.equipments ?? []).join(' · ') || '—'}</div>
                <div style={{ width: 110, flex: 'none' }}>
                  <button
                    type="button"
                    className={`switch ${r.available ? '' : 'off'}`}
                    onClick={() => toggleAvailable(r)}
                    title={r.available ? 'Désactiver la salle (cachée aux étudiants)' : 'Réactiver la salle'}
                  />
                </div>
                <div style={{ width: 90, flex: 'none', textAlign: 'right', display: 'flex', gap: 12, justifyContent: 'flex-end', color: 'var(--navy)', fontWeight: 800, fontSize: 16 }}>
                  <span onClick={() => openEdit(r)} style={{ cursor: 'pointer' }} title="Modifier">✎</span>
                  <span onClick={() => remove(r.id)} style={{ color: 'var(--red-soft-fg)', cursor: 'pointer' }} title="Supprimer">🗑</span>
                </div>
              </div>
            ))}
            {rooms.length === 0 && (
              <div className="table-row" style={{ justifyContent: 'center', color: 'var(--grey-1)' }}>Aucune salle.</div>
            )}
          </div>
        </div>

        {edit && (
          <div style={{ width: 368, flex: 'none', background: 'var(--bg-app)', borderLeft: '1px solid var(--border)', padding: '26px 30px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="heading-mont" style={{ fontSize: 17, color: 'var(--navy)' }}>
                {edit.id ? 'Modifier la salle' : 'Nouvelle salle'}
              </div>
              <span style={{ color: 'var(--grey-3)', fontSize: 18, cursor: 'pointer' }} onClick={close}>✕</span>
            </div>

            <label className="field-label" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Nom de la salle</label>
            <input className="input" value={edit.name} onChange={e => setEdit({ ...edit, name: e.target.value })} style={{ marginBottom: 16 }} />

            <label className="field-label" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Description</label>
            <textarea className="textarea" value={edit.description} onChange={e => setEdit({ ...edit, description: e.target.value })} style={{ minHeight: 60, marginBottom: 16 }} />

            <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label className="field-label" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Capacité</label>
                <input type="number" min={1} className="input" value={edit.capacity} onChange={e => setEdit({ ...edit, capacity: Number(e.target.value) })} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="field-label" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Image URL</label>
                <input className="input" placeholder="https://…" value={edit.imageUrl} onChange={e => setEdit({ ...edit, imageUrl: e.target.value })} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: 13, background: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}>
              <button type="button" onClick={() => setEdit({ ...edit, available: !edit.available })} className={`switch ${edit.available ? '' : 'off'}`} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Salle disponible à la réservation</span>
            </div>

            {/* ----- Fichiers : photos & documents ----- */}
            <div style={{ marginBottom: 22 }}>
              <label className="field-label" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Photos &amp; documents</label>
              {!edit.id ? (
                <div className="info-msg">Enregistrez d'abord la salle, puis rouvrez-la pour ajouter des photos et des documents (PDF, plans, consignes…).</div>
              ) : (
                <>
                  <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onUploadFile(e, 'PHOTO')} />
                  <input ref={docInputRef} type="file" style={{ display: 'none' }} onChange={e => onUploadFile(e, 'DOCUMENT')} />
                  <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                    <button type="button" className="btn btn-ghost" style={{ flex: 1, padding: '9px 0', fontSize: 11.5 }} disabled={fileBusy} onClick={() => photoInputRef.current?.click()}>
                      + Photo
                    </button>
                    <button type="button" className="btn btn-ghost" style={{ flex: 1, padding: '9px 0', fontSize: 11.5 }} disabled={fileBusy} onClick={() => docInputRef.current?.click()}>
                      + Document
                    </button>
                  </div>
                  {fileBusy && <div style={{ fontSize: 12, color: 'var(--grey-1)', marginBottom: 8 }}><span className="spinner" />&nbsp; Traitement…</div>}

                  {files.length === 0 && !fileBusy && (
                    <div style={{ fontSize: 12, color: 'var(--grey-1)' }}>Aucun fichier pour le moment.</div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {files.map(f => (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 8, background: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}>
                        {f.category === 'PHOTO'
                          ? <span style={{ width: 38, height: 38, borderRadius: 6, flexShrink: 0, background: `center/cover no-repeat url(${f.url})` }} />
                          : <span style={{ width: 38, height: 38, borderRadius: 6, flexShrink: 0, background: 'var(--red-soft-bg)', color: 'var(--red-soft-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>📄</span>}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: 'var(--navy)', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.originalName}</a>
                          <span style={{ fontSize: 11, color: 'var(--grey-1)' }}>{f.category === 'PHOTO' ? 'Photo' : 'Document'} · {formatBytes(f.sizeBytes)}</span>
                        </div>
                        <span onClick={() => removeFile(f.id)} title="Supprimer" style={{ cursor: 'pointer', color: 'var(--red-soft-fg)', fontSize: 15, padding: '0 4px' }}>🗑</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {err && <div className="error-msg">{err}</div>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-red" style={{ flex: 1 }} disabled={busy} onClick={save}>{busy ? '...' : 'Enregistrer'}</button>
              <button className="btn btn-ghost" onClick={close}>Annuler</button>
            </div>
          </div>
        )}

        {planning && !edit && (() => {
          const weekEnd = addDays(weekStart, 4)
          const weekLabel = `Semaine du ${weekStart.getDate()} – ${weekEnd.getDate()} ${MONTHS[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
          return (
            <div style={{ width: 620, flex: 'none', background: 'var(--bg-app)', borderLeft: '1px solid var(--border)', padding: '26px 30px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div className="heading-mont" style={{ fontSize: 17, color: 'var(--navy)' }}>Planning · {planning.name}</div>
                <span style={{ color: 'var(--grey-3)', fontSize: 18, cursor: 'pointer' }} onClick={closePlanning}>✕</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--grey-1)' }}>{weekLabel}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="btn btn-ghost" style={{ width: 32, height: 32, padding: 0 }}>‹</button>
                  <button onClick={() => setWeekStart(startOfWeek(new Date()))} className="btn btn-ghost" style={{ height: 32, padding: '0 12px', fontSize: 12 }}>Aujourd'hui</button>
                  <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="btn btn-ghost" style={{ width: 32, height: 32, padding: 0 }}>›</button>
                </div>
              </div>

              {/* day header */}
              <div style={{ display: 'flex' }}>
                <div style={{ width: 50, flex: 'none' }} />
                <div style={{ flex: 1, display: 'flex', textAlign: 'center' }}>
                  {days.map((d, i) => (
                    <div key={i} style={{ flex: 1, paddingBottom: 8 }}>
                      <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 12, color: 'var(--navy)' }}>{DAY_LABELS[i]}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--grey-3)' }}>{d.getDate()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* grid body */}
              <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
                <div style={{ width: 50, flex: 'none' }}>
                  {HOURS.map(h => (
                    <div key={h} style={{ height: ROW_PX, fontSize: 10.5, color: 'var(--grey-3)', fontWeight: 600, paddingTop: 3, textAlign: 'right', paddingRight: 8 }}>
                      {String(h).padStart(2, '0')}:00
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1, display: 'flex', position: 'relative', background: `repeating-linear-gradient(#ffffff,#ffffff ${ROW_PX - 1}px,#EFEFF2 ${ROW_PX - 1}px,#EFEFF2 ${ROW_PX}px)` }}>
                  {days.map((day, i) => (
                    <div key={i} style={{ flex: 1, position: 'relative', borderLeft: '1px solid #EFEFF2' }}>
                      {roomBookings
                        .filter(b => new Date(b.startTime).toDateString() === day.toDateString())
                        .map(b => {
                          const s = new Date(b.startTime), e = new Date(b.endTime)
                          const top = (s.getHours() + s.getMinutes() / 60 - 8) * ROW_PX
                          const h = ((e.getTime() - s.getTime()) / 3600000) * ROW_PX
                          const color = b.status === 'CONFIRMED' ? 'var(--green)' : 'var(--orange)'
                          return (
                            <div key={b.id} title={`${fmtRange(s, e)} · ${b.userEmail}`} style={{
                              position: 'absolute', left: 2, right: 2, top, height: Math.max(h, 16),
                              background: color, color: '#fff', borderRadius: 5, padding: '4px 6px',
                              fontSize: 10, fontWeight: 700, overflow: 'hidden',
                            }}>
                              <div>{fmtRange(s, e)}</div>
                              <div style={{ opacity: .92, fontWeight: 600 }}>{b.purpose || b.userEmail}</div>
                            </div>
                          )
                        })}
                      {/* current-time indicator */}
                      {day.toDateString() === now.toDateString() && now.getHours() >= 8 && now.getHours() < 18 && (() => {
                        const top = (now.getHours() + now.getMinutes() / 60 - 8) * ROW_PX
                        const label = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                        return (
                          <div style={{ position: 'absolute', left: 0, right: 0, top, height: 0, zIndex: 5, pointerEvents: 'none' }}>
                            <div style={{ position: 'absolute', left: -34, top: -8, fontSize: 9.5, fontWeight: 800, color: 'var(--red)', background: '#fff', padding: '0 2px' }}>{label}</div>
                            <div style={{ position: 'absolute', left: -4, top: -3, width: 6, height: 6, borderRadius: '50%', background: 'var(--red)' }} />
                            <div style={{ height: 2, background: 'var(--red)' }} />
                          </div>
                        )
                      })()}
                    </div>
                  ))}
                </div>
              </div>

              {/* legend */}
              <div style={{ display: 'flex', gap: 18, marginTop: 16, fontSize: 11.5, color: '#6B6B7B', fontWeight: 600, flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 13, height: 13, borderRadius: 3, background: 'var(--green)' }} />Confirmé</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ width: 13, height: 13, borderRadius: 3, background: 'var(--orange)' }} />En attente</span>
              </div>
            </div>
          )
        })()}
      </div>
    </>
  )
}