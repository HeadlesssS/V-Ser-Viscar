import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const noticeTimerRef = useRef(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  function showNotice(msg) {
    setNotice(msg)
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 2500)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
      })
      showNotice('Registration successful.')
      navigate('/profile')
    } catch (e2) {
      setError(e2?.message || 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-card">
      <div className="pt-cardHeader">
        <h1 className="pt-h1">Create your account</h1>
        <p className="pt-muted">Register to manage your profile and vehicles.</p>
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
              autoComplete="name"
              required
              placeholder="Your name"
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
              autoComplete="tel"
              required
              placeholder="98XXXXXXXX"
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
            autoComplete="email"
            required
            placeholder="name@example.com"
          />
        </div>

        <div className="pt-field">
          <label className="pt-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="pt-input"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            autoComplete="new-password"
            required
            placeholder="Create a strong password"
          />
        </div>

        <div className="pt-actions">
          <Link className="pt-btn pt-btn--ghost" to="/login">
            I already have an account
          </Link>
          <button className="pt-btn pt-btn--primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Register'}
          </button>
        </div>
      </form>
    </div>
  )
}

