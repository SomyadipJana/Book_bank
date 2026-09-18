/**
 * AdminCatalogue.jsx
 * Searchable/sortable book table with edit/retire actions.
 * "+ Add Book" opens a slide-over form panel.
 */
import React, { useState, useMemo } from 'react'
import { ALL_BOOKS, CATEGORIES, coverGridUrl } from '../../data/books'
import { Button } from '../../components'
import { Tag } from '../../components'

/* ── Tiny cover thumbnail ── */
function MiniCover({ book }) {
  const [errored, setErrored] = useState(false)
  const url = coverGridUrl(book)
  const spineColor = book.spineColor || book.spine || '#1E3D32'

  if (!url || errored) {
    return (
      <div style={{
        width: 28, height: 40, borderRadius: 2, backgroundColor: spineColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: 'rgba(250,247,240,0.7)', fontSize: 8, textAlign: 'center', padding: '0 2px', lineHeight: 1.2, fontFamily: 'var(--font-display)' }}>
          {book.title?.slice(0, 4)}
        </span>
      </div>
    )
  }
  return (
    <img
      src={url}
      alt={book.title}
      onError={() => setErrored(true)}
      style={{ width: 28, height: 40, objectFit: 'cover', borderRadius: 2, flexShrink: 0 }}
    />
  )
}

/* ── Add / Edit Book slide-over ── */
function BookSlideOver({ book, onClose, onSave }) {
  const isEdit = !!book
  const [form, setForm] = useState({
    title: book?.title || '',
    author: book?.author || '',
    category: book?.category || CATEGORIES[0],
    accession: book?.accession || '',
    isbn: book?.isbn || '',
    publisher: book?.publisher || '',
    totalCopies: book?.totalCopies ?? 1,
    availableCopies: book?.availableCopies ?? 1,
    format: book?.format || 'Book',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...form, totalCopies: +form.totalCopies, availableCopies: +form.availableCopies })
  }

  const fieldStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 10px',
    border: '1px solid rgba(30,61,50,0.18)',
    borderRadius: 4,
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--color-charcoal)',
    backgroundColor: '#fff',
    outline: 'none',
  }
  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-charcoal-60)',
    marginBottom: 5,
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(30,61,50,0.3)',
          zIndex: 200,
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 440,
        backgroundColor: 'var(--color-paper)',
        borderLeft: '1px solid rgba(30,61,50,0.15)',
        zIndex: 201,
        overflowY: 'auto',
        padding: '32px 28px',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column', gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0 }}>
            {isEdit ? 'Edit Book' : 'Add New Book'}
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-charcoal-60)', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { label: 'Title',         key: 'title',      type: 'text', required: true },
            { label: 'Author(s)',      key: 'author',     type: 'text', required: true },
            { label: 'Accession No.', key: 'accession',  type: 'text', required: true },
            { label: 'ISBN',          key: 'isbn',       type: 'text' },
            { label: 'Publisher',     key: 'publisher',  type: 'text' },
          ].map(({ label, key, type, required }) => (
            <div key={key}>
              <label style={labelStyle}>{label}{required && ' *'}</label>
              <input
                style={fieldStyle}
                type={type}
                required={required}
                value={form[key]}
                onChange={e => set(key, e.target.value)}
              />
            </div>
          ))}

          <div>
            <label style={labelStyle}>Category *</label>
            <select style={{ ...fieldStyle }} value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Format</label>
            <select style={{ ...fieldStyle }} value={form.format} onChange={e => set('format', e.target.value)}>
              {['Book', 'Magazine', 'Reference'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Total Copies *</label>
              <input style={fieldStyle} type="number" min={1} required value={form.totalCopies} onChange={e => set('totalCopies', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Available *</label>
              <input style={fieldStyle} type="number" min={0} required value={form.availableCopies} onChange={e => set('availableCopies', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button type="submit" variant="ochre" style={{ flex: 1 }}>
              {isEdit ? 'Save Changes' : 'Add Book'}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}

/* ── Main Catalogue view ── */
export default function AdminCatalogue({ onAction, externalSlideOver, onCloseExternalSlideOver }) {
  const [search, setSearch]       = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [sortKey, setSortKey]     = useState('accession')
  const [sortDir, setSortDir]     = useState('asc')
  const [slideOver, setSlideOver] = useState(null) // null | 'add' | book object
  const [retired, setRetired]     = useState(new Set())

  // Sync external trigger (header "+Add Book" button) with internal slide-over
  React.useEffect(() => {
    if (externalSlideOver === 'add') { setSlideOver('add') }
  }, [externalSlideOver])

  const handleSlideOverClose = () => {
    setSlideOver(null)
    if (onCloseExternalSlideOver) onCloseExternalSlideOver()
  }


  const COLS = [
    { key: 'accession', label: 'Acc. No.' },
    { key: 'title',     label: 'Title / Author' },
    { key: 'category',  label: 'Category' },
    { key: 'totalCopies',     label: 'Copies' },
    { key: 'availableCopies', label: 'Avail.' },
    { key: 'status',    label: 'Status' },
  ]

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return ALL_BOOKS
      .filter(b => !retired.has(b.accession))
      .filter(b => catFilter === 'All' || b.category === catFilter)
      .filter(b =>
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.accession?.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let av = a[sortKey] ?? '', bv = b[sortKey] ?? ''
        if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
        av = String(av).toLowerCase(); bv = String(bv).toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
  }, [search, catFilter, sortKey, sortDir, retired])

  const SortIndicator = ({ k }) => {
    if (sortKey !== k) return <span style={{ opacity: 0.3 }}> ⇅</span>
    return <span style={{ color: 'var(--color-ochre)' }}> {sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const statusTag = (b) => {
    const avail = b.availableCopies ?? (b.available ? 1 : 0)
    if (avail === 0) return <span className="admin-badge admin-badge--loan">On Loan</span>
    return <span className="admin-badge admin-badge--avail">Available</span>
  }

  return (
    <div>
      {/* Search + filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="admin-search"
          type="search"
          placeholder="Search title, author, accession, ISBN…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: 200 }}
        />
        <select
          className="admin-select"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-charcoal-60)', whiteSpace: 'nowrap' }}>
          {filtered.length} results
        </span>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 36 }}></th>
              {COLS.map(c => (
                <th
                  key={c.key}
                  onClick={() => handleSort(c.key)}
                  style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                >
                  {c.label}<SortIndicator k={c.key} />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 150).map(book => (
              <tr key={book.accession}>
                <td style={{ padding: '4px 6px' }}>
                  <MiniCover book={book} />
                </td>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--color-charcoal)', lineHeight: 1.3 }}>{book.title}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-charcoal-60)', marginTop: 1 }}>{book.author}</div>
                </td>
                <td>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                    backgroundColor: 'rgba(30,61,50,0.07)', padding: '2px 6px', borderRadius: 3,
                  }}>
                    {book.category}
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{book.totalCopies ?? 1}</td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <span style={{ color: (book.availableCopies ?? (book.available ? 1 : 0)) === 0 ? 'var(--color-oxblood)' : 'var(--color-ink)' }}>
                    {book.availableCopies ?? (book.available ? 1 : 0)}
                  </span>
                </td>
                <td>{statusTag(book)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="admin-action-btn"
                      onClick={() => setSlideOver(book)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-action-btn admin-action-btn--danger"
                      onClick={() => {
                        if (window.confirm(`Retire "${book.title}"? This removes it from the active catalogue.`)) {
                          setRetired(s => new Set([...s, book.accession]))
                        }
                      }}
                    >
                      Retire
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-charcoal-60)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
            No books match your search.
          </div>
        )}
      </div>

      {/* Slide-over */}
      {slideOver !== null && (
        <BookSlideOver
          book={slideOver === 'add' ? null : slideOver}
          onClose={handleSlideOverClose}
          onSave={(data) => {
            alert(`Book "${data.title}" ${slideOver === 'add' ? 'added' : 'updated'} (mock — real backend not yet connected).`)
            handleSlideOverClose()
          }}
        />
      )}
    </div>
  )
}

// Exported action handler for the header "+ Add Book" button
export function openAddBook(setSlideOver) {
  setSlideOver('add')
}
