import React, { useState } from 'react'
import { DueDatePocket } from './DueDatePocket'
import { SPINE, coverGridUrl } from '../data/books'

function AvailBadge({ available }) {
  return (
    <div className="avail-badge" role="status" aria-label={available ? 'Available' : 'On Loan'}>
      <span className={`avail-dot ${available ? 'avail-dot--yes' : 'avail-dot--no'}`} />
      <span className={`avail-label ${available ? 'avail-label--yes' : 'avail-label--no'}`}>
        {available ? 'Available' : 'On Loan'}
      </span>
    </div>
  )
}

export function CatalogCard({ book, onClick }) {
  const spineColor        = SPINE[book.category] || '#2B2620'
  const [imgFailed, setImgFailed] = useState(false)
  const src     = coverGridUrl(book)
  const showImg = src && !imgFailed

  return (
    <article
      className="catalog-card"
      aria-label={`${book.title} by ${book.author}`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/*
       * .catalog-card__cover  — position:relative, overflow:visible
       *   ├─ .catalog-card__cover-img  — position:absolute inset:0,
       *   │   overflow:hidden, border-radius inherited
       *   │   (clips the <img> without clipping the pocket)
       *   ├─ fallback title (position:absolute, inset:0)
       *   └─ DueDatePocket (position:absolute, bottom:-1px right:14px)
       *       peeks below because the cover itself is overflow:visible
       */}
      <div
        className="catalog-card__cover"
        style={{ backgroundColor: spineColor }}
      >
        {/* Inner clip wrapper — clips the image but NOT the pocket */}
        <div className="catalog-card__cover-img">
          {showImg ? (
            <img
              src={src}
              alt={`Cover of ${book.title}`}
              onError={() => setImgFailed(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block',
              }}
            />
          ) : (
            /* Fallback: dark-box with centred title text */
            <div className="catalog-card__cover-title">
              <span>{book.title}</span>
            </div>
          )}
        </div>

        {/* Pocket is a sibling of the clip wrapper — never clipped */}
        <DueDatePocket accession={book.accession} />
      </div>

      {/* ── Text body ── */}
      <div className="catalog-card__body">
        <h3 className="catalog-card__title">{book.title}</h3>
        <p className="catalog-card__author">{book.author}</p>
        <AvailBadge available={book.available} />
        <p className="catalog-card__accession">{book.accession} &middot; {book.format}</p>
      </div>
    </article>
  )
}
