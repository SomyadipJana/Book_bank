/**
 * AdminLoans.jsx
 * Loans & Renewals management.
 * Table of all active and overdue loans with real-time renewal logic and restriction checks.
 */
import React, { useState, useMemo } from 'react'
import { useAdminStore } from '../../data/adminStore.jsx'

export default function AdminLoans() {
  const { books, loans, renewLoan } = useAdminStore()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'active' | 'overdue'
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Active or overdue loans
  const activeLoans = useMemo(() => {
    return loans.filter(l => l.status === 'active' || l.status === 'overdue')
  }, [loans])

  // Map accession to book object for fast lookup
  const bookMap = useMemo(() => {
    const map = new Map()
    books.forEach(b => map.set(b.accession, b))
    return map
  }, [books])

  // Helper to check if title or accession is reserved by someone else
  const isTitleReserved = (loan) => {
    const currentBook = bookMap.get(loan.accession)
    const currentTitle = currentBook?.title?.trim().toLowerCase()

    return loans.some(other => {
      if (other.id === loan.id) return false
      if (other.status !== 'reserved') return false
      if (other.accession === loan.accession) return true
      if (currentTitle) {
        const otherBook = bookMap.get(other.accession)
        if (otherBook?.title?.trim().toLowerCase() === currentTitle) return true
      }
      return false
    })
  }

  // Filtered loans list
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return activeLoans
      .filter(l => {
        if (filterStatus === 'active') return l.status === 'active'
        if (filterStatus === 'overdue') return l.status === 'overdue'
        return true
      })
      .filter(l => {
        const book = bookMap.get(l.accession)
        return (
          l.memberName?.toLowerCase().includes(q) ||
          l.memberId?.toLowerCase().includes(q) ||
          l.accession?.toLowerCase().includes(q) ||
          book?.title?.toLowerCase().includes(q)
        )
      })
  }, [activeLoans, search, filterStatus, bookMap])

  const handleRenew = (loan, disabledReason) => {
    if (disabledReason) return
    renewLoan(loan.id)
    const book = bookMap.get(loan.accession)
    showToast(`Renewed "${book?.title || loan.accession}" for ${loan.memberName} (+14 days).`)
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
            backgroundColor: 'var(--color-ink)',
            color: 'var(--color-paper)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {toast}
        </div>
      )}

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="admin-search"
          type="search"
          placeholder="Search book title, member name, ID, accession…"
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
          <option value="active">Active On-Time ({activeLoans.filter(l => l.status === 'active').length})</option>
          <option value="overdue">Overdue ({activeLoans.filter(l => l.status === 'overdue').length})</option>
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
              <th>Days Left</th>
              <th style={{ textAlign: 'center' }}>Renewals</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(loan => {
              const book = bookMap.get(loan.accession)
              const daysLeft = Math.floor((new Date(loan.dueDate) - new Date()) / 86400000)
              const isOverdue = loan.status === 'overdue' || daysLeft < 0
              const renewCount = loan.renewCount || 0

              // Determine renewal eligibility & tooltip
              let disabledReason = null
              if (renewCount >= 2) {
                disabledReason = 'Maximum renewals reached (2/2)'
              } else if (loan.status === 'overdue' || daysLeft < 0) {
                disabledReason = 'Cannot renew overdue loan — please return first'
              } else if (isTitleReserved(loan)) {
                disabledReason = 'Another student has reserved this title'
              }

              return (
                <tr key={loan.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--color-charcoal)', lineHeight: 1.3 }}>
                      {book?.title || loan.accession}
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
                      color: isOverdue ? 'var(--color-oxblood)' : 'inherit',
                      fontWeight: isOverdue ? 600 : 400,
                    }}
                  >
                    {loan.dueDate}
                  </td>
                  <td>
                    {isOverdue ? (
                      <span style={{ color: 'var(--color-oxblood)', fontWeight: 600, fontSize: '0.8rem' }}>
                        {Math.abs(daysLeft)}d overdue
                      </span>
                    ) : (
                      <span style={{ color: 'var(--color-ink)', fontSize: '0.8rem' }}>
                        {daysLeft}d left
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
                      onClick={() => handleRenew(loan, disabledReason)}
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
