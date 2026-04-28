import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import VendorsPage from './pages/VendorsPage'
import InvoicesPage from './pages/InvoicesPage'
import ReportsPage from './pages/ReportsPage'
import { checkHealth } from './api/client'

export default function App() {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    const ping = async () => {
      const ok = await checkHealth()
      setApiStatus(ok ? 'online' : 'offline')
    }

    ping()
    const id = setInterval(ping, 15000)
    return () => clearInterval(id)
  }, [])

  return (
    <Layout apiStatus={apiStatus}>
      <Routes>
        <Route path="/" element={<Navigate to="/vendors" replace />} />
        <Route path="/vendors" element={<VendorsPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<Navigate to="/vendors" replace />} />
      </Routes>
    </Layout>
  )
}