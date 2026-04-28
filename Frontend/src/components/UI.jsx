

/* Spinner */
export function Spinner({ size = 18, color = 'var(--accent)' }) {
  return (
    <span
      className="spinner"
      style={{ width: size, height: size, borderTopColor: color }}
    />
  )
}

/* Button */
export function Btn({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}) {
  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size={14} color={variant === 'primary' ? '#000' : 'var(--accent)'} /> : children}
    </button>
  )
}

/* Card */
export function Card({ children, className = '', style }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  )
}

/* Stat Card */
export function StatCard({ label, value, sub, accent = 'yellow', loading }) {
  return (
    <div className={`stat-card stat-${accent}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {loading ? <Spinner size={20} /> : (value ?? '—')}
      </div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  )
}

/* Badge */
export function Badge({ children, color = 'green' }) {
  return <span className={`badge badge-${color}`}>{children}</span>
}

/* Field */
export function Field({ label, error, children }) {
  return (
    <div className="field">
      {label && <label className="field-label">{label}</label>}
      {children}
      {error && <span className="field-error">{error}</span>}
    </div>
  )
}

/* Modal */
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null
  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: width }}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

/* Confirm Delete Modal */
export function ConfirmModal({ open, onClose, onConfirm, itemName, loading }) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Delete" width={380}>
      <p className="text-muted" style={{ marginBottom: 24 }}>
        Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{itemName}</strong>?
        This action cannot be undone.
      </p>
      <div className="modal-footer">
        <Btn variant="ghost" onClick={onClose} disabled={loading}>Cancel</Btn>
        <Btn variant="danger" onClick={onConfirm} loading={loading}>Delete</Btn>
      </div>
    </Modal>
  )
}

/* Empty State */
export function Empty({ message = 'No data found.' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">◈</div>
      <p className="empty-msg">{message}</p>
    </div>
  )
}

/* Table */
export function Table({ columns, data, renderRow, loading, emptyMessage = 'No records found.' }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 52 }}>
        <Spinner size={28} />
      </div>
    )
  }
  if (!data || data.length === 0) return <Empty message={emptyMessage} />
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>{data.map(renderRow)}</tbody>
      </table>
    </div>
  )
}
