import { Navigate, Route, Routes } from 'react-router-dom'
import AdminStaff from './pages/AdminStaff.jsx'
import StaffDashboard from './pages/StaffDashboard.jsx'
import { AuthProvider } from './portal/AuthContext.jsx'
import PortalLayout from './portal/PortalLayout.jsx'
import LoginPage from './portal/pages/LoginPage.jsx'
import ProfilePage from './portal/pages/ProfilePage.jsx'
import RegisterPage from './portal/pages/RegisterPage.jsx'
import VehiclesPage from './portal/pages/VehiclesPage.jsx'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<PortalLayout />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
        </Route>

        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/admin" element={<AdminStaff />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  )
}
