import { useEffect, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

export default function ProfilePage() {
  const { user, setUser, ready } = useAuth()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const noticeTimerRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    })
  }, [user])

  function showNotice(msg) {
    setNotice(msg)
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 2500)
  }

  if (ready && !user) return <Navigate to="/login" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = await apiRequest('/api/customer/update-profile', {
        method: 'PUT',
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
        },
      })

      const updated =
        payload?.user || payload?.profile || payload?.data?.user || payload?.data || null
      setUser((u) => ({ ...(u || {}), ...(updated || {}), ...form }))
      showNotice('Profile updated.')
    } catch (e2) {
      setError(e2?.message || 'Failed to update profile.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-card">
      <div className="pt-cardHeader">
        <h1 className="pt-h1">Profile</h1>
        <p className="pt-muted">Update your personal information.</p>
      </div>

      {(error || notice) && (
        <div className="pt-bannerWrap">
          {error && (
            <div className="pt-banner pt-banner--error" role="alert">
              {error}
            </div>
          )}
          {notice && <div className="pt-banner pt-banner--ok">{notice}</div>}
        </div>
      )}

      <form className="pt-form" onSubmit={onSubmit}>
        <div className="pt-grid2">
          <div className="pt-field">
            <label className="pt-label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="pt-input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              autoComplete="name"
            />
          </div>
          <div className="pt-field">
            <label className="pt-label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              className="pt-input"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
              autoComplete="tel"
            />
          </div>
        </div>

        <div className="pt-field">
          <label className="pt-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            className="pt-input"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            autoComplete="email"
          />
        </div>

        <div className="pt-actions">
          <button className="pt-btn pt-btn--primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

