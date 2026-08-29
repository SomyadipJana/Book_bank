import React from 'react'
import { Tag } from './Tag'
import { Button } from './Button'
import { DueDatePocket } from './DueDatePocket'

/**
 * Card
 *
 * Book card with:
 *   - Stylised spine-colour "cover" area (no photography, no gradients)
 *   - Title (Fraunces), author (Inter), genre Tag
 *   - Due-Date Pocket motif peeking from bottom-right of cover
 *   - Elevation via 1px ink-15 border
 *   - 4px border-radius
 *   - No drop shadow
 *
 * Props:
 *   book: { id, title, author, accession, genre, status, spine }
 *     spine — a hex colour used as the cover background
 *     status — "Available" | "On Loan" | "Reserved"
 */

const statusVariantMap = {
  'Available': 'available',
  'On Loan':   'on-loan',
  'Reserved':  'reserved',
}

export function Card({ book }) {
  const [hovered, setHovered] = React.useState(false)

  const {
    title = 'Untitled',
    author = '',
    accession = 'BB-0000',
    genre = '',
    status = 'Available',
    spine = '#1E3D32',
  } = book

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-card)',
        border: `1px solid rgba(30,61,50,${hovered ? '0.28' : '0.15'})`,
        backgroundColor: 'var(--color-paper)',
        overflow: 'visible',
        transition: 'border-color 140ms ease',
        cursor: 'pointer',
      }}
      aria-label={`Book: ${title}`}
    >
      {/* ── Cover area ─────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          height: '180px',
          backgroundColor: spine,
          borderRadius: '4px 4px 0 0',
          overflow: 'visible',

          /* Subtle texture via repeating pattern — no gradients */
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(0,0,0,0.04) 0px,
              rgba(0,0,0,0.04) 1px,
              transparent 1px,
              transparent 10px
            )
          `,
        }}
      >
        {/* Spine title — vertical, Fraunces */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            textAlign: 'center',
          }}
        >
          <p
            className="font-display tracking-display"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'rgba(250,247,240,0.85)',
              lineHeight: 1.25,
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </p>
        </div>

        {/* Due-date pocket — peeking from bottom-right */}
        <DueDatePocket accession={accession} />
      </div>

      {/* ── Card body ──────────────────────────────── */}
      <div
        style={{
          padding: '14px 16px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flex: 1,
          borderTop: '1px solid rgba(30,61,50,0.10)',
        }}
      >
        {/* Title */}
        <div>
          <h2
            className="font-display"
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-ink)',
              lineHeight: 1.25,
              marginBottom: '3px',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              color: 'var(--color-charcoal-60)',
              lineHeight: 1.4,
            }}
          >
            {author}
          </p>
        </div>

        {/* Tags row */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {genre && <Tag>{genre}</Tag>}
          <Tag variant={statusVariantMap[status] ?? 'available'}>{status}</Tag>
        </div>

        {/* Accession meta */}
        <p
          className="mono-label"
          style={{ color: 'var(--color-charcoal-60)', marginTop: 'auto' }}
        >
          {accession}
        </p>

        {/* Action */}
        <Button
          variant={status === 'Available' ? 'primary' : 'secondary'}
          style={{ width: '100%', marginTop: '2px' }}
        >
          {status === 'Available' ? 'Request Issue' : 'View Details'}
        </Button>
      </div>
    </article>
  )
}
