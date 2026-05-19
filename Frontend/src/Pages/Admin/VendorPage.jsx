import { useState, useEffect } from 'react'
import './admin.css'

const API = "http://localhost:5169/api"
const COLORS = ['#cc1e1e','#1a4faa','#1a7a3a','#b05a00','#6b1a8a']
const empty = { name:'', contactPerson:'', phone:'', email:'', address:'' }

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

export default function VendorPage() {
  const [vendors, setVendors]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
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
      const res = await fetch(`${API}/vendors`)
      const data = await res.json()
      setVendors(Array.isArray(data) ? data : [])
    } catch { addToast('Failed to load vendors.', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase()
    return !q ||
      v.name?.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.phone?.includes(q) ||
      v.contactPerson?.toLowerCase().includes(q)
  })

  const openCreate = () => { setEditing(null); setForm(empty); setShowForm(true) }
  const openEdit   = v  => {
    setEditing(v)
    setForm({ name:v.name, contactPerson:v.contactPerson, phone:v.phone, email:v.email, address:v.address })
    setShowForm(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(editing ? `${API}/vendors/${editing.id}` : `${API}/vendors`, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      addToast(editing ? 'Vendor updated.' : 'Vendor added.')
      setShowForm(false); load()
    } catch (err) { addToast(err.message, 'error') }
    finally { setSubmitting(false) }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/vendors/${confirmDelete.id}`, { method: 'DELETE' })
      if (!res.ok) { const e = await res.json(); throw new Error(e.message) }
      addToast('Vendor deleted.')
      setConfirmDelete(null); load()
    } catch (err) { addToast(err.message, 'error') }
  }

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={id => setToasts(t => t.filter(x => x.id !== id))} />

      {/* Header */}
      <div className="ph">
        <div>
          <h1 className="ph-title">Vendor Directory</h1>
          <p className="ph-sub">Manage all your parts suppliers in one place.</p>
        </div>
        <button className="btn btn-p" onClick={openCreate}>+ Add Vendor</button>
      </div>

      {/* Toolbar */}
      <div className="tb" style={{ marginBottom:20 }}>
        <div className="sw" style={{ flex:'0 1 320px' }}>
          <span className="sw-ic">⌕</span>
          <input
            className="sw-in"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vendors..."
          />
        </div>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="empty-state"><div className="spinner" /><p>Loading vendors…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p>{search ? 'No vendors match your search.' : 'No vendors yet.'}</p>
        </div>
      ) : (
        <div className="grid">
          {filtered.map((v, i) => {
            const color = COLORS[i % COLORS.length]
            const ini   = v.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={v.id} className="card">
                <div className="card-top-line" style={{ background:`linear-gradient(90deg,${color},transparent)` }} />

                {/* Card header */}
                <div className="card-head">
                  <div className="card-av" style={{ color, background:`${color}18`, border:`1px solid ${color}33` }}>
                    {ini}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="card-title" style={{ fontSize:16, fontWeight:700, color:'#08060d' }}>
                      {v.name}
                    </div>
                    <div className="card-id" style={{ color:'#9c97a3', fontSize:11 }}>
                      VND-{String(v.id).padStart(4,'0')}
                    </div>
                  </div>
                </div>

                {/* Info rows */}
                <div className="card-rows">
                  {[
                    ['👤','Contact', v.contactPerson],
                    ['📞','Phone',   v.phone],
                    ['✉', 'Email',   v.email],
                    ['📍','Address', v.address],
                  ].map(([ic, lb, val]) => (
                    <div key={lb} className="card-row">
                      <span className="card-row-ic">{ic}</span>
                      <span style={{
                        fontSize:11, color:'#6b6375', width:52,
                        flexShrink:0, textTransform:'uppercase',
                        letterSpacing:'0.5px', paddingTop:1, fontWeight:600
                      }}>{lb}</span>
                      <span style={{
                        fontSize:13, color:'#08060d',
                        fontWeight:600, wordBreak:'break-all'
                      }}>{val || '—'}</span>
                    </div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="card-actions">
                  <button onClick={() => openEdit(v)} style={{
                    flex:1, padding:'9px 0',
                    background:'#fff0f0',
                    border:'1px solid rgba(204,30,30,0.3)',
                    color:'#cc1e1e',
                    borderRadius:7, cursor:'pointer',
                    fontSize:12, fontWeight:600,
                    fontFamily:'inherit',
                    transition:'all .14s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background='#cc1e1e'; e.currentTarget.style.color='#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#fff0f0'; e.currentTarget.style.color='#cc1e1e'; }}
                  >✎ Edit</button>

                  <button onClick={() => setConfirmDelete(v)} style={{
                    flex:1, padding:'9px 0',
                    background:'#cc1e1e',
                    border:'1px solid #cc1e1e',
                    color:'#fff',
                    borderRadius:7, cursor:'pointer',
                    fontSize:12, fontWeight:600,
                    fontFamily:'inherit',
                    transition:'all .14s'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background='#b01818'; e.currentTarget.style.borderColor='#b01818'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='#cc1e1e'; e.currentTarget.style.borderColor='#cc1e1e'; }}
                  >✕ Delete</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Vendor' : 'Add New Vendor'}>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Vendor Name <span>*</span></label>
              <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required placeholder="e.g. AutoParts Global" />
            </div>
            <div className="field">
              <label>Contact Person</label>
              <input value={form.contactPerson} onChange={e => setForm(f=>({...f,contactPerson:e.target.value}))} placeholder="e.g. Ramesh Kumar" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="98XXXXXXXX" />
            </div>
            <div className="field">
              <label>Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="vendor@example.com" />
            </div>
          </div>
          <div className="field">
            <label>Address</label>
            <input value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} placeholder="Street, City" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-g" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-p" disabled={submitting}>
              {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Vendor?">
        <div className="confirm-body">
          <div className="confirm-icon">⚠</div>
          <p className="confirm-text"><strong>{confirmDelete?.name}</strong> will be deleted.</p>
          <div className="form-actions" style={{ justifyContent:'center' }}>
            <button className="btn btn-g" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-d" onClick={handleDelete}>Yes, Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
