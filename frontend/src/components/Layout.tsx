import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import Header from './Header'
import Footer from './Footer'

export default function Layout({ admin = false }: { admin?: boolean }) {
  return (
    <div className="screen">
      <TopBar admin={admin} />
      <Header admin={admin} />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}