import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './Layouts/AppLayout'
import DashboardPage from './pages/admin/DashboardPage'
import VendorPage from './pages/admin/VendorPage'
import PurchaseInvoicePage from './pages/admin/PurchaseInvoicePage'
import FinancialReportPage from './pages/admin/FinancialReportPage'
import PartPage from './pages/admin/PartPage'
import SalesInvoicePage from './pages/staff/SalesInvoicePage'
import StaffDashboard from './Pages/Staff/StaffDashboard'
import CustomerDashboard from './Pages/Customer/CustomerDashboard'
import Login from './Pages/Auth/Login'
import CustomerRegister from './Pages/Customer/Register'
import RegisterStaff from './Pages/Admin/RegisterStaff'
import RegisterCustomer from './Pages/Staff/RegisterCustomer'
import AddVehicle from './Pages/Staff/AddVehicle'
import CustomerDetails from './Pages/Staff/CustomerDetails'
import SearchCustomer from './Pages/Staff/SearchCustomer'
import CustomerReports from './Pages/Staff/CustomerReports'
import CustomerProfile from './Pages/Customer/Profile'
import CustomerVehicles from './Pages/Customer/Vehicles'
import CustomerAppointments from './Pages/Customer/Appointments'
import CustomerPartsRequest from './Pages/Customer/PartsRequest'
import CustomerReviews from './Pages/Customer/Reviews'
import CustomerHistory from './Pages/Customer/History'
import CustomerPredictions from './Pages/Customer/Predictions'
import ProtectedRoute from './components/ProtectedRoute'

import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<CustomerRegister />} />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vendors" element={<VendorPage />} />
          <Route path="purchase-invoices" element={<PurchaseInvoicePage />} />
          <Route path="financial-reports" element={<FinancialReportPage />} />
          <Route path="parts" element={<PartPage />} />
          <Route path="sales-invoices" element={<SalesInvoicePage />} />
          <Route path="register-staff" element={<RegisterStaff />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={
          <ProtectedRoute allowedRoles={["Staff", "Admin"]}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          <Route path="dashboard" element={<StaffDashboard />} />
          <Route path="register-customer" element={<RegisterCustomer />} />
          <Route path="add-vehicle" element={<AddVehicle />} />
          <Route path="search-customer" element={<SearchCustomer />} />
          <Route path="customer-details" element={<CustomerDetails />} />
          <Route path="sales-invoices" element={<SalesInvoicePage />} />
          <Route path="customer-reports" element={<CustomerReports />} />
        </Route>

        {/* Customer Routes */}
        <Route path="/customer" element={
          <ProtectedRoute allowedRoles={["Customer"]}>
            <AppLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="vehicles" element={<CustomerVehicles />} />
          <Route path="appointments" element={<CustomerAppointments />} />
          <Route path="parts-request" element={<CustomerPartsRequest />} />
          <Route path="reviews" element={<CustomerReviews />} />
          <Route path="history" element={<CustomerHistory />} />
          <Route path="predictions" element={<CustomerPredictions />} />
        </Route>

        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}