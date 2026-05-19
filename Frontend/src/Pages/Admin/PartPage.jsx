import { useState, useEffect } from 'react'
import './admin.css'

const API = "http://localhost:5169/api"
const COLORS = ['#cc1e1e','#1a4faa','#1a7a3a','#b05a00','#6b1a8a']
const empty = { vendorId:'', name:'', sku:'', category:'', costPrice:'', sellingPrice:'', stockQuantity:'', lowStockThreshold:10 }

function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          <span style={{ flex:1 }}>{t.msg}</span>
          <button className="toast-close" onClick={() => onRemove(t.id)}>×</button>
        </div>
      ))}
    </div>
  )
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function PartPage() {
  const [parts, setParts]               = useState([])
  const [vendors, setVendors]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [filter, setFilter]             = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showForm, setShowForm]         = useState(false)
  const [editing, setEditing]           = useState(null)
  const [form, setForm]                 = useState(empty)
  const [submitting, setSubmitting]     = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toasts, setToasts]             = useState([])

  const addToast = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [partsRes, vendorsRes] = await Promise.all([
        fetch(`${API}/parts`),
        fetch(`${API}/vendors`),
      ])
      const partsData   = await partsRes.json()
      const vendorsData = await vendorsRes.json()
      setParts(Array.isArray(partsData) ? partsData : [])
      setVendors(Array.isArray(vendorsData) ? vendorsData.filter(v => v.isActive) : [])
    } catch {
      addToast('Failed to load data.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Get unique categories from parts
  const categories = ['all', ...new Set(parts.map(p => p.category).filter(Boolean))]

  const filtered = parts.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.name?.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.vendorName?.toLowerCase().includes(q)
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && p.isActive) ||
      (filter === 'inactive' && !p.isActive) ||
      (filter === 'lowstock' && p.isLowStock)
    const matchCategory =
      categoryFilter === 'all' || p.category === categoryFilter
    return matchSearch && matchFilter && matchCategory
  })

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }

  const openEdit = p => {
    setEditing(p)
    setForm({
      vendorId: p.vendorId,
      name: p.name,
      sku: p.sku,
      category: p.category,
      costPrice: p.costPrice,
      sellingPrice: p.sellingPrice,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
    })
    setShowForm(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url    = editing ? `${API}/parts/${editing.id}` : `${API}/parts`
      const method = editing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vendorId: parseInt(form.vendorId),
          costPrice: parseFloat(form.costPrice),
          sellingPrice: parseFloat(form.sellingPrice),
          stockQuantity: parseInt(form.stockQuantity),
          lowStockThreshold: parseInt(form.lowStockThreshold),
        }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.message) }
      addToast(editing ? 'Part updated successfully.' : 'Part added successfully.')
      setShowForm(false)
      load()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/parts/${confirmDelete.id}`, { method: 'DELETE' })
      if (!res.ok) { const err = await res.json(); throw new Error(err.message) }
      addToast('Part deactivated successfully.')
      setConfirmDelete(null)
      load()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  const activeCount   = parts.filter(p => p.isActive).length
  const lowStockCount = parts.filter(p => p.isLowStock).length

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={id => setToasts(t => t.filter(x => x.id !== id))} />

      {/* Header */}
      <div className="ph">
        <div>
          <p className="ph-bc">Admin › Parts Management</p>
          <h1 className="ph-title">Parts Catalog</h1>
          <p className="ph-sub">Manage all vehicle parts stocked by the service center.</p>
        </div>
        <button className="btn btn-p" onClick={openCreate}>+ Add Part</button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="sc"><span className="sc-n">{parts.length}</span><span className="sc-l">Total Parts</span></div>
        <div className="sc"><span className="sc-n sc-n-g">{activeCount}</span><span className="sc-l">Active</span></div>
        <div className="sc"><span className="sc-n sc-n-m">{parts.length - activeCount}</span><span className="sc-l">Inactive</span></div>
        <div className="sc"><span className="sc-n" style={{ color:'#b05a00' }}>{lowStockCount}</span><span className="sc-l">Low Stock</span></div>
      </div>

      {/* Toolbar */}
      <div className="tb">
        <div className="sw">
          <span className="sw-ic">⌕</span>
          <input
            className="sw-in"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, SKU, category, vendor..."
          />
        </div>
        <div className="ft">
          {[['all','All'],['active','Active'],['inactive','Inactive'],['lowstock','Low Stock']].map(([f,l]) => (
            <button key={f} className={`ftb${filter === f ? ' ftb-on' : ''}`} onClick={() => setFilter(f)}>{l}</button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)} style={{
            padding:'5px 14px', borderRadius:20, border:'1px solid',
            borderColor: categoryFilter === c ? '#cc1e1e' : '#e5e4e7',
            background: categoryFilter === c ? '#fff0f0' : '#fff',
            color: categoryFilter === c ? '#cc1e1e' : '#6b6375',
            fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
            transition:'all .14s'
          }}>
            {c === 'all' ? 'All Categories' : c}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="empty-state"><div className="spinner" /><p>Loading parts…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔧</div>
          <p>{search ? 'No parts match your search.' : 'No parts yet. Click "+ Add Part" to get started.'}</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((p, i) => {
            const color = COLORS[i % COLORS.length]
            const ini   = p.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={p.id} className="card">
                <div className="card-top-line" style={{ background:`linear-gradient(90deg,${color},transparent)` }} />

                {/* Low stock warning banner */}
                {p.isLowStock && (
                  <div style={{
                    background:'#fff8ed', border:'1px solid #f0c070',
                    borderRadius:6, padding:'6px 10px',
                    fontSize:11, color:'#b05a00', fontWeight:600,
                    display:'flex', alignItems:'center', gap:6
                  }}>
                    ⚠ Low Stock — only {p.stockQuantity} units left
                  </div>
                )}

                <div className="card-head">
                  <div className="card-av" style={{ color, background:`${color}18`, border:`1px solid ${color}33` }}>{ini}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="card-title">{p.name}</div>
                    <div className="card-id">SKU: {p.sku}</div>
                  </div>
                  <span className={`badge ${p.isActive ? 'b-act' : 'b-ina'}`}>
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="card-rows">
                  {[
                    ['🏷','Category', p.category],
                    ['🏭','Vendor',   p.vendorName],
                    ['📦','Stock',    `${p.stockQuantity} units (min: ${p.lowStockThreshold})`],
                    ['💰','Cost',     `Rs ${p.costPrice?.toLocaleString()}`],
                    ['🏷','Sell Price',`Rs ${p.sellingPrice?.toLocaleString()}`],
                  ].map(([ic, lb, val]) => (
                    <div key={lb} className="card-row">
                      <span className="card-row-ic">{ic}</span>
                      <span className="card-row-lb">{lb}</span>
                      <span className="card-row-val">{val || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Profit margin indicator */}
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'8px 10px', background:'#f7f7f8', borderRadius:7
                }}>
                  <span style={{ fontSize:11, color:'#9c97a3' }}>Profit Margin</span>
                  <span style={{ fontSize:13, fontWeight:700, color:'#1a7a3a' }}>
                    {p.costPrice > 0
                      ? `${(((p.sellingPrice - p.costPrice) / p.costPrice) * 100).toFixed(1)}%`
                      : '—'}
                  </span>
                </div>

                <div className="card-actions">
                  <button className="bic bic-e" onClick={() => openEdit(p)}>✎ Edit</button>
                  <button className="bic bic-d" onClick={() => setConfirmDelete(p)}>✕ Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Part' : 'Add New Part'}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Part Name <span>*</span></label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} required placeholder="e.g. Oil Filter" />
            </div>
            <div className="field">
              <label>SKU <span>*</span></label>
              <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku:e.target.value }))} required placeholder="e.g. OIL-FLT-001" />
            </div>
            <div className="field">
              <label>Category <span>*</span></label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))} required placeholder="e.g. Engine" />
            </div>
            <div className="field">
              <label>Vendor <span>*</span></label>
              <select value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId:e.target.value }))} required>
                <option value="">Select vendor…</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Cost Price (Rs) <span>*</span></label>
              <input type="number" value={form.costPrice} onChange={e => setForm(f => ({ ...f, costPrice:e.target.value }))} required placeholder="350" />
            </div>
            <div className="field">
              <label>Selling Price (Rs) <span>*</span></label>
              <input type="number" value={form.sellingPrice} onChange={e => setForm(f => ({ ...f, sellingPrice:e.target.value }))} required placeholder="550" />
            </div>
            <div className="field">
              <label>Stock Quantity <span>*</span></label>
              <input type="number" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity:e.target.value }))} required placeholder="25" />
            </div>
            <div className="field">
              <label>Low Stock Threshold</label>
              <input type="number" value={form.lowStockThreshold} onChange={e => setForm(f => ({ ...f, lowStockThreshold:e.target.value }))} placeholder="10" />
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-g" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-p" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Part'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Deactivate Part?">
        <div className="confirm-body">
          <div className="confirm-icon">⚠</div>
          <p className="confirm-text">
            <strong>{confirmDelete?.name}</strong> will be marked inactive and removed from the active catalog.
          </p>
          <div className="form-actions" style={{ justifyContent:'center' }}>
            <button className="btn btn-g" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-d" onClick={handleDelete}>Yes, Deactivate</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}