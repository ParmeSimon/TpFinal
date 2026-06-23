import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getRoom } from '../api/rooms'
import type { RoomDTO } from '../api/types'

export default function RoomDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [room, setRoom] = useState<RoomDTO | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getRoom(Number(id)).then(setRoom).catch(e => setErr(e.response?.data?.message || 'Salle introuvable'))
  }, [id])

  if (err) return <div className="section-pad"><div className="error-msg">{err}</div></div>
  if (!room) return <div className="center-page"><span className="spinner" />&nbsp; Chargement…</div>

  return (
    <>
      <div className="breadcrumb">
        <Link to="/rooms">Catalogue</Link>&nbsp;›&nbsp; {room.name}
      </div>

      <div style={{ padding: '34px 40px 44px', display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        {/* gallery */}
        <div style={{ width: 620, flex: '1 1 360px', minWidth: 320 }}>
          <div className="room-stripe-navy" style={{ height: 360, borderRadius: 10, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 16, left: 16 }}>
              {room.available
                ? <span className="badge available">● Disponible aujourd'hui</span>
                : <span className="badge occupied">● Occupée</span>}
            </div>
            {room.imageUrl && (
              <img src={room.imageUrl} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <div className="room-stripe-navy" style={{ flex: 1, height: 86, borderRadius: 7 }} />
            <div className="room-stripe-navy" style={{ flex: 1, height: 86, borderRadius: 7 }} />
            <div className="room-stripe-navy" style={{ flex: 1, height: 86, borderRadius: 7 }} />
          </div>
        </div>

        {/* info */}
        <div style={{ flex: '1 1 320px', minWidth: 280 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--red)', marginBottom: 9 }}>
            {room.description ? room.description.split(/[—.\n]/)[0].slice(0, 60) : 'Salle'}
          </div>
          <h1 className="heading-mont" style={{ fontSize: 34, color: 'var(--navy)', margin: '0 0 8px', letterSpacing: '-.02em' }}>{room.name}</h1>
          <div style={{ fontSize: 13.5, color: 'var(--grey-1)', fontWeight: 600, marginBottom: 22 }}>Campus EKOD · Le Mans</div>

          <div style={{ display: 'flex', gap: 26, padding: '18px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: 22, flexWrap: 'wrap' }}>
            <div>
              <div className="heading-mont" style={{ fontSize: 24, color: 'var(--navy)' }}>{room.capacity}</div>
              <div style={{ fontSize: 11.5, color: 'var(--grey-1)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Places</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div className="heading-mont" style={{ fontSize: 24, color: 'var(--navy)' }}>8h–20h</div>
              <div style={{ fontSize: 11.5, color: 'var(--grey-1)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Plage réservable</div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div className="heading-mont" style={{ fontSize: 24, color: room.available ? 'var(--green)' : 'var(--grey-1)' }}>
                {room.available ? 'Libre' : 'Occupée'}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--grey-1)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em' }}>Statut actuel</div>
            </div>
          </div>

          {room.description && (
            <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--text-2)', margin: '0 0 22px' }}>{room.description}</p>
          )}

          <div className="heading-mont" style={{ fontSize: 13, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Équipements</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 28 }}>
            {(room.equipments?.length ? room.equipments : ['Capacité ' + room.capacity]).map(eq => (
              <div key={eq} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, color: 'var(--navy)', fontWeight: 600 }}>
                <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--green-bg)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>✓</span>
                {eq}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              className="btn btn-red btn-lg"
              disabled={!room.available}
              onClick={() => nav(`/rooms/${room.id}/book`)}
            >
              Réserver cette salle
            </button>
            <button className="btn btn-ghost" onClick={() => nav(`/rooms/${room.id}/book`)}>Voir le planning</button>
          </div>
        </div>
      </div>
    </>
  )
}