export default function TopBar({ admin = false }: { admin?: boolean }) {
  return (
    <div className="ek-topbar">
      <div>
        <span>{admin ? "Espace administration" : "L'école des métiers du digital"}</span>
        <span>{admin ? 'CCI Le Mans Sarthe' : 'Le Mans'}</span>
      </div>
      <div>
        <span>{admin ? 'Aide' : 'support@ekod.school'}</span>
        <span>{admin ? 'FR' : '02 43 00 00 00'}</span>
      </div>
    </div>
  )
}