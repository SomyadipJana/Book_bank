import React, { useState, useEffect } from 'react'
import './index.css'
import LandingPage     from './pages/LandingPage'
import CatalogPage     from './pages/CatalogPage'
import BookDetailPage  from './pages/BookDetailPage'
import AuthPage        from './pages/AuthPage'
import AccountPage     from './pages/AccountPage'
import AdminPage       from './pages/AdminPage'

function getRoute() {
  const h = window.location.hash
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
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const handler = () => setRoute(getRoute())
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (route.page === 'catalog')  return <CatalogPage />
  if (route.page === 'book')     return <BookDetailPage accession={route.id} />
  if (route.page === 'login')    return <AuthPage key="login" mode="login" />
  if (route.page === 'register') return <AuthPage key="register" mode="register" />
  if (route.page === 'account')  return <AccountPage key={route.id || 'loans'} initialTab={route.id || 'loans'} />
  if (route.page === 'admin')    return <AdminPage currentTab={route.id} />
  return <LandingPage />
}
