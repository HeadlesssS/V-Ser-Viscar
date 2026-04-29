import { useEffect, useMemo, useRef, useState } from 'react'
import './StaffDashboard.css'

function safeText(v) {
  if (v === null || v === undefined) return ''
  return String(v)
}

function getVehicleFromCustomer(c) {
  return c?.vehicle ?? c?.Vehicle ?? c?.vehicleDetails ?? c?.vehicles?.[0] ?? null
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
    throw new Error(message)
  }

  return payload
}

export default function StaffDashboard() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')

  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [vehicleForm, setVehicleForm] = useState({
    vehicleNumber: '',
    brand: '',
    model: '',
  })

  const noticeTimerRef = useRef(null)

  function showNotice(msg) {
    setNotice(msg)
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 2500)
  }

  async function loadCustomers() {
    setError('')
    try {
      setLoading(true)
      const data = await apiRequest('/api/staff/customers')
      const list = Array.isArray(data) ? data : data?.customers || data?.data || []
      setCustomers(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e?.message || 'Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    }
  }, [])

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => {
      const v = getVehicleFromCustomer(c)
      const hay = [
        safeText(c?.name),
        safeText(c?.email),
        safeText(c?.phone),
        safeText(v?.vehicleNumber ?? v?.number ?? v?.plate),
        safeText(v?.brand),
        safeText(v?.model),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [customers, search])

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        phone: customerForm.phone.trim(),
        vehicleNumber: vehicleForm.vehicleNumber.trim(),
        brand: vehicleForm.brand.trim(),
        model: vehicleForm.model.trim(),
      }

      await apiRequest('/api/staff/create-customer', { method: 'POST', body: payload })
      setCustomerForm({ name: '', email: '', phone: '' })
      setVehicleForm({ vehicleNumber: '', brand: '', model: '' })
      showNotice('Customer saved.')
      await loadCustomers()
    } catch (e2) {
      setError(e2?.message || 'Failed to save customer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sd-page">
      <header className="sd-header">
        <div>
          <h1 className="sd-h1">Staff Dashboard</h1>
          <p className="sd-subtitle">Register customers and their vehicle details</p>
        </div>
      </header>

      <main className="sd-layout">
        <section className="sd-card">
          <div className="sd-card__header">
            <h2 className="sd-h2">New Customer</h2>
            <p className="sd-muted">Fill customer + vehicle details, then submit once.</p>
          </div>

          <form className="sd-form" onSubmit={onSubmit}>
            <div className="sd-formGrid">
              <div className="sd-block">
                <div className="sd-block__title">Customer</div>

                <label className="sd-label">
                  <span>Name</span>
                  <input
                    className="sd-input"
                    value={customerForm.name}
                    onChange={(e) =>
                      setCustomerForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    autoComplete="name"
                    placeholder="Customer name"
                  />
                </label>

                <label className="sd-label">
                  <span>Email</span>
                  <input
                    className="sd-input"
                    type="email"
                    value={customerForm.email}
                    onChange={(e) =>
                      setCustomerForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                  />
                </label>

                <label className="sd-label">
                  <span>Phone</span>
                  <input
                    className="sd-input"
                    value={customerForm.phone}
                    onChange={(e) =>
                      setCustomerForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    required
                    autoComplete="tel"
                    placeholder="98XXXXXXXX"
                  />
                </label>
              </div>

              <div className="sd-block">
                <div className="sd-block__title">Vehicle</div>

                <label className="sd-label">
                  <span>Vehicle number</span>
                  <input
                    className="sd-input"
                    value={vehicleForm.vehicleNumber}
                    onChange={(e) =>
                      setVehicleForm((f) => ({ ...f, vehicleNumber: e.target.value }))
                    }
                    required
                    placeholder="BA 2 PA 1234"
                  />
                </label>

                <label className="sd-label">
                  <span>Brand</span>
                  <input
                    className="sd-input"
                    value={vehicleForm.brand}
                    onChange={(e) => setVehicleForm((f) => ({ ...f, brand: e.target.value }))}
                    required
                    placeholder="Toyota"
                  />
                </label>

                <label className="sd-label">
                  <span>Model</span>
                  <input
                    className="sd-input"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm((f) => ({ ...f, model: e.target.value }))}
                    required
                    placeholder="Corolla"
                  />
                </label>
              </div>
            </div>

            <div className="sd-actions">
              <button className="sd-btn sd-btn--primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save Customer & Vehicle'}
              </button>
            </div>
          </form>
        </section>

        <section className="sd-card">
          <div className="sd-card__header sd-card__header--row">
            <div>
              <h2 className="sd-h2">Customers</h2>
              <p className="sd-muted">{loading ? 'Loading…' : `${filteredCustomers.length} record(s)`}</p>
            </div>
            <div className="sd-headerActions">
              <input
                className="sd-input sd-input--search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customers / vehicles…"
                aria-label="Search customers"
              />
              <button
                type="button"
                className="sd-btn"
                onClick={loadCustomers}
                disabled={loading}
              >
                Refresh
              </button>
            </div>
          </div>

          {(error || notice) && (
            <div className="sd-bannerWrap">
              {error && (
                <div className="sd-banner sd-banner--error" role="alert">
                  {error}
                </div>
              )}
              {notice && <div className="sd-banner sd-banner--ok">{notice}</div>}
            </div>
          )}

          <div className="sd-list">
            {loading ? (
              <div className="sd-empty">Loading customers…</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="sd-empty">No customers found.</div>
            ) : (
              filteredCustomers.map((c, idx) => {
                const v = getVehicleFromCustomer(c)
                const vehicleNumber = safeText(v?.vehicleNumber ?? v?.number ?? v?.plate) || '—'
                return (
                  <div className="sd-item" key={c?.id ?? c?._id ?? c?.email ?? idx}>
                    <div className="sd-item__main">
                      <div className="sd-item__title">{safeText(c?.name) || '—'}</div>
                      <div className="sd-item__meta">
                        <span className="sd-pill">{safeText(c?.phone) || '—'}</span>
                        <span className="sd-pill sd-pill--mono">{safeText(c?.email) || '—'}</span>
                      </div>
                    </div>
                    <div className="sd-item__vehicle">
                      <div className="sd-item__title sd-item__title--small">
                        {vehicleNumber}
                      </div>
                      <div className="sd-item__meta">
                        <span className="sd-pill">{safeText(v?.brand) || '—'}</span>
                        <span className="sd-pill">{safeText(v?.model) || '—'}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

