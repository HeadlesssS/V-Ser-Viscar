import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { invoiceApi, vendorApi } from '../api/client'
import {
  Btn, Card, Field, Modal, ConfirmModal, Table, StatCard,
} from '../components/UI'

const fmt = (n) =>
  n == null
    ? '—'
    : 'Rs. ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

function validate(form) {
  const err = {}
  if (!form.vendorId)                       err.vendorId     = 'Please select a vendor'
  if (!form.totalAmount || Number(form.totalAmount) <= 0)
                                             err.totalAmount  = 'Enter a valid amount greater than 0'
  return err
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [vendors,  setVendors]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search,   setSearch]   = useState('')

  // form modal
  const [modalOpen, setModalOpen] = useState(false)
  const [form,      setForm]      = useState({ vendorId: '', totalAmount: '' })
  const [errors,    setErrors]    = useState({})

  // confirm modal
  const [confirmOpen,  setConfirmOpen]  = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [invRes, venRes] = await Promise.all([
        invoiceApi.getAll(),
        vendorApi.getAll(),
      ])
      setInvoices(invRes.data)
      setVendors(venRes.data)
    } catch (err) {
      toast.error('Failed to load data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* ── Derived stats ── */
  const totalSpend = invoices.reduce((s, i) => s + (i.totalAmount || 0), 0)
  const avgInvoice = invoices.length ? totalSpend / invoices.length : 0

  /* ── Helpers ── */
  const openAdd = () => {
    setForm({ vendorId: '', totalAmount: '' })
    setErrors({})
    setModalOpen(true)
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
  }

  /* ── Create invoice ── */
  const handleSave = async () => {
    const err = validate(form)
    if (Object.keys(err).length) { setErrors(err); return }

    setSaving(true)
    try {
      await invoiceApi.create({
        vendorId:    parseInt(form.vendorId),
        totalAmount: parseFloat(form.totalAmount),
      })
      toast.success('Invoice created')
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error('Failed to create invoice: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete ── */
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await invoiceApi.delete(deleteTarget.id)
      toast.success('Invoice deleted')
      setConfirmOpen(false)
      load()
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  /* ── Filter ── */
  const filtered = invoices.filter((inv) => {
    const vendorName = inv.vendor?.name || ''
    return (
      String(inv.id).includes(search) ||
      vendorName.toLowerCase().includes(search.toLowerCase()) ||
      fmtDate(inv.date).toLowerCase().includes(search.toLowerCase())
    )
  })

  /* ── Render ── */
  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Purchase Invoices</h1>
        <p className="page-sub">
          Feature 4 — Create purchase invoices from vendors to update stock
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard
          label="Total Invoices"
          value={invoices.length}
          accent="yellow"
          loading={loading}
        />
        <StatCard
          label="Total Spend"
          value={loading ? null : fmt(totalSpend)}
          accent="green"
          loading={loading}
        />
        <StatCard
          label="Average Invoice"
          value={loading ? null : fmt(avgInvoice)}
          accent="blue"
          loading={loading}
        />
        <StatCard
          label="Vendors Active"
          value={vendors.length}
          accent="yellow"
          loading={loading}
        />
      </div>

      {/* Table */}
      <Card>
        <div className="section-head">
          <span className="section-title">Invoice Records</span>
          <div className="flex gap-12 items-center" style={{ flexWrap: 'wrap' }}>
            <div className="search-wrap">
              <span className="search-icon">⌕</span>
              <input
                placeholder="Search invoices…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Btn onClick={openAdd}>+ New Invoice</Btn>
          </div>
        </div>

        <Table
          loading={loading}
          columns={['Invoice #', 'Date', 'Vendor', 'Amount', 'Actions']}
          data={filtered}
          emptyMessage="No invoices yet. Create your first purchase invoice."
          renderRow={(inv) => (
            <tr key={inv.id}>
              <td className="td-id">INV-{String(inv.id).padStart(4, '0')}</td>
              <td className="td-muted">{fmtDate(inv.date)}</td>
              <td className="td-name">{inv.vendor?.name || `Vendor #${inv.vendorId}`}</td>
              <td className="td-amount">{fmt(inv.totalAmount)}</td>
              <td>
                <Btn
                  variant="danger"
                  size="sm"
                  onClick={() => { setDeleteTarget({ id: inv.id, name: `INV-${String(inv.id).padStart(4,'0')}` }); setConfirmOpen(true) }}
                >
                  ✕ Delete
                </Btn>
              </td>
            </tr>
          )}
        />
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Purchase Invoice"
        width={440}
      >
        <div className="form-stack">
          <Field label="Vendor *" error={errors.vendorId}>
            <select name="vendorId" value={form.vendorId} onChange={handleChange}>
              <option value="">— Select a vendor —</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Total Amount (Rs.) *" error={errors.totalAmount}>
            <input
              name="totalAmount"
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 15000.00"
              value={form.totalAmount}
              onChange={handleChange}
            />
          </Field>

          {vendors.length === 0 && (
            <p style={{ fontSize: 12, color: 'var(--red)' }}>
              ⚠ No vendors available. Please add vendors first.
            </p>
          )}
        </div>

        <div className="modal-footer">
          <Btn variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
            Cancel
          </Btn>
          <Btn onClick={handleSave} loading={saving} disabled={vendors.length === 0}>
            Create Invoice
          </Btn>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name}
        loading={deleting}
      />
    </div>
  )
}
