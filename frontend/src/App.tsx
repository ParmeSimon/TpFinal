import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import Layout from './components/Layout'
import Protected from './components/Protected'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Catalogue from './pages/Catalogue'
import RoomDetail from './pages/RoomDetail'
import BookingNew from './pages/BookingNew'
import MyBookings from './pages/MyBookings'
import AdminBookings from './pages/admin/AdminBookings'
import AdminRooms from './pages/admin/AdminRooms'
import AdminUsers from './pages/admin/AdminUsers'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Consultation des salles et planning : publics (header/footer, sans authentification).
              La réservation elle-même reste protégée : la garde se fait à la validation. */}
          <Route element={<Layout />}>
            <Route path="/rooms" element={<Catalogue />} />
            <Route path="/rooms/:id" element={<RoomDetail />} />
            <Route path="/rooms/:id/book" element={<BookingNew />} />
          </Route>

          {/* Consulter ses réservations : connexion requise */}
          <Route element={<Protected><Layout /></Protected>}>
            <Route path="/bookings" element={<MyBookings />} />
          </Route>

          <Route element={<Protected adminOnly><Layout admin /></Protected>}>
            <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/rooms" element={<AdminRooms />} />
            <Route path="/admin/users" element={<AdminUsers/>}/>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}