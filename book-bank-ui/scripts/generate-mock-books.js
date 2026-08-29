#!/usr/bin/env node
/**
 * scripts/generate-mock-books.js
 *
 * Development-only script. Runs locally with:
 *   node scripts/generate-mock-books.js
 *   (or: npm run generate)
 *
 * Reads GOOGLE_BOOKS_API_KEY from book-bank-ui/.env — never commit that file.
 *
 * Output schema per book:
 *   { id, accession, title, authors, author, publisher, publishedDate,
 *     category, categories, isbn13, description, pageCount, format,
 *     available, availableCopies, totalCopies, addedDate, edition,
 *     coverGrid  — small image, fine for catalogue cards
 *     coverLarge — largest available: OpenLibrary-L > Google zoom=3 > fallback }
 *
 * Rule: always store the largest source and let CSS scale down.
 *       Never store a small image and stretch it up — that causes blur.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

/* ── Load .env from the project root ──────────────────────── */
const __filename = fileURLToPath(import.meta.url)
const __dirname  = dirname(__filename)
const ROOT       = join(__dirname, '..')

function loadDotenv(envPath) {
  let raw
  try {
    raw = readFileSync(envPath, 'utf8')
  } catch {
    console.error(`\n[generate-mock-books] Could not find .env at ${envPath}`)
    console.error('Create it with: GOOGLE_BOOKS_API_KEY=<your-key>\n')
    process.exit(1)
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const val = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '')
    process.env[key] = val
  }
}

loadDotenv(join(ROOT, '.env'))

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY
if (!API_KEY) {
  console.error('\n[generate-mock-books] GOOGLE_BOOKS_API_KEY is not set in .env\n')
  process.exit(1)
}

/* ── Book title list ─────────────────────────────────────────
   Format: [title, override_category]
   ─────────────────────────────────────────────────────────── */
const TITLES = [
  /* Core 21 */
  ['Introduction to Algorithms',                   'Algorithms & DS'],
  ['The Algorithm Design Manual',                  'Algorithms & DS'],
  ['Data Structures and Algorithm Analysis in C++','Algorithms & DS'],
  ['Introduction to the Theory of Computation',   'Computer Science'],
  ['Automata Computability and Complexity',        'Computer Science'],
  ['Clean Code',                                   'Engineering'],
  ['Design Patterns Elements of Reusable Object-Oriented Software', 'Engineering'],
  ['The Pragmatic Programmer',                     'Engineering'],
  ['Software Engineering Sommerville',             'Engineering'],
  ['Operating System Concepts',                    'Systems & OS'],
  ['Computer Organization and Architecture Stallings', 'Systems & OS'],
  ['Database System Concepts',                     'Computer Science'],
  ['Computer Networks Tanenbaum',                  'Networks'],
  ['Computer Networking A Top-Down Approach',      'Networks'],
  ['Discrete Mathematics and Its Applications Rosen', 'Mathematics'],
  ['Linear Algebra and Its Applications Strang',   'Mathematics'],
  ['The Mythical Man-Month',                       'Management'],
  ['Thinking Fast and Slow',                       'Psychology'],
  ["The Hitchhiker's Guide to the Galaxy",         'Fiction'],
  ['The Phoenix Project DevOps',                   'Management'],
  ['Oxford Dictionary of Computer Science',        'Computer Science'],

  /* Additions */
  ['Structure and Interpretation of Computer Programs', 'Computer Science'],
  ['Computer Science An Overview Brookshear',      'Computer Science'],
  ['Artificial Intelligence A Modern Approach',    'Computer Science'],
  ['Pattern Recognition and Machine Learning Bishop', 'Computer Science'],
  ['Deep Learning Goodfellow',                     'Computer Science'],
  ['The Art of Computer Programming Knuth',        'Algorithms & DS'],
  ['Concrete Mathematics Graham Knuth',            'Mathematics'],
  ['Introduction to Linear Algebra Strang',        'Mathematics'],
  ['Numerical Methods for Engineers Chapra',       'Mathematics'],
  ['Digital Design Morris Mano',                   'Systems & OS'],
  ['Modern Operating Systems Tanenbaum',           'Systems & OS'],
  ['Computer Architecture A Quantitative Approach','Systems & OS'],
  ['TCP IP Illustrated Stevens',                   'Networks'],
  ['Unix Network Programming Stevens',             'Networks'],
  ['Compilers Principles Techniques Tools',        'Engineering'],
  ['Code Complete McConnell',                      'Engineering'],
  ['Working Effectively with Legacy Code',         'Engineering'],
  ['Continuous Delivery Humble Farley',            'Engineering'],
  ['Release It Design and Deploy Production-Ready Software', 'Engineering'],
  ['Site Reliability Engineering Google',          'Engineering'],
  ['Cracking the Coding Interview',                'Algorithms & DS'],
  ['Elements of Programming Interviews',           'Algorithms & DS'],
  ['Programming Pearls Bentley',                   'Computer Science'],
  ['The C Programming Language Kernighan Ritchie', 'Computer Science'],
  ['Python Crash Course',                          'Computer Science'],
  ['Calculus Early Transcendentals Stewart',       'Mathematics'],
  ['Probability and Statistics for Engineers Walpole', 'Mathematics'],
  ['Introduction to Probability Blitzstein',       'Mathematics'],
  ['Sapiens A Brief History of Humankind',         'Fiction'],
  ['Atomic Habits',                                'Psychology'],
  ['Deep Work Cal Newport',                        'Psychology'],
  ['Zero to One Peter Thiel',                      'Management'],
  ['The Lean Startup Eric Ries',                   'Management'],
  ['Drive Daniel Pink',                            'Psychology'],
]

/* ── Category → spine colour ─────────────────────────────── */
const SPINE = {
  'Computer Science': '#1A3848',
  'Engineering':      '#1E3D32',
  'Mathematics':      '#281E4A',
  'Algorithms & DS':  '#18294A',
  'Systems & OS':     '#2B2620',
  'Networks':         '#38330E',
  'Fiction':          '#3B1F2B',
  'Psychology':       '#4A1E2A',
  'Management':       '#2E2A24',
}

/* ── Helpers ─────────────────────────────────────────────── */

function accession(n) {
  return `BB-${String(n).padStart(4, '0')}`
}

function randomAvailability() {
  const available = Math.random() < 0.70
  const total = Math.floor(Math.random() * 4) + 2
  const avail = available ? Math.floor(Math.random() * total) + 1 : 0
  return { available, totalCopies: total, availableCopies: avail }
}

function extractIsbn13(identifiers = []) {
  const entry = identifiers.find(i => i.type === 'ISBN_13')
  return entry ? entry.identifier : ''
}

/**
 * bestGoogleUrl — pick the highest-quality imageLinks field available.
 * Uses optional chaining throughout so any missing field safely falls through.
 * @param {object} imageLinks
 * @param {'grid'|'large'} size — 'large' upgrades zoom=1 to zoom=0 for full-size scan
 */
function bestGoogleUrl(imageLinks, size = 'grid') {
  const raw =
    imageLinks?.large ||
    imageLinks?.medium ||
    imageLinks?.small ||
    imageLinks?.thumbnail ||
    imageLinks?.smallThumbnail ||
    null
  if (!raw) return null
  let url = raw.replace(/^http:/, 'https:').replace('&edge=curl', '')
  // For the detail page, request full-size scan instead of thumbnail
  if (size === 'large') {
    url = url.replace('zoom=1', 'zoom=0')
  }
  return url
}

/** Probe an OpenLibrary URL: returns the URL if it resolves to a real image,
 *  or null if OL returns 404 / redirect-to-blank (with ?default=false). */
async function probeOL(isbn13, size) {
  const url = `https://covers.openlibrary.org/b/isbn/${isbn13}-${size}.jpg?default=false`
  try {
    const r = await fetch(url, { method: 'HEAD' })
    if (r.ok && r.status !== 204) return url
    return null
  } catch {
    return null
  }
}

function mapGoogleCategory(googleCats = [], override) {
  if (override) return override
  const raw = (googleCats?.[0] || '').toLowerCase()
  if (raw.includes('computer'))   return 'Computer Science'
  if (raw.includes('math'))       return 'Mathematics'
  if (raw.includes('fiction'))    return 'Fiction'
  if (raw.includes('psycholog'))  return 'Psychology'
  if (raw.includes('business') || raw.includes('management')) return 'Management'
  if (raw.includes('network'))    return 'Networks'
  if (raw.includes('engineer'))   return 'Engineering'
  return 'Computer Science'
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

/** Search OpenLibrary directly by query for cover ID */
async function searchOpenLibraryCover(query) {
  try {
    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=5`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    for (const doc of (data.docs || [])) {
      if (doc.cover_i) {
        const coverL = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg?default=false`
        const coverM = `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg?default=false`
        const r = await fetch(coverL, { method: 'HEAD' })
        if (r.ok && r.status !== 204) {
          return { coverLarge: coverL, coverGrid: coverM, source: `OpenLibrary Search (id:${doc.cover_i})` }
        }
      }
    }
    return null
  } catch {
    return null
  }
}

/* ── Fetch one title — with multi-candidate & dual-source search ── */
async function fetchBook(title, category) {
  const q   = encodeURIComponent(title)
  const url = `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=6&key=${API_KEY}`

  let res, data
  try {
    res  = await fetch(url)
    data = await res.json()
  } catch (err) {
    console.log(`    ↳ [NETWORK ERROR] ${err.message}`)
    return null
  }

  if (!res.ok) {
    const snippet = JSON.stringify(data).slice(0, 200)
    console.log(`    ↳ [HTTP ${res.status}] ${snippet}`)
    return null
  }

  const items = data?.items || []
  if (items.length === 0) {
    console.log(`    ↳ [NO RESULTS] Google returned 0 items`)
    return null
  }

  let chosenInfo = null
  let coverGrid = null
  let coverLarge = null
  let coverSource = 'none'

  // Pass 1: Try each candidate item and probe OpenLibrary for high-res cover
  for (const item of items) {
    const info = item.volumeInfo || {}
    const isbn13 = extractIsbn13(info.industryIdentifiers)
    if (isbn13) {
      const [olL, olM] = await Promise.all([
        probeOL(isbn13, 'L'),
        probeOL(isbn13, 'M'),
      ])
      if (olL || olM) {
        chosenInfo = info
        coverLarge = olL || olM
        coverGrid  = olM || olL
        coverSource = `OpenLibrary ISBN (L:${olL?'✓':'✗'} M:${olM?'✓':'✗'})`
        break
      }
    }
  }

  // Pass 2: If no candidate matched OL via ISBN, try OpenLibrary Search directly
  if (!coverLarge) {
    const olDirect = await searchOpenLibraryCover(title)
    if (olDirect) {
      chosenInfo = items[0]?.volumeInfo || {}
      coverLarge = olDirect.coverLarge
      coverGrid  = olDirect.coverGrid
      coverSource = olDirect.source
    }
  }

  // Pass 3: Fall back to Google Books best image link, avoiding snippet items
  if (!coverLarge) {
    for (const item of items) {
      const info = item.volumeInfo || {}
      const thumb = bestGoogleUrl(info.imageLinks, 'large')
      // Skip snippet scans where id contains AAAAMAAJ / AAAAYAAJ or no authors
      const isSnippet = (item.id && (item.id.endsWith('AAJ') || item.id.includes('AAAAMAAJ'))) && !info.authors
      if (thumb && !isSnippet) {
        chosenInfo = info
        coverLarge = thumb
        coverGrid = bestGoogleUrl(info.imageLinks, 'grid')
        coverSource = `Google Books (id:${item.id})`
        break
      }
    }
    // Fallback to first available if all were skipped
    if (!coverLarge && items[0]?.volumeInfo?.imageLinks) {
      chosenInfo = items[0].volumeInfo
      coverLarge = bestGoogleUrl(chosenInfo.imageLinks, 'large')
      coverGrid = bestGoogleUrl(chosenInfo.imageLinks, 'grid')
      coverSource = `Google Books fallback`
    }
  }

  if (!chosenInfo) {
    chosenInfo = items[0]?.volumeInfo || {}
  }

  const isbn13 = extractIsbn13(chosenInfo.industryIdentifiers)
  console.log(`    ↳ [RESOLVED] title="${chosenInfo.title?.slice(0,40)}" source=${coverSource}`)

  if (!coverGrid && !coverLarge) {
    console.log(`    ↳ [SKIP] no usable cover URL from any source`)
    return null
  }

  return {
    rawTitle:     chosenInfo.title         || title,
    authors:      chosenInfo.authors       || [],
    publisher:    chosenInfo.publisher     || '',
    publishedDate:chosenInfo.publishedDate || '',
    googleCats:   chosenInfo.categories    || [],
    isbn13,
    coverGrid:    coverGrid  || coverLarge,
    coverLarge:   coverLarge || coverGrid,
    description:  chosenInfo.description   || '',
    pageCount:    chosenInfo.pageCount     || null,
    overrideCat:  category,
    _coverSource: coverSource,
  }
}

/* ── Main ────────────────────────────────────────────────── */
async function main() {
  console.log(`\n📚 Book Bank — mock data generator (enhanced multi-source mode)`)
  console.log(`   ${TITLES.length} titles queued\n`)

  /* ── Load existing JSON so we can preserve good URLs ───── */
  const outDir  = join(ROOT, 'src', 'data')
  const outPath = join(outDir, 'mockBooks.json')
  let existing = []
  try {
    existing = JSON.parse(readFileSync(outPath, 'utf8'))
    console.log(`   Loaded ${existing.length} existing entries for non-destructive merge\n`)
  } catch {
    console.log(`   No existing mockBooks.json — fresh run\n`)
  }
  const existingMap = new Map(existing.map(b => [(b.title || '').toLowerCase(), b]))

  /* ── Counters for three-bucket summary ─────────────────── */
  let nKept    = 0
  let nFetched = 0
  let nNone    = 0
  let nSkipped = 0

  const books = []

  for (let i = 0; i < TITLES.length; i++) {
    const [title, cat] = TITLES[i]
    const num = `[${String(i + 1).padStart(2, '0')}/${TITLES.length}]`
    console.log(`\n${num} "${title.slice(0, 60)}"`)

    const prev = existingMap.get(title.toLowerCase())
    const data = await fetchBook(title, cat)

    if (!data) {
      if (prev) {
        console.log(`    ↳ [MERGE] fetch failed — keeping existing entry`)
        books.push(prev)
        nKept++
      } else {
        console.log(`    ↳ [SKIP] no existing entry and fetch failed`)
        nSkipped++
      }
      await sleep(200)
      continue
    }

    const { available, totalCopies, availableCopies } =
      prev ? { available: prev.available, totalCopies: prev.totalCopies, availableCopies: prev.availableCopies }
           : randomAvailability()

    const category = mapGoogleCategory(data.googleCats, data.overrideCat)
    const id       = books.length + 1
    const { _coverSource, ...cleanData } = data

    const entry = {
      ...cleanData,
      id,
      accession:      prev?.accession ?? accession(id),
      title:          data.rawTitle,
      authors:        data.authors,
      author:         data.authors.join(', '),
      category,
      coverGrid:      data.coverGrid,
      coverLarge:     data.coverLarge,
      thumbnail:      data.coverGrid,
      format:         prev?.format ?? 'Book',
      available,
      availableCopies,
      totalCopies,
      addedDate:      prev?.addedDate ?? new Date().toISOString().slice(0, 10),
      edition:        data.publishedDate ? `${data.publishedDate.slice(0, 4)} Edition` : (prev?.edition ?? ''),
    }

    books.push(entry)
    nFetched++
    console.log(`    ↳ [RESULT] ✅ has cover (${entry.coverLarge?.slice(0, 60)}) acc=${entry.accession}`)

    await sleep(200)
  }

  /* ── Write JSON ───────────────────────────────────────── */
  mkdirSync(outDir, { recursive: true })
  const cleanBooks = books.map(({ _coverSource, ...b }) => b)  // safety strip
  writeFileSync(outPath, JSON.stringify(cleanBooks, null, 2), 'utf8')

  /* ── Three-bucket summary ─────────────────────────────── */
  const withOL     = books.filter(b => b.coverLarge?.includes('openlibrary')).length
  const withGoogle = books.filter(b => b.coverLarge?.includes('books.google')).length
  console.log('\n' + '═'.repeat(60))
  console.log(`📚  Total entries    : ${books.length}`)
  console.log(`✅  Fetched new cover : ${nFetched}`)
  console.log(`📌  Kept existing URL : ${nKept}`)
  console.log(`⚠️   No cover (placeholder): ${nNone}`)
  console.log(`⏭   Skipped entirely : ${nSkipped}`)
  console.log(`\n   Cover sources:`)
  console.log(`   🖼  OpenLibrary (probed) : ${withOL}`)
  console.log(`   🔍  Google best-field    : ${withGoogle}`)
  console.log(`📄  Output: src/data/mockBooks.json`)
  console.log('═'.repeat(60) + '\n')
}

main().catch(err => {
  console.error('\nFatal error:', err)
  process.exit(1)
})
