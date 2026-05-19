import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/admin/DashboardPage'
import VendorPage from './pages/admin/VendorPage'
import PurchaseInvoicePage from './pages/admin/PurchaseInvoicePage'
import FinancialReportPage from './pages/admin/FinancialReportPage'
import PartPage from './pages/admin/PartPage'
import SalesInvoicePage from './pages/staff/SalesInvoicePage'

import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vendors" element={<VendorPage />} />
          <Route path="purchase-invoices" element={<PurchaseInvoicePage />} />
          <Route path="financial-reports" element={<FinancialReportPage />} />
          <Route path="parts" element={<PartPage />} />
          <Route path="sales-invoices" element={<SalesInvoicePage />} />
       
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}