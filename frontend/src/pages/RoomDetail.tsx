import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getRoom } from '../api/rooms'
import type { RoomDTO } from '../api/types'
import { roomPhotos } from '../api/roomImages'

export default function RoomDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [room, setRoom] = useState<RoomDTO | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [mainIdx, setMainIdx] = useState(0)
  const [reserving, setReserving] = useState(false)

  useEffect(() => {
    if (!id) return
    getRoom(Number(id)).then(setRoom).catch(e => setErr(e.response?.data?.message || 'Salle introuvable'))
  }, [id])

  if (err) return <div className="section-pad"><div className="error-msg">{err}</div></div>
  if (!room) return <div className="center-page"><span className="spinner" />&nbsp; Chargement…</div>

  const isDisabled = !room.available
  const isBooked = room.available && room.currentlyBooked
  const statusLabel = reserving
    ? 'Réservation en cours…'
    : isDisabled
      ? 'Indisponible'
      : isBooked
        ? 'Réservée'
        : 'Libre'
  const statusColor = reserving
    ? 'var(--orange, #F59E0B)'
    : isDisabled
      ? 'var(--grey-1)'
      : isBooked
        ? 'var(--red)'
        : 'var(--green)'

  function goReserve() {
    if (!room) return
    setReserving(true)
    setTimeout(() => nav(`/rooms/${room.id}/book`), 220)
  }

  return (
    <>
      <div className="breadcrumb">
        <Link to="/rooms">Catalogue</Link>&nbsp;›&nbsp; {room.name}
      </div>

      <div style={{ padding: '34px 40px 44px', display: 'flex', gap: 36, flexWrap: 'wrap' }}>
        {/* gallery */}
        <div style={{ width: 620, flex: '1 1 360px', minWidth: 320 }}>
          {(() => {
            const photos = roomPhotos(room)
            const main = photos[mainIdx] ?? photos[0]
            const thumbs = photos.slice(0, 4)
            return (
              <>
                <div style={{ height: 360, borderRadius: 10, position: 'relative', overflow: 'hidden', background: '#0B1A4E' }}>
                  <img src={main} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}>
                    {reserving
                      ? <span className="badge pending">● Réservation en cours…</span>
                      : isDisabled
                        ? <span className="badge occupied">● Indisponible</span>
                        : isBooked
                          ? <span className="badge booked">● Réservée</span>
                          : <span className="badge available">● Disponible aujourd'hui</span>}
                  </div>
                </div>
                {thumbs.length > 1 && (
                  <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                    {thumbs.map((p, i) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setMainIdx(i)}
                        style={{
                          flex: 1,
                          height: 86,
                          borderRadius: 7,
                          border: i === mainIdx ? '2px solid var(--red)' : '2px solid transparent',
                          backgroundImage: `url("${p}")`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          padding: 0,
                          cursor: 'pointer',
                        }}
                        aria-label={`Photo ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            )
          })()}
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
              <div className="heading-mont" style={{ fontSize: 24, color: statusColor, transition: 'color .2s' }}>
                {statusLabel}
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
              disabled={isDisabled || reserving}
              onClick={goReserve}
            >
              {reserving ? 'Réservation en cours…' : isBooked ? 'Voir d\'autres créneaux' : 'Réserver cette salle'}
            </button>
            <button className="btn btn-ghost" onClick={() => nav(`/rooms/${room.id}/book`)} disabled={reserving}>Voir le planning</button>
          </div>
        </div>
      </div>
    </>
  )
}