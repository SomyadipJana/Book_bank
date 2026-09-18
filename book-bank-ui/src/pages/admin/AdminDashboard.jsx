/**
 * AdminDashboard.jsx
 * Stat chips + quick-summary recent activity tables.
 */
import React from 'react'
import { ALL_BOOKS } from '../../data/books'
import { MOCK_MEMBERS, MOCK_ORDERS, getOverdueLoans, getActiveLoans } from '../../data/mockAdminData'

export default function AdminDashboard() {
  const totalBooks  = ALL_BOOKS.reduce((s, b) => s + (b.totalCopies || 1), 0)
  const booksOnLoan = ALL_BOOKS.reduce((s, b) => s + ((b.totalCopies || 1) - (b.availableCopies ?? (b.available ? 1 : 0))), 0)
  const overdueLoans = getOverdueLoans()
  const activeLoans  = getActiveLoans()
  const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'pending').length
  const totalFines = MOCK_MEMBERS.reduce((s, m) => s + m.fines, 0)

  const stats = [
    { label: 'Total Books',     value: totalBooks,          color: 'var(--color-ink)' },
    { label: 'On Loan',         value: booksOnLoan,         color: 'var(--color-ochre)' },
    { label: 'Overdue',         value: overdueLoans.length, color: 'var(--color-oxblood)' },
    { label: 'Active Members',  value: MOCK_MEMBERS.filter(m => m.status === 'active').length, color: 'var(--color-ink)' },
    { label: 'Pending Orders',  value: pendingOrders,       color: 'var(--color-ochre)' },
    { label: 'Fines Owed (₹)', value: `₹${totalFines.toFixed(2)}`, color: 'var(--color-oxblood)' },
  ]

  return (
    <div>
      {/* ── Stat chips ── */}
      <div className="admin-stats-row" style={{ marginBottom: 36 }}>
        {stats.map(s => (
          <div key={s.label} className="admin-stat-chip">
            <span className="admin-stat-chip__value" style={{ color: s.color }}>{s.value}</span>
            <span className="admin-stat-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Quick tables ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>

        {/* Recent overdue */}
        <section>
          <h2 className="admin-section-title">Overdue Loans</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Member</th><th>Accession</th><th>Due Date</th></tr>
            </thead>
            <tbody>
              {overdueLoans.slice(0, 6).map(l => {
                const book = ALL_BOOKS.find(b => b.accession === l.accession)
                return (
                  <tr key={l.id}>
                    <td>{l.memberName}</td>
                    <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.accession}</td>
                    <td style={{ color: 'var(--color-oxblood)' }}>{l.dueDate}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>

        {/* Pending orders */}
        <section>
          <h2 className="admin-section-title">Pending Orders</h2>
          <table className="admin-table">
            <thead>
              <tr><th>Title</th><th>Vendor</th><th>Qty</th></tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.filter(o => o.status !== 'received').map(o => (
                <tr key={o.id}>
                  <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</td>
                  <td style={{ color: 'var(--color-charcoal-60)' }}>{o.vendorId}</td>
                  <td>{o.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

      </div>
    </div>
  )
}
