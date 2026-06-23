import { Link } from 'react-router-dom'
import type { RoomDTO } from '../api/types'

interface Props { room: RoomDTO; variant?: 'navy' | 'red' }

function stripeClass(room: RoomDTO, variant?: 'navy' | 'red') {
  if (!room.available) return 'room-stripe-grey'
  if (variant === 'red') return 'room-stripe-red'
  return 'room-stripe-navy'
}

export default function RoomCard({ room, variant }: Props) {
  return (
    <div className="room-card">
      <div className={`cover ${stripeClass(room, variant)}`}>
        <div className="top-left">
          {room.available
            ? <span className="badge available">● Disponible</span>
            : <span className="badge occupied">● Occupée</span>}
        </div>
        <div className="title">
          <div className="name">{room.name}</div>
          <div className="kind">{room.description ? room.description.split(/[—.\n]/)[0].slice(0, 40) : 'Salle'}</div>
        </div>
      </div>
      <div className="body">
        <div className="meta">
          <span className="pl">{room.capacity} places</span>
          <span className="loc">Campus EKOD</span>
        </div>
        <div className="tags">
          {(room.equipments ?? []).slice(0, 3).map(eq => (
            <span className="tag" key={eq}>{eq}</span>
          ))}
        </div>
        {room.available ? (
          <Link to={`/rooms/${room.id}`} className="btn btn-red btn-block">Voir / Réserver</Link>
        ) : (
          <button className="btn btn-ghost btn-block" disabled>Voir les créneaux</button>
        )}
      </div>
    </div>
  )
}