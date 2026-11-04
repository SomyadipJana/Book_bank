/**
 * AdminLoans.jsx
 * Loans & Renewals management.
 * Table of all active and overdue loans with real-time renewal logic and restriction checks.
 * Connected to unified LibraryStore.
 */
import React, { useState, useMemo } from 'react'
import { useLibraryStore } from '../../data/libraryStore'

export default function AdminLoans() {
  const { loans, members, reservations, renewBook } = useLibraryStore()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'active' | 'overdue'
  const [toast, setToast] = useState(null)

  const showToast = (msg, isErr = false) => {
    setToast({ msg, isErr })
    setTimeout(() => setToast(null), 3500)
  }

  // Active loans (both on-time and overdue)
  const activeLoans = useMemo(() => {
    return loans.filter(l => l.status === 'active')
  }, [loans])

  // Filtered loans list
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return activeLoans
      .filter(l => {
        if (filterStatus === 'active') return !l.isOverdue
        if (filterStatus === 'overdue') return l.isOverdue
        return true
      })
      .filter(l => {
        return (
          l.memberName?.toLowerCase().includes(q) ||
          l.memberId?.toLowerCase().includes(q) ||
          l.accession?.toLowerCase().includes(q) ||
          l.bookTitle?.toLowerCase().includes(q)
        )
      })
  }, [activeLoans, search, filterStatus])

  const handleRenew = (loan) => {
    try {
      renewBook({ loanId: loan.id, actor: 'Librarian' })
      showToast(`Renewed "${loan.bookTitle}" for ${loan.memberName} (+14 days).`)
    } catch (err) {
      showToast(err.message, true)
    }
  }

  return (
    <div>
      {/* Toast notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 300,
            padding: '12px 20px',
            borderRadius: 4,
            backgroundColor: toast.isErr ? 'var(--color-oxblood)' : 'var(--color-ink)',
            color: 'var(--color-paper)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="admin-search"
          type="search"
          placeholder="Search book title, student name, ID, accession…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: 200 }}
        />

        <select
          className="admin-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="all">All Active Loans ({activeLoans.length})</option>
          <option value="active">Active On-Time ({activeLoans.filter(l => !l.isOverdue).length})</option>
          <option value="overdue">Overdue ({activeLoans.filter(l => l.isOverdue).length})</option>
        </select>

        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-charcoal-60)' }}>
          {filtered.length} active loans
        </span>
      </div>

      {/* Loans Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Book / Accession</th>
              <th>Student</th>
              <th>Issued</th>
              <th>Due Date</th>
              <th>Days Left / Late</th>
              <th style={{ textAlign: 'center' }}>Renewals</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(loan => {
              const member = members.find(m => m.id === loan.memberId)
              const renewCount = loan.renewCount || 0

              // Determine renewal eligibility & tooltip
              const hasUnpaidFines = member && member.totalFinesDue > 0
              const hasActiveWaiting = reservations.some(
                r => r.accession === loan.accession && r.status === 'waiting' && r.memberId !== loan.memberId
              )

              let disabledReason = null
              if (renewCount >= 2) {
                disabledReason = 'Maximum renewals reached (2/2)'
              } else if (loan.isOverdue) {
                disabledReason = 'Cannot renew overdue loan — return first'
              } else if (hasActiveWaiting) {
                disabledReason = 'Another student has reserved this title'
              } else if (hasUnpaidFines) {
                disabledReason = 'Student has unpaid fines'
              }

              return (
                <tr key={loan.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--color-charcoal)', lineHeight: 1.3 }}>
                      {loan.bookTitle}
                    </div>
                    <div className="mono-label" style={{ color: 'var(--color-charcoal-60)', marginTop: 2 }}>
                      {loan.accession}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{loan.memberName}</div>
                    <div className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>
                      {loan.memberId}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {loan.issuedDate}
                  </td>
                  <td
                    style={{
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap',
                      color: loan.isOverdue ? 'var(--color-oxblood)' : 'inherit',
                      fontWeight: loan.isOverdue ? 600 : 400,
                    }}
                  >
                    {loan.dueDate}
                  </td>
                  <td>
                    {loan.isOverdue ? (
                      <div>
                        <span style={{ color: 'var(--color-oxblood)', fontWeight: 600, fontSize: '0.8rem' }}>
                          +{loan.daysLate}d overdue
                        </span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-oxblood)' }}>
                          ₹{loan.accruedFine} fine
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--color-ink)', fontSize: '0.8rem' }}>
                        {loan.daysLeft}d left
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {renewCount}/2
                  </td>
                  <td>
                    <button
                      className="admin-action-btn admin-action-btn--renew"
                      disabled={!!disabledReason}
                      title={disabledReason || 'Extend due date by 14 days'}
                      onClick={() => handleRenew(loan)}
                    >
                      Renew
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              color: 'var(--color-charcoal-60)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
            }}
          >
            No active loans found.
          </div>
        )}
      </div>
    </div>
  )
}
