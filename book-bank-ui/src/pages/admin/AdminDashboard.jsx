/**
 * AdminDashboard.jsx
 * - Dev Date Simulator (+1d, +7d, +14d, pick date, reset)
 * - Real-time stat tiles
 * - "Needs Attention" list (Overdue, holds expiring soon, unpaid fines, waitlist)
 * - "Recent Activity" timeline feed from audit log
 */
import React from 'react'
import { useLibraryStore } from '../../data/libraryStore'
import { Button } from '../../components'

export default function AdminDashboard() {
  const {
    today,
    books,
    members,
    loans,
    reservations,
    fines,
    activityLog,
    advanceDateDays,
    setSimulatedDate,
    resetDateToToday,
    resetEntireStore,
  } = useLibraryStore()

  const nonRetiredBooks = books.filter(b => !b.retired && b.bookStatus !== 'Retired')
  const totalBookCopies = nonRetiredBooks.reduce((s, b) => s + (Number(b.totalCopies) || 1), 0)
  const activeLoans = loans.filter(l => l.status === 'active')
  const overdueLoans = activeLoans.filter(l => l.isOverdue)
  const normalActiveLoans = activeLoans.filter(l => !l.isOverdue)
  const activeReservations = reservations.filter(r => r.status === 'ready' || r.status === 'waiting')
  const readyHolds = reservations.filter(r => r.status === 'ready')
  const waitingReservations = reservations.filter(r => r.status === 'waiting')
  const activeStudents = members.filter(m => m.status === 'active').length
  const totalFinesDue = members.reduce((s, m) => s + (Number(m.totalFinesDue) || 0), 0)
  const unpaidFixedFines = fines.filter(f => f.status === 'unpaid')

  const stats = [
    { label: 'Total Books',     value: totalBookCopies,               color: 'var(--color-ink)' },
    { label: 'On Loan',         value: normalActiveLoans.length,       color: 'var(--color-ochre)' },
    { label: 'Overdue',         value: overdueLoans.length,            color: 'var(--color-oxblood)' },
    { label: 'Reserved',        value: activeReservations.length,      color: '#6B4EAF' },
    { label: 'Active Students', value: activeStudents,                 color: 'var(--color-ink)' },
    { label: 'Fines Owed (₹)',  value: `₹${totalFinesDue.toFixed(2)}`, color: 'var(--color-oxblood)' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Dev-only Date Travel Simulator ── */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid rgba(198, 138, 46, 0.4)',
          borderRadius: 6,
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6875rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              backgroundColor: 'rgba(198, 138, 46, 0.15)',
              color: 'var(--color-ochre)',
              padding: '3px 8px',
              borderRadius: 3,
              fontWeight: 700,
            }}
          >
            DEV DATE SIMULATOR
          </span>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-charcoal)' }}>
            System Date: <strong style={{ color: 'var(--color-ink)', fontSize: '0.95rem' }}>{today}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="date"
            value={today}
            onChange={e => e.target.value && setSimulatedDate(e.target.value)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
              padding: '4px 8px',
              border: '1px solid rgba(30,61,50,0.2)',
              borderRadius: 4,
              backgroundColor: 'var(--color-paper)',
              color: 'var(--color-charcoal)',
            }}
            title="Set custom date"
          />
          <button
            className="admin-action-btn"
            onClick={() => advanceDateDays(1)}
            title="Fast forward 1 day to trigger due dates and fines"
          >
            +1 Day
          </button>
          <button
            className="admin-action-btn"
            onClick={() => advanceDateDays(7)}
            title="Fast forward 7 days (1 week)"
          >
            +7 Days
          </button>
          <button
            className="admin-action-btn"
            onClick={() => advanceDateDays(14)}
            title="Fast forward 14 days (full loan duration)"
          >
            +14 Days
          </button>
          <button
            className="admin-action-btn"
            onClick={resetDateToToday}
            style={{ color: 'var(--color-ochre)' }}
            title="Reset system date to initial demo date (2026-09-18)"
          >
            Reset Date
          </button>
          <button
            className="admin-action-btn admin-action-btn--danger"
            onClick={() => {
              if (window.confirm('Reset all library books, members, loans, and reservations back to default seed?')) {
                resetEntireStore()
              }
            }}
            title="Reset all store state in localStorage"
          >
            Reset All Data
          </button>
        </div>
      </div>

      {/* ── Stat chips ── */}
      <div className="admin-stats-row">
        {stats.map(s => (
          <div key={s.label} className="admin-stat-chip">
            <span className="admin-stat-chip__value" style={{ color: s.color }}>{s.value}</span>
            <span className="admin-stat-chip__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Needs Attention Section ── */}
      <section style={{ backgroundColor: '#ffffff', border: '1px solid rgba(30,61,50,0.12)', borderRadius: 6, padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
            <h2 className="admin-section-title" style={{ margin: 0 }}>Needs Attention</h2>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-charcoal-60)' }}>
            {overdueLoans.length + readyHolds.length + unpaidFixedFines.length + waitingReservations.length} pending items
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

          {/* 1. Overdue Items */}
          <div style={{ border: '1px solid rgba(122,46,39,0.18)', borderRadius: 4, padding: 14, backgroundColor: 'rgba(122,46,39,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-oxblood)', textTransform: 'uppercase' }}>
                Overdue Loans ({overdueLoans.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-oxblood)', fontWeight: 600 }}>₹5 / day</span>
            </div>
            {overdueLoans.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-60)', padding: '12px 0' }}>No overdue loans.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {overdueLoans.map(l => (
                  <li key={l.id} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 6, borderBottom: '1px dashed rgba(122,46,39,0.15)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{l.memberName}</div>
                      <div className="mono-label" style={{ fontSize: '0.68rem', color: 'var(--color-charcoal-60)' }}>
                        {l.accession} · {l.bookTitle?.slice(0, 20)}…
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--color-oxblood)', fontWeight: 700 }}>+{l.daysLate}d</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-oxblood)' }}>₹{l.accruedFine}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 2. Holds Expiring Soon */}
          <div style={{ border: '1px solid rgba(30,61,50,0.18)', borderRadius: 4, padding: 14, backgroundColor: 'rgba(30,61,50,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-ink)', textTransform: 'uppercase' }}>
                Pickup Holds Ready ({readyHolds.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-ink)' }}>5-Day Expiry</span>
            </div>
            {readyHolds.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-60)', padding: '12px 0' }}>No active pickup holds.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {readyHolds.map(r => (
                  <li key={r.id} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 6, borderBottom: '1px dashed rgba(30,61,50,0.15)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.memberName}</div>
                      <div className="mono-label" style={{ fontSize: '0.68rem', color: 'var(--color-charcoal-60)' }}>
                        {r.accession} · {r.bookTitle?.slice(0, 20)}…
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--color-ochre)', fontWeight: 600, fontSize: '0.75rem' }}>Expires</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-charcoal)' }}>{r.holdExpiresAt}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 3. Unpaid Fines */}
          <div style={{ border: '1px solid rgba(198,138,46,0.3)', borderRadius: 4, padding: 14, backgroundColor: 'rgba(198,138,46,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-ochre)', textTransform: 'uppercase' }}>
                Unpaid Fine Invoices ({unpaidFixedFines.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-ochre)', fontWeight: 600 }}>Action Needed</span>
            </div>
            {unpaidFixedFines.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-60)', padding: '12px 0' }}>No unsettled fine records.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {unpaidFixedFines.map(f => (
                  <li key={f.id} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 6, borderBottom: '1px dashed rgba(198,138,46,0.2)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{f.memberName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-charcoal-60)' }}>{f.reason}</div>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--color-oxblood)' }}>
                      ₹{Number(f.amount).toFixed(2)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 4. Active Waitlist */}
          <div style={{ border: '1px solid rgba(107,78,175,0.25)', borderRadius: 4, padding: 14, backgroundColor: 'rgba(107,78,175,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700, color: '#6B4EAF', textTransform: 'uppercase' }}>
                Waitlist Queues ({waitingReservations.length})
              </span>
              <span style={{ fontSize: '0.75rem', color: '#6B4EAF' }}>Awaiting Returns</span>
            </div>
            {waitingReservations.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-60)', padding: '12px 0' }}>No active waitlists.</div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {waitingReservations.map(r => (
                  <li key={r.id} style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 6, borderBottom: '1px dashed rgba(107,78,175,0.18)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{r.memberName}</div>
                      <div className="mono-label" style={{ fontSize: '0.68rem', color: 'var(--color-charcoal-60)' }}>
                        {r.accession} · {r.bookTitle?.slice(0, 18)}…
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: '#6B4EAF', fontWeight: 700, fontSize: '0.75rem' }}>Queue #{r.queuePosition}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </section>

      {/* ── Recent Activity Log ── */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 className="admin-section-title" style={{ margin: 0 }}>Recent Activity (Audit Log)</h2>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-charcoal-60)' }}>
            Real-time audit events across students & librarians
          </span>
        </div>

        <div style={{ backgroundColor: '#ffffff', border: '1px solid rgba(30,61,50,0.12)', borderRadius: 6, overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Time</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Member</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {activityLog.slice(0, 10).map(act => (
                <tr key={act.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-charcoal-60)', whiteSpace: 'nowrap' }}>
                    {act.timestamp?.includes('T') ? act.timestamp.replace('T', ' ').slice(0, 16) : act.timestamp}
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.6875rem',
                        letterSpacing: '0.04em',
                        padding: '2px 6px',
                        borderRadius: 3,
                        backgroundColor: 'rgba(30,61,50,0.08)',
                        color: 'var(--color-ink)',
                        fontWeight: 600,
                      }}
                    >
                      {act.action?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{act.actor}</td>
                  <td style={{ fontSize: '0.8125rem' }}>
                    {act.memberName ? (
                      <span>{act.memberName} <span className="mono-label" style={{ color: 'var(--color-charcoal-60)', fontSize: '0.7rem' }}>({act.memberId})</span></span>
                    ) : '—'}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--color-charcoal)' }}>
                    {act.description}
                  </td>
                </tr>
              ))}
              {activityLog.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color-charcoal-60)', padding: '24px 0' }}>
                    No recent activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}
