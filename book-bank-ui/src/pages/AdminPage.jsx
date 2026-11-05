/**
 * AdminPage.jsx
 *
 * Auth-gated Admin Shell.
 * Layout: fixed 240px ink sidebar + paper main content.
 * Density: 14px base, 40px table rows, no shadows, no decorative spacing.
 *
 * Routes:  #admin  →  dashboard
 *          #admin/catalogue
 *          #admin/loans
 *          #admin/issue-return
 *          #admin/members
 *          #admin/vendors
 *          #admin/reports
 */
import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components'

import AdminDashboard   from './admin/AdminDashboard'
import AdminCatalogue   from './admin/AdminCatalogue'
import AdminLoans       from './admin/AdminLoans'
import AdminIssueReturn from './admin/AdminIssueReturn'
import AdminMembers     from './admin/AdminMembers'
import AdminVendors     from './admin/AdminVendors'
import AdminReports     from './admin/AdminReports'

/* ── Nav configuration ───────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',    label: 'Dashboard',        hash: '#admin/dashboard',    action: null },
  { id: 'catalogue',    label: 'Catalogue',        hash: '#admin/catalogue',    action: '+ Add Book' },
  { id: 'loans',        label: 'Loans & Renewals', hash: '#admin/loans',        action: null },
  { id: 'issue-return', label: 'Issue / Return',   hash: '#admin/issue-return', action: null },
  { id: 'members',      label: 'Members',          hash: '#admin/members',      action: '+ Add Member' },
  { id: 'vendors',      label: 'Vendors & Orders', hash: '#admin/vendors',      action: null },
  { id: 'reports',      label: 'Reports',          hash: '#admin/reports',      action: null },
]

/* ── Shell ──────────────────────────────────────────────────── */
export default function AdminPage({ currentTab = 'dashboard' }) {
  const { user, logout } = useAuth()
  const addBookTriggerRef = useRef(null)
  const addMemberTriggerRef = useRef(null)

  // ── Auth gate (role === "librarian") ──────────────────────────────────────
  const isLibrarian = user?.role === 'librarian'

  useEffect(() => {
    if (!user) {
      window.location.hash = '#login'
    } else if (!isLibrarian) {
      sessionStorage.setItem('bb_flash_msg', 'Not authorised')
      window.location.hash = '#catalog'
    }
  }, [user, isLibrarian])

  if (!user) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font-mono)', color: 'var(--color-charcoal-60)', fontSize: 14 }}>
        Redirecting to Sign In…
      </div>
    )
  }

  if (!isLibrarian) {
    return (
      <div style={{ padding: 40, fontFamily: 'var(--font-mono)', color: 'var(--color-oxblood)', fontSize: 14 }}>
        Not authorised. Redirecting to Catalogue…
      </div>
    )
  }

  const activeNav = NAV.find(n => n.id === currentTab) ?? NAV[0]

  const handleHeaderAction = () => {
    if (currentTab === 'catalogue' && addBookTriggerRef.current) {
      addBookTriggerRef.current()
    } else if (currentTab === 'members' && addMemberTriggerRef.current) {
      addMemberTriggerRef.current()
    }
  }

  const handleLogout = () => { logout(); window.location.hash = '#login' }

  /* ── Content area selection ── */
  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':    return <AdminDashboard />
      case 'catalogue':    return <AdminCatalogueWrapper onRegisterAddBook={cb => { addBookTriggerRef.current = cb }} />
      case 'loans':        return <AdminLoans />
      case 'issue-return': return <AdminIssueReturn />
      case 'members':      return <AdminMembers onAdd={cb => { addMemberTriggerRef.current = cb }} />
      case 'vendors':      return <AdminVendors />
      case 'reports':      return <AdminReports />
      default:             return <AdminDashboard />
    }
  }

  return (
    <div className="admin-panel">

      {/* ── Fixed sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__top">

          {/* Wordmark */}
          <div className="admin-sidebar__logo">
            <span className="admin-sidebar__logo-name">Book Bank</span>
            <span className="admin-sidebar__logo-admin">ADMIN</span>
          </div>

          {/* Nav links */}
          <nav className="admin-sidebar__nav">
            {NAV.map(item => (
              <a
                key={item.id}
                href={item.hash}
                className={`admin-sidebar__nav-link${item.id === currentTab ? ' admin-sidebar__nav-link--active' : ''}`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* User + logout */}
        <div className="admin-sidebar__bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: 'rgba(250, 247, 240, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-paper)',
                flexShrink: 0,
              }}
            >
              {user?.name ? user.name[0].toUpperCase() : 'L'}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span className="admin-sidebar__user-name" title={user?.name}>{user?.name || 'Librarian'}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.625rem', color: 'var(--color-ochre)', letterSpacing: '0.08em' }}>
                LIBRARIAN
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="admin-sidebar__logout-btn"
            title="Sign out of Admin Panel"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main">

        {/* Page header */}
        <header className="admin-header">
          <h1 className="admin-header__title">{activeNav.label}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {activeNav.action && (
              <Button
                variant="ochre"
                onClick={handleHeaderAction}
                style={{ fontSize: '0.8125rem', padding: '9px 18px' }}
              >
                {activeNav.action}
              </Button>
            )}

            <a
              href="#catalog"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.04em',
                color: 'var(--color-charcoal-60)',
                textDecoration: 'none',
                padding: '7px 12px',
                borderRadius: '4px',
                border: '1px solid rgba(30,61,50,0.15)',
                backgroundColor: '#ffffff',
                whiteSpace: 'nowrap',
              }}
              title="View the public catalogue"
            >
              Public Catalogue ↗
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '10px', borderLeft: '1px solid rgba(30,61,50,0.12)' }}>
              <span className="account-nav-user" title={user?.name}>
                <span className="account-nav-avatar">{user?.name ? user.name[0].toUpperCase() : 'L'}</span>
                <span className="account-nav-name" style={{ fontWeight: 600 }}>{user?.name || 'Librarian'}</span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.625rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: 'rgba(198, 138, 46, 0.15)',
                    color: 'var(--color-ochre)',
                    border: '1px solid rgba(198, 138, 46, 0.35)',
                    fontWeight: 600,
                  }}
                >
                  Librarian
                </span>
              </span>

              <button
                type="button"
                className="account-nav-signout"
                onClick={handleLogout}
                style={{
                  padding: '7px 14px',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(122, 46, 39, 0.3)',
                  color: 'var(--color-oxblood)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                }}
                title="Sign out of Book Bank"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Page body */}
        {renderContent()}
      </main>
    </div>
  )
}

/* ── Wrapper: gives Catalogue a way to expose its slide-over trigger upward ── */
function AdminCatalogueWrapper({ onRegisterAddBook }) {
  const [slideOver, setSlideOver] = useState(null)

  useEffect(() => {
    // Register the "+ Add Book" trigger with the parent (AdminPage header button)
    onRegisterAddBook(() => setSlideOver('add'))
  }, [onRegisterAddBook])

  return <AdminCatalogue externalSlideOver={slideOver} onCloseExternalSlideOver={() => setSlideOver(null)} />
}
