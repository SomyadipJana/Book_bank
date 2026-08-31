import React, { useState } from 'react'
import { Button } from '../components/Button'
import { SPINE } from '../data/books'

/* ── Mock Account Data ───────────────────────────────────── */

const USER_PROFILE = {
  name: 'Eleanor Vance',
  enrollmentNo: 'LIB-2024-8841',
  role: 'Undergraduate — Literature & Computing',
  joined: 'OCT 2023',
  expires: 'JUN 2027',
}

function getStoredUser() {
  try {
    const raw = localStorage.getItem('bb_user')
    if (raw) {
      const u = JSON.parse(raw)
      return {
        name: u.full_name || USER_PROFILE.name,
        enrollmentNo: u.email || USER_PROFILE.enrollmentNo,
        role: u.role ? u.role.toUpperCase() : USER_PROFILE.role,
        joined: 'ACTIVE',
        expires: '2027',
      }
    }
  } catch (e) {}
  return USER_PROFILE
}

const INITIAL_LOANS = [
  {
    id: 'loan-1',
    accession: 'BB-0006',
    title: 'The Pragmatic Programmer',
    author: 'Hunt and Thomas',
    category: 'Engineering',
    format: 'Book',
    borrowedDate: '2026-08-16',
    dueDate: '2026-08-30', // 1 day remaining (on time)
    totalDays: 14,
    daysElapsed: 13,
    isOverdue: false,
    renewalsLeft: 2,
  },
  {
    id: 'loan-2',
    accession: 'BB-0001',
    title: 'One Hundred Years of Solitude',
    author: 'Gabriel García Márquez',
    category: 'Fiction',
    format: 'Book',
    borrowedDate: '2026-08-20',
    dueDate: '2026-09-03', // 5 days remaining (on time)
    totalDays: 14,
    daysElapsed: 9,
    isOverdue: false,
    renewalsLeft: 1,
  },
  {
    id: 'loan-3',
    accession: 'BB-0018',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    category: 'Design',
    format: 'Book',
    borrowedDate: '2026-08-10',
    dueDate: '2026-08-24', // 5 days overdue!
    totalDays: 14,
    daysElapsed: 19,
    isOverdue: true,
    renewalsLeft: 0,
  },
]

const INITIAL_RESERVATIONS = [
  {
    id: 'res-1',
    accession: 'BB-0007',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    category: 'Engineering',
    reservedDate: '2026-08-27',
    status: 'Ready for pickup',
    pickupLocation: 'Desk Bay 2 — Shelf R-04',
    pickupDeadline: '2026-09-02',
    isReady: true,
  },
  {
    id: 'res-2',
    accession: 'BB-0015',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    category: 'History',
    reservedDate: '2026-08-28',
    status: 'Position #1 in queue',
    pickupLocation: 'In active circulation',
    pickupDeadline: 'Est. 05 Sept 2026',
    isReady: false,
  },
]

const HISTORY_RECORDS = [
  {
    id: 'hist-1',
    accession: 'BB-0011',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    category: 'Science',
    borrowed: '12 Jul 2026',
    returned: '25 Jul 2026',
    status: 'Returned on time',
  },
  {
    id: 'hist-2',
    accession: 'BB-0020',
    title: 'The Elements of Typographic Style',
    author: 'Robert Bringhurst',
    category: 'Design',
    borrowed: '01 Jun 2026',
    returned: '17 Jun 2026',
    status: 'Returned (2d late)',
  },
  {
    id: 'hist-3',
    accession: 'BB-0021',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    category: 'Psychology',
    borrowed: '10 May 2026',
    returned: '24 May 2026',
    status: 'Returned on time',
  },
  {
    id: 'hist-4',
    accession: 'BB-0027',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    category: 'Philosophy',
    borrowed: '15 Apr 2026',
    returned: '28 Apr 2026',
    status: 'Returned on time',
  },
  {
    id: 'hist-5',
    accession: 'BB-0030',
    title: 'IEEE Spectrum — Spring 2025',
    author: 'IEEE Publications',
    category: 'Engineering',
    borrowed: '02 Mar 2026',
    returned: '09 Mar 2026',
    status: 'Returned on time',
  },
]

const INITIAL_FINES = [
  {
    id: 'fine-1',
    date: '2026-08-25',
    accession: 'BB-0018',
    item: 'The Design of Everyday Things',
    reason: 'Overdue loan (5 days @ $0.50/day)',
    amount: 2.50,
    status: 'Unpaid',
  },
  {
    id: 'fine-2',
    date: '2026-06-18',
    accession: 'BB-0020',
    item: 'The Elements of Typographic Style',
    reason: 'Overdue loan (2 days @ $1.00/day)',
    amount: 2.00,
    status: 'Unpaid',
  },
  {
    id: 'fine-3',
    date: '2026-02-14',
    accession: 'BB-0003',
    item: 'The Brothers Karamazov',
    reason: 'Replacement barcode label fee',
    amount: 1.50,
    status: 'Settled',
  },
]

/* ── Navigation Header ───────────────────────────────────── */

function AccountNav() {
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
          { label: 'Catalogue',    href: '#catalog',  active: false },
          { label: 'My Loans',     href: '#account',  active: true  },
          { label: 'Reservations', href: '#account',  active: false },
          { label: 'About',        href: '#',         active: false },
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
        <span className="account-nav-user" title={USER_PROFILE.name}>
          <span className="account-nav-avatar">{USER_PROFILE.name[0]}</span>
          <span className="account-nav-name">{USER_PROFILE.name}</span>
        </span>
        <button
          type="button"
          className="account-nav-signout"
          onClick={() => { window.location.hash = '#login' }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}

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

/* ── Main Component ──────────────────────────────────────── */

export default function AccountPage({ initialTab = 'loans' }) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [loans, setLoans] = useState(INITIAL_LOANS)
  const [reservations, setReservations] = useState(INITIAL_RESERVATIONS)
  const [fines, setFines] = useState(INITIAL_FINES)
  const [renewedIds, setRenewedIds] = useState({})

  const totalUnpaidFines = fines
    .filter(f => f.status === 'Unpaid')
    .reduce((sum, f) => sum + f.amount, 0)

  const handleRenew = (loanId) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId && l.renewalsLeft > 0) {
        return {
          ...l,
          dueDate: '2026-09-14',
          daysElapsed: 1,
          totalDays: 14,
          isOverdue: false,
          renewalsLeft: l.renewalsLeft - 1,
        }
      }
      return l
    }))
    setRenewedIds(prev => ({ ...prev, [loanId]: true }))
  }

  const handleCancelHold = (resId) => {
    setReservations(prev => prev.filter(r => r.id !== resId))
  }

  const handlePayFine = (fineId) => {
    setFines(prev => prev.map(f => f.id === fineId ? { ...f, status: 'Settled' } : f))
  }

  return (
    <div className="account-page">
      <AccountNav />

      <main className="account-main">
        {/* ── Top Identity & Stat Chips Strip ── */}
        <header className="account-header">
          {(() => {
            const user = getStoredUser()
            return (
              <div className="account-id-block">
                <h1 className="account-user-name">{user.name}</h1>
                <div className="account-id-meta">
                  <span className="account-mono-pill">ID: {user.enrollmentNo}</span>
                  <span className="account-meta-dot" aria-hidden="true">&middot;</span>
                  <span className="account-role-text">{user.role}</span>
                  <span className="account-meta-dot" aria-hidden="true">&middot;</span>
                  <span className="account-role-text">VALID THRU {user.expires}</span>
                </div>
              </div>
            )
          })()}

          {/* 3 Plex Mono Stat Chips */}
          <div className="account-stat-strip" aria-label="Account summary statistics">
            <div className="account-stat-chip">
              <span className="account-stat-chip__label">BOOKS OUT</span>
              <span className="account-stat-chip__value">{loans.length}</span>
            </div>
            <div className="account-stat-chip">
              <span className="account-stat-chip__label">RESERVED</span>
              <span className="account-stat-chip__value">{reservations.length}</span>
            </div>
            <div className={`account-stat-chip${totalUnpaidFines > 0 ? ' account-stat-chip--alert' : ''}`}>
              <span className="account-stat-chip__label">FINES DUE</span>
              <span className="account-stat-chip__value">
                ${totalUnpaidFines.toFixed(2)}
              </span>
            </div>
          </div>
        </header>

        {/* ── Underline Tabs ── */}
        <div className="account-tabs-wrap">
          <div className="account-tabs" role="tablist" aria-label="Account sections">
            <button
              id="tab-loans"
              role="tab"
              aria-selected={activeTab === 'loans'}
              aria-controls="panel-loans"
              className={`account-tab${activeTab === 'loans' ? ' active' : ''}`}
              onClick={() => setActiveTab('loans')}
            >
              Current loans <span className="account-tab-count">{loans.length}</span>
            </button>
            <button
              id="tab-reservations"
              role="tab"
              aria-selected={activeTab === 'reservations'}
              aria-controls="panel-reservations"
              className={`account-tab${activeTab === 'reservations' ? ' active' : ''}`}
              onClick={() => setActiveTab('reservations')}
            >
              Reservations <span className="account-tab-count">{reservations.length}</span>
            </button>
            <button
              id="tab-history"
              role="tab"
              aria-selected={activeTab === 'history'}
              aria-controls="panel-history"
              className={`account-tab${activeTab === 'history' ? ' active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              History <span className="account-tab-count">{HISTORY_RECORDS.length}</span>
            </button>
            <button
              id="tab-fines"
              role="tab"
              aria-selected={activeTab === 'fines'}
              aria-controls="panel-fines"
              className={`account-tab${activeTab === 'fines' ? ' active' : ''}`}
              onClick={() => setActiveTab('fines')}
            >
              Fines {totalUnpaidFines > 0 && <span className="account-tab-count account-tab-count--alert">${totalUnpaidFines.toFixed(2)}</span>}
            </button>
          </div>
        </div>

        {/* ── Tab Panels ── */}
        <section className="account-panel-container">

          {/* 1. CURRENT LOANS (List rows — not cards) */}
          {activeTab === 'loans' && (
            <div id="panel-loans" role="tabpanel" aria-labelledby="tab-loans" className="account-panel">
              <div className="account-panel-header">
                <span className="account-section-eyebrow">ACTIVE CIRCULATION &middot; {loans.length} ITEMS</span>
                <span className="account-loan-policy">Standard loan duration: 14 days &middot; Max 2 renewals</span>
              </div>

              {loans.length === 0 ? (
                <div className="account-empty-state">
                  <p className="account-empty-title">NO BOOKS CURRENTLY ON LOAN</p>
                  <p className="account-empty-desc">You have returned all borrowed items.</p>
                  <Button variant="secondary" onClick={() => { window.location.hash = '#catalog' }}>
                    Browse catalog
                  </Button>
                </div>
              ) : (
                <div className="account-loan-list" role="list">
                  {loans.map(loan => {
                    const pct = Math.min(100, Math.round((loan.daysElapsed / loan.totalDays) * 100))
                    const daysLeft = loan.totalDays - loan.daysElapsed

                    return (
                      <article
                        key={loan.id}
                        className={`account-loan-row${loan.isOverdue ? ' account-loan-row--overdue' : ''}`}
                        role="listitem"
                      >
                        {/* Cover thumbnail */}
                        <div className="account-loan-row__thumb">
                          <BookThumb
                            title={loan.title}
                            category={loan.category}
                            accession={loan.accession}
                          />
                        </div>

                        {/* Title & info */}
                        <div className="account-loan-row__details">
                          <div className="account-loan-row__tagline">
                            <span className="account-loan-cat">{loan.category}</span>
                            <span className="account-meta-dot">&middot;</span>
                            <span className="account-loan-acc">{loan.accession}</span>
                          </div>
                          <h2 className="account-loan-row__title">
                            <a
                              href={`#book/${loan.accession}`}
                              onClick={e => { e.preventDefault(); window.location.hash = `#book/${loan.accession}` }}
                            >
                              {loan.title}
                            </a>
                          </h2>
                          <p className="account-loan-row__author">{loan.author}</p>
                        </div>

                        {/* Date metadata */}
                        <div className="account-loan-row__dates">
                          <div className="account-date-group">
                            <span className="account-date-key">BORROWED</span>
                            <span className="account-date-val">{loan.borrowedDate}</span>
                          </div>
                          <div className="account-date-group">
                            <span className={`account-date-key${loan.isOverdue ? ' text-oxblood' : ''}`}>
                              {loan.isOverdue ? 'OVERDUE SINCE' : 'DUE DATE'}
                            </span>
                            <span className={`account-date-val${loan.isOverdue ? ' text-oxblood font-bold' : ''}`}>
                              {loan.dueDate}
                            </span>
                          </div>
                        </div>

                        {/* Slim Progress Bar */}
                        <div className="account-loan-row__progress">
                          <div className="account-progress-label-row">
                            <span className={`account-progress-status${loan.isOverdue ? ' text-oxblood' : ''}`}>
                              {loan.isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days remaining`}
                            </span>
                            <span className="account-progress-pct">{pct}%</span>
                          </div>
                          <div
                            className="account-progress-track"
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-label={`Loan duration progress for ${loan.title}`}
                          >
                            <div
                              className={`account-progress-bar${loan.isOverdue ? ' account-progress-bar--oxblood' : ' account-progress-bar--ochre'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="account-loan-row__actions">
                          {renewedIds[loan.id] ? (
                            <span className="account-badge-renewed">RENEWED +14D</span>
                          ) : (
                            <Button
                              variant={loan.isOverdue ? 'danger' : 'secondary'}
                              disabled={loan.renewalsLeft <= 0}
                              style={{ fontSize: '0.75rem', padding: '7px 14px' }}
                              onClick={() => handleRenew(loan.id)}
                            >
                              {loan.renewalsLeft > 0 ? `Renew (${loan.renewalsLeft} left)` : 'No renewals'}
                            </Button>
                          )}
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
                <span className="account-section-eyebrow">ACTIVE HOLDS &middot; {reservations.length} ITEMS</span>
                <span className="account-loan-policy">Holds are held at desk for 5 days after notification</span>
              </div>

              {reservations.length === 0 ? (
                <div className="account-empty-state">
                  <p className="account-empty-title">NO ACTIVE RESERVATIONS</p>
                  <p className="account-empty-desc">You do not have any titles on hold.</p>
                </div>
              ) : (
                <div className="account-table-wrapper">
                  <table className="account-table" aria-label="Reservations table">
                    <thead>
                      <tr>
                        <th>ITEM / ACCESSION</th>
                        <th>RESERVED ON</th>
                        <th>STATUS / HOLD STATE</th>
                        <th>LOCATION / DEADLINE</th>
                        <th style={{ textAlign: 'right' }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reservations.map(res => (
                        <tr key={res.id}>
                          <td>
                            <div className="account-table-book">
                              <span className="account-table-acc">{res.accession}</span>
                              <a
                                href={`#book/${res.accession}`}
                                className="account-table-title"
                                onClick={e => { e.preventDefault(); window.location.hash = `#book/${res.accession}` }}
                              >
                                {res.title}
                              </a>
                              <span className="account-table-author">{res.author}</span>
                            </div>
                          </td>
                          <td className="account-mono-cell">{res.reservedDate}</td>
                          <td>
                            <span className={`account-status-badge${res.isReady ? ' account-status-badge--ready' : ' account-status-badge--queue'}`}>
                              {res.status}
                            </span>
                          </td>
                          <td>
                            <div className="account-location-cell">
                              <span className="account-loc-main">{res.pickupLocation}</span>
                              <span className="account-loc-sub">{res.pickupDeadline}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <Button
                              variant="danger"
                              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                              onClick={() => handleCancelHold(res.id)}
                            >
                              Cancel hold
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. HISTORY */}
          {activeTab === 'history' && (
            <div id="panel-history" role="tabpanel" aria-labelledby="tab-history" className="account-panel">
              <div className="account-panel-header">
                <span className="account-section-eyebrow">CIRCULATION HISTORY &middot; {HISTORY_RECORDS.length} PAST LOANS</span>
                <span className="account-loan-policy">Complete circulation ledger for member {USER_PROFILE.enrollmentNo}</span>
              </div>

              <div className="account-table-wrapper">
                <table className="account-table" aria-label="Circulation history table">
                  <thead>
                    <tr>
                      <th>ACCESSION</th>
                      <th>TITLE &amp; AUTHOR</th>
                      <th>CATEGORY</th>
                      <th>BORROWED</th>
                      <th>RETURNED</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HISTORY_RECORDS.map(rec => (
                      <tr key={rec.id}>
                        <td className="account-mono-cell">{rec.accession}</td>
                        <td>
                          <div className="account-table-book">
                            <a
                              href={`#book/${rec.accession}`}
                              className="account-table-title"
                              onClick={e => { e.preventDefault(); window.location.hash = `#book/${rec.accession}` }}
                            >
                              {rec.title}
                            </a>
                            <span className="account-table-author">{rec.author}</span>
                          </div>
                        </td>
                        <td>{rec.category}</td>
                        <td className="account-mono-cell">{rec.borrowed}</td>
                        <td className="account-mono-cell">{rec.returned}</td>
                        <td>
                          <span className={`account-history-status${rec.status.includes('late') ? ' account-history-status--late' : ''}`}>
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. FINES (Plain table, Plex Mono amounts) */}
          {activeTab === 'fines' && (
            <div id="panel-fines" role="tabpanel" aria-labelledby="tab-fines" className="account-panel">
              <div className="account-panel-header">
                <span className="account-section-eyebrow">ASSESSED FINES &amp; CHARGES</span>
                <span className="account-loan-policy">Daily late fee: $0.50/day standard &middot; $1.00/day reserved titles</span>
              </div>

              <div className="account-table-wrapper">
                <table className="account-table account-table--fines" aria-label="Fines and charges table">
                  <thead>
                    <tr>
                      <th>DATE</th>
                      <th>ACCESSION / ITEM</th>
                      <th>DESCRIPTION / REASON</th>
                      <th>STATUS</th>
                      <th style={{ textAlign: 'right' }}>AMOUNT</th>
                      <th style={{ textAlign: 'right' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fines.map(fine => (
                      <tr key={fine.id} className={fine.status === 'Unpaid' ? 'account-fine-unpaid' : 'account-fine-settled'}>
                        <td className="account-mono-cell">{fine.date}</td>
                        <td>
                          <div className="account-table-book">
                            <span className="account-table-acc">{fine.accession}</span>
                            <span className="account-table-title-plain">{fine.item}</span>
                          </div>
                        </td>
                        <td className="account-fine-reason">{fine.reason}</td>
                        <td>
                          <span className={`account-fine-badge${fine.status === 'Unpaid' ? ' account-fine-badge--unpaid' : ' account-fine-badge--settled'}`}>
                            {fine.status}
                          </span>
                        </td>
                        <td className="account-fine-amount" style={{ textAlign: 'right' }}>
                          ${fine.amount.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {fine.status === 'Unpaid' ? (
                            <Button
                              variant="ochre"
                              style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                              onClick={() => handlePayFine(fine.id)}
                            >
                              Pay fine
                            </Button>
                          ) : (
                            <span className="account-fine-receipt">PAID</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="account-table-foot">
                      <td colSpan="4" style={{ textAlign: 'right', fontWeight: 600 }}>
                        TOTAL OUTSTANDING FINES:
                      </td>
                      <td className="account-fine-total" style={{ textAlign: 'right' }}>
                        ${totalUnpaidFines.toFixed(2)}
                      </td>
                      <td></td>
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
