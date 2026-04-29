import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const noticeTimerRef = useRef(null)

  const [form, setForm] = useState({
    email: '',
    password: '',
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
      await login({
        email: form.email.trim(),
        password: form.password,
      })
      showNotice('Logged in.')
      navigate('/profile')
    } catch (e2) {
      setError(e2?.message || 'Login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-card">
      <div className="pt-cardHeader">
        <h1 className="pt-h1">Login</h1>
        <p className="pt-muted">Access your profile and vehicles.</p>
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
            autoComplete="current-password"
            required
            placeholder="Your password"
          />
        </div>

        <div className="pt-actions">
          <Link className="pt-btn pt-btn--ghost" to="/register">
            Create account
          </Link>
          <button className="pt-btn pt-btn--primary" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  )
}

