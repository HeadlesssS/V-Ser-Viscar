import { useState, useEffect } from 'react';
import { partsApi, categoriesApi } from '../api/client';
import Navbar from '../components/Navbar';

const emptyForm = { name: '', description: '', categoryId: '', price: '', quantityOnHand: '', reorderLevel: 10 };

export default function PartsPage() {
  const [parts, setParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [p, c] = await Promise.all([partsApi.getAll(), categoriesApi.getAll()]);
    setParts(p.data);
    setCategories(c.data);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setShowForm(true); setError(''); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description || '', categoryId: p.categoryId, price: p.price, quantityOnHand: p.quantityOnHand, reorderLevel: p.reorderLevel });
    setEditId(p.id);
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, categoryId: Number(form.categoryId), price: Number(form.price), quantityOnHand: Number(form.quantityOnHand), reorderLevel: Number(form.reorderLevel) };
      if (editId) {
        await partsApi.update(editId, payload);
        setMsg('Part updated successfully!');
      } else {
        await partsApi.create(payload);
        setMsg('Part added successfully!');
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete part "${name}"?`)) return;
    try {
      await partsApi.delete(id);
      setMsg('Part deleted.');
      load();
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      setError('Cannot delete part — it may be used in invoices.');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>🔩 Parts Management</h2>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Part</button>
        </div>

        {msg && <div style={{ background: '#f0fff4', border: '1px solid #68d391', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: '#276749' }}>{msg}</div>}
        {error && <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: '#c53030' }}>{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--primary)' }}>
            <h3 style={{ marginBottom: '16px' }}>{editId ? 'Edit Part' : 'Add New Part'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Part Name *</label>
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category *</label>
                  <select required value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Price (NPR) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Stock Quantity *</label>
                  <input required type="number" min="0" value={form.quantityOnHand} onChange={e => setForm(f => ({ ...f, quantityOnHand: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Reorder Level</label>
                  <input type="number" min="1" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (editId ? 'Update Part' : 'Add Part')}</button>
                <button type="button" className="btn btn-outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Name</th>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Price</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Stock</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Reorder</th>
                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)' }}>No parts found. Add your first part!</td></tr>
              )}
              {parts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 10px', fontWeight: '500' }}>{p.name}</td>
                  <td style={{ padding: '11px 10px', color: 'var(--text-light)' }}>{p.categoryName}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right' }}>NPR {Number(p.price).toFixed(2)}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right' }}>{p.quantityOnHand}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right' }}>{p.reorderLevel}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'center' }}>
                    {p.isLowStock
                      ? <span style={{ background: '#fff5f5', color: '#c53030', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}>⚠ Low Stock</span>
                      : <span style={{ background: '#f0fff4', color: '#276749', padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '500' }}>✓ OK</span>
                    }
                  </td>
                  <td style={{ padding: '11px 10px', textAlign: 'center' }}>
                    <button className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.85rem', marginRight: '6px' }} onClick={() => openEdit(p)}>Edit</button>
                    <button className="btn" style={{ padding: '4px 12px', fontSize: '0.85rem', background: '#fff5f5', color: '#c53030', border: '1px solid #fc8181' }} onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
