import { useEffect, useState } from 'react'
import { createRoom, deleteRoom, listRooms, updateRoom } from '../../api/rooms'
import type { CreateRoomDTO, RoomDTO } from '../../api/types'

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

  async function load() {
    try { setRooms(await listRooms()) }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
  }
  useEffect(() => { load() }, [])

  function openCreate() { setEdit({ ...EMPTY }); setErr(null) }
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
    setErr(null)
  }
  function close() { setEdit(null) }

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

  return (
    <>
      <div className="ek-hero-red" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="eyebrow">Catalogue</div>
          <h1>Gestion des salles</h1>
        </div>
        <button className="btn btn-white" onClick={openCreate}>+ Nouvelle salle</button>
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
              <div key={r.id} className={`table-row ${edit?.id === r.id ? 'active' : ''}`}>
                <div style={{ flex: 1.4 }}>
                  <div className="heading-mont" style={{ color: 'var(--navy)' }}>{r.name}</div>
                  <div style={{ fontWeight: 600, color: 'var(--grey-1)', fontSize: 12 }}>{(r.description ?? '').split(/[—.\n]/)[0].slice(0, 40)}</div>
                </div>
                <div style={{ width: 90, flex: 'none', fontWeight: 700, color: 'var(--navy)' }}>{r.capacity}</div>
                <div style={{ flex: 1.6, color: '#6B6B7B', fontSize: 12 }}>{(r.equipments ?? []).join(' · ') || '—'}</div>
                <div style={{ width: 110, flex: 'none' }}>
                  <span className={`switch ${r.available ? '' : 'off'}`} style={{ pointerEvents: 'none' }} />
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

            {err && <div className="error-msg">{err}</div>}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-red" style={{ flex: 1 }} disabled={busy} onClick={save}>{busy ? '...' : 'Enregistrer'}</button>
              <button className="btn btn-ghost" onClick={close}>Annuler</button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}