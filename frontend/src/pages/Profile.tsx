import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { updateProfile, changePassword } from '../api/users'
import { uploadAvatar, deleteAvatar } from '../api/files'

function Avatar({ src, initials, size = 96 }: { src: string | null; initials: string; size?: number }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: src ? `center/cover no-repeat url(${src})` : 'var(--navy)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Montserrat', fontWeight: 800, fontSize: size / 2.6,
        boxShadow: '0 4px 14px rgba(11,26,78,.18)', userSelect: 'none',
      }}
    >
      {!src && initials}
    </div>
  )
}

export default function Profile() {
  const { user, reload, logout } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  // --- Informations personnelles ---
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [savingInfo, setSavingInfo] = useState(false)
  const [infoErr, setInfoErr] = useState<string | null>(null)
  const [infoOk, setInfoOk] = useState(false)

  // --- Photo (upload immédiat) ---
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarErr, setAvatarErr] = useState<string | null>(null)

  // --- Mot de passe ---
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)
  const [pwdErr, setPwdErr] = useState<string | null>(null)
  const [pwdOk, setPwdOk] = useState(false)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
    }
  }, [user])

  const initials = user ? (user.firstName[0] + (user.lastName[0] ?? '')).toUpperCase() : '?'
  const infoDirty = !!user && (firstName !== user.firstName || lastName !== user.lastName)

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // permet de re-sélectionner le même fichier
    if (!file) return
    setAvatarErr(null)
    if (!file.type.startsWith('image/')) { setAvatarErr('Veuillez choisir un fichier image'); return }
    if (file.size > 20 * 1024 * 1024) { setAvatarErr('Image trop lourde (20 Mo maximum)'); return }
    setAvatarBusy(true)
    try {
      await uploadAvatar(file)
      await reload()
    } catch (e: any) {
      setAvatarErr(e.response?.data?.message || "Échec de l'envoi de la photo")
    } finally {
      setAvatarBusy(false)
    }
  }

  async function removeAvatar() {
    setAvatarErr(null); setAvatarBusy(true)
    try {
      await deleteAvatar()
      await reload()
    } catch (e: any) {
      setAvatarErr(e.response?.data?.message || 'Suppression impossible')
    } finally {
      setAvatarBusy(false)
    }
  }

  async function saveInfo(e: React.FormEvent) {
    e.preventDefault()
    setInfoErr(null); setInfoOk(false); setSavingInfo(true)
    try {
      await updateProfile({ firstName: firstName.trim(), lastName: lastName.trim() })
      await reload()
      setInfoOk(true)
    } catch (e: any) {
      setInfoErr(e.response?.data?.message || 'Enregistrement impossible')
    } finally {
      setSavingInfo(false)
    }
  }

  async function savePwd(e: React.FormEvent) {
    e.preventDefault()
    setPwdErr(null); setPwdOk(false)
    if (newPassword.length < 8) { setPwdErr('Le nouveau mot de passe doit contenir au moins 8 caractères'); return }
    if (newPassword !== confirmPassword) { setPwdErr('Les deux mots de passe ne correspondent pas'); return }
    setSavingPwd(true)
    try {
      await changePassword({ currentPassword, newPassword })
      setPwdOk(true)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (e: any) {
      setPwdErr(e.response?.data?.message || 'Changement de mot de passe impossible')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <>
      <div className="ek-hero-red">
        <div className="eyebrow">Mon espace</div>
        <h1>Mon profil</h1>
      </div>

      <div style={{ padding: '28px 40px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 22, alignItems: 'start', maxWidth: 980, margin: '0 auto' }}>

        {/* ----- Informations personnelles ----- */}
        <form className="card" onSubmit={saveInfo} style={{ padding: 26 }}>
          <h2 className="heading-mont" style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--navy)' }}>Informations personnelles</h2>
          <p style={{ margin: '0 0 22px', fontSize: 13, color: 'var(--grey-2)' }}>Votre nom et votre photo apparaissent dans l'application.</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 18 }}>
            <Avatar src={user?.avatarUrl ?? null} initials={initials} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input ref={fileRef} type="file" accept="image/*" onChange={onPickFile} style={{ display: 'none' }} />
              <button type="button" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: 11.5 }} disabled={avatarBusy} onClick={() => fileRef.current?.click()}>
                {avatarBusy ? 'Envoi…' : (user?.avatarUrl ? 'Changer la photo' : 'Ajouter une photo')}
              </button>
              {user?.avatarUrl && (
                <button type="button" onClick={removeAvatar} disabled={avatarBusy}
                  style={{ alignSelf: 'flex-start', background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--red-soft-fg)', fontSize: 12, fontWeight: 600 }}>
                  Retirer la photo
                </button>
              )}
            </div>
          </div>
          {avatarErr && <div className="error-msg">{avatarErr}</div>}

          <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
            <div style={{ flex: 1 }}>
              <label className="field-label">Prénom</label>
              <input className="input" required maxLength={40} value={firstName} onChange={e => { setFirstName(e.target.value); setInfoOk(false) }} />
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Nom</label>
              <input className="input" required maxLength={40} value={lastName} onChange={e => { setLastName(e.target.value); setInfoOk(false) }} />
            </div>
          </div>

          <label className="field-label" style={{ marginTop: 16 }}>Email</label>
          <input className="input" value={user?.email ?? ''} disabled style={{ background: 'var(--grey-soft)', color: 'var(--grey-2)', cursor: 'not-allowed' }} />
          <p style={{ fontSize: 11.5, color: 'var(--grey-3)', margin: '7px 0 0' }}>L'adresse email ne peut pas être modifiée. Contactez un administrateur si besoin.</p>

          {infoErr && <div className="error-msg" style={{ marginTop: 18 }}>{infoErr}</div>}
          {infoOk && <div style={{ marginTop: 18, background: 'var(--green-bg)', color: 'var(--green-deep)', padding: '10px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>Profil mis à jour ✓</div>}

          <button type="submit" className="btn btn-red btn-block" disabled={savingInfo || !infoDirty} style={{ marginTop: 20, padding: 14 }}>
            {savingInfo ? '...' : 'Enregistrer'}
          </button>
        </form>

        {/* ----- Sécurité / mot de passe ----- */}
        <form className="card" onSubmit={savePwd} style={{ padding: 26 }}>
          <h2 className="heading-mont" style={{ margin: '0 0 4px', fontSize: 18, color: 'var(--navy)' }}>Mot de passe</h2>
          <p style={{ margin: '0 0 22px', fontSize: 13, color: 'var(--grey-2)' }}>Pour votre sécurité, votre mot de passe actuel vous sera demandé.</p>

          <label className="field-label">Mot de passe actuel</label>
          <input className="input" type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
            value={currentPassword} onChange={e => { setCurrentPassword(e.target.value); setPwdOk(false) }} style={{ marginBottom: 16 }} />

          <label className="field-label">Nouveau mot de passe</label>
          <input className="input" type={showPwd ? 'text' : 'password'} required minLength={8} autoComplete="new-password"
            placeholder="8 caractères minimum"
            value={newPassword} onChange={e => { setNewPassword(e.target.value); setPwdOk(false) }} style={{ marginBottom: 16 }} />

          <label className="field-label">Confirmer le nouveau mot de passe</label>
          <input className="input" type={showPwd ? 'text' : 'password'} required minLength={8} autoComplete="new-password"
            value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setPwdOk(false) }} style={{ marginBottom: 12 }} />

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--grey-2)', cursor: 'pointer' }}>
            <input type="checkbox" checked={showPwd} onChange={e => setShowPwd(e.target.checked)} />
            Afficher les mots de passe
          </label>

          {pwdErr && <div className="error-msg" style={{ marginTop: 18 }}>{pwdErr}</div>}
          {pwdOk && <div style={{ marginTop: 18, background: 'var(--green-bg)', color: 'var(--green-deep)', padding: '10px 14px', borderRadius: 6, fontSize: 13, fontWeight: 600 }}>Mot de passe modifié ✓</div>}

          <button type="submit" className="btn btn-navy btn-block" disabled={savingPwd} style={{ marginTop: 20, padding: 14 }}>
            {savingPwd ? '...' : 'Modifier le mot de passe'}
          </button>
        </form>

        {/* ----- Déconnexion ----- */}
        <div className="card" style={{ padding: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, gridColumn: '1 / -1' }}>
          <div>
            <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 14, color: 'var(--navy)' }}>Déconnexion</div>
            <div style={{ fontSize: 12.5, color: 'var(--grey-2)', marginTop: 2 }}>Fermez votre session sur cet appareil.</div>
          </div>
          <button type="button" className="btn btn-outline-red" style={{ padding: '11px 22px', fontSize: 12.5 }} onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </>
  )
}