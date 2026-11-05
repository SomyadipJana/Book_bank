import React, { useState, useEffect } from 'react'
import './index.css'
import LandingPage     from './pages/LandingPage'
import CatalogPage     from './pages/CatalogPage'
import BookDetailPage  from './pages/BookDetailPage'
import AuthPage        from './pages/AuthPage'
import AccountPage     from './pages/AccountPage'
import AdminPage       from './pages/AdminPage'
import { useAuth }     from './context/AuthContext'

function getRoute() {
  const p = window.location.pathname.replace(/\/+$/, '')
  const h = window.location.hash

  // Direct pathname support (/admin or /admin/...)
  if (p === '/admin' || p.startsWith('/admin/')) {
    const sub = p.replace(/^\/admin\/?/, '')
    return { page: 'admin', id: sub || 'dashboard' }
  }
  if (p === '/catalog') return { page: 'catalog', id: null }

  // Hash-based routes
  if (h === '#catalog')          return { page: 'catalog',      id: null }
  if (h === '#login')            return { page: 'login',        id: null }
  if (h === '#register')         return { page: 'register',     id: null }
  if (h === '#account' || h === '#loans') return { page: 'account', id: 'loans' }
  if (h === '#reservations')     return { page: 'account',      id: 'reservations' }
  if (h === '#history')          return { page: 'account',      id: 'history' }
  if (h === '#fines')            return { page: 'account',      id: 'fines' }
  if (h.startsWith('#account/')) return { page: 'account',      id: h.slice(9) || 'loans' }
  if (h.startsWith('#book/'))    return { page: 'book',         id: h.slice(6) }
  if (h === '#admin' || h === '#admin/dashboard') return { page: 'admin', id: 'dashboard' }
  if (h.startsWith('#admin/'))    return { page: 'admin',        id: h.slice(7) }
  return                                { page: 'landing',      id: null }
}

export default function App() {
  const { user } = useAuth()
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const handler = () => setRoute(getRoute())
    window.addEventListener('hashchange', handler)
    window.addEventListener('popstate', handler)
    return () => {
      window.removeEventListener('hashchange', handler)
      window.removeEventListener('popstate', handler)
    }
  }, [])

  // Librarian should never land on student account / loans page
  useEffect(() => {
    if (user?.role === 'librarian' && route.page === 'account') {
      window.location.hash = '#admin'
      setRoute({ page: 'admin', id: 'dashboard' })
    }
  }, [user, route.page])

  // Route protection for /admin:
  // - Logged out -> redirect to Sign In
  // - Logged-in student -> redirect to Catalogue with "Not authorised"
  useEffect(() => {
    if (route.page === 'admin') {
      if (!user) {
        window.location.hash = '#login'
        setRoute({ page: 'login', id: null })
      } else if (user.role !== 'librarian') {
        sessionStorage.setItem('bb_flash_msg', 'Not authorised')
        window.location.hash = '#catalog'
        setRoute({ page: 'catalog', id: null })
      }
    }
  }, [user, route.page])

  if (route.page === 'catalog')  return <CatalogPage />
  if (route.page === 'book')     return <BookDetailPage accession={route.id} />
  if (route.page === 'login')    return <AuthPage key="login" mode="login" />
  if (route.page === 'register') return <AuthPage key="register" mode="register" />
  if (route.page === 'account') {
    if (user?.role === 'librarian') return <AdminPage currentTab="dashboard" />
    return <AccountPage key={route.id || 'loans'} initialTab={route.id || 'loans'} />
  }
  if (route.page === 'admin') {
    if (!user) return <AuthPage key="login" mode="login" />
    if (user.role !== 'librarian') return <CatalogPage />
    return <AdminPage currentTab={route.id} />
  }
  return <LandingPage />
}
