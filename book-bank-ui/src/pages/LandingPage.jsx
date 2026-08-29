import React, { useState } from 'react'
import { Button } from '../components/Button'
import { DueDatePocket } from '../components/DueDatePocket'

/* ── Data ────────────────────────────────────────────────── */

const FAN_BOOKS = [
  { accession: 'BB-0042', spine: '#2D5A45', rotate: -6, z: 1, left: '10%' },
  { accession: 'BB-0117', spine: '#5C3020', rotate: -3, z: 2, left: '22%' },
  { accession: 'BB-0205', spine: '#1E3D5C', rotate:  0, z: 3, left: '34%' },
  { accession: 'BB-0331', spine: '#4A3B2A', rotate:  3, z: 2, left: '46%' },
  { accession: 'BB-0408', spine: '#3B2D4A', rotate:  6, z: 1, left: '58%' },
]

const STATS = [
  { eyebrow: 'Titles Available', number: '4,812', label: 'Books and magazines in active circulation' },
  { eyebrow: 'Active Members',   number: '1,390', label: 'Students and faculty with open accounts' },
  { eyebrow: 'Return Rate',      number: '96%',   label: 'Books returned on or before the due date' },
]

const ARRIVALS = [
  /* ── Original 6 ── */
  {
    accession: 'BB-0501', available: true,
    spine: '#2A4A3E',
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn13: '9780735211292',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg?default=false',
  },
  {
    accession: 'BB-0502', available: false,
    spine: '#4A3B1A',
    title: 'The Pragmatic Programmer',
    author: 'Hunt & Thomas',
    isbn13: '9780135957059',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780135957059-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780135957059-L.jpg?default=false',
  },
  {
    accession: 'BB-0503', available: true,
    spine: '#1E3A5C',
    title: 'Deep Work',
    author: 'Cal Newport',
    isbn13: '9781455586691',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9781455586691-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg?default=false',
  },
  {
    accession: 'BB-0504', available: true,
    spine: '#3B1A1A',
    title: 'Structure and Interpretation',
    author: 'Abelson & Sussman',
    isbn13: '9780262510875',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780262510875-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780262510875-L.jpg?default=false',
  },
  {
    accession: 'BB-0505', available: false,
    spine: '#2E3B2A',
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    isbn13: '9780062316097',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780062316097-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg?default=false',
  },
  {
    accession: 'BB-0506', available: true,
    spine: '#3A2A4A',
    title: 'The Lean Startup',
    author: 'Eric Ries',
    isbn13: '9780307887894',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780307887894-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg?default=false',
  },

  /* ── New 9 — genre-diverse additions ── */
  {
    accession: 'BB-0507', available: true,
    spine: '#3B1F2B',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn13: '9780061122415',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780061122415-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg?default=false',
  },
  {
    accession: 'BB-0508', available: false,
    spine: '#2B1A1A',
    title: '1984',
    author: 'George Orwell',
    isbn13: '9780451524935',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780451524935-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg?default=false',
  },
  {
    accession: 'BB-0509', available: true,
    spine: '#2A3B2A',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn13: '9780061935466',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780061935466-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780061935466-L.jpg?default=false',
  },
  {
    accession: 'BB-0510', available: true,
    spine: '#4A1E2A',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn13: '9780141439518',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780141439518-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg?default=false',
  },
  {
    accession: 'BB-0511', available: false,
    spine: '#3B1A2A',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    isbn13: '9780141345642',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780141345642-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780141345642-L.jpg?default=false',
  },
  {
    accession: 'BB-0512', available: true,
    spine: '#2E2820',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn13: '9780521402309',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780521402309-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780521402309-L.jpg?default=false',
  },
  {
    accession: 'BB-0513', available: true,
    spine: '#2E2A24',
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    isbn13: '9781451648546',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9781451648546-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9781451648546-L.jpg?default=false',
  },
  /* Clean Code and CLRS also appear in the main catalogue — reuse their accessions */
  {
    accession: 'BB-0006', available: false,
    spine: '#1E3D32',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn13: '9780132350884',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780132350884-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg?default=false',
  },
  {
    accession: 'BB-0001', available: true,
    spine: '#18294A',
    title: 'Introduction to Algorithms',
    author: 'Cormen, Leiserson, Rivest, Stein',
    isbn13: '9780262046305',
    coverGrid:  'https://covers.openlibrary.org/b/isbn/9780262046305-M.jpg?default=false',
    coverLarge: 'https://covers.openlibrary.org/b/isbn/9780262046305-L.jpg?default=false',
  },
]

const STEPS = [
  {
    title: 'Search the catalogue',
    body:  `Browse by title, author, subject, or accession number. Filter by department, language, or availability. Every copy's current status is shown in real time.`,
  },
  {
    title: 'Reserve or request',
    body:  `Found your book? Request an issue directly. If every copy is on loan, place a reservation — you'll receive an in-app notification the moment it's returned.`,
  },
  {
    title: 'Pick up from the library',
    body:  `Visit the Book Bank counter with your student ID. The librarian issues the book against your account. Your due date is stamped on your dashboard.`,
  },
]


/* ── Sub-components ──────────────────────────────────────── */

function Nav() {
  return (
    <nav className="nav">
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

      <ul className="nav__links">
        {[
          { label: 'Catalogue',    href: '#catalog' },
          { label: 'My Loans',     href: '#loans' },
          { label: 'Reservations', href: '#reservations' },
          { label: 'About',        href: '#' },
        ].map((l) => (
          <li key={l.label}><a href={l.href} className="nav__link">{l.label}</a></li>
        ))}
      </ul>

      <Button
        variant="primary"
        style={{ fontSize: '0.8125rem', padding: '9px 18px' }}
        onClick={() => { window.location.hash = '#login' }}
      >
        Sign In
      </Button>
    </nav>
  )
}

function BookCoverFan() {
  return (
    <div className="hero__fan">
      {FAN_BOOKS.map((book) => (
        <div
          key={book.accession}
          className="book-cover"
          style={{
            backgroundColor: book.spine,
            transform: `rotate(${book.rotate}deg)`,
            zIndex: book.z,
            left: book.left,
            /* Line texture — no gradients */
            backgroundImage: `repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0.05) 0px,
              rgba(0,0,0,0.05) 1px,
              transparent 1px,
              transparent 12px
            )`,
          }}
        >
          {/* Spine label */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '12px 8px',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.45rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(250,247,240,0.5)',
              writingMode: 'vertical-rl',
              textOrientation: 'mixed',
              transform: 'rotate(180deg)',
            }}>
              {book.accession}
            </span>
          </div>
          <DueDatePocket accession={book.accession} />
        </div>
      ))}
    </div>
  )
}

function Hero() {
  return (
    <section style={{ borderBottom: 'var(--border-elevation)' }}>
      <div className="hero">
        {/* Content */}
        <div className="hero__content">
          <span className="section-eyebrow">Book Bank — Student Library</span>

          <h1
            className="font-display tracking-display"
            style={{ fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', fontWeight: 700, color: 'var(--color-ink)', lineHeight: 1.05, marginBottom: '20px' }}
          >
            Read widely.<br />Return kindly.
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '1rem',
            color: 'var(--color-charcoal-60)',
            lineHeight: 1.65,
            maxWidth: '440px',
            marginBottom: '36px',
          }}>
            Search over 4,800 titles, reserve what's on loan, and pick up from
            the library counter — all from one account.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <Button variant="primary" style={{ fontSize: '0.9375rem', padding: '12px 28px' }}>
              Browse the catalogue
            </Button>
            <a href="#how" className="text-link">How Book Bank works</a>
          </div>
        </div>

        {/* Book fan */}
        <BookCoverFan />
      </div>
    </section>
  )
}

function StatsStrip() {
  return (
    <section className="stats-strip">
      <div className="stats-strip__inner">
        {STATS.map((s) => (
          <div key={s.eyebrow} className="stat">
            <span className="stat__eyebrow">{s.eyebrow}</span>
            <span className="stat__number">{s.number}</span>
            <span className="stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function ArrivalCard({ book }) {
  const [imgFailed, setImgFailed] = useState(false)
  const showImg = book.coverGrid && !imgFailed

  return (
    <article className="arrival-card">
      <div
        className="arrival-card__cover"
        style={{ backgroundColor: book.spine }}
      >
        {showImg ? (
          /* Real cover image — fills the fixed-ratio cover box */
          <img
            src={book.coverGrid}
            alt={`Cover of ${book.title}`}
            onError={() => setImgFailed(true)}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
              display: 'block',
            }}
          />
        ) : (
          /* Fallback: lined spine texture + centred Fraunces title */
          <>
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `repeating-linear-gradient(
                0deg,
                rgba(0,0,0,0.04) 0px, rgba(0,0,0,0.04) 1px,
                transparent 1px, transparent 10px
              )`,
            }} />
            <div style={{
              position: 'absolute', inset: '12px 8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.7rem',
                fontWeight: 600,
                color: 'rgba(250,247,240,0.8)',
                lineHeight: 1.3,
                textAlign: 'center',
                letterSpacing: '-0.01em',
              }}>
                {book.title}
              </p>
            </div>
          </>
        )}
        <DueDatePocket accession={book.accession} />
      </div>

      <div className="arrival-card__meta">
        <p className="arrival-card__title">{book.title}</p>
        <p className="arrival-card__author">{book.author}</p>
        <div className="arrival-card__status">
          <span
            className={`status-dot ${book.available ? 'status-dot--available' : 'status-dot--on-loan'}`}
          />
          <span
            className="arrival-card__status-label"
            style={{ color: book.available ? 'var(--color-ochre)' : 'var(--color-oxblood)' }}
          >
            {book.available ? 'Available' : 'On Loan'}
          </span>
        </div>
      </div>
    </article>
  )
}

function NewArrivals() {
  return (
    <section style={{ borderBottom: 'var(--border-elevation)' }}>
      <div className="arrivals">
        <span className="section-eyebrow">New Arrivals</span>
        <h2
          className="section-title"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '32px' }}
        >
          Just added to the collection
        </h2>

        <div className="arrivals__scroll">
          {ARRIVALS.map((book) => (
            <ArrivalCard key={book.accession} book={book} />
          ))}
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="how" id="how">
      <div className="how__inner">
        <span className="section-eyebrow">Process</span>
        <h2
          className="section-title"
          style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '8px' }}
        >
          How Book Bank works
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.9375rem',
          color: 'var(--color-charcoal-60)',
          marginBottom: '40px',
          lineHeight: 1.6,
        }}>
          Three steps from title search to book in hand.
        </p>

        <ol className="how__steps">
          {STEPS.map((step, i) => (
            <li key={step.title} className="how__step">
              <span className="how__step-number">0{i + 1}</span>
              <div>
                <p className="how__step-title">{step.title}</p>
                <p className="how__step-body">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <span
            className="font-display"
            style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-paper)', letterSpacing: '-0.02em' }}
          >
            Book Bank
          </span>
          <p className="footer__tagline">
            The student book lending system for our campus library.
          </p>
        </div>

        {/* Links */}
        <nav className="footer__nav" aria-label="Footer navigation">
          <div className="footer__nav-group">
            <span className="footer__nav-heading">Library</span>
            <a href="#catalog" className="footer__nav-link">Browse Catalogue</a>
            <a href="#" className="footer__nav-link">New Arrivals</a>
            <a href="#" className="footer__nav-link">Reservations</a>
          </div>
          <div className="footer__nav-group">
            <span className="footer__nav-heading">Account</span>
            <a href="#" className="footer__nav-link">Sign In</a>
            <a href="#" className="footer__nav-link">Register</a>
            <a href="#" className="footer__nav-link">My Loans</a>
          </div>
          <div className="footer__nav-group">
            <span className="footer__nav-heading">Information</span>
            <a href="#" className="footer__nav-link">Library Hours</a>
            <a href="#" className="footer__nav-link">Fine Policy</a>
            <a href="#" className="footer__nav-link">Contact</a>
          </div>
        </nav>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: '1200px', margin: '36px auto 0' }}>
        <div className="footer__bottom">
          <p className="footer__copy">
            &copy; {year} Book Bank Management System. Software Engineering Lab Project.
          </p>
        </div>
      </div>
    </footer>
  )
}

/* ── Page ────────────────────────────────────────────────── */

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: 'var(--color-paper)' }}>
      <Nav />
      <Hero />
      <StatsStrip />
      <NewArrivals />
      <HowItWorks />
      <Footer />
    </div>
  )
}
