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
import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components'

import AdminDashboard   from './admin/AdminDashboard'
import AdminCatalogue   from './admin/AdminCatalogue'
import AdminLoans       from './admin/AdminLoans'
import AdminIssueReturn from './admin/AdminIssueReturn'
import AdminMembers     from './admin/AdminMembers'
import AdminVendors     from './admin/AdminVendors'
import AdminReports     from './admin/AdminReports'

/* ── Nav configuration ─────────────────────────────────────── */
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

  // ── Header action callbacks (forwarded from child pages) ───────────────────
  const addBookTriggerRef = React.useRef(null)
  const addMemberTriggerRef = React.useRef(null)

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
          <span className="admin-sidebar__user-name" title={user.name}>{user.name}</span>
          <button onClick={handleLogout} className="admin-sidebar__logout">Log out</button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="admin-main">

        {/* Page header */}
        <header className="admin-header">
          <h1 className="admin-header__title">{activeNav.label}</h1>
          {activeNav.action && (
            <Button
              variant="ochre"
              onClick={handleHeaderAction}
              style={{ fontSize: '0.8125rem', padding: '9px 18px' }}
            >
              {activeNav.action}
            </Button>
          )}
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
