import React, { useState } from 'react'
import { DueDatePocket } from './DueDatePocket'
import { SPINE, coverUrl } from '../data/books'

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

/* ── Cover — real image with colored-box fallback ─────────── */
function BookCover({ book }) {
  const spineColor = SPINE[book.category] || '#2B2620'
  const [imgFailed, setImgFailed] = useState(false)

  const showImg = book.isbn && !imgFailed

  return (
    <div
      className="catalog-card__cover"
      style={{ backgroundColor: spineColor, position: 'relative' }}
    >
      {showImg ? (
        <img
          src={coverUrl(book.isbn)}
          alt={`Cover of ${book.title}`}
          onError={() => setImgFailed(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            borderRadius: '4px 4px 0 0',
            display: 'block',
          }}
        />
      ) : (
        /* Fallback: original dark-box-with-title style */
        <div className="catalog-card__cover-title">
          <span>{book.title}</span>
        </div>
      )}
      <DueDatePocket accession={book.accession} />
    </div>
  )
}

export function CatalogCard({ book, onClick }) {
  return (
    <article
      className="catalog-card"
      aria-label={`${book.title} by ${book.author}`}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick?.() }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <BookCover book={book} />

      <div className="catalog-card__body">
        <h3 className="catalog-card__title">{book.title}</h3>
        <p className="catalog-card__author">{book.author}</p>
        <AvailBadge available={book.available} />
        <p className="catalog-card__accession">{book.accession} &middot; {book.format}</p>
      </div>
    </article>
  )
}
