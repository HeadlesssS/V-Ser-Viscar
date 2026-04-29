import { useState, useEffect } from 'react';
import { purchaseInvoicesApi, vendorsApi, partsApi } from '../api/client';
import Navbar from '../components/Navbar';

export default function PurchasesPage() {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [parts, setParts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vendorId: '', notes: '' });
  const [items, setItems] = useState([{ partId: '', quantity: 1, unitCost: '' }]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [inv, v, p] = await Promise.all([purchaseInvoicesApi.getAll(), vendorsApi.getAll(), partsApi.getAll()]);
    setInvoices(inv.data);
    setVendors(v.data);
    setParts(p.data);
  };

  useEffect(() => { load(); }, []);

  const addItem = () => setItems(i => [...i, { partId: '', quantity: 1, unitCost: '' }]);
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
  const updateItem = (idx, field, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: val } : item));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.vendorId) { setError('Please select a vendor'); return; }
    if (items.some(i => !i.partId || !i.unitCost)) { setError('Fill all item fields'); return; }
    setLoading(true);
    try {
      await purchaseInvoicesApi.create({
        vendorId: Number(form.vendorId),
        notes: form.notes,
        items: items.map(i => ({ partId: Number(i.partId), quantity: Number(i.quantity), unitCost: Number(i.unitCost) }))
      });
      setMsg('Purchase invoice created! Stock updated.');
      setShowForm(false);
      setForm({ vendorId: '', notes: '' });
      setItems([{ partId: '', quantity: 1, unitCost: '' }]);
      load();
      setTimeout(() => setMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>📦 Purchase Invoices (Stock In)</h2>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(''); }}>+ New Purchase</button>
        </div>

        {msg && <div style={{ background: '#f0fff4', border: '1px solid #68d391', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: '#276749' }}>{msg}</div>}
        {error && <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: '#c53030' }}>{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--primary)' }}>
            <h3 style={{ marginBottom: '16px' }}>New Purchase Invoice</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Vendor *</label>
                  <select value={form.vendorId} onChange={e => setForm(f => ({ ...f, vendorId: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }}>
                    <option value="">Select vendor</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Notes</label>
                  <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }} />
                </div>
              </div>

              <h4 style={{ marginBottom: '10px' }}>Items</h4>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <div>
                    {idx === 0 && <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '500' }}>Part</label>}
                    <select value={item.partId} onChange={e => updateItem(idx, 'partId', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }}>
                      <option value="">Select part</option>
                      {parts.map(p => <option key={p.id} value={p.id}>{p.name} (stock: {p.quantityOnHand})</option>)}
                    </select>
                  </div>
                  <div>
                    {idx === 0 && <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '500' }}>Qty</label>}
                    <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    {idx === 0 && <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '500' }}>Unit Cost</label>}
                    <input type="number" min="0" step="0.01" value={item.unitCost} onChange={e => updateItem(idx, 'unitCost', e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }} />
                  </div>
                  <button type="button" onClick={() => removeItem(idx)} style={{ padding: '8px 12px', background: '#fff5f5', color: '#c53030', border: '1px solid #fc8181', borderRadius: 'var(--radius)', cursor: 'pointer' }}>✕</button>
                </div>
              ))}

              <button type="button" className="btn btn-outline" style={{ marginBottom: '16px' }} onClick={addItem}>+ Add Item</button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Create Invoice'}</button>
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>#</th>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Vendor</th>
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Notes</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Total (NPR)</th>
                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Items</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)' }}>No purchase invoices yet.</td></tr>
              )}
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 10px', fontWeight: '500' }}>PI-{String(inv.id).padStart(4, '0')}</td>
                  <td style={{ padding: '11px 10px' }}>{new Date(inv.date).toLocaleDateString()}</td>
                  <td style={{ padding: '11px 10px' }}>{inv.vendorName}</td>
                  <td style={{ padding: '11px 10px', color: 'var(--text-light)' }}>{inv.notes || '—'}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right', fontWeight: '600' }}>{Number(inv.totalAmount).toFixed(2)}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'center' }}>
                    <span style={{ background: '#e7f5ff', color: '#1971c2', padding: '2px 8px', borderRadius: '20px', fontSize: '0.82rem' }}>{inv.items?.length || 0} items</span>
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
