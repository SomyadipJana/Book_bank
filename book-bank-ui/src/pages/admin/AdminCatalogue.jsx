/**
 * AdminCatalogue.jsx
 * Full book catalogue management:
 * - 5-status system (Available, On Loan, Reserved, Overdue, Retired)
 * - Status & Category filtering + Search & Sort
 * - BookSlideOver with Google Books search-assist & cover drag-drop upload
 * - Connected to shared AdminStore
 */
import React, { useState, useMemo, useRef } from 'react'
import { CATEGORIES, coverGridUrl } from '../../data/books'
import { useAdminStore } from '../../data/adminStore.jsx'
import { Button } from '../../components'

/* ── Tiny cover thumbnail ── */
function MiniCover({ book }) {
  const [errored, setErrored] = useState(false)
  const url = book.uploadedCover || coverGridUrl(book)
  const spineColor = book.spineColor || book.spine || '#1E3D32'

  if (!url || errored) {
    return (
      <div
        style={{
          width: 28,
          height: 40,
          borderRadius: 2,
          backgroundColor: spineColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: 'rgba(250,247,240,0.7)',
            fontSize: 8,
            textAlign: 'center',
            padding: '0 2px',
            lineHeight: 1.2,
            fontFamily: 'var(--font-display)',
          }}
        >
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

/* ── 5-Status Badge ── */
function StatusBadge({ status }) {
  let dotClass = 'admin-status-dot--available'
  let badgeClass = 'admin-badge--avail'
  const label = status || 'Available'

  switch (label) {
    case 'On Loan':
      dotClass = 'admin-status-dot--loan'
      badgeClass = 'admin-badge--loan'
      break
    case 'Reserved':
      dotClass = 'admin-status-dot--reserved'
      badgeClass = 'admin-badge--reserved'
      break
    case 'Overdue':
      dotClass = 'admin-status-dot--overdue'
      badgeClass = 'admin-badge--overdue'
      break
    case 'Retired':
      dotClass = 'admin-status-dot--retired'
      badgeClass = 'admin-badge--muted'
      break
    default:
      dotClass = 'admin-status-dot--available'
      badgeClass = 'admin-badge--avail'
      break
  }

  return (
    <span className={`admin-badge ${badgeClass}`}>
      <span className={`admin-status-dot ${dotClass}`} />
      {label}
    </span>
  )
}

/* ── Add / Edit Book slide-over with Google Books assist & Cover Upload ── */
function BookSlideOver({ book, onClose }) {
  const { addBook, updateBook, uploadCover } = useAdminStore()
  const isEdit = !!book

  const [form, setForm] = useState({
    title: book?.title || '',
    author: book?.author || '',
    category: book?.category || CATEGORIES[0],
    accession: book?.accession || `BB-${String(Math.floor(1000 + Math.random() * 9000))}`,
    isbn: book?.isbn || book?.isbn13 || '',
    publisher: book?.publisher || '',
    edition: book?.edition || '',
    totalCopies: book?.totalCopies ?? 1,
    availableCopies: book?.availableCopies ?? 1,
    format: book?.format || 'Book',
    description: book?.description || '',
    bookStatus: book?.bookStatus || 'Available',
  })

  // Cover image state
  const [coverDataUrl, setCoverDataUrl] = useState(book?.uploadedCover || book?.coverLarge || book?.coverGrid || null)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // Google Books search assist state
  const [gbQuery, setGbQuery] = useState('')
  const [gbLoading, setGbLoading] = useState(false)
  const [gbResults, setGbResults] = useState([])
  const [gbError, setGbError] = useState(null)

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Google Books Search
  const searchGoogleBooks = async (e) => {
    if (e) e.preventDefault()
    if (!gbQuery.trim()) return
    setGbLoading(true)
    setGbError(null)
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(gbQuery)}&maxResults=5`)
      if (!res.ok) throw new Error('API request failed')
      const data = await res.json()
      const items = data.items || []
      setGbResults(items)
      if (items.length === 0) {
        setGbError('No matching books found on Google Books.')
      }
    } catch (err) {
      setGbError('Could not query Google Books. Check your connection or search manually.')
    } finally {
      setGbLoading(false)
    }
  }

  // Populate form from Google Books result
  const handleSelectGoogleBook = (item) => {
    const info = item.volumeInfo || {}
    const isbns = info.industryIdentifiers || []
    const isbn13 = isbns.find(id => id.type === 'ISBN_13')?.identifier
    const isbnFallback = isbns[0]?.identifier || ''
    const isbn = isbn13 || isbnFallback

    const img = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null
    if (img) {
      // Upgrade http to https
      setCoverDataUrl(img.replace('http://', 'https://'))
    }

    setForm(f => ({
      ...f,
      title: info.title || f.title,
      author: info.authors ? info.authors.join(', ') : f.author,
      publisher: info.publisher || f.publisher,
      isbn: isbn || f.isbn,
      edition: info.publishedDate ? `${info.publishedDate.slice(0, 4)} Edition` : f.edition,
      description: info.description ? info.description.slice(0, 500) : f.description,
    }))
    setGbResults([])
    setGbQuery('')
  }

  // File drop / upload handler
  const handleFile = (file) => {
    if (!file) return
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      alert('Please upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Cover image exceeds 2MB limit.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      // Store as data URL with comment:
      // TODO: replace with multipart upload to backend endpoint
      setCoverDataUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    if (e.dataTransfer?.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      totalCopies: Math.max(1, Number(form.totalCopies) || 1),
      availableCopies: Math.max(0, Number(form.availableCopies) || 0),
    }

    if (isEdit) {
      updateBook(book.accession, payload)
      if (coverDataUrl) {
        // TODO: replace with multipart upload to backend endpoint
        uploadCover(book.accession, coverDataUrl)
      }
    } else {
      addBook({
        ...payload,
        coverGrid: coverDataUrl,
        coverLarge: coverDataUrl,
        uploadedCover: coverDataUrl,
      })
      if (coverDataUrl) {
        // TODO: replace with multipart upload to backend endpoint
        uploadCover(payload.accession, coverDataUrl)
      }
    }
    onClose()
  }

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
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
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(30,61,50,0.3)',
          zIndex: 200,
        }}
      />
      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          maxWidth: '92vw',
          backgroundColor: 'var(--color-paper)',
          borderLeft: '1px solid rgba(30,61,50,0.15)',
          zIndex: 201,
          overflowY: 'auto',
          padding: '32px 28px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--color-charcoal)',
                margin: 0,
              }}
            >
              {isEdit ? 'Edit Book' : 'Add New Book'}
            </h2>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-charcoal-60)' }}>
              {isEdit ? `Accession: ${book.accession}` : 'Catalogue Entry'}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: 'var(--color-charcoal-60)',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Google Books Search Assist Box ── */}
        <div
          style={{
            padding: 14,
            backgroundColor: 'rgba(30,61,50,0.04)',
            border: '1px solid rgba(30,61,50,0.12)',
            borderRadius: 4,
          }}
        >
          <label style={{ ...labelStyle, color: 'var(--color-ink)', fontWeight: 600 }}>
            Google Books Auto-Fill Assist
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <input
              type="text"
              style={{ ...fieldStyle, flex: 1 }}
              placeholder="Search title, ISBN, or author…"
              value={gbQuery}
              onChange={e => setGbQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  searchGoogleBooks()
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={searchGoogleBooks}
              disabled={gbLoading}
              style={{ fontSize: '0.75rem', padding: '6px 12px', whiteSpace: 'nowrap' }}
            >
              {gbLoading ? 'Searching…' : 'Find Book'}
            </Button>
          </div>

          {gbError && (
            <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--color-oxblood)', fontFamily: 'var(--font-mono)' }}>
              {gbError}
            </div>
          )}

          {/* Results list */}
          {gbResults.length > 0 && (
            <div
              style={{
                marginTop: 10,
                maxHeight: 180,
                overflowY: 'auto',
                backgroundColor: '#fff',
                border: '1px solid rgba(30,61,50,0.15)',
                borderRadius: 4,
              }}
            >
              {gbResults.map(item => {
                const info = item.volumeInfo || {}
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectGoogleBook(item)}
                    style={{
                      padding: '8px 10px',
                      cursor: 'pointer',
                      borderBottom: '1px solid rgba(30,61,50,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(30,61,50,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                  >
                    {info.imageLinks?.smallThumbnail && (
                      <img
                        src={info.imageLinks.smallThumbnail.replace('http://', 'https://')}
                        alt=""
                        style={{ width: 24, height: 34, objectFit: 'cover', borderRadius: 2 }}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {info.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-charcoal-60)' }}>
                        {info.authors?.join(', ') || 'Unknown Author'} · {info.publishedDate?.slice(0, 4) || '—'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Cover Upload Area ── */}
        <div>
          <label style={labelStyle}>Cover Image (Drag & Drop or Click — Max 2MB)</label>
          <div
            className={`cover-upload-zone${isDragOver ? ' drag-over' : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={e => {
                if (e.target.files?.[0]) handleFile(e.target.files[0])
              }}
            />

            {coverDataUrl ? (
              <div>
                <img src={coverDataUrl} alt="Cover preview" className="cover-preview" />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-ink)' }}>
                  Click or drag to replace cover
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCoverDataUrl(null)
                  }}
                  style={{
                    marginTop: 6,
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-oxblood)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Remove Cover
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '1.5rem', marginBottom: 6, opacity: 0.6 }}>📷</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-charcoal)' }}>
                  Drop book cover here, or click to browse
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-charcoal-60)', marginTop: 4 }}>
                  Supports JPG, PNG, WebP (2:3 aspect ratio recommended)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input
              style={fieldStyle}
              type="text"
              required
              value={form.title}
              onChange={e => setField('title', e.target.value)}
            />
          </div>

          <div>
            <label style={labelStyle}>Author(s) *</label>
            <input
              style={fieldStyle}
              type="text"
              required
              value={form.author}
              onChange={e => setField('author', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Accession No. *</label>
              <input
                style={fieldStyle}
                type="text"
                required
                value={form.accession}
                onChange={e => setField('accession', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>ISBN</label>
              <input
                style={fieldStyle}
                type="text"
                value={form.isbn}
                onChange={e => setField('isbn', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Publisher</label>
              <input
                style={fieldStyle}
                type="text"
                value={form.publisher}
                onChange={e => setField('publisher', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Edition</label>
              <input
                style={fieldStyle}
                type="text"
                placeholder="e.g. 2nd Edition"
                value={form.edition}
                onChange={e => setField('edition', e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select
                style={fieldStyle}
                value={form.category}
                onChange={e => setField('category', e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Status *</label>
              <select
                style={fieldStyle}
                value={form.bookStatus}
                onChange={e => setField('bookStatus', e.target.value)}
              >
                <option value="Available">Available</option>
                <option value="On Loan">On Loan</option>
                <option value="Reserved">Reserved</option>
                <option value="Overdue">Overdue</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Total Copies *</label>
              <input
                style={fieldStyle}
                type="number"
                min={1}
                required
                value={form.totalCopies}
                onChange={e => setField('totalCopies', e.target.value)}
              />
            </div>
            <div>
              <label style={labelStyle}>Available Copies *</label>
              <input
                style={fieldStyle}
                type="number"
                min={0}
                required
                value={form.availableCopies}
                onChange={e => setField('availableCopies', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...fieldStyle, minHeight: 70, resize: 'vertical' }}
              rows={3}
              value={form.description}
              onChange={e => setField('description', e.target.value)}
            />
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

/* ── Google Books Direct Import Modal ── */
function GoogleBooksImportModal({ isOpen, onClose }) {
  const { addBook } = useAdminStore()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState([])
  const [importedSet, setImportedSet] = useState(new Set())
  const [error, setError] = useState(null)

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError(null)
    try {
      let items = []
      try {
        const localRes = await fetch(`http://127.0.0.1:8000/api/books/external-search?q=${encodeURIComponent(query)}`)
        if (localRes.ok) {
          const data = await localRes.json()
          items = data.map(v => ({
            id: v.isbn_13 || v.title,
            volumeInfo: {
              title: v.title,
              authors: v.authors,
              description: v.description,
              publisher: v.publisher,
              publishedDate: v.publishedDate,
              categories: v.categories,
              industryIdentifiers: v.isbn_13 ? [{ type: 'ISBN_13', identifier: v.isbn_13 }] : [],
              imageLinks: { thumbnail: v.thumbnail },
              pageCount: v.pageCount,
            }
          }))
        }
      } catch (err) {
        // Fallback to direct Google Books API
      }

      if (items.length === 0) {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`)
        if (!res.ok) throw new Error('Failed to query Google Books API')
        const data = await res.json()
        items = data.items || []
      }

      setResults(items)
      if (items.length === 0) {
        setError('No books found matching your query on Google Books.')
      }
    } catch (err) {
      setError('Could not connect to Google Books API. Please check your network.')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = (item) => {
    const info = item.volumeInfo || {}
    const isbns = info.industryIdentifiers || []
    const isbn13 = isbns.find(id => id.type === 'ISBN_13')?.identifier
    const isbnFallback = isbns[0]?.identifier || ''
    const isbn = isbn13 || isbnFallback

    const img = (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '')
      .replace('http://', 'https://')

    let category = 'Computer Science'
    const catRaw = (info.categories?.[0] || '').toLowerCase()
    if (catRaw.includes('algorithm')) category = 'Algorithms & DS'
    else if (catRaw.includes('engineer')) category = 'Engineering'
    else if (catRaw.includes('math')) category = 'Mathematics'
    else if (catRaw.includes('system') || catRaw.includes('operating')) category = 'Systems & OS'
    else if (catRaw.includes('network')) category = 'Networks'
    else if (catRaw.includes('fiction') || catRaw.includes('novel')) category = 'Fiction'
    else if (catRaw.includes('psychol')) category = 'Psychology'
    else if (catRaw.includes('management') || catRaw.includes('business')) category = 'Management'

    const newBook = {
      title: info.title || 'Untitled Book',
      author: info.authors ? info.authors.join(', ') : 'Unknown Author',
      publisher: info.publisher || 'Unknown Publisher',
      edition: info.publishedDate ? `${info.publishedDate.slice(0, 4)} Edition` : '1st Edition',
      category,
      isbn,
      totalCopies: 3,
      availableCopies: 3,
      description: info.description || '',
      coverGrid: img || null,
      coverLarge: img ? img.replace('zoom=1', 'zoom=0') : null,
      uploadedCover: img || null,
    }

    addBook(newBook)
    setImportedSet(prev => new Set([...prev, item.id || info.title]))
  }

  if (!isOpen) return null

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30,61,50,0.5)', backdropFilter: 'blur(2px)' }}
      />
      <div style={{
        position: 'relative',
        backgroundColor: 'var(--color-paper)',
        borderRadius: 8,
        width: 820,
        maxWidth: '92vw',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
        border: '1px solid rgba(30,61,50,0.2)',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(30,61,50,0.12)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', margin: 0, color: 'var(--color-ink)' }}>
              Import from Google Books API
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: '0.8125rem', color: 'var(--color-charcoal-60)' }}>
              Search any published book or textbook and import directly into the Book Bank catalogue.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--color-charcoal-60)' }}
          >
            ✕
          </button>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(30,61,50,0.08)', display: 'flex', gap: 10, backgroundColor: '#ffffff' }}>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search title, author, subject (e.g. Distributed Systems, Kafka, Artificial Intelligence)..."
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 4,
              border: '1px solid rgba(30,61,50,0.2)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              outline: 'none',
            }}
            autoFocus
          />
          <Button type="submit" variant="ochre" disabled={loading} style={{ fontSize: '0.875rem', padding: '10px 20px' }}>
            {loading ? 'Searching…' : 'Search API'}
          </Button>
        </form>

        {/* Results area */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ padding: 12, backgroundColor: 'rgba(122,46,39,0.08)', color: 'var(--color-oxblood)', borderRadius: 4, fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {results.map(item => {
            const info = item.volumeInfo || {}
            const img = (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '').replace('http://', 'https://')
            const isImported = importedSet.has(item.id || info.title)

            return (
              <div
                key={item.id || info.title}
                style={{
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  padding: 14,
                  border: '1px solid rgba(30,61,50,0.1)',
                  borderRadius: 6,
                  backgroundColor: '#ffffff',
                }}
              >
                {img ? (
                  <img src={img} alt="" style={{ width: 44, height: 62, objectFit: 'cover', borderRadius: 3, flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                ) : (
                  <div style={{ width: 44, height: 62, backgroundColor: 'var(--color-ink)', borderRadius: 3, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 9 }}>
                    No Cover
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-charcoal)' }}>
                    {info.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-60)', marginTop: 2 }}>
                    {info.authors?.join(', ') || 'Unknown Author'} · {info.publisher || 'Unknown Publisher'} ({info.publishedDate?.slice(0, 4) || '—'})
                  </div>
                  {info.description && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-charcoal)', marginTop: 4, maxHeight: 36, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {info.description.slice(0, 140)}…
                    </div>
                  )}
                </div>

                <div>
                  {isImported ? (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-ink)', fontWeight: 600 }}>
                      ✓ Added to Library
                    </span>
                  ) : (
                    <Button
                      variant="secondary"
                      style={{ fontSize: '0.8125rem', padding: '7px 14px', whiteSpace: 'nowrap' }}
                      onClick={() => handleImport(item)}
                    >
                      + Import Book
                    </Button>
                  )}
                </div>
              </div>
            )
          })}

          {!loading && results.length === 0 && !error && (
            <div style={{ textAlign: 'center', color: 'var(--color-charcoal-60)', padding: '40px 0', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              Type a book title, author or subject above to search millions of books on Google Books.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Main Catalogue view ── */
export default function AdminCatalogue({ externalSlideOver, onCloseExternalSlideOver }) {
  const { books, retireBook } = useAdminStore()

  const [search, setSearch]             = useState('')
  const [catFilter, setCatFilter]       = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortKey, setSortKey]           = useState('accession')
  const [sortDir, setSortDir]           = useState('asc')
  const [slideOver, setSlideOver]       = useState(null) // null | 'add' | book object
  const [showGoogleImport, setShowGoogleImport] = useState(false)

  // Sync external trigger (header "+Add Book" button) with internal slide-over
  React.useEffect(() => {
    if (externalSlideOver === 'add') {
      setSlideOver('add')
    }
  }, [externalSlideOver])

  const handleSlideOverClose = () => {
    setSlideOver(null)
    if (onCloseExternalSlideOver) onCloseExternalSlideOver()
  }

  const COLS = [
    { key: 'accession', label: 'Acc. No.' },
    { key: 'title', label: 'Title / Author' },
    { key: 'category', label: 'Category' },
    { key: 'totalCopies', label: 'Copies' },
    { key: 'availableCopies', label: 'Avail.' },
    { key: 'bookStatus', label: 'Status' },
  ]

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()

    return books
      .filter(b => {
        // Status filter: by default (statusFilter === 'All'), exclude retired books
        if (statusFilter === 'All') {
          return !b.retired && b.bookStatus !== 'Retired'
        }
        if (statusFilter === 'Retired') {
          return b.retired || b.bookStatus === 'Retired'
        }
        // Specific active status
        return (!b.retired && b.bookStatus !== 'Retired') && b.bookStatus === statusFilter
      })
      .filter(b => catFilter === 'All' || b.category === catFilter)
      .filter(b =>
        (b.title || '').toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.accession || '').toLowerCase().includes(q) ||
        (b.isbn || '').toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let av = a[sortKey] ?? ''
        let bv = b[sortKey] ?? ''
        if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av
        av = String(av).toLowerCase()
        bv = String(bv).toLowerCase()
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
  }, [books, search, catFilter, statusFilter, sortKey, sortDir])

  const SortIndicator = ({ k }) => {
    if (sortKey !== k) return <span style={{ opacity: 0.3 }}> ⇅</span>
    return <span style={{ color: 'var(--color-ochre)' }}> {sortDir === 'asc' ? '↑' : '↓'}</span>
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

        {/* Category filter */}
        <select
          className="admin-select"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* 5-status filter */}
        <select
          className="admin-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses (Active)</option>
          <option value="Available">Available</option>
          <option value="On Loan">On Loan</option>
          <option value="Reserved">Reserved</option>
          <option value="Overdue">Overdue</option>
          <option value="Retired">Retired</option>
        </select>

        <Button
          variant="secondary"
          style={{ fontSize: '0.8125rem', padding: '8px 14px', whiteSpace: 'nowrap' }}
          onClick={() => setShowGoogleImport(true)}
          title="Search Google Books API and import titles directly into the catalogue"
        >
          🌐 Import from Google Books
        </Button>

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
                  {c.label}
                  <SortIndicator k={c.key} />
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 150).map(book => {
              const isRetired = book.retired || book.bookStatus === 'Retired'
              return (
                <tr key={book.accession} className={isRetired ? 'row--retired' : ''}>
                  <td style={{ padding: '4px 6px' }}>
                    <MiniCover book={book} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--color-charcoal)', lineHeight: 1.3 }}>
                      {book.title}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-charcoal-60)', marginTop: 1 }}>
                      {book.author}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.68rem',
                        backgroundColor: 'rgba(30,61,50,0.07)',
                        padding: '2px 6px',
                        borderRadius: 3,
                      }}
                    >
                      {book.category}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {book.totalCopies ?? 1}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    <span
                      style={{
                        color: (book.availableCopies ?? 0) === 0 ? 'var(--color-oxblood)' : 'var(--color-ink)',
                        fontWeight: 600,
                      }}
                    >
                      {book.availableCopies ?? 0}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={book.bookStatus || (book.availableCopies > 0 ? 'Available' : 'On Loan')} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="admin-action-btn"
                        onClick={() => setSlideOver(book)}
                        disabled={isRetired}
                        title={isRetired ? 'Cannot edit retired book' : 'Edit book details'}
                      >
                        Edit
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--danger"
                        disabled={isRetired}
                        title={isRetired ? 'Already retired' : 'Retire book from catalogue'}
                        onClick={() => {
                          if (window.confirm(`Retire "${book.title}"? This marks it as Retired.`)) {
                            try {
                              retireBook(book.accession)
                            } catch (err) {
                              alert(err.message)
                            }
                          }
                        }}
                      >
                        {isRetired ? 'Retired' : 'Retire'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div
            style={{
              padding: '40px 0',
              textAlign: 'center',
              color: 'var(--color-charcoal-60)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8125rem',
            }}
          >
            No books match your search or filter.
          </div>
        )}
      </div>

      {/* Slide-over */}
      {slideOver !== null && (
        <BookSlideOver
          book={slideOver === 'add' ? null : slideOver}
          onClose={handleSlideOverClose}
        />
      )}

      {/* Google Books API direct search & import modal */}
      <GoogleBooksImportModal
        isOpen={showGoogleImport}
        onClose={() => setShowGoogleImport(false)}
      />
    </div>
  )
}
