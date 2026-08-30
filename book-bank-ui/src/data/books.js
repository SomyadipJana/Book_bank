/* ── Spine colours by category ─────────────────────────────── */
export const SPINE = {
  'Computer Science': '#1A3848',
  Engineering:        '#1E3D32',
  Mathematics:        '#281E4A',
  'Algorithms & DS':  '#18294A',
  'Systems & OS':     '#2B2620',
  Networks:           '#38330E',
  Fiction:            '#3B1F2B',
  Psychology:         '#4A1E2A',
  Management:         '#2E2A24',
}

export const CATEGORIES    = [
  'Computer Science',
  'Algorithms & DS',
  'Engineering',
  'Mathematics',
  'Systems & OS',
  'Networks',
  'Fiction',
  'Psychology',
  'Management',
]
export const AVAILABILITIES = ['Available', 'On Loan']
export const FORMATS        = ['Book', 'Magazine', 'Reference']

/* ── Cover URL helpers ───────────────────────────────────────
   Rules:
   • Always use the largest available source; let CSS scale down.
   • Append ?default=false to every OpenLibrary URL so OL returns a
     real 404 when it has no cover — otherwise it sends a blank GIF
     that never triggers onError.
   • Never manipulate zoom= params on Google URLs (undocumented).
   ─────────────────────────────────────────────────────────── */

function olUrl(isbn, size) {
  // ?default=false → OL returns 404 instead of a blank placeholder image
  return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`
}

/** Catalogue card cover — small/medium is acceptable */
export function coverGridUrl(book) {
  // Generated data: coverGrid is already the best URL the script found
  if (book.coverGrid)  return book.coverGrid
  // Legacy/static data fallback chain
  if (book.thumbnail)  return book.thumbnail
  const id = book.isbn13 || book.isbn
  if (id) return olUrl(id, 'M')
  return null
}

/** Detail page cover — always use the largest available source */
export function coverLargeUrl(book) {
  // Generated data: coverLarge is already the best URL the script found
  if (book.coverLarge) {
    // Upgrade any Google Books URL to zoom=0 (full-size scan)
    // zoom=1 is the thumbnail (~128px); zoom=0 is the full cover
    return book.coverLarge.replace('zoom=1', 'zoom=0')
  }
  // Legacy/static data: build OL-L URL, or fall through to grid URL
  const id = book.isbn13 || book.isbn
  if (id) return olUrl(id, 'L')
  // Last resort: whatever grid has, upgraded if it's a Google URL
  if (book.thumbnail) return book.thumbnail.replace('zoom=1', 'zoom=0')
  return null
}

/** @deprecated — use coverGridUrl or coverLargeUrl instead */
export function coverUrl(book) {
  return coverGridUrl(book)
}

/* ── Generated data (populated by scripts/generate-mock-books.js) ─
   Vite treats JSON imports as static assets — safe to import at
   module level. If the file doesn't exist yet, the catch block
   below returns the STATIC_BOOKS fallback so the app never breaks.
   ─────────────────────────────────────────────────────────── */

import generatedBooks from './mockBooks.json' with { type: 'json' }

function normalise(b, i) {
  return {
    ...b,
    id:     b.id     ?? i + 1,
    format: b.format ?? 'Book',
    author: b.author || (Array.isArray(b.authors) ? b.authors.join(', ') : ''),
    isbn:   b.isbn   || b.isbn13 || '',
  }
}

export const ALL_BOOKS = generatedBooks.map(normalise)
