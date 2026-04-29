import { useEffect, useMemo, useRef, useState } from 'react'
import './AdminStaff.css'

const ROLE_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Staff', label: 'Staff' },
]

function getStaffId(staff) {
  return staff?.id ?? staff?._id ?? staff?.staffId ?? staff?.userId
}

function safeText(v) {
  if (v === null || v === undefined) return ''
  return String(v)
}

async function apiRequest(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : await res.text()

  if (!res.ok) {
    const message =
      (payload && typeof payload === 'object' && (payload.message || payload.error)) ||
      (typeof payload === 'string' ? payload : null) ||
      `Request failed (${res.status})`
    const err = new Error(message)
    err.status = res.status
    err.payload = payload
    throw err
  }

  return payload
}

export default function AdminStaff() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [search, setSearch] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'Staff',
  })

  const [editingId, setEditingId] = useState(null)
  const [editingRole, setEditingRole] = useState('Staff')

  const noticeTimerRef = useRef(null)

  function showNotice(msg) {
    setNotice(msg)
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 2500)
  }

  async function loadStaff({ silent } = {}) {
    try {
      if (silent) setRefreshing(true)
      else setLoading(true)
      setError('')
      const data = await apiRequest('/api/admin/staff')
      const list = Array.isArray(data) ? data : data?.staff || data?.data || []
      setStaff(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e?.message || 'Failed to load staff.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStaff()
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    }
  }, [])

  const filteredStaff = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return staff
    return staff.filter((s) => {
      const hay = [
        safeText(s?.name),
        safeText(s?.email),
        safeText(s?.phone),
        safeText(s?.role),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [staff, search])

  async function onCreateStaff(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.role,
      }
      await apiRequest('/api/admin/create-staff', { method: 'POST', body: payload })
      setForm({ name: '', email: '', password: '', phone: '', role: 'Staff' })
      showNotice('Staff created.')
      await loadStaff({ silent: true })
    } catch (e2) {
      setError(e2?.message || 'Failed to create staff.')
    } finally {
      setSubmitting(false)
    }
  }

  function startEditRole(s) {
    const id = getStaffId(s)
    setEditingId(id)
    setEditingRole(s?.role === 'Admin' ? 'Admin' : 'Staff')
  }

  function cancelEditRole() {
    setEditingId(null)
    setEditingRole('Staff')
  }

  async function saveRole(id) {
    setError('')
    try {
      await apiRequest(`/api/admin/update-role/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: { role: editingRole },
      })
      showNotice('Role updated.')
      cancelEditRole()
      await loadStaff({ silent: true })
    } catch (e) {
      setError(e?.message || 'Failed to update role.')
    }
  }

  async function deleteStaff(s) {
    const id = getStaffId(s)
    if (!id) {
      setError('Cannot delete: staff id is missing.')
      return
    }
    const label = s?.name || s?.email || 'this staff member'
    const ok = window.confirm(`Delete ${label}? This cannot be undone.`)
    if (!ok) return

    setError('')
    try {
      await apiRequest(`/api/admin/delete-staff/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      showNotice('Staff deleted.')
      await loadStaff({ silent: true })
    } catch (e) {
      setError(e?.message || 'Failed to delete staff.')
    }
  }

  return (
    <div className="as-page">
      <header className="as-topbar">
        <div className="as-topbar__title">
          <div className="as-badge" aria-hidden="true">
            VS
          </div>
          <div>
            <h1 className="as-h1">Admin Dashboard</h1>
            <p className="as-subtitle">Manage staff accounts and roles</p>
          </div>
        </div>
        <div className="as-topbar__actions">
          <button
            type="button"
            className="as-btn as-btn--ghost"
            onClick={() => loadStaff({ silent: true })}
            disabled={loading || refreshing}
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      <main className="as-grid">
        <section className="as-card">
          <div className="as-card__header">
            <h2 className="as-h2">Register Staff</h2>
            <p className="as-muted">Create a new admin or staff account.</p>
          </div>

          <form className="as-form" onSubmit={onCreateStaff}>
            <div className="as-field">
              <label className="as-label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="as-input"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoComplete="name"
                required
                placeholder="e.g. Nischal Karki"
              />
            </div>

            <div className="as-field">
              <label className="as-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="as-input"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                autoComplete="email"
                required
                placeholder="name@example.com"
              />
            </div>

            <div className="as-field">
              <label className="as-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="as-input"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
                required
                placeholder="Create a strong password"
              />
            </div>

            <div className="as-field">
              <label className="as-label" htmlFor="phone">
                Phone
              </label>
              <input
                id="phone"
                className="as-input"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                autoComplete="tel"
                required
                placeholder="98XXXXXXXX"
              />
            </div>

            <div className="as-field">
              <label className="as-label" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                className="as-select"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                {ROLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="as-form__actions">
              <button className="as-btn as-btn--primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create Staff'}
              </button>
            </div>
          </form>
        </section>

        <section className="as-card as-card--table">
          <div className="as-card__header as-card__header--row">
            <div>
              <h2 className="as-h2">Staff</h2>
              <p className="as-muted">
                {loading ? 'Loading…' : `${filteredStaff.length} result(s)`}
              </p>
            </div>
            <div className="as-search">
              <input
                className="as-input as-input--search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, phone, role…"
                aria-label="Search staff"
              />
            </div>
          </div>

          {(error || notice) && (
            <div className="as-bannerWrap">
              {error && (
                <div className="as-banner as-banner--error" role="alert">
                  {error}
                </div>
              )}
              {notice && <div className="as-banner as-banner--ok">{notice}</div>}
            </div>
          )}

          <div className="as-tableWrap" role="region" aria-label="Staff list">
            <table className="as-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th className="as-thActions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="as-empty">
                      Loading staff…
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="as-empty">
                      No staff found.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((s) => {
                    const id = getStaffId(s)
                    const isEditing = id && editingId === id
                    const role = s?.role === 'Admin' ? 'Admin' : 'Staff'
                    return (
                      <tr key={id ?? `${s?.email}-${s?.phone}`}>
                        <td>
                          <div className="as-cellMain">{safeText(s?.name) || '—'}</div>
                        </td>
                        <td className="as-mono">{safeText(s?.email) || '—'}</td>
                        <td className="as-mono">{safeText(s?.phone) || '—'}</td>
                        <td>
                          {isEditing ? (
                            <select
                              className="as-select as-select--compact"
                              value={editingRole}
                              onChange={(e) => setEditingRole(e.target.value)}
                            >
                              {ROLE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`as-pill ${role === 'Admin' ? 'is-admin' : ''}`}>
                              {role}
                            </span>
                          )}
                        </td>
                        <td className="as-actions">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                className="as-btn as-btn--small as-btn--primary"
                                onClick={() => saveRole(id)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="as-btn as-btn--small as-btn--ghost"
                                onClick={cancelEditRole}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="as-btn as-btn--small as-btn--ghost"
                                onClick={() => startEditRole(s)}
                                disabled={!id}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="as-btn as-btn--small as-btn--danger"
                                onClick={() => deleteStaff(s)}
                                disabled={!id}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}

