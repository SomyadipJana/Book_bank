import React, { useState } from 'react'
import { Button } from '../components/Button'
import { DueDatePocket } from '../components/DueDatePocket'
import { CatalogCard } from '../components/CatalogCard'
import { ALL_BOOKS, SPINE, coverLargeUrl, coverGridUrl } from '../data/books'
import { useAuth } from '../context/AuthContext'

/* ── Helpers ─────────────────────────────────────────────── */

function getPickupDate() {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

/* ── Icons ───────────────────────────────────────────────── */

function IconCheck() {
  return (
    <svg width="15" height="11" viewBox="0 0 15 11" fill="none" aria-hidden="true">
      <path
        d="M1.5 5.5L5.5 9.5L13.5 1.5"
        stroke="var(--color-ink)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ── Nav ─────────────────────────────────────────────────── */

function DetailNav() {
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
          { label: 'Catalogue',    href: '#catalog' },
          { label: 'My Loans',     href: '#loans' },
          { label: 'Reservations', href: '#reservations' },
          { label: 'About',        href: '#' },
        ].map(l => (
          <li key={l.label}>
            <a href={l.href} className="nav__link">{l.label}</a>
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

/* ── Action area ─────────────────────────────────────────── */

function ActionArea({ available }) {
  const [reserved, setReserved] = useState(false)
  const pickupDate = getPickupDate()

  if (available) {
    if (reserved) {
      return (
        <div className="detail-action">
          <div className="reserved-confirm" role="status" aria-live="polite">
            <span className="reserved-confirm__check"><IconCheck /></span>
            <span>Reserved — pick up by {pickupDate}</span>
          </div>
        </div>
      )
    }
    return (
      <div className="detail-action">
        <Button
          id="reserve-btn"
          variant="ochre"
          style={{ fontSize: '0.9375rem', padding: '13px 28px', alignSelf: 'flex-start' }}
          onClick={() => setReserved(true)}
        >
          Reserve this title
        </Button>
      </div>
    )
  }

  /* Unavailable */
  return (
    <div className="detail-action">
      <Button
        id="waitlist-btn"
        variant="secondary"
        style={{ fontSize: '0.9375rem', padding: '13px 28px', alignSelf: 'flex-start' }}
      >
        Join waitlist
      </Button>
      <p className="waitlist-note">
        All copies are currently on loan. You will be notified when
        a copy is returned and your reservation can be collected.
      </p>
    </div>
  )
}

/* ── "More like this" ─────────────────────────────────────── */

function RelatedBooks({ book }) {
  const related = ALL_BOOKS
    .filter(b => b.id !== book.id && b.category === book.category)
    .slice(0, 4)

  /* Fallback: fill from any category if not enough in same category */
  const extra = related.length < 4
    ? ALL_BOOKS.filter(b => b.id !== book.id && !related.find(r => r.id === b.id)).slice(0, 4 - related.length)
    : []

  const cards = [...related, ...extra]

  if (cards.length === 0) return null

  return (
    <div>
      <hr className="detail-divider" />
      <section className="detail-related" aria-label="More like this">
        <div className="detail-related__header">
          <span className="section-eyebrow">More Like This</span>
          <h2
            className="section-title"
            style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)', marginBottom: 0 }}
          >
            {book.category} titles you may enjoy
          </h2>
        </div>
        <div className="detail-related-grid">
          {cards.map(b => (
            <CatalogCard
              key={b.id}
              book={b}
              onClick={() => { window.location.hash = `#book/${b.accession}` }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────────── */

export default function BookDetailPage({ accession }) {
  const book = ALL_BOOKS.find(b => b.accession === accession)

  /* 404 state */
  if (!book) {
    return (
      <div className="detail-page">
        <DetailNav />
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '80px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
        }}>
          <p className="mono-label" style={{ color: 'var(--color-charcoal-60)', letterSpacing: '0.08em' }}>
            ACCESSION NOT FOUND
          </p>
          <h1 className="detail-title" style={{ fontSize: '1.5rem', textAlign: 'center' }}>
            No record for {accession}
          </h1>
          <Button variant="secondary" onClick={() => { window.location.hash = '#catalog' }}>
            Back to catalogue
          </Button>
        </div>
      </div>
    )
  }

  const spineColor = SPINE[book.category] || '#2B2620'
  const copiesAvail = (book.availableCopies ?? (book.available ? 1 : 0)) > 0

  /* ── Detail cover ──────────────────────────────────────────
     Two-stage fallback:
       1. coverLarge (OL-L with ?default=false → real 404 on miss)
       2. coverGrid  (Google best-field, if OL 404s)
       3. Styled title placeholder (Fraunces, spine background)
     onError swaps through the stages; never leaves a bare div.
     ───────────────────────────────────────────────────── */
  const largeSrc = coverLargeUrl(book)
  const gridSrc  = coverGridUrl(book)
  // 0 = show large, 1 = show grid (OL failed), 2 = show placeholder
  const [coverStage, setCoverStage] = useState(0)
  const coverSrc = coverStage === 0 ? largeSrc : (coverStage === 1 ? gridSrc : null)
  const showCoverImg = coverSrc !== null

  function handleCoverError() {
    if (coverStage === 0 && gridSrc && gridSrc !== largeSrc) {
      setCoverStage(1)   // try grid URL (Google)
    } else {
      setCoverStage(2)   // give up → styled placeholder
    }
  }

  return (
    <div className="detail-page">
      <DetailNav />

      {/* Breadcrumb */}
      <nav className="detail-breadcrumb" aria-label="Breadcrumb">
        <a href="#catalog" onClick={e => { e.preventDefault(); window.location.hash = '#catalog' }}>
          Catalogue
        </a>
        <span className="detail-breadcrumb__sep" aria-hidden="true">›</span>
        <span className="detail-breadcrumb__current" title={book.title}>
          {book.accession}
        </span>
      </nav>

      {/* ── Hero ── */}
      <div className="detail-hero">

        {/* Left — Cover */}
        <div className="detail-cover-col">
          <div
            className="detail-cover-block"
            style={{
              backgroundColor: spineColor,
              position: 'relative',
            }}
          >
            {showCoverImg ? (
              <img
                src={coverSrc}
                alt={`Cover of ${book.title}`}
                onError={handleCoverError}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  borderRadius: 'inherit',
                  display: 'block',
                }}
              />
            ) : (
              /* Styled placeholder: spine-colour background + Fraunces title */
              <div className="detail-cover-title">
                <span>{book.title}</span>
              </div>
            )}
            <DueDatePocket accession={book.accession} />
          </div>

          <div className="detail-cover-meta">
            <p className="detail-cover-accession">{book.accession}</p>
            <div className="detail-cover-avail">
              <span
                className="detail-cover-avail__dot"
                style={{ backgroundColor: book.available ? 'var(--color-ochre)' : 'var(--color-oxblood)' }}
              />
              <span
                className="detail-cover-avail__label"
                style={{ color: book.available ? 'var(--color-ochre)' : 'var(--color-oxblood)' }}
              >
                {book.available ? 'Available' : 'On Loan'}
              </span>
            </div>
          </div>
        </div>

        {/* Right — Info */}
        <div className="detail-info-col">
          {/* Eyebrow */}
          <span className="detail-category-eyebrow">
            {book.category} &mdash; {book.format}
          </span>

          {/* Title */}
          <h1 className="detail-title">{book.title}</h1>

          {/* Byline: small-caps mono */}
          <div className="detail-byline">
            <div className="detail-byline__row">
              <span className="detail-byline__key">Author</span>
              <span className="detail-byline__val">{book.author}</span>
            </div>
            {book.edition && (
              <div className="detail-byline__row">
                <span className="detail-byline__key">Edition</span>
                <span className="detail-byline__val">{book.edition}</span>
              </div>
            )}
            {book.publisher && (
              <div className="detail-byline__row">
                <span className="detail-byline__key">Publisher</span>
                <span className="detail-byline__val">{book.publisher}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {book.description && (
            <p className="detail-description">{book.description}</p>
          )}

          {/* Metadata table */}
          <div className="detail-meta" role="table" aria-label="Book details">
            <div className="detail-meta-row">
              <div className="detail-meta-key">Category</div>
              <div className="detail-meta-val">{book.category}</div>
            </div>
            <div className="detail-meta-row">
              <div className="detail-meta-key">Copies</div>
              <div className="detail-meta-val">
                {book.totalCopies} total
                <span className={`copies-available${copiesAvail ? '' : ' copies-none'}`}>
                  {book.availableCopies ?? (book.available ? '1' : '0')} available
                </span>
              </div>
            </div>
            <div className="detail-meta-row">
              <div className="detail-meta-key">Format</div>
              <div className="detail-meta-val">{book.format}</div>
            </div>
            <div className="detail-meta-row">
              <div className="detail-meta-key">Added</div>
              <div className="detail-meta-val">{formatDate(book.addedDate)}</div>
            </div>
            <div className="detail-meta-row">
              <div className="detail-meta-key">Accession</div>
              <div className="detail-meta-val" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                {book.accession}
              </div>
            </div>
          </div>

          {/* Action */}
          <ActionArea available={book.available} />
        </div>
      </div>

      {/* ── More like this ── */}
      <RelatedBooks book={book} />
    </div>
  )
}
