import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { vendorApi } from '../api/client'
import {
  Btn, Card, Field, Modal, ConfirmModal, Table, Badge,
} from '../components/UI'

const EMPTY = { name: '', contact: '', address: '' }

function validate(form) {
  const err = {}
  if (!form.name.trim())    err.name    = 'Vendor name is required'
  if (!form.contact.trim()) err.contact = 'Contact is required'
  if (!form.address.trim()) err.address = 'Address is required'
  return err
}

export default function VendorsPage() {
  const [vendors,   setVendors]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [search,    setSearch]    = useState('')

  // form modal
  const [modalOpen, setModalOpen]   = useState(false)
  const [editId,    setEditId]      = useState(null)
  const [form,      setForm]        = useState(EMPTY)
  const [errors,    setErrors]      = useState({})

  // confirm modal
  const [confirmOpen,   setConfirmOpen]   = useState(false)
  const [deleteTarget,  setDeleteTarget]  = useState(null) // { id, name }

  /* ── Fetch all vendors ── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await vendorApi.getAll()
      setVendors(data)
    } catch (err) {
      toast.error('Failed to load vendors: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* ── Helpers ── */
  const openAdd = () => {
    setEditId(null)
    setForm(EMPTY)
    setErrors({})
    setModalOpen(true)
  }

  const openEdit = (vendor) => {
    setEditId(vendor.id)
    setForm({ name: vendor.name || '', contact: vendor.contact || '', address: vendor.address || '' })
    setErrors({})
    setModalOpen(true)
  }

  const openDelete = (vendor) => {
    setDeleteTarget({ id: vendor.id, name: vendor.name })
    setConfirmOpen(true)
  }

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: undefined }))
  }

  /* ── Save (create or update) ── */
  const handleSave = async () => {
    const err = validate(form)
    if (Object.keys(err).length) { setErrors(err); return }

    setSaving(true)
    try {
      if (editId) {
        await vendorApi.update(editId, { ...form, id: editId })
        toast.success('Vendor updated')
      } else {
        await vendorApi.create(form)
        toast.success('Vendor added')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error('Save failed: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  /* ── Delete ── */
  const handleDelete = async () => {
    setDeleting(true)
    try {
      await vendorApi.delete(deleteTarget.id)
      toast.success('Vendor deleted')
      setConfirmOpen(false)
      load()
    } catch (err) {
      toast.error('Delete failed: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  /* ── Filter ── */
  const filtered = vendors.filter((v) =>
    [v.name, v.contact, v.address]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  /* ── Render ── */
  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Vendors</h1>
        <p className="page-sub">
          Feature 5 — Manage supplier records (CRUD operations)
        </p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 28 }}>
        <div className="stat-card stat-yellow">
          <div className="stat-label">Total Vendors</div>
          <div className="stat-value">{loading ? '—' : vendors.length}</div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-label">Active</div>
          <div className="stat-value">{loading ? '—' : vendors.length}</div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-label">Search Results</div>
          <div className="stat-value">{loading ? '—' : filtered.length}</div>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <div className="section-head">
          <span className="section-title">All Vendors</span>
          <div className="flex gap-12 items-center" style={{ flexWrap: 'wrap' }}>
            {/* Search */}
            <div className="search-wrap">
              <span className="search-icon">⌕</span>
              <input
                placeholder="Search vendors…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Btn onClick={openAdd}>+ Add Vendor</Btn>
          </div>
        </div>

        <Table
          loading={loading}
          columns={['ID', 'Name', 'Contact', 'Address', 'Status', 'Actions']}
          data={filtered}
          emptyMessage="No vendors found. Add your first vendor."
          renderRow={(v) => (
            <tr key={v.id}>
              <td className="td-id">#{v.id}</td>
              <td className="td-name">{v.name || '—'}</td>
              <td className="td-muted">{v.contact || '—'}</td>
              <td className="td-muted">{v.address || '—'}</td>
              <td><Badge color="green">Active</Badge></td>
              <td>
                <div className="flex gap-8">
                  <Btn variant="ghost" size="sm" onClick={() => openEdit(v)}>✏ Edit</Btn>
                  <Btn variant="danger" size="sm" onClick={() => openDelete(v)}>✕</Btn>
                </div>
              </td>
            </tr>
          )}
        />
      </Card>

      {/* Add / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? 'Edit Vendor' : 'Add New Vendor'}
        width={480}
      >
        <div className="form-stack">
          <Field label="Vendor Name *" error={errors.name}>
            <input
              name="name"
              placeholder="e.g. AutoParts Co."
              value={form.name}
              onChange={handleChange}
            />
          </Field>
          <Field label="Contact (Phone / Email) *" error={errors.contact}>
            <input
              name="contact"
              placeholder="e.g. +94 77 123 4567"
              value={form.contact}
              onChange={handleChange}
            />
          </Field>
          <Field label="Address *" error={errors.address}>
            <input
              name="address"
              placeholder="e.g. 42 Main Street, Colombo"
              value={form.address}
              onChange={handleChange}
            />
          </Field>
        </div>
        <div className="modal-footer">
          <Btn variant="ghost" onClick={() => setModalOpen(false)} disabled={saving}>
            Cancel
          </Btn>
          <Btn onClick={handleSave} loading={saving}>
            {editId ? 'Update Vendor' : 'Add Vendor'}
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
