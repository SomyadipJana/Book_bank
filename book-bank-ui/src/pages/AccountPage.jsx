import React, { useState, useEffect, useMemo } from 'react'
import { Button } from '../components/Button'
import { SPINE } from '../data/books'
import { useAuth } from '../context/AuthContext'
import { useLibraryStore, formatDisplayDate, daysBetween } from '../data/libraryStore'

/* ── Small Book Cover Thumbnail ──────────────────────────── */
function BookThumb({ title, category, accession }) {
  const bg = SPINE[category] || '#1E3D32'
  return (
    <div className="account-thumb" style={{ backgroundColor: bg }} aria-hidden="true">
      <span className="account-thumb-text">{title}</span>
      <span className="account-thumb-tag">{accession}</span>
    </div>
  )
}

/* ── Navigation Header ───────────────────────────────────── */
function AccountNav({ activeTab = 'loans', userName = '', onLogout }) {
  const { user } = useAuth()
  const isLibrarian = user?.role === 'librarian'

  return (
    <nav className="nav" role="navigation" aria-label="Main navigation">
      <a
        href="#/"
        style={{ textDecoration: 'none' }}
        onClick={e => { e.preventDefault(); window.location.hash = '/' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            className="font-display"
            style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.02em' }}
          >
            Book Bank
          </span>
          <span className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>
            Management System
          </span>
        </div>
      </a>

      <ul className="nav__links" aria-label="Site sections">
        {[
          { label: 'Catalogue',    href: '#catalog',      active: false },
          { label: 'My Loans',     href: '#loans',        active: activeTab === 'loans' },
          { label: 'Reservations', href: '#reservations', active: activeTab === 'reservations' },
          { label: 'About',        href: '#',             active: false },
        ].map(l => (
          <li key={l.label}>
            <a
              href={l.href}
              className="nav__link"
              style={l.active ? {
                color: 'var(--color-ink)',
                fontWeight: 600,
                borderBottom: '2px solid var(--color-ochre)',
                paddingBottom: '2px',
              } : {}}
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="account-nav-user" title={userName}>
          <span className="account-nav-avatar">{userName ? userName[0].toUpperCase() : 'S'}</span>
          <span className="account-nav-name">{userName}</span>
        </span>
        <button
          type="button"
          className="account-nav-signout"
          onClick={onLogout}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}

/* ── Main Component ──────────────────────────────────────── */
export default function AccountPage({ initialTab = 'loans' }) {
  const { user, logout } = useAuth()
  const {
    today,
    members,
    fines: allFines,
    renewBook,
    cancelReservation,
    fineDailyRate,
    activityLog,
  } = useLibraryStore()

  // Guard: librarian is not a member and has no loans/fines
  useEffect(() => {
    if (user?.role === 'librarian') {
      window.location.hash = '#admin'
    }
  }, [user])

  if (user?.role === 'librarian') {
    return null
  }

  // Find this specific student member in the shared store
  const member = useMemo(() => {
    const userEmail = user?.email?.toLowerCase() || ''
    const found = members.find(m =>
      m.email.toLowerCase() === userEmail ||
      m.id === user?.memberId ||
      m.studentId === user?.studentId ||
      (userEmail === 'test@university.edu' && m.id === 'STU-001')
    )
    if (found) return found

    // Fallback if no matching member found: create a dynamic view
    return {
      id: user?.studentId || 'STU-NEW',
      name: user?.name || 'Student',
      email: user?.email || '',
      studentId: user?.studentId || 'STU-NEW',
      dept: user?.dept || 'Undergraduate',
      status: 'active',
      joined: 'JAN 2025',
      expires: 'JUN 2028',
      booksOut: 0,
      overdueCount: 0,
      totalFinesDue: 0,
      hasUnpaidFines: false,
      activeLoans: [],
      overdueLoans: [],
      historyLoans: [],
      reservations: [],
    }
  }, [members, user])

  const [activeTab, setActiveTab] = useState(initialTab)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    window.history.replaceState(null, '', `#${tab}`)
  }

  /* ── Renew action ── */
  const handleRenew = (loanId) => {
    try {
      const newDue = renewBook({ loanId, actor: member.name })
      showToast(`Loan renewed successfully! New due date: ${formatDisplayDate(newDue)}`, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  /* ── Cancel reservation action ── */
  const handleCancelHold = (resId) => {
    try {
      cancelReservation({ reservationId: resId, actor: member.name })
      showToast('Reservation cancelled.', 'info')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  /* ── Student Notifications (Step 7) ── */
  const notifications = useMemo(() => {
    const list = []

    // 1. Ready holds
    member.reservations.forEach(r => {
      if (r.status === 'ready') {
        list.push({
          id: `notif-ready-${r.id}`,
          type: 'ready',
          msg: `"${r.bookTitle}" is ready for pickup at ${r.pickupLocation || 'Circulation Desk'}! Hold expires ${formatDisplayDate(r.holdExpiresAt)}.`,
        })
      }
    })

    // 2. Overdue books
    member.activeLoans.forEach(l => {
      if (l.isOverdue) {
        list.push({
          id: `notif-overdue-${l.id}`,
          type: 'overdue',
          msg: `"${l.bookTitle}" is ${l.daysLate} day(s) overdue! Fine accrued: ₹${l.accruedFine}. Please return it immediately.`,
        })
      } else if (l.daysLeft <= 2) {
        list.push({
          id: `notif-due-${l.id}`,
          type: 'warning',
          msg: `"${l.bookTitle}" is due in ${l.daysLeft === 0 ? 'today' : `${l.daysLeft} day(s)`} (${formatDisplayDate(l.dueDate)}).`,
        })
      }
    })

    // 3. Unpaid fines
    if (member.hasUnpaidFines) {
      list.push({
        id: 'notif-fine',
        type: 'fine',
        msg: `You have total unpaid fines of ₹${member.totalFinesDue.toFixed(2)}. Borrowing and renewals are paused until cleared by the librarian.`,
      })
    }

    return list
  }, [member])

  // Member's fixed fines
  const memberFixedFines = useMemo(() => {
    return allFines.filter(f => f.memberId === member.id)
  }, [allFines, member.id])

  return (
    <div className="account-page">
      <AccountNav
        activeTab={activeTab}
        userName={member.name}
        onLogout={() => { logout(); window.location.hash = '#login' }}
      />

      {/* Toast Feedback */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 500,
          padding: '12px 20px',
          borderRadius: 4,
          backgroundColor: toast.type === 'error' ? 'var(--color-oxblood)' : toast.type === 'success' ? 'var(--color-ink)' : 'var(--color-charcoal)',
          color: 'var(--color-paper)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
          maxWidth: 420,
        }}>
          {toast.msg}
        </div>
      )}

      <main className="account-main">
        {/* ── Top Identity & Stat Chips Strip ── */}
        <header className="account-header">
          <div className="account-id-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 className="account-user-name" style={{ margin: 0 }}>{member.name}</h1>
              <span className={`admin-badge admin-badge--${member.status === 'active' ? 'avail' : 'overdue'}`}>
                {member.status.toUpperCase()}
              </span>
            </div>
            <div className="account-id-meta" style={{ marginTop: 6 }}>
              <span className="account-mono-pill">ID: {member.studentId || member.id}</span>
              <span className="account-meta-dot" aria-hidden="true">&middot;</span>
              <span className="account-role-text">{member.dept}</span>
              <span className="account-meta-dot" aria-hidden="true">&middot;</span>
              <span className="account-role-text">VALID THRU {member.expires || 'JUN 2028'}</span>
            </div>
          </div>

          <div className="account-stats-row">
            <div className="account-stat-chip">
              <span className="account-stat-chip__label">BOOKS OUT</span>
              <span className="account-stat-chip__value">{member.booksOut}</span>
            </div>
            <div className="account-stat-chip">
              <span className="account-stat-chip__label">RESERVED</span>
              <span className="account-stat-chip__value">{member.reservations.length}</span>
            </div>
            <div className={`account-stat-chip${member.totalFinesDue > 0 ? ' account-stat-chip--alert' : ''}`}>
              <span className="account-stat-chip__label">FINES DUE</span>
              <span className="account-stat-chip__value">
                ₹{member.totalFinesDue.toFixed(2)}
              </span>
            </div>
          </div>
        </header>

        {/* ── Student Notifications Strip (Step 7) ── */}
        {notifications.length > 0 && (
          <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: '10px 16px',
                  borderRadius: 4,
                  fontSize: '0.8125rem',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.02em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backgroundColor: n.type === 'overdue' || n.type === 'fine' ? 'rgba(122,46,39,0.1)' : n.type === 'ready' ? 'rgba(30,61,50,0.1)' : 'rgba(198,138,46,0.12)',
                  border: `1px solid ${n.type === 'overdue' || n.type === 'fine' ? 'var(--color-oxblood)' : n.type === 'ready' ? 'var(--color-ink)' : 'var(--color-ochre)'}`,
                  color: n.type === 'overdue' || n.type === 'fine' ? 'var(--color-oxblood)' : n.type === 'ready' ? 'var(--color-ink)' : '#8B5C00',
                }}
              >
                <span>{n.type === 'ready' ? '≡ƒöö' : n.type === 'overdue' ? 'ΓÜá∩╕Å' : 'Γä╣∩╕Å'}</span>
                <span>{n.msg}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Underline Tabs ── */}
        <div className="account-tabs-wrap">
          <div className="account-tabs" role="tablist" aria-label="Account sections">
            <button
              id="tab-loans"
              role="tab"
              aria-selected={activeTab === 'loans'}
              aria-controls="panel-loans"
              className={`account-tab${activeTab === 'loans' ? ' active' : ''}`}
              onClick={() => handleTabChange('loans')}
            >
              Current loans <span className="account-tab-count">{member.activeLoans.length}</span>
            </button>

            <button
              id="tab-reservations"
              role="tab"
              aria-selected={activeTab === 'reservations'}
              aria-controls="panel-reservations"
              className={`account-tab${activeTab === 'reservations' ? ' active' : ''}`}
              onClick={() => handleTabChange('reservations')}
            >
              Reservations <span className="account-tab-count">{member.reservations.length}</span>
            </button>

            <button
              id="tab-history"
              role="tab"
              aria-selected={activeTab === 'history'}
              aria-controls="panel-history"
              className={`account-tab${activeTab === 'history' ? ' active' : ''}`}
              onClick={() => handleTabChange('history')}
            >
              History <span className="account-tab-count">{member.historyLoans.length}</span>
            </button>

            <button
              id="tab-fines"
              role="tab"
              aria-selected={activeTab === 'fines'}
              aria-controls="panel-fines"
              className={`account-tab${activeTab === 'fines' ? ' active' : ''}`}
              onClick={() => handleTabChange('fines')}
            >
              Fines {member.totalFinesDue > 0 && <span className="account-tab-count account-tab-count--alert">₹{member.totalFinesDue.toFixed(0)}</span>}
            </button>
          </div>
        </div>

        {/* ── Tab Panels ── */}
        <section className="account-tab-content">

          {/* 1. CURRENT LOANS */}
          {activeTab === 'loans' && (
            <div id="panel-loans" role="tabpanel" aria-labelledby="tab-loans" className="account-panel">
              <div className="account-panel-header">
                <span className="account-section-eyebrow">ACTIVE BORROWED TITLES</span>
                <span className="account-loan-policy">14-day standard loan &middot; Max 2 renewals &middot; Borrow limit: 5 titles</span>
              </div>

              {member.activeLoans.length === 0 ? (
                <div className="account-empty-state">
                  <p className="account-empty-text">You have no active loans right now.</p>
                  <Button variant="ochre" onClick={() => window.location.hash = '#catalog'}>
                    Browse Catalogue
                  </Button>
                </div>
              ) : (
                <div className="account-loans-list">
                  {member.activeLoans.map(loan => {
                    const daysTotal = 14
                    const daysLeft = loan.daysLeft
                    const pct = loan.isOverdue
                      ? 100
                      : Math.min(100, Math.max(0, Math.round(((daysTotal - daysLeft) / daysTotal) * 100)))

                    const renewalsLeft = Math.max(0, 2 - (loan.renewCount || 0))
                    const canRenew = renewalsLeft > 0 && !loan.isOverdue && !member.hasUnpaidFines && member.status === 'active'

                    return (
                      <article
                        key={loan.id}
                        className={`account-loan-row${loan.isOverdue ? ' account-loan-row--overdue' : ''}`}
                        aria-label={`Loan for ${loan.bookTitle}`}
                      >
                        <BookThumb
                          title={loan.bookTitle}
                          category={loan.bookCategory}
                          accession={loan.accession}
                        />

                        <div className="account-loan-meta">
                          <div className="account-loan-title-row">
                            <a
                              href={`#book/${loan.accession}`}
                              onClick={e => { e.preventDefault(); window.location.hash = `#book/${loan.accession}` }}
                              className="account-loan-title"
                            >
                              {loan.bookTitle}
                            </a>
                            <span className="account-loan-author">by {loan.bookAuthor}</span>
                          </div>

                          <div className="account-loan-dates">
                            <span className="account-date-key">ISSUED</span>
                            <span className="account-date-val">{formatDisplayDate(loan.issuedDate)}</span>
                            <span className="account-date-sep" aria-hidden="true">&middot;</span>
                            <span className={`account-date-key${loan.isOverdue ? ' text-oxblood' : ''}`}>
                              DUE
                            </span>
                            <span className={`account-date-val${loan.isOverdue ? ' text-oxblood font-bold' : ''}`}>
                              {formatDisplayDate(loan.dueDate)}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="account-progress-wrap">
                            <div className="account-progress-meta">
                              <span className={`account-progress-status${loan.isOverdue ? ' text-oxblood' : ''}`}>
                                {loan.isOverdue
                                  ? `${loan.daysLate} days overdue (Fine: ₹${loan.accruedFine})`
                                  : daysLeft === 0
                                  ? 'Due today'
                                  : `${daysLeft} days remaining`}
                              </span>
                              <span className="account-progress-pct">{loan.isOverdue ? 'OVERDUE' : `${pct}% elapsed`}</span>
                            </div>

                            <div
                              className="account-progress-track"
                              role="progressbar"
                              aria-valuenow={pct}
                              aria-valuemin="0"
                              aria-valuemax="100"
                              aria-label={`Loan duration progress for ${loan.bookTitle}`}
                            >
                              <div
                                className={`account-progress-bar${loan.isOverdue ? ' account-progress-bar--oxblood' : ' account-progress-bar--ochre'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="account-loan-actions">
                          <Button
                            variant={canRenew ? 'ochre' : 'secondary'}
                            disabled={!canRenew}
                            onClick={() => handleRenew(loan.id)}
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                            title={
                              loan.isOverdue
                                ? 'Cannot renew overdue loan'
                                : member.hasUnpaidFines
                                ? 'Cannot renew while fines are unpaid'
                                : renewalsLeft === 0
                                ? 'Maximum 2 renewals reached'
                                : member.status === 'suspended'
                                ? 'Account is suspended'
                                : 'Extend loan by 14 days'
                            }
                          >
                            {renewalsLeft > 0 ? `Renew (${renewalsLeft} left)` : 'No renewals left'}
                          </Button>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. RESERVATIONS */}
          {activeTab === 'reservations' && (
            <div id="panel-reservations" role="tabpanel" aria-labelledby="tab-reservations" className="account-panel">
              <div className="account-panel-header">
                <span className="account-section-eyebrow">TITLE HOLDS &amp; QUEUE</span>
                <span className="account-loan-policy">Hold period: 5 business days upon notification</span>
              </div>

              {member.reservations.length === 0 ? (
                <div className="account-empty-state">
                  <p className="account-empty-text">No active reservations.</p>
                  <Button variant="ochre" onClick={() => window.location.hash = '#catalog'}>
                    Search Catalogue
                  </Button>
                </div>
              ) : (
                <div className="account-reservations-list">
                  {member.reservations.map(res => (
                    <article
                      key={res.id}
                      className={`account-res-card${res.isReady ? ' account-res-card--ready' : ''}`}
                      aria-label={`Reservation for ${res.bookTitle}`}
                    >
                      <BookThumb
                        title={res.bookTitle}
                        category={res.bookCategory}
                        accession={res.accession}
                      />

                      <div className="account-res-meta">
                        <div className="account-loan-title-row">
                          <a
                            href={`#book/${res.accession}`}
                            onClick={e => { e.preventDefault(); window.location.hash = `#book/${res.accession}` }}
                            className="account-loan-title"
                          >
                            {res.bookTitle}
                          </a>
                          <span className="account-loan-author">by {res.bookAuthor}</span>
                        </div>

                        <div className="account-res-status-row">
                          <span className={`account-status-badge${res.isReady ? ' account-status-badge--ready' : ' account-status-badge--queue'}`}>
                            {res.isReady ? 'READY FOR PICKUP' : `POSITION #${res.queuePosition || 1} IN QUEUE`}
                          </span>
                        </div>

                        <div className="account-res-details">
                          <div>
                            <span className="account-date-key">PICKUP LOCATION: </span>
                            <span className="account-date-val font-semibold">{res.pickupLocation || 'Circulation Desk'}</span>
                          </div>
                          <div>
                            <span className="account-date-key">{res.isReady ? 'HOLD EXPIRES: ' : 'REQUESTED: '}</span>
                            <span className="account-date-val font-semibold">
                              {res.isReady ? formatDisplayDate(res.holdExpiresAt) : formatDisplayDate(res.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="account-res-actions">
                        <Button
                          variant="secondary"
                          style={{ fontSize: '0.8125rem', width: '100%' }}
                          onClick={() => handleCancelHold(res.id)}
                        >
                          Cancel Hold
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. HISTORY */}
          {activeTab === 'history' && (
            <div id="panel-history" role="tabpanel" aria-labelledby="tab-history" className="account-panel">
              <div className="account-panel-header">
                <span className="account-section-eyebrow">CIRCULATION HISTORY</span>
                <span className="account-loan-policy">Past completed borrowings</span>
              </div>

              {member.historyLoans.length === 0 ? (
                <div className="account-empty-state">
                  <p className="account-empty-text">No borrowing history yet.</p>
                </div>
              ) : (
                <div className="account-table-wrapper">
                  <table className="account-table" aria-label="Circulation history table">
                    <thead>
                      <tr>
                        <th>ACCESSION</th>
                        <th>TITLE / AUTHOR</th>
                        <th>BORROWED</th>
                        <th>RETURNED</th>
                        <th>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {member.historyLoans.map(rec => {
                        const wasLate = rec.returnedDate && rec.dueDate && rec.returnedDate > rec.dueDate
                        const lateDays = wasLate ? daysBetween(rec.dueDate, rec.returnedDate) : 0

                        return (
                          <tr key={rec.id}>
                            <td className="account-mono-cell">{rec.accession}</td>
                            <td>
                              <a
                                href={`#book/${rec.accession}`}
                                onClick={e => { e.preventDefault(); window.location.hash = `#book/${rec.accession}` }}
                                className="account-table-title"
                              >
                                {rec.bookTitle}
                              </a>
                              <span className="account-table-author"> &middot; {rec.bookAuthor}</span>
                            </td>
                            <td>{formatDisplayDate(rec.issuedDate)}</td>
                            <td>{formatDisplayDate(rec.returnedDate)}</td>
                            <td>
                              <span className={`account-history-status${wasLate ? ' account-history-status--late' : ''}`}>
                                {wasLate ? `Returned (${lateDays}d late)` : 'Returned on time'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. FINES */}
          {activeTab === 'fines' && (
            <div id="panel-fines" role="tabpanel" aria-labelledby="tab-fines" className="account-panel">
              <div className="account-panel-header">
                <span className="account-section-eyebrow">ASSESSED FINES &amp; CHARGES</span>
                <span className="account-loan-policy">Daily late fee: ₹{fineDailyRate}/day on overdue items</span>
              </div>

              <div className="account-table-wrapper">
                <table className="account-table account-table--fines" aria-label="Fines and charges table">
                  <thead>
                    <tr>
                      <th>DATE / DUE</th>
                      <th>ACCESSION / ITEM</th>
                      <th>DESCRIPTION / REASON</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'right' }}>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Live accruing fines for current overdue loans */}
                    {member.overdueLoans.map(l => (
                      <tr key={`live-fine-${l.id}`} className="account-fine-unpaid">
                        <td className="account-mono-cell">{formatDisplayDate(l.dueDate)}</td>
                        <td>
                          <div className="account-table-book">
                            <span className="account-table-acc">{l.accession}</span>
                            <span className="account-table-title-plain">{l.bookTitle}</span>
                          </div>
                        </td>
                        <td className="account-fine-reason">
                          Active overdue loan ({l.daysLate} days late @ ₹{fineDailyRate}/day)
                        </td>
                        <td>
                          <span className="account-fine-badge account-fine-badge--unpaid">
                            ACCRUING
                          </span>
                        </td>
                        <td className="account-fine-amount" style={{ textAlign: 'right', color: 'var(--color-oxblood)' }}>
                          ₹{l.accruedFine.toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {/* Fixed recorded fines */}
                    {memberFixedFines.map(fine => (
                      <tr key={fine.id} className={fine.status === 'unpaid' ? 'account-fine-unpaid' : 'account-fine-settled'}>
                        <td className="account-mono-cell">{formatDisplayDate(fine.createdAt)}</td>
                        <td>
                          <div className="account-table-book">
                            <span className="account-table-acc">{fine.accession || 'FEE'}</span>
                            <span className="account-table-title-plain">{fine.accession ? `Book ${fine.accession}` : 'Library Service'}</span>
                          </div>
                        </td>
                        <td className="account-fine-reason">{fine.reason}</td>
                        <td>
                          <span className={`account-fine-badge${fine.status === 'unpaid' ? ' account-fine-badge--unpaid' : ' account-fine-badge--settled'}`}>
                            {fine.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="account-fine-amount" style={{ textAlign: 'right' }}>
                          ₹{Number(fine.amount).toFixed(2)}
                        </td>
                      </tr>
                    ))}

                    {member.overdueLoans.length === 0 && memberFixedFines.length === 0 && (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '32px 0', color: 'var(--color-charcoal-60)' }}>
                          No assessed fines or charges on your account. Good standing!
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="account-table-foot">
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600 }}>
                        TOTAL OUTSTANDING FINES:
                      </td>
                      <td className="account-fine-total" style={{ textAlign: 'right', color: member.totalFinesDue > 0 ? 'var(--color-oxblood)' : 'inherit' }}>
                        ₹{member.totalFinesDue.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  )
}
