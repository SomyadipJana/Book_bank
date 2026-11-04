import React, { useState, useMemo, useCallback } from 'react'
import { Button } from '../components/Button'
import { CatalogCard } from '../components/CatalogCard'
import { ALL_BOOKS, CATEGORIES, AVAILABILITIES, FORMATS } from '../data/books'
import { useAuth } from '../context/AuthContext'

const PER_PAGE = 12

/* ── Svg helpers ─────────────────────────────────────────── */

function IconSearch() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.25"/>
      <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round"/>
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* ── Sub-components ──────────────────────────────────────── */

function CatalogNav() {
  const { user, logout } = useAuth()
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
          { label: 'Catalogue',    href: '#catalog',      active: true  },
          { label: 'My Loans',     href: '#loans',        active: false },
          { label: 'Reservations', href: '#reservations', active: false },
          { label: 'About',        href: '#',             active: false },
          ...(user?.role === 'librarian' ? [{ label: 'Admin', href: '#admin', active: false }] : []),
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

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="account-nav-user" title={user.name}>
            <span className="account-nav-avatar">{user.name[0].toUpperCase()}</span>
            <span className="account-nav-name">{user.name}</span>
          </span>
          <button
            type="button"
            className="account-nav-signout"
            onClick={() => { logout(); window.location.hash = '#login' }}
          >
            Sign Out
          </button>
        </div>
      ) : (
        <Button
          variant="primary"
          style={{ fontSize: '0.8125rem', padding: '9px 18px' }}
          onClick={() => { window.location.hash = '#login' }}
        >
          Sign In
        </Button>
      )}
    </nav>
  )
}

function SearchBar({ value, onChange }) {
  return (
    <div className="search-pill-wrap">
      <span className="search-pill-icon" aria-hidden="true">
        <IconSearch />
      </span>
      <input
        id="catalog-search"
        type="search"
        className="search-pill"
        placeholder="Search by title, author or accession no."
        value={value}
        onChange={e => onChange(e.target.value)}
        autoComplete="off"
        aria-label="Search catalogue"
      />
    </div>
  )
}

function FilterPill({ id, label, value, onChange, options }) {
  return (
    <div className="filter-pill-wrap">
      <select
        id={id}
        className={`filter-pill${value ? ' has-value' : ''}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label={label}
      >
        <option value="">{label}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <span className="filter-pill-chevron" aria-hidden="true">
        <IconChevron />
      </span>
    </div>
  )
}

function FilterChip({ label, onRemove }) {
  return (
    <button
      className="filter-chip"
      onClick={onRemove}
      aria-label={`Remove filter: ${label}`}
      type="button"
    >
      {label}
      <span className="filter-chip__x" aria-hidden="true">×</span>
    </button>
  )
}

function EmptyState({ onClearFilters }) {
  return (
    <div className="empty-state" role="status">
      <p className="empty-state__msg">
        No titles match<br />try a different search
      </p>
      <Button variant="secondary" onClick={onClearFilters}>
        Clear filters
      </Button>
    </div>
  )
}

function buildPageRange(current, total) {
  if (total <= 9) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 5) return [1, 2, 3, 4, 5, 6, '…', total]
  if (current >= total - 4) return [1, '…', total-5, total-4, total-3, total-2, total-1, total]
  return [1, '…', current-1, current, current+1, '…', total]
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const range = buildPageRange(page, totalPages)
  return (
    <nav className="pagination-wrap" aria-label="Pagination">
      <div className="pagination">
        <button
          className="pag-link pag-nav"
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          ← Prev
        </button>

        {range.map((item, i) =>
          item === '…' ? (
            <span key={`ell-${i}`} className="pag-ellipsis" aria-hidden="true">…</span>
          ) : (
            <button
              key={item}
              className={`pag-link${page === item ? ' active' : ''}`}
              onClick={() => onChange(item)}
              aria-label={`Page ${item}`}
              aria-current={page === item ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}

        <button
          className="pag-link pag-nav"
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </nav>
  )
}

/* ── Page ────────────────────────────────────────────────── */

const INITIAL_FILTERS = { category: '', availability: '', format: '' }

export default function CatalogPage() {
  const [search,      setSearch]      = useState('')
  const [filters,     setFilters]     = useState(INITIAL_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)

  const setFilter = useCallback((key, val) => {
    setFilters(f => ({ ...f, [key]: val }))
    setCurrentPage(1)
  }, [])

  const handleSearch = useCallback(val => {
    setSearch(val)
    setCurrentPage(1)
  }, [])

  const clearAll = useCallback(() => {
    setSearch('')
    setFilters(INITIAL_FILTERS)
    setCurrentPage(1)
  }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return ALL_BOOKS.filter(b => {
      if (q && !(
        b.title.toLowerCase().includes(q)     ||
        b.author.toLowerCase().includes(q)    ||
        b.accession.toLowerCase().includes(q)
      )) return false
      if (filters.category     && b.category !== filters.category)                       return false
      if (filters.availability && (filters.availability === 'Available') !== b.available) return false
      if (filters.format       && b.format !== filters.format)                            return false
      return true
    })
  }, [search, filters])

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const activeChips = [
    filters.category     && { key: 'category',     label: filters.category     },
    filters.availability && { key: 'availability', label: filters.availability },
    filters.format       && { key: 'format',       label: filters.format       },
  ].filter(Boolean)

  const goToBook = useCallback(accession => {
    window.location.hash = `#book/${accession}`
  }, [])

  return (
    <div className="catalog-page">
      <CatalogNav />

      {/* ── Topbar ── */}
      <div className="catalog-topbar" role="search">
        <div className="catalog-topbar__controls">
          <SearchBar value={search} onChange={handleSearch} />
          <FilterPill
            id="filter-category"
            label="Category"
            value={filters.category}
            onChange={v => setFilter('category', v)}
            options={CATEGORIES}
          />
          <FilterPill
            id="filter-availability"
            label="Availability"
            value={filters.availability}
            onChange={v => setFilter('availability', v)}
            options={AVAILABILITIES}
          />
          <FilterPill
            id="filter-format"
            label="Format"
            value={filters.format}
            onChange={v => setFilter('format', v)}
            options={FORMATS}
          />
        </div>

        <div className="catalog-topbar__chips">
          {activeChips.map(chip => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              onRemove={() => setFilter(chip.key, '')}
            />
          ))}
          <span className="result-count" aria-live="polite">
            {filtered.length.toLocaleString()} title{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* ── Grid ── */}
      <main id="catalog-results">
        <div className="catalog-grid-wrap">
          <div className="catalog-grid">
            {paginated.length > 0
              ? paginated.map(book => (
                  <CatalogCard
                    key={book.id}
                    book={book}
                    onClick={() => goToBook(book.accession)}
                  />
                ))
              : <EmptyState onClearFilters={clearAll} />
            }
          </div>
        </div>

        {paginated.length > 0 && (
          <Pagination
            page={currentPage}
            totalPages={totalPages}
            onChange={p => {
              setCurrentPage(p)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
      </main>
    </div>
  )
}
