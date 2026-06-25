import { useEffect, useMemo, useState } from 'react'
import { listAvailable, listRooms } from '../api/rooms'
import type { RoomDTO } from '../api/types'
import RoomCard from '../components/RoomCard'
import { useAuth } from '../auth/AuthContext'

export default function Catalogue() {
  const { isAdmin } = useAuth()
  const [rooms, setRooms] = useState<RoomDTO[]>([])
  const [q, setQ] = useState('')
  const [minCap, setMinCap] = useState<number | ''>('')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetcher = isAdmin ? listRooms : listAvailable
    fetcher()
      .then(setRooms)
      .catch(e => setErr(e.response?.data?.message || 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const filtered = useMemo(() => {
    return rooms.filter(r => {
      if (onlyAvailable && r.currentlyBooked) return false
      if (minCap !== '' && r.capacity < Number(minCap)) return false
      if (q && !(r.name.toLowerCase().includes(q.toLowerCase()) || (r.description ?? '').toLowerCase().includes(q.toLowerCase()))) return false
      return true
    })
  }, [rooms, q, minCap, onlyAvailable])

  return (
    <>
      <div className="ek-hero-red">
        <div className="eyebrow">Catalogue</div>
        <h1>Trouvez la salle qu'il vous faut</h1>
      </div>

      <div style={{ padding: '22px 40px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 280, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 15, top: 13, color: 'var(--grey-1)' }}>⌕</span>
          <input
            className="input"
            placeholder="Rechercher une salle, un bâtiment…"
            value={q}
            onChange={e => setQ(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>
        <select
          className="select"
          value={minCap}
          onChange={e => setMinCap(e.target.value === '' ? '' : Number(e.target.value))}
          style={{ width: 180, fontWeight: 600, color: 'var(--navy)' }}
        >
          <option value="">Capacité</option>
          <option value="10">≥ 10 places</option>
          <option value="20">≥ 20 places</option>
          <option value="40">≥ 40 places</option>
          <option value="60">≥ 60 places</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13, color: 'var(--navy)', fontWeight: 700, cursor: 'pointer' }}>
          <button type="button" onClick={() => setOnlyAvailable(v => !v)} className={`switch ${onlyAvailable ? '' : 'off'}`} />
          Disponibles uniquement
        </label>
      </div>

        {err && <div className="error-msg">{err}</div>}
        {loading && <div className="center-page"><span className="spinner" />&nbsp; Chargement…</div>}

        {!loading && filtered.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--grey-1)' }}>
            Aucune salle ne correspond à votre recherche.
          </div>
        )}

        <div className="grid-3">
          {filtered.map(r => (
            <RoomCard key={r.id} room={r} variant={r.capacity >= 60 ? 'red' : 'navy'} />
          ))}
        </div>
    </>
  )
}