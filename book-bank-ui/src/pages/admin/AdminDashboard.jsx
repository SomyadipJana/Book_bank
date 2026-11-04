/**
 * AdminDashboard.jsx
 * Stat chips + quick-summary recent activity tables.
 * Connected to shared AdminStore.
 */
import React from 'react'
import { useAdminStore } from '../../data/adminStore'
import { MOCK_ORDERS } from '../../data/mockAdminData'

export default function AdminDashboard() {
  const { books, members, loans } = useAdminStore()

  const nonRetiredBooks = books.filter(b => !b.retired)
  const totalBooks = nonRetiredBooks.reduce((s, b) => s + (Number(b.totalCopies) || 1), 0)
  const booksOnLoan = loans.filter(l => l.status === 'active' || l.status === 'overdue').length
  const overdueLoans = loans.filter(l => l.status === 'overdue')
  const reservedLoans = loans.filter(l => l.status === 'reserved')
  const activeStudents = members.filter(m => m.status === 'active').length
  const pendingOrders = MOCK_ORDERS.filter(o => o.status === 'pending').length
  const totalFines = members.reduce((s, m) => s + (Number(m.fines) || 0), 0)

  const stats = [
    { label: 'Total Books',     value: totalBooks,            color: 'var(--color-ink)' },
    { label: 'On Loan',         value: booksOnLoan,           color: 'var(--color-ochre)' },
    { label: 'Overdue',         value: overdueLoans.length,   color: 'var(--color-oxblood)' },
    { label: 'Reserved',        value: reservedLoans.length,  color: '#6B4EAF' },
    { label: 'Active Students', value: activeStudents,        color: 'var(--color-ink)' },
    { label: 'Pending Orders',  value: pendingOrders,         color: 'var(--color-ochre)' },
    { label: 'Fines Owed (₹)',  value: `₹${totalFines.toFixed(2)}`, color: 'var(--color-oxblood)' },
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
                const book = books.find(b => b.accession === l.accession)
                return (
                  <tr key={l.id}>
                    <td>{l.memberName}</td>
                    <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>
                      {l.accession} {book ? `· ${book.title.slice(0, 18)}…` : ''}
                    </td>
                    <td style={{ color: 'var(--color-oxblood)', fontWeight: 600 }}>{l.dueDate}</td>
                  </tr>
                )
              })}
              {overdueLoans.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-charcoal-60)', padding: '20px 0' }}>
                    No overdue loans.
                  </td>
                </tr>
              )}
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
