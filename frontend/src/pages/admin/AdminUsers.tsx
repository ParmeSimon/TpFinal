import { useEffect, useState } from 'react'
import { listUsers, updateUser } from '../../api/users'
import type { Role, UserDTO, UpdateUserDTO } from '../../api/types'

const ALL_ROLES: Role[] = ['STUDENT', 'TEACHER', 'ADMIN']

interface EditState {
  id: number
  firstName: string
  lastName: string
  roles: Role[]
  active: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserDTO[]>([])
  const [edit, setEdit] = useState<EditState | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function load() {
    try { setUsers(await listUsers()) }
    catch (e: any) { setErr(e.response?.data?.message || 'Erreur') }
  }
  useEffect(() => { load() }, [])

  function openEdit(u: UserDTO) {
    setEdit({ id: u.id, firstName: u.firstName, lastName: u.lastName, roles: [...u.roles], active: u.active })
    setErr(null)
  }
  function close() { setEdit(null) }

  function toggleRole(role: Role) {
      if (!edit) return
      const dejaPresent = edit.roles.includes(role)
      const nouveauxRoles = dejaPresent
          ? edit.roles.filter(r => r !== role)
          : [...edit.roles, role]
      setEdit({ ...edit, roles: nouveauxRoles })
  }

  async function save() {
    if (!edit) return
    setBusy(true); setErr(null)
    const dto: UpdateUserDTO = {
      firstName: edit.firstName,
      lastName: edit.lastName,
      roles: edit.roles,
      active: edit.active,
    }
    try {
      await updateUser(edit.id, dto)
      close(); load()
    } catch (e: any) {
      setErr(e.response?.data?.message || "Erreur d'enregistrement")
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="ek-hero-red">
        <div className="eyebrow">Administration</div>
        <h1>Gestion des utilisateurs</h1>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 480, padding: '26px 30px 44px 40px' }}>
          {err && !edit && <div className="error-msg">{err}</div>}
          <div className="table-wrap">
            <div className="table-head">
              <div style={{ flex: 1.2 }}>Nom</div>
              <div style={{ flex: 1.6 }}>Email</div>
              <div style={{ flex: 1.2 }}>Rôles</div>
              <div style={{ width: 90, flex: 'none' }}>Statut</div>
              <div style={{ width: 70, flex: 'none', textAlign: 'right' }}>Actions</div>
            </div>

            {users.map(u => (
              <div key={u.id} className={`table-row ${edit?.id === u.id ? 'active' : ''}`}>
                <div className="heading-mont" style={{ flex: 1.2, color: 'var(--navy)' }}>{u.firstName} {u.lastName}</div>
                <div style={{ flex: 1.6, color: '#6B6B7B', fontSize: 13 }}>{u.email}</div>
                <div style={{ flex: 1.2, fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>{u.roles.join(' · ')}</div>
                <div style={{ width: 90, flex: 'none' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: u.active ? 'var(--green)' : 'var(--grey-3)' }}>
                    {u.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                <div style={{ width: 70, flex: 'none', textAlign: 'right', color: 'var(--navy)', fontWeight: 800, fontSize: 16 }}>
                  <span onClick={() => openEdit(u)} style={{ cursor: 'pointer' }} title="Modifier">✎</span>
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="table-row" style={{ justifyContent: 'center', color: 'var(--grey-1)' }}>Aucun utilisateur.</div>
            )}
          </div>
        </div>

        {edit && (
          <div style={{ width: 368, flex: 'none', background: 'var(--bg-app)', borderLeft: '1px solid var(--border)', padding: '26px 30px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div className="heading-mont" style={{ fontSize: 17, color: 'var(--navy)' }}>Modifier l'utilisateur</div>
              <span style={{ color: 'var(--grey-3)', fontSize: 18, cursor: 'pointer' }} onClick={close}>✕</span>
            </div>

            <label className="field-label" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Prénom</label>
            <input className="input" value={edit.firstName} onChange={e => setEdit({ ...edit, firstName: e.target.value })} style={{ marginBottom: 16 }} />

            <label className="field-label" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Nom</label>
            <input className="input" value={edit.lastName} onChange={e => setEdit({ ...edit, lastName: e.target.value })} style={{ marginBottom: 16 }} />

            <label className="field-label" style={{ textTransform: 'uppercase', letterSpacing: '.04em' }}>Rôles</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {ALL_ROLES.map(role => (
                <label key={role} style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: 'var(--navy)', fontSize: 13 }}>
                  <input type="checkbox" checked={edit.roles.includes(role)} onChange={() => toggleRole(role)} />
                  {role}
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: 13, background: '#fff', border: '1px solid var(--border)', borderRadius: 8 }}>
              <button type="button" onClick={() => setEdit({ ...edit, active: !edit.active })} className={`switch ${edit.active ? '' : 'off'}`} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Compte actif</span>
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