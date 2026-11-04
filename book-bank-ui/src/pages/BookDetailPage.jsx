import React, { useState, useMemo } from 'react'
import { Button } from '../components/Button'
import { DueDatePocket } from '../components/DueDatePocket'
import { CatalogCard } from '../components/CatalogCard'
import { SPINE, coverLargeUrl, coverGridUrl } from '../data/books'
import { useAuth } from '../context/AuthContext'
import { useLibraryStore } from '../data/libraryStore'

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
  const isLibrarian = user?.role === 'librarian'

  const navItems = isLibrarian
    ? [
        { label: 'Catalogue', href: '#catalog' },
        { label: 'Admin',     href: '#admin' },
        { label: 'About',     href: '#' },
      ]
    : [
        { label: 'Catalogue',    href: '#catalog' },
        { label: 'My Loans',     href: '#loans' },
        { label: 'Reservations', href: '#reservations' },
        { label: 'About',        href: '#' },
      ]

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
        {navItems.map(l => (
          <li key={l.label}>
            <a href={l.href} className="nav__link">{l.label}</a>
          </li>
        ))}
      </ul>

      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            className="account-nav-user"
            title={user.name}
            style={{ cursor: 'pointer' }}
            onClick={() => { window.location.hash = isLibrarian ? '#admin' : '#loans' }}
          >
            <span className="account-nav-avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</span>
            <span className="account-nav-name">{user.name}</span>
            {isLibrarian && (
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
                  marginLeft: 4,
                }}
              >
                Librarian
              </span>
            )}
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

function ActionArea({ book }) {
  const { user } = useAuth()
  const { reservations, reserveBook, cancelReservation } = useLibraryStore()
  const [errorMsg, setErrorMsg] = useState(null)
  const isLibrarian = user?.role === 'librarian'

  const userReservation = useMemo(() => {
    if (!user?.memberId) return null
    return reservations.find(
      r => r.accession === book.accession &&
           r.memberId === user.memberId &&
           (r.status === 'ready' || r.status === 'waiting')
    )
  }, [reservations, book.accession, user?.memberId])

  const handleReserve = () => {
    setErrorMsg(null)
    if (!user) {
      window.location.hash = '#login'
      return
    }
    if (isLibrarian) {
      setErrorMsg('Librarians cannot place personal reservations. Issue books via Admin Issue Desk.')
      return
    }
    try {
      reserveBook({
        accession: book.accession,
        memberId: user.memberId,
        actor: user.name,
      })
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const handleCancel = () => {
    if (!userReservation) return
    setErrorMsg(null)
    try {
      cancelReservation({
        reservationId: userReservation.id,
        actor: user?.name || 'Student',
      })
    } catch (err) {
      setErrorMsg(err.message)
    }
  }

  const available = (book.availableCopies ?? (book.available ? 1 : 0)) > 0

  return (
    <div className="detail-action" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(122, 46, 39, 0.1)',
          color: 'var(--color-oxblood)',
          padding: '10px 14px',
          borderRadius: 4,
          fontSize: '0.85rem',
          border: '1px solid rgba(122, 46, 39, 0.25)',
          maxWidth: 480,
        }}>
          ⚠ {errorMsg}
        </div>
      )}

      {userReservation ? (
        <div style={{
          padding: '16px 20px',
          backgroundColor: userReservation.status === 'ready' ? 'rgba(30,61,50,0.06)' : 'rgba(198,138,46,0.1)',
          border: `1px solid ${userReservation.status === 'ready' ? 'var(--color-ink)' : 'var(--color-ochre)'}`,
          borderRadius: 4,
          maxWidth: 480,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ color: userReservation.status === 'ready' ? 'var(--color-ink)' : 'var(--color-ochre)' }}>
              <IconCheck />
            </span>
            <span style={{
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              fontSize: '1rem',
              color: userReservation.status === 'ready' ? 'var(--color-ink)' : 'var(--color-ochre)',
            }}>
              {userReservation.status === 'ready' ? 'Ready for Pickup' : `Waitlisted (Queue #${userReservation.queuePosition})`}
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--color-charcoal)', margin: '0 0 12px' }}>
            {userReservation.status === 'ready'
              ? `A copy is being held for you until ${formatDate(userReservation.holdExpiresAt)}. Collect at: ${userReservation.pickupLocation || 'Main Circulation Desk'}.`
              : 'All copies are currently checked out. We will reserve the next returned copy for you automatically.'}
          </p>

          <Button
            variant="secondary"
            style={{ fontSize: '0.8125rem', padding: '6px 14px', color: 'var(--color-oxblood)' }}
            onClick={handleCancel}
          >
            Cancel Reservation
          </Button>
        </div>
      ) : available ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <Button
            id="reserve-btn"
            variant="ochre"
            style={{ fontSize: '0.9375rem', padding: '13px 28px' }}
            onClick={handleReserve}
          >
            Reserve this title
          </Button>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-60)' }}>
            Places a 5-day hold at the library circulation desk.
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <Button
            id="waitlist-btn"
            variant="secondary"
            style={{ fontSize: '0.9375rem', padding: '13px 28px' }}
            onClick={handleReserve}
          >
            Join waitlist
          </Button>
          <p className="waitlist-note" style={{ maxWidth: 440 }}>
            All copies are currently on loan. Join the waitlist to receive the next available copy.
          </p>
        </div>
      )}
    </div>
  )
}

/* ── "More like this" ─────────────────────────────────────── */

function RelatedBooks({ currentBook, allBooks }) {
  const related = allBooks
    .filter(b => b.accession !== currentBook.accession && !b.retired && b.category === currentBook.category)
    .slice(0, 4)

  const extra = related.length < 4
    ? allBooks.filter(b => b.accession !== currentBook.accession && !b.retired && !related.find(r => r.accession === b.accession)).slice(0, 4 - related.length)
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
            {currentBook.category} titles you may enjoy
          </h2>
        </div>
        <div className="detail-related-grid">
          {cards.map(b => (
            <CatalogCard
              key={b.accession || b.id}
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
  const { books } = useLibraryStore()
  const book = books.find(b => b.accession === accession)

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
          <ActionArea book={book} />
        </div>
      </div>

      {/* ── More like this ── */}
      <RelatedBooks currentBook={book} allBooks={books} />
    </div>
  )
}
