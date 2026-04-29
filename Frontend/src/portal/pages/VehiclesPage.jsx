import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { apiRequest } from '../../lib/api.js'
import { useAuth } from '../AuthContext.jsx'

function safeText(v) {
  if (v === null || v === undefined) return ''
  return String(v)
}

function getVehicleId(v) {
  return v?.id ?? v?._id ?? v?.vehicleId
}

export default function VehiclesPage() {
  const { user, ready } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const noticeTimerRef = useRef(null)

  const [form, setForm] = useState({
    id: '',
    vehicleNumber: '',
    brand: '',
    model: '',
  })

  function showNotice(msg) {
    setNotice(msg)
    if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    noticeTimerRef.current = window.setTimeout(() => setNotice(''), 2500)
  }

  async function loadVehicles() {
    setError('')
    try {
      setLoading(true)
      const payload = await apiRequest('/api/customer/vehicles')
      const list = Array.isArray(payload)
        ? payload
        : payload?.vehicles || payload?.data || payload?.items || []
      setVehicles(Array.isArray(list) ? list : [])
    } catch (e) {
      setError(e?.message || 'Failed to load vehicles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
    return () => {
      if (noticeTimerRef.current) window.clearTimeout(noticeTimerRef.current)
    }
  }, [])

  if (ready && !user) return <Navigate to="/login" replace />

  const filteredVehicles = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return vehicles
    return vehicles.filter((v) => {
      const hay = [
        safeText(v?.vehicleNumber ?? v?.number ?? v?.plate),
        safeText(v?.brand),
        safeText(v?.model),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(q)
    })
  }, [vehicles, search])

  function startEdit(v) {
    setForm({
      id: safeText(getVehicleId(v) || ''),
      vehicleNumber: safeText(v?.vehicleNumber ?? v?.number ?? v?.plate),
      brand: safeText(v?.brand),
      model: safeText(v?.model),
    })
  }

  function resetForm() {
    setForm({ id: '', vehicleNumber: '', brand: '', model: '' })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        vehicleNumber: form.vehicleNumber.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
      }

      // If backend supports upsert, it may accept an id.
      if (form.id) payload.id = form.id

      await apiRequest('/api/customer/add-vehicle', { method: 'POST', body: payload })
      showNotice(form.id ? 'Vehicle updated.' : 'Vehicle added.')
      resetForm()
      await loadVehicles()
    } catch (e2) {
      setError(e2?.message || 'Failed to save vehicle.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-card">
      <div className="pt-cardHeader">
        <h1 className="pt-h1">Vehicles</h1>
        <p className="pt-muted">Add and manage your vehicles.</p>
      </div>

      <div className="pt-form">
        <form onSubmit={onSubmit} className="pt-form" style={{ padding: 0 }}>
          <div className="pt-grid2">
            <div className="pt-field">
              <label className="pt-label" htmlFor="vehicleNumber">
                Vehicle number
              </label>
              <input
                id="vehicleNumber"
                className="pt-input"
                value={form.vehicleNumber}
                onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))}
                required
                placeholder="BA 2 PA 1234"
              />
            </div>
            <div className="pt-field">
              <label className="pt-label" htmlFor="brand">
                Brand
              </label>
              <input
                id="brand"
                className="pt-input"
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                required
                placeholder="Toyota"
              />
            </div>
          </div>

          <div className="pt-field">
            <label className="pt-label" htmlFor="model">
              Model
            </label>
            <input
              id="model"
              className="pt-input"
              value={form.model}
              onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              required
              placeholder="Corolla"
            />
          </div>

          <div className="pt-actions">
            {form.id ? (
              <button type="button" className="pt-btn pt-btn--ghost" onClick={resetForm}>
                Cancel edit
              </button>
            ) : null}
            <button className="pt-btn pt-btn--primary" disabled={submitting}>
              {submitting ? 'Saving…' : form.id ? 'Save changes' : 'Add vehicle'}
            </button>
          </div>
        </form>
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

      <div className="pt-list">
        <div className="pt-row">
          <input
            className="pt-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search vehicles…"
            aria-label="Search vehicles"
            style={{ flex: '1 1 260px' }}
          />
          <button type="button" className="pt-btn" onClick={loadVehicles} disabled={loading}>
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {loading ? (
          <div className="pt-empty">Loading vehicles…</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="pt-empty">No vehicles found.</div>
        ) : (
          filteredVehicles.map((v, idx) => {
            const id = getVehicleId(v)
            const vehicleNumber = safeText(v?.vehicleNumber ?? v?.number ?? v?.plate) || '—'
            return (
              <div className="pt-item" key={id ?? `${vehicleNumber}-${idx}`}>
                <div className="pt-row">
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 750, color: 'var(--text-h)' }}>
                      {vehicleNumber}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                      <span className="pt-pill">{safeText(v?.brand) || '—'}</span>
                      <span className="pt-pill">{safeText(v?.model) || '—'}</span>
                      {id ? <span className="pt-pill pt-pill--mono">id: {safeText(id)}</span> : null}
                    </div>
                  </div>
                  <div className="pt-actions" style={{ justifyContent: 'flex-end' }}>
                    <button type="button" className="pt-btn pt-btn--ghost" onClick={() => startEdit(v)}>
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

