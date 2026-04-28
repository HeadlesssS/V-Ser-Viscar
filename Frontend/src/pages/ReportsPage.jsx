import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { invoiceApi } from '../api/client'
import { Card, Spinner } from '../components/UI'

const fmt = (n) =>
  n == null
    ? '—'
    : 'Rs. ' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const MONTHS = [
  '', 'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export default function ReportsPage() {
  const [daily,    setDaily]    = useState(null)
  const [monthly,  setMonthly]  = useState(null)
  const [yearly,   setYearly]   = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true)
    try {
      const [d, m, y, inv] = await Promise.all([
        invoiceApi.daily(),
        invoiceApi.monthly(),
        invoiceApi.yearly(),
        invoiceApi.getAll(),
      ])
      // ASP.NET returns camelCase or PascalCase depending on settings
      setDaily({
        total: d.data.totalSales ?? d.data.TotalSales ?? 0,
        date:  d.data.date       ?? d.data.Date,
      })
      setMonthly({
        total: m.data.totalSales ?? m.data.TotalSales ?? 0,
        month: m.data.month      ?? m.data.Month,
        year:  m.data.year       ?? m.data.Year,
      })
      setYearly({
        total: y.data.totalSales ?? y.data.TotalSales ?? 0,
        year:  y.data.year       ?? y.data.Year,
      })
      // sort newest first
      setInvoices([...inv.data].sort((a, b) => new Date(b.date) - new Date(a.date)))
      if (isRefresh) toast.success('Reports refreshed')
    } catch (err) {
      toast.error('Failed to load reports: ' + err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  /* Monthly breakdown for mini chart */
  const monthlyBreakdown = (() => {
    const map = {}
    invoices.forEach((inv) => {
      const m = new Date(inv.date).getMonth() + 1
      map[m] = (map[m] || 0) + (inv.totalAmount || 0)
    })
    return Object.entries(map)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([month, total]) => ({ month: Number(month), total }))
  })()

  const maxVal = Math.max(...monthlyBreakdown.map((x) => x.total), 1)

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Financial Reports</h1>
            <p className="page-sub">Feature 1 — View purchase totals by day, month, and year</p>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => load(true)}
            disabled={refreshing || loading}
          >
            {refreshing ? <Spinner size={13} /> : '↺'} Refresh
          </button>
        </div>
      </div>

      {/* ── Report Cards ── */}
      <div className="report-grid">
        {/* Daily */}
        <div className="report-card report-day">
          <div className="report-glow" />
          <div className="report-period">Today</div>
          <div className="report-amount">
            {loading ? <Spinner size={24} color="var(--accent)" /> : fmt(daily?.total)}
          </div>
          <div className="report-meta">
            {loading ? '…' : fmtDate(daily?.date || new Date())}
          </div>
        </div>

        {/* Monthly */}
        <div className="report-card report-month">
          <div className="report-glow" />
          <div className="report-period">This Month</div>
          <div className="report-amount">
            {loading ? <Spinner size={24} color="var(--green)" /> : fmt(monthly?.total)}
          </div>
          <div className="report-meta">
            {loading ? '…' : `${MONTHS[monthly?.month] || ''} ${monthly?.year || ''}`}
          </div>
        </div>

        {/* Yearly */}
        <div className="report-card report-year">
          <div className="report-glow" />
          <div className="report-period">This Year</div>
          <div className="report-amount">
            {loading ? <Spinner size={24} color="var(--blue)" /> : fmt(yearly?.total)}
          </div>
          <div className="report-meta">
            {loading ? '…' : `Year ${yearly?.year || new Date().getFullYear()}`}
          </div>
        </div>
      </div>

      {/* ── Bar Chart: Monthly Breakdown ── */}
      {!loading && monthlyBreakdown.length > 0 && (
        <Card className="mb-24" style={{ marginBottom: 24 }}>
          <div className="section-head" style={{ marginBottom: 24 }}>
            <span className="section-title">Monthly Spend Breakdown</span>
            <span className="text-muted" style={{ fontSize: 12 }}>
              {yearly?.year || new Date().getFullYear()} — all purchase invoices
            </span>
          </div>

          {/* Bar chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 140, padding: '0 4px' }}>
            {monthlyBreakdown.map(({ month, total }) => {
              const pct = (total / maxVal) * 100
              return (
                <div
                  key={month}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
                  title={`${MONTHS[month]}: ${fmt(total)}`}
                >
                  <span style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {fmt(total).replace('Rs. ', '')}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      height: `${pct}%`,
                      minHeight: 4,
                      background: 'linear-gradient(to top, var(--accent), rgba(240,192,64,0.4))',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.4s ease',
                    }}
                  />
                  <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                    {MONTHS[month]?.slice(0, 3)}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* ── Invoice History Table ── */}
      <Card>
        <div className="section-head" style={{ marginBottom: 20 }}>
          <span className="section-title">Full Invoice History</span>
          <span className="text-muted" style={{ fontSize: 12 }}>
            {invoices.length} total records
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner size={28} />
          </div>
        ) : invoices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◈</div>
            <p className="empty-msg">No invoices recorded yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Amount</th>
                  <th>Period</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const d   = new Date(inv.date)
                  const mon = MONTHS[d.getMonth() + 1]
                  const yr  = d.getFullYear()
                  return (
                    <tr key={inv.id}>
                      <td className="td-id">INV-{String(inv.id).padStart(4, '0')}</td>
                      <td className="td-muted">{fmtDate(inv.date)}</td>
                      <td className="td-name">{inv.vendor?.name || `Vendor #${inv.vendorId}`}</td>
                      <td className="td-amount">{fmt(inv.totalAmount)}</td>
                      <td className="td-muted" style={{ fontSize: 12 }}>{mon} {yr}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
