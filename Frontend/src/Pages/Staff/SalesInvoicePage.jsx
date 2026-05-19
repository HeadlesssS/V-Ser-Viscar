import { useState, useEffect } from 'react'
import '../admin/admin.css'

const API = "http://localhost:5169/api"
const COLORS = ['#cc1e1e','#1a4faa','#1a7a3a','#b05a00','#6b1a8a']

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

function Modal({ open, onClose, title, wide, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={wide ? { maxWidth:600 } : {}}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default function SalesInvoicePage() {
  const [invoices, setInvoices]           = useState([])
  const [customers, setCustomers]         = useState([])
  const [parts, setParts]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [showForm, setShowForm]           = useState(false)
  const [showDetail, setShowDetail]       = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [submitting, setSubmitting]       = useState(false)
  const [toasts, setToasts]               = useState([])

  // Form state
  const [customerId, setCustomerId] = useState('')
  const [staffId, setStaffId]       = useState('1')
  const [isCredit, setIsCredit]     = useState(false)
  const [items, setItems]           = useState([{ partId:'', quantity:'', unitPrice:'' }])

  const addToast = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000)
  }

  const load = async () => {
    setLoading(true)
    try {
      const [invRes, cusRes, partsRes] = await Promise.all([
        fetch(`${API}/sales-invoices`),
        fetch(`${API}/customers`),
        fetch(`${API}/parts`),
      ])
      const [inv, cus, pts] = await Promise.all([
        invRes.json(), cusRes.json(), partsRes.json()
      ])
      setInvoices(Array.isArray(inv)  ? inv  : [])
      setCustomers(Array.isArray(cus) ? cus  : [])
      setParts(Array.isArray(pts)     ? pts  : [])
    } catch {
      addToast('Failed to load data.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Auto-fill unit price when part selected
  const updateItem = (i, field, val) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item
      const updated = { ...item, [field]: val }
      if (field === 'partId') {
        const part = parts.find(p => p.id === parseInt(val))
        if (part) updated.unitPrice = part.sellingPrice
      }
      return updated
    }))
  }

  // Live totals
  const subtotal       = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0)
  const discountAmount = subtotal > 5000 ? subtotal * 0.10 : 0
  const totalAmount    = subtotal - discountAmount

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase()
    return !q ||
      inv.customerName?.toLowerCase().includes(q) ||
      inv.staffName?.toLowerCase().includes(q) ||
      String(inv.id).includes(q)
  })

  const openCreate = () => {
    setCustomerId(''); setStaffId('1'); setIsCredit(false)
    setItems([{ partId:'', quantity:'', unitPrice:'' }])
    setShowForm(true)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!customerId) { addToast('Please select a customer.', 'error'); return }
    if (items.some(i => !i.partId || !i.quantity || !i.unitPrice)) {
      addToast('Please fill all item fields.', 'error'); return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API}/sales-invoices`, {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          staffId:    parseInt(staffId),
          customerId: parseInt(customerId),
          isCredit,
          items: items.map(i => ({
            partId:    parseInt(i.partId),
            quantity:  parseInt(i.quantity),
            unitPrice: parseFloat(i.unitPrice),
          })),
        }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.message) }
      addToast('Sales invoice created successfully.')
      setShowForm(false); load()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API}/sales-invoices/${confirmDelete.id}`, { method:'DELETE' })
      if (!res.ok) { const err = await res.json(); throw new Error(err.message) }
      addToast('Invoice deleted and stock reversed.')
      setConfirmDelete(null); load()
    } catch (err) { addToast(err.message, 'error') }
  }

  const totalRevenue  = invoices.reduce((s, i) => s + i.totalAmount, 0)
  const totalDiscount = invoices.reduce((s, i) => s + i.discountAmount, 0)
  const creditCount   = invoices.filter(i => i.isCredit).length
  const thisMonth     = invoices.filter(i => new Date(i.saleDate).getMonth() === new Date().getMonth()).length

  return (
    <div className="page">
      <Toast toasts={toasts} onRemove={id => setToasts(t => t.filter(x => x.id !== id))} />

      {/* Header */}
      <div className="ph">
        <div>
          <p className="ph-bc">Staff › Sales Invoices</p>
          <h1 className="ph-title">Sales Invoices</h1>
          <p className="ph-sub">Create and manage vehicle parts sales.</p>
        </div>
        <button className="btn btn-p" onClick={openCreate}>+ New Sale</button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="sc"><span className="sc-n">{invoices.length}</span><span className="sc-l">Total Invoices</span></div>
        <div className="sc"><span className="sc-n sc-n-g">Rs {totalRevenue.toLocaleString()}</span><span className="sc-l">Total Revenue</span></div>
        <div className="sc"><span className="sc-n" style={{ color:'#b05a00' }}>{creditCount}</span><span className="sc-l">Credit Sales</span></div>
        <div className="sc"><span className="sc-n" style={{ color:'#6b1a8a' }}>Rs {totalDiscount.toLocaleString()}</span><span className="sc-l">Discounts Given</span></div>
        <div className="sc"><span className="sc-n" style={{ color:'#1a4faa' }}>{thisMonth}</span><span className="sc-l">This Month</span></div>
      </div>

      {/* Short search */}
      <div style={{ marginBottom:20 }}>
        <div className="sw" style={{ width:320 }}>
          <span className="sw-ic">⌕</span>
          <input className="sw-in" value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer, staff or ID..." />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="empty-state"><div className="spinner" /><p>Loading invoices…</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🧾</div>
          <p>{search ? 'No invoices match your search.' : 'No sales invoices yet.'}</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {filtered.map((inv, i) => {
            const color = COLORS[i % COLORS.length]
            const date  = new Date(inv.saleDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
            return (
              <div key={inv.id} style={{
                background:'#fff', border:'1px solid #e5e4e7',
                borderRadius:14, overflow:'hidden',
                boxShadow:'0 1px 3px rgba(0,0,0,0.05)',
                transition:'box-shadow .18s, transform .18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 6px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.05)'; e.currentTarget.style.transform='translateY(0)'; }}
              >
                {/* Loyalty banner */}
                {inv.loyaltyDiscountApplied && (
                  <div style={{ background:'#f0fdf4', borderBottom:'1px solid #b3dfc0', padding:'6px 20px', fontSize:11, color:'#1a7a3a', fontWeight:600, display:'flex', alignItems:'center', gap:6 }}>
                    🎉 10% Loyalty Discount Applied — Rs {inv.discountAmount?.toLocaleString()} saved
                  </div>
                )}

                <div style={{ display:'flex', alignItems:'stretch' }}>
                  {/* Color bar */}
                  <div style={{ width:4, background:color, flexShrink:0 }} />

                  {/* ID + Date */}
                  <div style={{ padding:'16px 20px', display:'flex', alignItems:'center', gap:14, borderRight:'1px solid #f0f0f0', minWidth:190 }}>
                    <div style={{ width:44, height:44, borderRadius:10, flexShrink:0, background:`${color}15`, border:`1px solid ${color}30`, color, fontSize:11, fontWeight:800, display:'flex', alignItems:'center', justifyContent:'center', letterSpacing:0.5 }}>
                      {inv.customerName?.slice(0,2).toUpperCase() || 'SA'}
                    </div>
                    <div>
                      <div style={{ fontSize:15, fontWeight:700, color:'#08060d' }}>SAL-{String(inv.id).padStart(4,'0')}</div>
                      <div style={{ fontSize:12, color:'#9c97a3', marginTop:2 }}>{date}</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ flex:1, padding:'16px 24px', display:'flex', alignItems:'center', gap:28, borderRight:'1px solid #f0f0f0', flexWrap:'wrap' }}>
                    {[
                      ['Customer', inv.customerName],
                      ['Staff',    inv.staffName || 'Staff'],
                      ['Items',    `${inv.items?.length || 0} part(s)`],
                      ['Payment',  inv.isPaid ? 'Paid' : 'Credit'],
                    ].map(([lb, val]) => (
                      <div key={lb} style={{ display:'flex', flexDirection:'column', gap:3 }}>
                        <span style={{ fontSize:10, color:'#9c97a3', textTransform:'uppercase', letterSpacing:'0.8px', fontWeight:600 }}>{lb}</span>
                        <span style={{ fontSize:13, fontWeight:600, color: lb === 'Payment' ? (inv.isPaid ? '#1a7a3a' : '#b05a00') : '#08060d' }}>{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Amount + Actions */}
                  <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', alignItems:'flex-end', justifyContent:'center', gap:10, minWidth:180 }}>
                    <div style={{ textAlign:'right' }}>
                      {inv.discountAmount > 0 && (
                        <div style={{ fontSize:11, color:'#9c97a3', textDecoration:'line-through', marginBottom:2 }}>
                          Rs {inv.subtotal?.toLocaleString()}
                        </div>
                      )}
                      <div style={{ fontSize:11, color:'#9c97a3', marginBottom:2 }}>Total Amount</div>
                      <div style={{ fontSize:20, fontWeight:800, color:'#cc1e1e' }}>Rs {inv.totalAmount?.toLocaleString()}</div>
                    </div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => setShowDetail(inv)} style={{
                        padding:'7px 12px', background:'#fff0f0',
                        border:'1px solid rgba(204,30,30,0.3)', color:'#cc1e1e',
                        borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', transition:'all .14s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background='#cc1e1e'; e.currentTarget.style.color='#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#fff0f0'; e.currentTarget.style.color='#cc1e1e'; }}
                      >👁 View</button>
                      <button onClick={() => setConfirmDelete(inv)} style={{
                        padding:'7px 12px', background:'#cc1e1e',
                        border:'1px solid #cc1e1e', color:'#fff',
                        borderRadius:7, cursor:'pointer', fontSize:12, fontWeight:600, fontFamily:'inherit', transition:'background .14s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background='#b01818'}
                        onMouseLeave={e => e.currentTarget.style.background='#cc1e1e'}
                      >✕ Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Create Sales Invoice" wide>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label>Customer <span>*</span></label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)} required>
                <option value="">Select customer…</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.userName || c.user?.name || `Customer #${c.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Staff ID</label>
              <input type="number" value={staffId} onChange={e => setStaffId(e.target.value)} placeholder="Staff ID" />
            </div>
          </div>

          {/* Items */}
          <div className="field">
            <label>Items <span>*</span></label>
            <div style={{ border:'1px solid #e5e4e7', borderRadius:8, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:8, padding:'8px 12px', background:'#f7f7f8', fontSize:11, fontWeight:600, color:'#9c97a3', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                <span>Part</span><span>Qty</span><span>Unit Price</span><span></span>
              </div>
              {items.map((item, idx) => (
                <div key={idx} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr auto', gap:8, padding:'8px 12px', borderTop:'1px solid #f0f0f0', alignItems:'center' }}>
                  <select value={item.partId} onChange={e => updateItem(idx,'partId',e.target.value)}
                    style={{ padding:'6px 8px', border:'1px solid #e5e4e7', borderRadius:6, fontSize:12, fontFamily:'inherit', outline:'none' }}>
                    <option value="">Select part…</option>
                    {parts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stockQuantity})</option>
                    ))}
                  </select>
                  <input type="number" placeholder="Qty" min="1" value={item.quantity}
                    onChange={e => updateItem(idx,'quantity',e.target.value)}
                    style={{ padding:'6px 8px', border:'1px solid #e5e4e7', borderRadius:6, fontSize:12, fontFamily:'inherit', outline:'none' }} />
                  <input type="number" placeholder="Price" value={item.unitPrice}
                    onChange={e => updateItem(idx,'unitPrice',e.target.value)}
                    style={{ padding:'6px 8px', border:'1px solid #e5e4e7', borderRadius:6, fontSize:12, fontFamily:'inherit', outline:'none' }} />
                  <button type="button" onClick={() => {
                    if (items.length === 1) { addToast('At least one item required.', 'error'); return }
                    setItems(items.filter((_, i) => i !== idx))
                  }} style={{ width:26, height:26, borderRadius:6, border:'1px solid #fcc', background:'#fff8f8', color:'#cc1e1e', cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                </div>
              ))}
              <button type="button" onClick={() => setItems([...items, { partId:'', quantity:'', unitPrice:'' }])}
                style={{ padding:'8px 12px', background:'#f7f7f8', border:'none', borderTop:'1px solid #e5e4e7', width:'100%', cursor:'pointer', fontSize:12, color:'#6b6375', fontFamily:'inherit' }}>
                + Add Item
              </button>
            </div>
          </div>

          {/* Live order summary */}
          <div style={{ background:'#f7f7f8', borderRadius:8, padding:'12px 14px', display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
              <span style={{ color:'#6b6375' }}>Subtotal</span>
              <span style={{ fontWeight:600 }}>Rs {subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'#1a7a3a' }}>🎉 Loyalty Discount (10%)</span>
                <span style={{ color:'#1a7a3a', fontWeight:600 }}>- Rs {discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:700, borderTop:'1px solid #e5e4e7', paddingTop:8 }}>
              <span>Total</span>
              <span style={{ color:'#cc1e1e' }}>Rs {totalAmount.toLocaleString()}</span>
            </div>
            {subtotal > 5000 && (
              <div style={{ fontSize:11, color:'#1a7a3a', textAlign:'right' }}>
                ✓ Loyalty discount applied — subtotal exceeds Rs 5,000
              </div>
            )}
          </div>

          {/* Payment type */}
          <div className="field">
            <label>Payment Type</label>
            <div style={{ display:'flex', background:'#f7f7f8', border:'1px solid #e5e4e7', borderRadius:8, padding:4, gap:4 }}>
              <button type="button" onClick={() => setIsCredit(false)} style={{
                flex:1, padding:'8px 0', borderRadius:6, border:'none', cursor:'pointer',
                fontSize:12, fontWeight:600, fontFamily:'inherit',
                background: !isCredit ? '#cc1e1e' : 'transparent',
                color: !isCredit ? '#fff' : '#6b6375', transition:'all .14s'
              }}>Cash / Paid</button>
              <button type="button" onClick={() => setIsCredit(true)} style={{
                flex:1, padding:'8px 0', borderRadius:6, border:'none', cursor:'pointer',
                fontSize:12, fontWeight:600, fontFamily:'inherit',
                background: isCredit ? '#b05a00' : 'transparent',
                color: isCredit ? '#fff' : '#6b6375', transition:'all .14s'
              }}>Credit</button>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-g" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-p" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal open={!!showDetail} onClose={() => setShowDetail(null)}
        title={`SAL-${String(showDetail?.id || 0).padStart(4,'0')}`} wide>
        {showDetail && (
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-grid">
              {[
                ['Customer', showDetail.customerName],
                ['Staff',    showDetail.staffName || 'Staff'],
                ['Date',     new Date(showDetail.saleDate).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })],
                ['Status',   showDetail.isPaid ? '✓ Paid' : '⏳ Credit'],
              ].map(([lb, val]) => (
                <div key={lb} style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  <span style={{ fontSize:11, color:'#9c97a3', textTransform:'uppercase', letterSpacing:'0.5px', fontWeight:600 }}>{lb}</span>
                  <span style={{ fontSize:13, fontWeight:600, color: lb === 'Status' ? (showDetail.isPaid ? '#1a7a3a' : '#b05a00') : '#08060d' }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Items table */}
            <div style={{ border:'1px solid #e5e4e7', borderRadius:8, overflow:'hidden' }}>
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8, padding:'8px 14px', background:'#f7f7f8', fontSize:11, fontWeight:600, color:'#9c97a3', textTransform:'uppercase' }}>
                <span>Part</span><span>Qty</span><span>Unit Price</span><span style={{ textAlign:'right' }}>Line Total</span>
              </div>
              {showDetail.items?.map(item => (
                <div key={item.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr', gap:8, padding:'10px 14px', borderTop:'1px solid #f0f0f0', fontSize:13, alignItems:'center' }}>
                  <div>
                    <div style={{ fontWeight:600, color:'#08060d' }}>{item.partName}</div>
                    <div style={{ fontSize:11, color:'#9c97a3' }}>{item.sku}</div>
                  </div>
                  <span style={{ color:'#08060d', fontWeight:500 }}>{item.quantity}</span>
                  <span style={{ color:'#08060d', fontWeight:500 }}>Rs {item.unitPrice?.toLocaleString()}</span>
                  <span style={{ fontWeight:700, color:'#cc1e1e', textAlign:'right' }}>Rs {item.lineTotal?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ background:'#f7f7f8', borderRadius:8, padding:'12px 14px', display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                <span style={{ color:'#6b6375' }}>Subtotal</span>
                <span style={{ fontWeight:500 }}>Rs {showDetail.subtotal?.toLocaleString()}</span>
              </div>
              {showDetail.discountAmount > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                  <span style={{ color:'#1a7a3a' }}>🎉 Loyalty Discount (10%)</span>
                  <span style={{ color:'#1a7a3a', fontWeight:600 }}>- Rs {showDetail.discountAmount?.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, borderTop:'1px solid #e5e4e7', paddingTop:8 }}>
                <span>Total</span>
                <span style={{ color:'#cc1e1e' }}>Rs {showDetail.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn btn-g" onClick={() => setShowDetail(null)}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Invoice?">
        <div className="confirm-body">
          <div className="confirm-icon">⚠</div>
          <p className="confirm-text">
            Invoice <strong>SAL-{String(confirmDelete?.id || 0).padStart(4,'0')}</strong> will be permanently deleted and stock reversed.
          </p>
          <div className="form-actions" style={{ justifyContent:'center' }}>
            <button className="btn btn-g" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-d" onClick={handleDelete}>Yes, Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}