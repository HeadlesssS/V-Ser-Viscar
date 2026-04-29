import { useState, useEffect } from 'react';
import { salesInvoicesApi, customersApi, partsApi } from '../api/client';
import Navbar from '../components/Navbar';

export default function SalesPage() {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [parts, setParts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerId: '', paymentMethod: 'Cash', status: 'Paid' });
  const [items, setItems] = useState([{ partId: '', quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [inv, c, p] = await Promise.all([salesInvoicesApi.getAll(), customersApi.getAll(), partsApi.getAll()]);
    setInvoices(inv.data);
    setCustomers(c.data);
    setParts(p.data);
  };

  useEffect(() => { load(); }, []);

  const getPartById = (id) => parts.find(p => p.id === Number(id));
  const subTotal = items.reduce((sum, item) => {
    const part = getPartById(item.partId);
    return sum + (part ? Number(part.price) * Number(item.quantity) : 0);
  }, 0);
  const discountPercent = subTotal > 5000 ? 10 : 0;
  const total = subTotal - (subTotal * discountPercent / 100);

  const addItem = () => setItems(i => [...i, { partId: '', quantity: 1 }]);
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx));
  const updateItem = (idx, field, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: val } : item));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.customerId) { setError('Please select a customer'); return; }
    if (items.some(i => !i.partId)) { setError('Fill all item fields'); return; }
    setLoading(true);
    try {
      const res = await salesInvoicesApi.create({
        customerId: Number(form.customerId),
        paymentMethod: form.paymentMethod,
        status: form.status,
        items: items.map(i => ({ partId: Number(i.partId), quantity: Number(i.quantity) }))
      });
      const d = res.data;
      setMsg(`Invoice created! Total: NPR ${Number(d.totalAmount).toFixed(2)}${d.loyaltyApplied ? ' (10% loyalty discount applied! 🎉)' : ''}`);
      setShowForm(false);
      setForm({ customerId: '', paymentMethod: 'Cash', status: 'Paid' });
      setItems([{ partId: '', quantity: 1 }]);
      load();
      setTimeout(() => setMsg(''), 6000);
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
          <h2>🧾 Sales Invoices</h2>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setError(''); }}>+ New Sale</button>
        </div>

        {msg && <div style={{ background: '#f0fff4', border: '1px solid #68d391', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: '#276749' }}>{msg}</div>}
        {error && <div style={{ background: '#fff5f5', border: '1px solid #fc8181', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '16px', color: '#c53030' }}>{error}</div>}

        {showForm && (
          <div className="card" style={{ marginBottom: '24px', border: '2px solid var(--primary)' }}>
            <h3 style={{ marginBottom: '16px' }}>New Sales Invoice</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Customer *</label>
                  <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }}>
                    <option value="">Select customer</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Payment Method</label>
                  <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }}>
                    <option>Cash</option>
                    <option>Card</option>
                    <option>Credit</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }}>
                    <option>Paid</option>
                    <option>Credit</option>
                  </select>
                </div>
              </div>

              <h4 style={{ marginBottom: '10px' }}>Parts Sold</h4>
              {items.map((item, idx) => {
                const part = getPartById(item.partId);
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                    <div>
                      {idx === 0 && <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '500' }}>Part</label>}
                      <select value={item.partId} onChange={e => updateItem(idx, 'partId', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }}>
                        <option value="">Select part</option>
                        {parts.map(p => <option key={p.id} value={p.id}>{p.name} — NPR {Number(p.price).toFixed(2)} (stock: {p.quantityOnHand})</option>)}
                      </select>
                    </div>
                    <div>
                      {idx === 0 && <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '500' }}>Qty</label>}
                      <input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      {idx === 0 && <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: '500' }}>Subtotal</label>}
                      <input readOnly value={part ? `NPR ${(Number(part.price) * Number(item.quantity)).toFixed(2)}` : '—'}
                        style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: '#f8f9fa', boxSizing: 'border-box' }} />
                    </div>
                    <button type="button" onClick={() => removeItem(idx)} style={{ padding: '8px 12px', background: '#fff5f5', color: '#c53030', border: '1px solid #fc8181', borderRadius: 'var(--radius)', cursor: 'pointer' }}>✕</button>
                  </div>
                );
              })}

              <button type="button" className="btn btn-outline" style={{ marginBottom: '16px' }} onClick={addItem}>+ Add Part</button>

              <div style={{ background: '#f8f9fa', borderRadius: 'var(--radius)', padding: '14px 18px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-light)' }}>Subtotal</span>
                  <strong>NPR {subTotal.toFixed(2)}</strong>
                </div>
                {discountPercent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#2f9e44' }}>
                    <span>🎉 Loyalty Discount (10%)</span>
                    <strong>-NPR {(subTotal * 0.1).toFixed(2)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', fontSize: '1.1rem' }}>
                  <strong>Total</strong>
                  <strong style={{ color: 'var(--primary)' }}>NPR {total.toFixed(2)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Processing...' : 'Create Invoice'}</button>
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
                <th style={{ padding: '12px 10px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Subtotal</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Discount</th>
                <th style={{ padding: '12px 10px', textAlign: 'right' }}>Total</th>
                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Payment</th>
                <th style={{ padding: '12px 10px', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr><td colSpan={8} style={{ padding: '30px', textAlign: 'center', color: 'var(--text-light)' }}>No sales invoices yet.</td></tr>
              )}
              {invoices.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '11px 10px', fontWeight: '500' }}>SI-{String(inv.id).padStart(4, '0')}</td>
                  <td style={{ padding: '11px 10px' }}>{new Date(inv.date).toLocaleDateString()}</td>
                  <td style={{ padding: '11px 10px' }}>{inv.customerName}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right' }}>NPR {Number(inv.subTotal).toFixed(2)}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'right', color: '#2f9e44' }}>
                    {inv.loyaltyApplied ? `${inv.discountPercent}%` : '—'}
                  </td>
                  <td style={{ padding: '11px 10px', textAlign: 'right', fontWeight: '600' }}>NPR {Number(inv.totalAmount).toFixed(2)}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'center' }}>{inv.paymentMethod}</td>
                  <td style={{ padding: '11px 10px', textAlign: 'center' }}>
                    <span style={{ background: inv.status === 'Paid' ? '#f0fff4' : '#fff9db', color: inv.status === 'Paid' ? '#276749' : '#7c5e00', padding: '3px 10px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '500' }}>
                      {inv.status}
                    </span>
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
