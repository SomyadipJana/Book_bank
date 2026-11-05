/**
 * libraryStore.jsx — Single Source of Truth for Book Bank
 * 
 * Manages:
 *  - books (catalog records, copies, cover overrides, retirement)
 *  - members (students with real identity, dept, status)
 *  - loans (active & returned loans, due dates, renewals)
 *  - reservations (queue positions, ready holds, 5-day expiry)
 *  - fines (fixed fines on return, manual payments, accruing overdue fines)
 *  - activityLog (audit timeline of all student & admin actions)
 *  - simulatedDate (dev-only date travel for testing overdue, fines & hold expiry)
 * 
 * Persists in localStorage and stays in sync across browser tabs via window 'storage' event.
 * 
 * // TODO: replace with backend API calls.
 */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { ALL_BOOKS } from './books'
import { MOCK_VENDORS, MOCK_ORDERS } from './mockAdminData'

const LibraryStoreContext = createContext(null)
const STORAGE_KEY = 'bb_library_data_v2'

/* ── Default Settings ────────────────────────────────────────── */
export const FINE_DAILY_RATE = 5 // ₹5 per overdue day
export const STANDARD_LOAN_DAYS = 14
export const MAX_RENEWALS = 2
export const BORROW_LIMIT = 5
export const HOLD_EXPIRY_DAYS = 5

/* ── Helper: Date Formatting & Math ──────────────────────────── */
export function addDays(isoDateStr, days) {
  const d = new Date(isoDateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export function daysBetween(fromIso, toIso) {
  const from = new Date(fromIso)
  const to = new Date(toIso)
  return Math.floor((to - from) / 86400000)
}

export function formatDisplayDate(isoDateStr) {
  if (!isoDateStr) return '—'
  const d = new Date(isoDateStr)
  if (isNaN(d.getTime())) return isoDateStr
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ── Initial Seed Data ───────────────────────────────────────── */
const SEED_DATE = '2026-09-18'

const INITIAL_MEMBERS = [
  {
    id: 'STU-001',
    name: 'Aisha Patel',
    email: 'aisha.patel@university.edu',
    studentId: 'STU-001',
    dept: 'Computer Science',
    status: 'active',
    joined: 'JAN 2024',
    expires: 'JUN 2027',
  },
  {
    id: 'STU-002',
    name: 'Rahul Mehta',
    email: 'rahul.mehta@university.edu',
    studentId: 'STU-002',
    dept: 'Mathematics',
    status: 'active',
    joined: 'AUG 2023',
    expires: 'JUN 2026',
  },
  {
    id: 'STU-003',
    name: 'Priya Sharma',
    email: 'priya.sharma@university.edu',
    studentId: 'STU-003',
    dept: 'Engineering',
    status: 'active',
    joined: 'JAN 2025',
    expires: 'JUN 2028',
  },
  {
    id: 'STU-004',
    name: 'Devraj Singh',
    email: 'devraj.singh@university.edu',
    studentId: 'STU-004',
    dept: 'Networks',
    status: 'active',
    joined: 'AUG 2024',
    expires: 'JUN 2027',
  },
  {
    id: 'STU-005',
    name: 'Meera Rao',
    email: 'meera.rao@university.edu',
    studentId: 'STU-005',
    dept: 'Psychology',
    status: 'suspended', // Suspended student for testing rule
    joined: 'AUG 2023',
    expires: 'JUN 2026',
  },
  {
    id: 'STU-006',
    name: 'Kiran Joshi',
    email: 'kiran.joshi@university.edu',
    studentId: 'STU-006',
    dept: 'Management',
    status: 'active', // Clean student (0 loans, 0 fines)
    joined: 'JAN 2025',
    expires: 'JUN 2028',
  },
]

const INITIAL_BOOKS = ALL_BOOKS.map(b => ({
  accession: b.accession,
  title: b.title,
  author: b.author,
  category: b.category,
  totalCopies: b.totalCopies || 2,
  publisher: b.publisher || '',
  edition: b.edition || '',
  isbn: b.isbn || '',
  format: b.format || 'Book',
  description: b.description || '',
  coverGrid: b.coverGrid || null,
  coverLarge: b.coverLarge || null,
  uploadedCover: null,
  retired: false,
}))

const INITIAL_LOANS = [
  // Aisha Patel (STU-001): 1 active loan on time
  {
    id: 'LN-0001',
    accession: 'BB-0006', // The Pragmatic Programmer
    memberId: 'STU-001',
    issuedDate: '2026-09-10',
    dueDate: '2026-09-24', // Due in 6 days
    returnedDate: null,
    renewCount: 0,
    status: 'active',
  },
  // Rahul Mehta (STU-002): 1 active overdue loan (accruing fine)
  {
    id: 'LN-0002',
    accession: 'BB-0001', // One Hundred Years of Solitude
    memberId: 'STU-002',
    issuedDate: '2026-08-20',
    dueDate: '2026-09-03', // 15 days overdue as of 2026-09-18
    returnedDate: null,
    renewCount: 0,
    status: 'active',
  },
  // Priya Sharma (STU-003): 2 active loans on time
  {
    id: 'LN-0003',
    accession: 'BB-0004', // The Red and the Black
    memberId: 'STU-003',
    issuedDate: '2026-09-08',
    dueDate: '2026-09-22',
    returnedDate: null,
    renewCount: 1,
    status: 'active',
  },
  {
    id: 'LN-0004',
    accession: 'BB-0003', // Complete Works of Shakespeare
    memberId: 'STU-003',
    issuedDate: '2026-09-12',
    dueDate: '2026-09-26',
    returnedDate: null,
    renewCount: 0,
    status: 'active',
  },
  // Devraj Singh (STU-004): 1 active loan due in 2 days
  {
    id: 'LN-0005',
    accession: 'BB-0002', // Poetical Works of Longfellow
    memberId: 'STU-004',
    issuedDate: '2026-09-06',
    dueDate: '2026-09-20', // Due in 2 days as of 2026-09-18
    returnedDate: null,
    renewCount: 2, // Max renewals reached
    status: 'active',
  },
  // Loan History (returned records)
  {
    id: 'LN-0006',
    accession: 'BB-0011',
    memberId: 'STU-001',
    issuedDate: '2026-08-01',
    dueDate: '2026-08-15',
    returnedDate: '2026-08-14',
    renewCount: 0,
    status: 'returned',
  },
  {
    id: 'LN-0007',
    accession: 'BB-0020',
    memberId: 'STU-002',
    issuedDate: '2026-07-10',
    dueDate: '2026-07-24',
    returnedDate: '2026-07-27', // 3 days late
    renewCount: 0,
    status: 'returned',
  },
]

const INITIAL_RESERVATIONS = [
  // Aisha Patel (STU-001): Ready for pickup (5-day hold expiring 2026-09-21)
  {
    id: 'RES-0001',
    accession: 'BB-0007', // Ivanhoe
    memberId: 'STU-001',
    createdAt: '2026-09-14',
    status: 'ready', // ready for pickup
    queuePosition: 1,
    holdExpiresAt: '2026-09-21',
    pickupLocation: 'Desk Bay 2 — Shelf R-04',
  },
  // Priya Sharma (STU-003): Waitlisted position #1
  {
    id: 'RES-0002',
    accession: 'BB-0006', // The Pragmatic Programmer (currently on loan to Aisha)
    memberId: 'STU-003',
    createdAt: '2026-09-15',
    status: 'waiting',
    queuePosition: 1,
    holdExpiresAt: null,
    pickupLocation: 'Main Circulation Desk',
  },
  // Devraj Singh (STU-004): Waitlisted position #2 for BB-0006
  {
    id: 'RES-0003',
    accession: 'BB-0006',
    memberId: 'STU-004',
    createdAt: '2026-09-16',
    status: 'waiting',
    queuePosition: 2,
    holdExpiresAt: null,
    pickupLocation: 'Main Circulation Desk',
  },
]

const INITIAL_FINES = [
  // Rahul Mehta (STU-002): An existing fixed fine from late return of BB-0020
  {
    id: 'FN-0001',
    loanId: 'LN-0007',
    memberId: 'STU-002',
    accession: 'BB-0020',
    reason: 'Overdue return: 3 days late @ ₹5/day',
    amount: 15,
    status: 'unpaid',
    createdAt: '2026-07-27',
    paidAt: null,
  },
]

const INITIAL_ACTIVITY = [
  {
    id: 'ACT-0001',
    timestamp: '2026-09-14T10:30:00Z',
    action: 'hold_ready',
    actor: 'System',
    memberId: 'STU-001',
    memberName: 'Aisha Patel',
    accession: 'BB-0007',
    bookTitle: 'Ivanhoe',
    description: 'Copy returned; hold ready for pickup for Aisha Patel until 21 Sep 2026.',
  },
  {
    id: 'ACT-0002',
    timestamp: '2026-09-15T14:10:00Z',
    action: 'reserve',
    actor: 'Priya Sharma',
    memberId: 'STU-003',
    memberName: 'Priya Sharma',
    accession: 'BB-0006',
    bookTitle: 'The Pragmatic Programmer',
    description: 'Priya Sharma joined the waitlist at position #1.',
  },
  {
    id: 'ACT-0003',
    timestamp: '2026-09-16T09:45:00Z',
    action: 'reserve',
    actor: 'Devraj Singh',
    memberId: 'STU-004',
    memberName: 'Devraj Singh',
    accession: 'BB-0006',
    bookTitle: 'The Pragmatic Programmer',
    description: 'Devraj Singh joined the waitlist at position #2.',
  },
]

/* ── Storage Loader ──────────────────────────────────────────── */
function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Merge any new seed books that aren't yet in saved books (by accession)
      const existingAccessions = new Set((parsed.books || []).map(b => b.accession))
      const newBooksToAdd = INITIAL_BOOKS.filter(b => !existingAccessions.has(b.accession))
      const mergedBooks = [...(parsed.books || []), ...newBooksToAdd]

      return {
        books: mergedBooks,
        members: parsed.members || INITIAL_MEMBERS,
        loans: parsed.loans || INITIAL_LOANS,
        reservations: parsed.reservations || INITIAL_RESERVATIONS,
        fines: parsed.fines || INITIAL_FINES,
        activityLog: parsed.activityLog || INITIAL_ACTIVITY,
        simulatedDate: parsed.simulatedDate || SEED_DATE,
        fineDailyRate: parsed.fineDailyRate || FINE_DAILY_RATE,
      }
    }
  } catch (err) {
    console.error('Failed to parse localStorage data:', err)
  }
  return {
    books: INITIAL_BOOKS,
    members: INITIAL_MEMBERS,
    loans: INITIAL_LOANS,
    reservations: INITIAL_RESERVATIONS,
    fines: INITIAL_FINES,
    activityLog: INITIAL_ACTIVITY,
    simulatedDate: SEED_DATE,
    fineDailyRate: FINE_DAILY_RATE,
  }
}

/* ── Provider Component ──────────────────────────────────────── */
export function LibraryStoreProvider({ children }) {
  const [state, setState] = useState(loadInitialState)

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }, [state])

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const fresh = JSON.parse(e.newValue)
          setState(fresh)
        } catch (err) {
          console.error('Failed to sync cross-tab storage:', err)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  /* ── Current Date (Simulated or Real) ── */
  const today = state.simulatedDate || new Date().toISOString().split('T')[0]

  /* ── Auto-Expire Holds Check on Date Advance ── */
  useEffect(() => {
    // Check if any ready hold has passed its holdExpiresAt
    setState(prev => {
      let changed = false
      const updatedReservations = [...prev.reservations]
      const newActivity = [...prev.activityLog]

      updatedReservations.forEach((res, idx) => {
        if (res.status === 'ready' && res.holdExpiresAt && today > res.holdExpiresAt) {
          changed = true
          // Mark expired
          updatedReservations[idx] = { ...res, status: 'expired' }

          newActivity.unshift({
            id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            action: 'hold_expired',
            actor: 'System',
            memberId: res.memberId,
            memberName: prev.members.find(m => m.id === res.memberId)?.name || res.memberId,
            accession: res.accession,
            bookTitle: prev.books.find(b => b.accession === res.accession)?.title || res.accession,
            description: `Hold expired for ${res.accession}. Passing to next in waitlist.`,
          })

          // Pass to next waiting in queue for the same accession
          const nextWaitingIdx = updatedReservations.findIndex(
            r => r.accession === res.accession && r.status === 'waiting'
          )
          if (nextWaitingIdx !== -1) {
            const nextRes = updatedReservations[nextWaitingIdx]
            const holdExpiry = addDays(today, HOLD_EXPIRY_DAYS)
            updatedReservations[nextWaitingIdx] = {
              ...nextRes,
              status: 'ready',
              queuePosition: 1,
              holdExpiresAt: holdExpiry,
              pickupLocation: 'Desk Bay 2 — Shelf R-04',
            }

            // Re-order remaining waiting reservations
            let nextPos = 2
            updatedReservations.forEach((r, rIdx) => {
              if (r.accession === res.accession && r.status === 'waiting' && rIdx !== nextWaitingIdx) {
                updatedReservations[rIdx] = { ...r, queuePosition: nextPos++ }
              }
            })

            newActivity.unshift({
              id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              timestamp: new Date().toISOString(),
              action: 'hold_ready',
              actor: 'System',
              memberId: nextRes.memberId,
              memberName: prev.members.find(m => m.id === nextRes.memberId)?.name || nextRes.memberId,
              accession: nextRes.accession,
              bookTitle: prev.books.find(b => b.accession === nextRes.accession)?.title || nextRes.accession,
              description: `Hold ready for next in queue: hold expires ${formatDisplayDate(holdExpiry)}.`,
            })
          }
        }
      })

      if (!changed) return prev
      return {
        ...prev,
        reservations: updatedReservations,
        activityLog: newActivity,
      }
    })
  }, [today])

  /* ═══════════════════════════════════════════════════════════
     STEP 4: DERIVED, NEVER STORED, VALUES
     Computed live from loans, reservations, fines & today's date
     ══════════════════════════════════════════════════════════ */

  // 1. Loans with computed fields
  const computedLoans = useMemo(() => {
    return state.loans.map(loan => {
      const isReturned = loan.status === 'returned'
      const isOverdue = !isReturned && today > loan.dueDate
      const daysLate = isOverdue ? daysBetween(loan.dueDate, today) : 0
      const daysLeft = !isReturned ? daysBetween(today, loan.dueDate) : 0
      const accruedFine = isOverdue ? daysLate * state.fineDailyRate : 0
      const book = state.books.find(b => b.accession === loan.accession)
      const member = state.members.find(m => m.id === loan.memberId)

      return {
        ...loan,
        isOverdue,
        daysLate,
        daysLeft,
        accruedFine,
        bookTitle: book?.title || loan.accession,
        bookAuthor: book?.author || 'Unknown',
        bookCategory: book?.category || 'General',
        memberName: member?.name || loan.memberId,
        memberEmail: member?.email || '',
      }
    })
  }, [state.loans, state.books, state.members, today, state.fineDailyRate])

  // 2. Reservations with computed fields
  const computedReservations = useMemo(() => {
    return state.reservations.map(res => {
      const book = state.books.find(b => b.accession === res.accession)
      const member = state.members.find(m => m.id === res.memberId)
      const isReady = res.status === 'ready'
      const daysUntilExpiry = isReady && res.holdExpiresAt ? daysBetween(today, res.holdExpiresAt) : null

      return {
        ...res,
        isReady,
        daysUntilExpiry,
        bookTitle: book?.title || res.accession,
        bookAuthor: book?.author || '',
        bookCategory: book?.category || '',
        memberName: member?.name || res.memberId,
      }
    })
  }, [state.reservations, state.books, state.members, today])

  // 3. Books with computed availability & 5-status value
  const computedBooks = useMemo(() => {
    return state.books.map(b => {
      const activeLoansForBook = computedLoans.filter(l => l.accession === b.accession && l.status === 'active')
      const readyHoldsForBook = computedReservations.filter(r => r.accession === b.accession && r.status === 'ready')
      const waitingHoldsForBook = computedReservations.filter(r => r.accession === b.accession && r.status === 'waiting')
      const onLoanCount = activeLoansForBook.length
      const reservedCount = readyHoldsForBook.length
      const availableCopies = Math.max(0, (b.totalCopies || 1) - onLoanCount - reservedCount)
      const hasOverdueLoan = activeLoansForBook.some(l => l.isOverdue)

      let bookStatus = 'Available'
      if (b.retired) {
        bookStatus = 'Retired'
      } else if (hasOverdueLoan) {
        bookStatus = 'Overdue'
      } else if (availableCopies > 0) {
        bookStatus = 'Available'
      } else if (reservedCount > 0) {
        bookStatus = 'Reserved'
      } else if (onLoanCount > 0) {
        bookStatus = 'On Loan'
      }

      return {
        ...b,
        availableCopies,
        onLoanCount,
        reservedCount,
        waitingCount: waitingHoldsForBook.length,
        hasOverdueLoan,
        bookStatus,
        activeLoansCount: activeLoansForBook.length,
      }
    })
  }, [state.books, computedLoans, computedReservations])

  // 4. Members with live computed counts, fines & status
  const computedMembers = useMemo(() => {
    return state.members.map(m => {
      const memberLoans = computedLoans.filter(l => l.memberId === m.id)
      const activeLoans = memberLoans.filter(l => l.status === 'active')
      const overdueLoans = activeLoans.filter(l => l.isOverdue)
      const historyLoans = memberLoans.filter(l => l.status === 'returned')

      // Fixed unpaid fines recorded on return or manually
      const fixedUnpaidFines = state.fines
        .filter(f => f.memberId === m.id && f.status === 'unpaid')
        .reduce((sum, f) => sum + Number(f.amount || 0), 0)

      // Accruing live fines on currently overdue loans
      const accruingFines = overdueLoans.reduce((sum, l) => sum + l.accruedFine, 0)
      const totalFinesDue = fixedUnpaidFines + accruingFines

      const memberReservations = computedReservations.filter(r => r.memberId === m.id && (r.status === 'waiting' || r.status === 'ready'))

      return {
        ...m,
        booksOut: activeLoans.length,
        overdueCount: overdueLoans.length,
        fixedUnpaidFines,
        accruingFines,
        totalFinesDue,
        hasUnpaidFines: totalFinesDue > 0,
        activeLoans,
        overdueLoans,
        historyLoans,
        reservations: memberReservations,
      }
    })
  }, [state.members, computedLoans, computedReservations, state.fines])

  /* ═══════════════════════════════════════════════════════════
     ACTIONS & BUSINESS RULES (Step 5)
     Enforced on both student and admin sides
     ══════════════════════════════════════════════════════════ */

  // Helper to append activity
  const logActivity = useCallback((action, actor, memberId, memberName, accession, bookTitle, description) => {
    const entry = {
      id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      memberId,
      memberName,
      accession,
      bookTitle,
      description,
    }
    setState(prev => ({
      ...prev,
      activityLog: [entry, ...prev.activityLog],
    }))
  }, [])

  /* ── 1. Issue Book ── */
  const issueBook = useCallback(({ accession, memberId, actor = 'Librarian' }) => {
    const book = computedBooks.find(b => b.accession === accession)
    const member = computedMembers.find(m => m.id === memberId)

    if (!book) throw new Error('Book not found')
    if (!member) throw new Error('Student member not found')

    // Rule: Title is retired
    if (book.retired) {
      throw new Error(`Cannot issue "${book.title}": this title is retired.`)
    }

    // Rule: Member suspended
    if (member.status === 'suspended') {
      throw new Error(`Cannot issue book: ${member.name}'s account is suspended.`)
    }

    // Rule: Borrow limit reached (5 books)
    if (member.booksOut >= BORROW_LIMIT) {
      throw new Error(`Cannot issue book: ${member.name} has reached the borrowing limit of ${BORROW_LIMIT} books.`)
    }

    // Rule: Student already holds this title
    const alreadyHolds = member.activeLoans.some(l => l.accession === accession)
    if (alreadyHolds) {
      throw new Error(`Cannot issue book: ${member.name} already holds an active copy of this title.`)
    }

    // Rule: Student has unpaid fines
    if (member.hasUnpaidFines) {
      throw new Error(`Cannot issue book: ${member.name} has unpaid fines of ₹${member.totalFinesDue.toFixed(2)}. Fines must be cleared first.`)
    }

    // Check if member has a ready hold for this book
    const existingHold = state.reservations.find(
      r => r.accession === accession && r.memberId === memberId && r.status === 'ready'
    )

    // Rule: No copies available (unless student holds the ready reservation)
    if (!existingHold && book.availableCopies <= 0) {
      throw new Error(`Cannot issue book: no copies of "${book.title}" are currently available for general checkout.`)
    }

    const dueDate = addDays(today, STANDARD_LOAN_DAYS)
    const newLoan = {
      id: `LN-${String(Date.now()).slice(-6)}`,
      accession,
      memberId,
      issuedDate: today,
      dueDate,
      returnedDate: null,
      renewCount: 0,
      status: 'active',
    }

    setState(prev => {
      // If there was a ready hold, fulfill it
      const updatedReservations = prev.reservations.map(r => {
        if (r.accession === accession && r.memberId === memberId && r.status === 'ready') {
          return { ...r, status: 'fulfilled' }
        }
        return r
      })

      return {
        ...prev,
        loans: [newLoan, ...prev.loans],
        reservations: updatedReservations,
        activityLog: [
          {
            id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            action: 'issue',
            actor,
            memberId,
            memberName: member.name,
            accession,
            bookTitle: book.title,
            description: `"${book.title}" (${accession}) issued to ${member.name}. Due date: ${formatDisplayDate(dueDate)}.`,
          },
          ...prev.activityLog,
        ],
      }
    })

    return newLoan
  }, [computedBooks, computedMembers, today, state.reservations])

  /* ── 2. Return Book ── */
  const returnBook = useCallback(({ loanId, actor = 'Librarian' }) => {
    const loan = computedLoans.find(l => l.id === loanId)
    if (!loan) throw new Error('Loan record not found')
    if (loan.status === 'returned') throw new Error('This book has already been returned.')

    const book = computedBooks.find(b => b.accession === loan.accession)
    const member = computedMembers.find(m => m.id === loan.memberId)

    const isOverdue = today > loan.dueDate
    const daysLate = isOverdue ? daysBetween(loan.dueDate, today) : 0
    const fineAmount = daysLate * state.fineDailyRate

    setState(prev => {
      // 1. Update loan
      const updatedLoans = prev.loans.map(l =>
        l.id === loanId ? { ...l, returnedDate: today, status: 'returned' } : l
      )

      // 2. If overdue, create fixed unpaid fine record
      const updatedFines = [...prev.fines]
      if (isOverdue && fineAmount > 0) {
        updatedFines.unshift({
          id: `FN-${String(Date.now()).slice(-6)}`,
          loanId: loan.id,
          memberId: loan.memberId,
          accession: loan.accession,
          reason: `Overdue loan: ${daysLate} days late @ ₹${state.fineDailyRate}/day`,
          amount: fineAmount,
          status: 'unpaid',
          createdAt: today,
          paidAt: null,
        })
      }

      // 3. Check waitlisted reservations: first person in queue becomes 'ready' with 5-day hold
      const updatedReservations = [...prev.reservations]
      const nextWaitlistIdx = updatedReservations.findIndex(
        r => r.accession === loan.accession && r.status === 'waiting'
      )

      const newActivities = []

      newActivities.push({
        id: `ACT-${Date.now()}-ret`,
        timestamp: new Date().toISOString(),
        action: 'return',
        actor,
        memberId: loan.memberId,
        memberName: member?.name || loan.memberId,
        accession: loan.accession,
        bookTitle: book?.title || loan.accession,
        description: `"${book?.title}" returned by ${member?.name}.${isOverdue ? ` Overdue by ${daysLate} days (fine of ₹${fineAmount} assessed).` : ''}`,
      })

      if (nextWaitlistIdx !== -1) {
        const nextRes = updatedReservations[nextWaitlistIdx]
        const holdExpiresAt = addDays(today, HOLD_EXPIRY_DAYS)
        updatedReservations[nextWaitlistIdx] = {
          ...nextRes,
          status: 'ready',
          holdExpiresAt,
          pickupLocation: 'Desk Bay 2 — Shelf R-04',
        }

        // Re-order remaining waiting
        let pos = 1
        updatedReservations.forEach((r, idx) => {
          if (r.accession === loan.accession && r.status === 'waiting' && idx !== nextWaitlistIdx) {
            updatedReservations[idx] = { ...r, queuePosition: pos++ }
          }
        })

        const nextMember = prev.members.find(m => m.id === nextRes.memberId)
        newActivities.push({
          id: `ACT-${Date.now()}-hold`,
          timestamp: new Date().toISOString(),
          action: 'hold_ready',
          actor: 'System',
          memberId: nextRes.memberId,
          memberName: nextMember?.name || nextRes.memberId,
          accession: loan.accession,
          bookTitle: book?.title || loan.accession,
          description: `Hold ready for ${nextMember?.name} on "${book?.title}". Hold expires ${formatDisplayDate(holdExpiresAt)}.`,
        })
      }

      return {
        ...prev,
        loans: updatedLoans,
        fines: updatedFines,
        reservations: updatedReservations,
        activityLog: [...newActivities, ...prev.activityLog],
      }
    })
  }, [computedLoans, computedBooks, computedMembers, today, state.fineDailyRate])

  /* ── 3. Renew Loan ── */
  const renewBook = useCallback(({ loanId, actor }) => {
    const loan = computedLoans.find(l => l.id === loanId)
    if (!loan) throw new Error('Loan not found')
    if (loan.status !== 'active') throw new Error('Only active loans can be renewed.')

    const member = computedMembers.find(m => m.id === loan.memberId)
    const book = computedBooks.find(b => b.accession === loan.accession)

    // Rule: Max 2 renewals
    if ((loan.renewCount || 0) >= MAX_RENEWALS) {
      throw new Error(`Cannot renew: maximum renewals reached (${MAX_RENEWALS}/${MAX_RENEWALS}).`)
    }

    // Rule: Blocked if overdue
    if (loan.isOverdue) {
      throw new Error('Cannot renew: this loan is overdue. Please return the book to the library.')
    }

    // Rule: Blocked if student has unpaid fines
    if (member && member.hasUnpaidFines) {
      throw new Error(`Cannot renew: student has ₹${member.totalFinesDue.toFixed(2)} in unpaid fines. Fines must be cleared first.`)
    }

    // Rule: Blocked if another student has the title reserved
    const hasReservation = state.reservations.some(
      r => r.accession === loan.accession &&
           r.memberId !== loan.memberId &&
           (r.status === 'waiting' || r.status === 'ready')
    )
    if (hasReservation) {
      throw new Error('Cannot renew: another student has requested or reserved this title.')
    }

    // Rule: Student account suspended
    if (member && member.status === 'suspended') {
      throw new Error('Cannot renew: member account is suspended.')
    }

    const newDueDate = addDays(loan.dueDate, STANDARD_LOAN_DAYS)
    const nextRenewCount = (loan.renewCount || 0) + 1

    setState(prev => ({
      ...prev,
      loans: prev.loans.map(l =>
        l.id === loanId ? { ...l, dueDate: newDueDate, renewCount: nextRenewCount } : l
      ),
      activityLog: [
        {
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          action: 'renew',
          actor: actor || member?.name || 'Student',
          memberId: loan.memberId,
          memberName: member?.name || loan.memberId,
          accession: loan.accession,
          bookTitle: book?.title || loan.accession,
          description: `Loan for "${book?.title}" renewed (+14 days). New due date: ${formatDisplayDate(newDueDate)} (Renewal ${nextRenewCount}/${MAX_RENEWALS}).`,
        },
        ...prev.activityLog,
      ],
    }))

    return newDueDate
  }, [computedLoans, computedMembers, computedBooks, state.reservations])

  /* ── 4. Reserve / Join Waitlist ── */
  const reserveBook = useCallback(({ accession, memberId, actor }) => {
    const book = computedBooks.find(b => b.accession === accession)
    const member = computedMembers.find(m => m.id === memberId)

    if (!book) throw new Error('Book not found')
    if (!member) throw new Error('Member not found')

    if (book.retired) throw new Error('Cannot reserve: this title is retired.')
    if (member.status === 'suspended') throw new Error('Cannot reserve: account is suspended.')

    // Rule: Student already holds an active copy
    const alreadyHolds = member.activeLoans.some(l => l.accession === accession)
    if (alreadyHolds) {
      throw new Error('Cannot reserve: you currently have an active copy of this title on loan.')
    }

    // Rule: Student already has an active reservation for this title
    const alreadyReserved = member.reservations.some(r => r.accession === accession && (r.status === 'waiting' || r.status === 'ready'))
    if (alreadyReserved) {
      throw new Error('Cannot reserve: you already have an active hold or waitlist request for this title.')
    }

    const isAvailableForPickup = book.availableCopies > 0
    let newReservation = null

    if (isAvailableForPickup) {
      // Direct pickup reservation with 5-day hold
      const holdExpiresAt = addDays(today, HOLD_EXPIRY_DAYS)
      newReservation = {
        id: `RES-${String(Date.now()).slice(-6)}`,
        accession,
        memberId,
        createdAt: today,
        status: 'ready',
        queuePosition: 1,
        holdExpiresAt,
        pickupLocation: 'Desk Bay 2 — Shelf R-04',
      }
    } else {
      // Join waitlist queue
      const existingQueueCount = state.reservations.filter(
        r => r.accession === accession && r.status === 'waiting'
      ).length
      newReservation = {
        id: `RES-${String(Date.now()).slice(-6)}`,
        accession,
        memberId,
        createdAt: today,
        status: 'waiting',
        queuePosition: existingQueueCount + 1,
        holdExpiresAt: null,
        pickupLocation: 'Main Circulation Desk',
      }
    }

    setState(prev => ({
      ...prev,
      reservations: [newReservation, ...prev.reservations],
      activityLog: [
        {
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          action: 'reserve',
          actor: actor || member.name,
          memberId,
          memberName: member.name,
          accession,
          bookTitle: book.title,
          description: isAvailableForPickup
            ? `"${book.title}" reserved for pickup by ${member.name}. Hold ready until ${formatDisplayDate(newReservation.holdExpiresAt)}.`
            : `${member.name} joined the waitlist for "${book.title}" at position #${newReservation.queuePosition}.`,
        },
        ...prev.activityLog,
      ],
    }))

    return newReservation
  }, [computedBooks, computedMembers, today, state.reservations])

  /* ── 5. Cancel Reservation ── */
  const cancelReservation = useCallback(({ reservationId, actor }) => {
    const res = state.reservations.find(r => r.id === reservationId)
    if (!res) throw new Error('Reservation not found')

    const book = computedBooks.find(b => b.accession === res.accession)
    const member = computedMembers.find(m => m.id === res.memberId)
    const wasReady = res.status === 'ready'

    setState(prev => {
      const updatedReservations = prev.reservations.map(r =>
        r.id === reservationId ? { ...r, status: 'cancelled' } : r
      )

      const newActivities = [
        {
          id: `ACT-${Date.now()}-cancel`,
          timestamp: new Date().toISOString(),
          action: 'cancel',
          actor: actor || member?.name || 'Student',
          memberId: res.memberId,
          memberName: member?.name || res.memberId,
          accession: res.accession,
          bookTitle: book?.title || res.accession,
          description: `Reservation for "${book?.title}" cancelled by ${actor || member?.name}.`,
        },
      ]

      // If a ready hold was cancelled, pass the available copy to the next waiting person
      if (wasReady) {
        const nextWaitingIdx = updatedReservations.findIndex(
          r => r.accession === res.accession && r.status === 'waiting'
        )
        if (nextWaitingIdx !== -1) {
          const nextRes = updatedReservations[nextWaitingIdx]
          const holdExpiry = addDays(today, HOLD_EXPIRY_DAYS)
          updatedReservations[nextWaitingIdx] = {
            ...nextRes,
            status: 'ready',
            queuePosition: 1,
            holdExpiresAt: holdExpiry,
            pickupLocation: 'Desk Bay 2 — Shelf R-04',
          }

          let pos = 2
          updatedReservations.forEach((r, idx) => {
            if (r.accession === res.accession && r.status === 'waiting' && idx !== nextWaitingIdx) {
              updatedReservations[idx] = { ...r, queuePosition: pos++ }
            }
          })

          const nextMember = prev.members.find(m => m.id === nextRes.memberId)
          newActivities.push({
            id: `ACT-${Date.now()}-hold`,
            timestamp: new Date().toISOString(),
            action: 'hold_ready',
            actor: 'System',
            memberId: nextRes.memberId,
            memberName: nextMember?.name || nextRes.memberId,
            accession: res.accession,
            bookTitle: book?.title || res.accession,
            description: `Hold re-assigned to ${nextMember?.name}: ready for pickup until ${formatDisplayDate(holdExpiry)}.`,
          })
        }
      } else {
        // Just re-order the waiting queue
        let pos = 1
        updatedReservations.forEach((r, idx) => {
          if (r.accession === res.accession && r.status === 'waiting') {
            updatedReservations[idx] = { ...r, queuePosition: pos++ }
          }
        })
      }

      return {
        ...prev,
        reservations: updatedReservations,
        activityLog: [...newActivities, ...prev.activityLog],
      }
    })
  }, [state.reservations, computedBooks, computedMembers, today])

  /* ── 6. Fines: Mark Paid ── */
  const markFinePaid = useCallback(({ fineId, actor = 'Librarian' }) => {
    const fine = state.fines.find(f => f.id === fineId)
    if (!fine) throw new Error('Fine record not found')

    const member = computedMembers.find(m => m.id === fine.memberId)

    setState(prev => ({
      ...prev,
      fines: prev.fines.map(f =>
        f.id === fineId ? { ...f, status: 'paid', paidAt: today } : f
      ),
      activityLog: [
        {
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          action: 'fine_paid',
          actor,
          memberId: fine.memberId,
          memberName: member?.name || fine.memberId,
          accession: fine.accession,
          bookTitle: prev.books.find(b => b.accession === fine.accession)?.title || '',
          description: `Fine of ₹${fine.amount} for ${member?.name || fine.memberId} marked as paid by ${actor}.`,
        },
        ...prev.activityLog,
      ],
    }))
  }, [state.fines, computedMembers, today])

  /* ── 7. Books: Add, Edit, Retire ── */
  const addBook = useCallback((bookData, actor = 'Librarian') => {
    const accession = bookData.accession || `BB-${String(Date.now()).slice(-4)}`
    const totalCopies = Number(bookData.totalCopies) || 1
    const newBook = {
      ...bookData,
      accession,
      totalCopies,
      retired: false,
    }

    setState(prev => ({
      ...prev,
      books: [newBook, ...prev.books],
      activityLog: [
        {
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          action: 'book_added',
          actor,
          memberId: null,
          memberName: null,
          accession,
          bookTitle: newBook.title,
          description: `New book "${newBook.title}" (${accession}) added to catalogue (${totalCopies} copies).`,
        },
        ...prev.activityLog,
      ],
    }))

    return newBook
  }, [])

  const updateBook = useCallback((accession, patch, actor = 'Librarian') => {
    setState(prev => {
      const book = prev.books.find(b => b.accession === accession)
      return {
        ...prev,
        books: prev.books.map(b => (b.accession === accession ? { ...b, ...patch } : b)),
        activityLog: [
          {
            id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            timestamp: new Date().toISOString(),
            action: 'book_edited',
            actor,
            memberId: null,
            memberName: null,
            accession,
            bookTitle: book?.title || accession,
            description: `Book "${book?.title || accession}" details updated by ${actor}.`,
          },
          ...prev.activityLog,
        ],
      }
    })
  }, [])

  const uploadCover = useCallback((accession, dataUrl) => {
    // TODO: replace with multipart upload to backend endpoint
    updateBook(accession, { coverGrid: dataUrl, coverLarge: dataUrl, uploadedCover: dataUrl })
  }, [updateBook])

  const retireBook = useCallback((accession, actor = 'Librarian') => {
    const book = computedBooks.find(b => b.accession === accession)
    if (!book) throw new Error('Book not found')

    // Rule: A book with active loans can't be retired
    if (book.activeLoansCount > 0) {
      throw new Error('Cannot retire: title has active loans.')
    }

    setState(prev => ({
      ...prev,
      books: prev.books.map(b => (b.accession === accession ? { ...b, retired: true } : b)),
      activityLog: [
        {
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          action: 'book_retired',
          actor,
          memberId: null,
          memberName: null,
          accession,
          bookTitle: book.title,
          description: `Book "${book.title}" (${accession}) retired from active circulation.`,
        },
        ...prev.activityLog,
      ],
    }))
  }, [computedBooks])

  /* ── 8. Members: Register, Edit, Suspend ── */
  const registerMember = useCallback(({ name, email, studentId, dept = 'General' }) => {
    // Check duplicate email
    const emailLower = email.trim().toLowerCase()
    const idClean = studentId.trim().toUpperCase()

    const emailExists = state.members.some(m => m.email.toLowerCase() === emailLower)
    if (emailExists) {
      throw new Error(`An account with email "${email}" already exists. Please sign in instead.`)
    }

    const idExists = state.members.some(m => m.studentId.toUpperCase() === idClean)
    if (idExists) {
      throw new Error(`Student ID "${studentId}" is already registered.`)
    }

    const newMember = {
      id: idClean,
      name: name.trim(),
      email: emailLower,
      studentId: idClean,
      dept: dept.trim() || 'General',
      status: 'active',
      joined: new Date().toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase(),
      expires: 'JUN 2028',
    }

    setState(prev => ({
      ...prev,
      members: [newMember, ...prev.members],
      activityLog: [
        {
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          action: 'member_registered',
          actor: newMember.name,
          memberId: newMember.id,
          memberName: newMember.name,
          accession: null,
          bookTitle: null,
          description: `New student ${newMember.name} (${newMember.studentId}, ${newMember.dept}) registered.`,
        },
        ...prev.activityLog,
      ],
    }))

    return newMember
  }, [state.members])

  const toggleSuspendMember = useCallback((id, actor = 'Librarian') => {
    const member = computedMembers.find(m => m.id === id)
    if (!member) throw new Error('Member not found')

    const newStatus = member.status === 'active' ? 'suspended' : 'active'

    setState(prev => ({
      ...prev,
      members: prev.members.map(m => (m.id === id ? { ...m, status: newStatus } : m)),
      activityLog: [
        {
          id: `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toISOString(),
          action: newStatus === 'suspended' ? 'member_suspended' : 'member_reinstated',
          actor,
          memberId: id,
          memberName: member.name,
          accession: null,
          bookTitle: null,
          description: `Account for ${member.name} (${id}) ${newStatus === 'suspended' ? 'suspended' : 'reinstated'} by ${actor}.${newStatus === 'suspended' && member.booksOut > 0 ? ` (Warning: Member currently holds ${member.booksOut} active loans).` : ''}`,
        },
        ...prev.activityLog,
      ],
    }))
  }, [computedMembers])

  /* ── 9. Dev-only Date Travel ── */
  const setSimulatedDate = useCallback((newDateStr) => {
    setState(prev => ({ ...prev, simulatedDate: newDateStr }))
  }, [])

  const advanceDateDays = useCallback((days) => {
    setState(prev => {
      const current = prev.simulatedDate || new Date().toISOString().split('T')[0]
      return { ...prev, simulatedDate: addDays(current, days) }
    })
  }, [])

  const resetDateToToday = useCallback(() => {
    setState(prev => ({ ...prev, simulatedDate: SEED_DATE }))
  }, [])

  /* ── Reset entire store to initial seed ── */
  const resetEntireStore = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState({
      books: INITIAL_BOOKS,
      members: INITIAL_MEMBERS,
      loans: INITIAL_LOANS,
      reservations: INITIAL_RESERVATIONS,
      fines: INITIAL_FINES,
      activityLog: INITIAL_ACTIVITY,
      simulatedDate: SEED_DATE,
      fineDailyRate: FINE_DAILY_RATE,
    })
  }, [])

  return (
    <LibraryStoreContext.Provider
      value={{
        // Raw & Computed entities
        today,
        simulatedDate: state.simulatedDate,
        fineDailyRate: state.fineDailyRate,
        books: computedBooks,
        members: computedMembers,
        loans: computedLoans,
        reservations: computedReservations,
        fines: state.fines,
        activityLog: state.activityLog,
        vendors: MOCK_VENDORS,
        orders: MOCK_ORDERS,

        // Core business methods
        issueBook,
        returnBook,
        renewBook,
        reserveBook,
        cancelReservation,
        markFinePaid,

        // Book management
        addBook,
        updateBook,
        uploadCover,
        retireBook,

        // Member management
        registerMember,
        toggleSuspendMember,

        // Dev date simulation
        setSimulatedDate,
        advanceDateDays,
        resetDateToToday,
        resetEntireStore,

        // Legacy compatibility aliases
        issueLoan: (l) => issueBook({ accession: l.accession, memberId: l.memberId }),
        returnLoan: (id, t) => returnBook({ loanId: id }),
        renewLoan: (id) => renewBook({ loanId: id, actor: 'Librarian' }),
      }}
    >
      {children}
    </LibraryStoreContext.Provider>
  )
}

export function useLibraryStore() {
  const ctx = useContext(LibraryStoreContext)
  if (!ctx) throw new Error('useLibraryStore must be used inside LibraryStoreProvider')
  return ctx
}

// Legacy alias so existing imports don't break
export const useAdminStore = useLibraryStore
export const AdminStoreProvider = LibraryStoreProvider
export default useLibraryStore
