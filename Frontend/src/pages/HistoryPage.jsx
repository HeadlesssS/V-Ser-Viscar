import { useState, useEffect } from 'react';
import { salesInvoicesApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function HistoryPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (user?.customerId) {
      salesInvoicesApi.getByCustomer(user.customerId)
        .then(res => setInvoices(res.data))
        .catch(() => setInvoices([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  const totalSpent = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);

  return (
    <>
      <Navbar />
      <div className="container section">
        <h2 style={{ marginBottom: '6px' }}>📋 My Purchase History</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>Welcome back, {user?.name}! Here are all your past purchases.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="card" style={{ textAlign: 'center', background: '#e7f5ff', border: 'none' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--primary)' }}>{invoices.length}</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Total Purchases</div>
          </div>
          <div className="card" style={{ textAlign: 'center', background: '#f3f0ff', border: 'none' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#7950f2' }}>NPR {totalSpent.toFixed(0)}</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Total Spent</div>
          </div>
          <div className="card" style={{ textAlign: 'center', background: '#f0fff4', border: 'none' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '700', color: '#2f9e44' }}>{invoices.filter(i => i.loyaltyApplied).length}</div>
            <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Loyalty Discounts</div>
          </div>
        </div>

        {loading && <p style={{ textAlign: 'center', color: 'var(--text-light)' }}>Loading...</p>}

        {!loading && !user?.customerId && (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
            <p>No customer profile linked to your account.</p>
          </div>
        )}

        {!loading && invoices.length === 0 && user?.customerId && (
          <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
            <p>No purchase history yet. Visit us to make your first purchase!</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {invoices.map(inv => (
            <div key={inv.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <div
                style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', background: expanded === inv.id ? '#f0f4ff' : 'white' }}
                onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}
              >
                <div>
                  <span style={{ fontWeight: '600', marginRight: '12px' }}>SI-{String(inv.id).padStart(4, '0')}</span>
                  <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>{new Date(inv.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {inv.loyaltyApplied && <span style={{ marginLeft: '10px', background: '#d3f9d8', color: '#2b8a3e', padding: '2px 8px', borderRadius: '20px', fontSize: '0.78rem' }}>🎉 Loyalty Discount</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>NPR {Number(inv.totalAmount).toFixed(2)}</span>
                  <span style={{ background: inv.status === 'Paid' ? '#f0fff4' : '#fff9db', color: inv.status === 'Paid' ? '#276749' : '#7c5e00', padding: '3px 10px', borderRadius: '20px', fontSize: '0.82rem' }}>{inv.status}</span>
                  <span style={{ color: 'var(--text-light)' }}>{expanded === inv.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === inv.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: '#fafafa' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-light)', fontWeight: '500' }}>Part</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-light)', fontWeight: '500' }}>Qty</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-light)', fontWeight: '500' }}>Unit Price</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', color: 'var(--text-light)', fontWeight: '500' }}>Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items.map((item, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 10px' }}>{item.partName}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>{item.quantity}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>NPR {Number(item.unitPrice).toFixed(2)}</td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '500' }}>NPR {Number(item.lineTotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '20px', fontSize: '0.9rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>Subtotal: NPR {Number(inv.subTotal).toFixed(2)}</span>
                    {inv.loyaltyApplied && <span style={{ color: '#2f9e44' }}>Discount: -{inv.discountPercent}%</span>}
                    <strong>Total: NPR {Number(inv.totalAmount).toFixed(2)}</strong>
                    <span style={{ color: 'var(--text-light)' }}>Via {inv.paymentMethod}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
