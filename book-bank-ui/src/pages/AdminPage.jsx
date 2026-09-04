import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { ALL_BOOKS } from '../data/books'
import { Button } from '../components/Button'

export default function AdminPage({ currentTab = 'dashboard' }) {
  const { user, logout } = useAuth()

  // ── Auth Gate ──
  // TODO: replace role check with real backend-issued role claim once auth is live.
  const isLibrarian = user && user.role === 'librarian'

  useEffect(() => {
    if (!isLibrarian) {
      window.location.hash = '#login'
    }
  }, [isLibrarian])

  if (!isLibrarian) {
    return (
      <div style={{ padding: '40px', fontFamily: 'var(--font-mono)', color: 'var(--color-oxblood)' }}>
        Redirecting to Sign In...
      </div>
    )
  }

  // ── Calculate Dashboard Stats from mockBooks ──
  const totalBooks = ALL_BOOKS.reduce((acc, b) => acc + (b.totalCopies || 1), 0)
  const booksOnLoan = ALL_BOOKS.reduce((acc, b) => acc + ((b.totalCopies || 1) - (b.availableCopies ?? (b.available ? 1 : 0))), 0)
  const overdueCount = 14 // Simulated realistic overdue count

  // ── Navigation Configuration ──
  const NAV_ITEMS = [
    { label: 'Dashboard',        id: 'dashboard',      hash: '#admin/dashboard',     actionLabel: 'Refresh Stats' },
    { label: 'Catalogue',        id: 'catalogue',      hash: '#admin/catalogue',     actionLabel: '+ Add Book' },
    { label: 'Issue / Return',   id: 'issue-return',   hash: '#admin/issue-return',  actionLabel: 'New Transaction' },
    { label: 'Members',          id: 'members',        hash: '#admin/members',       actionLabel: 'Add Member' },
    { label: 'Vendors & Orders', id: 'vendors',        hash: '#admin/vendors',       actionLabel: 'New Order' },
    { label: 'Reports',          id: 'reports',        hash: '#admin/reports',       actionLabel: 'Export PDF' },
  ]

  const activeNav = NAV_ITEMS.find(item => item.id === currentTab) || NAV_ITEMS[0]

  const handleLogout = () => {
    logout()
    window.location.hash = '#login'
  }

  return (
    <div className="admin-panel">
      {/* ── Fixed Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__top">
          {/* Logo / Wordmark */}
          <div className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-name">Book Bank</span>
            <span className="admin-sidebar__logo-admin">ADMIN</span>
          </div>

          {/* Nav Links */}
          <nav className="admin-sidebar__nav">
            {NAV_ITEMS.map((item) => {
              const isActive = item.id === currentTab
              return (
                <a
                  key={item.id}
                  href={item.hash}
                  className={`admin-sidebar__nav-link${isActive ? ' admin-sidebar__nav-link--active' : ''}`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Bottom (Profile & Logout) */}
        <div className="admin-sidebar__bottom">
          <span className="admin-sidebar__user-name" title={user.name}>
            {user.name}
          </span>
          <button onClick={handleLogout} className="admin-sidebar__logout">
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <main className="admin-main">
        {/* Header Row */}
        <header className="admin-header">
          <h1 className="admin-header__title">{activeNav.label}</h1>
          <Button
            variant="ochre"
            style={{ fontSize: '0.8125rem', padding: '9px 18px' }}
            onClick={() => alert(`${activeNav.actionLabel} action triggered.`)}
          >
            {activeNav.actionLabel}
          </Button>
        </header>

        {/* View Selection */}
        {currentTab === 'dashboard' ? (
          <div className="admin-dashboard-content">
            {/* 3-Stat Row */}
            <div className="admin-stats-row">
              <div className="account-stat-chip">
                <span className="account-stat-chip__label">TOTAL BOOKS</span>
                <span className="account-stat-chip__value">{totalBooks}</span>
              </div>
              <div className="account-stat-chip">
                <span className="account-stat-chip__label">BOOKS ON LOAN</span>
                <span className="account-stat-chip__value">{booksOnLoan}</span>
              </div>
              <div className="account-stat-chip account-stat-chip--alert">
                <span className="account-stat-chip__label">OVERDUE COUNT</span>
                <span className="account-stat-chip__value">{overdueCount}</span>
              </div>
            </div>

            {/* Dashboard placeholder body */}
            <div style={{ marginTop: '24px', color: 'var(--color-charcoal-60)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>
              <p>Welcome to the librarian administrative console. All active library metrics and system operations are managed through the sidebar desk controllers.</p>
            </div>
          </div>
        ) : (
          /* Placeholder screens for other sections */
          <div style={{ color: 'var(--color-charcoal-60)', fontFamily: 'var(--font-mono)', fontSize: '0.875rem' }}>
            <p>[Module: {activeNav.label}] is currently under active development.</p>
          </div>
        )}
      </main>
    </div>
  )
}
