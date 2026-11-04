import React, { createContext, useContext, useState } from 'react'
import { ALL_BOOKS } from './books'
import { MOCK_MEMBERS, MOCK_LOANS } from './mockAdminData'

const AdminStoreContext = createContext(null)

export function AdminStoreProvider({ children }) {
  const [books, setBooks] = useState(() =>
    ALL_BOOKS.map(b => {
      const avail = b.availableCopies ?? (b.available !== false ? 1 : 0)
      let initialStatus = avail > 0 ? 'Available' : 'On Loan'
      // Seed initial representative statuses for the 5-status system
      if (b.accession === 'BB-0001' || b.accession === 'BB-0010') {
        initialStatus = 'Overdue'
      } else if (b.accession === 'BB-0005') {
        initialStatus = 'Reserved'
      }

      return {
        ...b,
        totalCopies: b.totalCopies ?? 1,
        availableCopies: avail,
        bookStatus: b.bookStatus ?? initialStatus,
        retired: false,
      }
    })
  )

  const [members, setMembers] = useState(MOCK_MEMBERS)

  const [loans, setLoans] = useState(() => {
    // Seed initial loans with renewCounts and add mock reserved loans
    const base = MOCK_LOANS.map(l => ({
      ...l,
      // LN-0002 has max renewals reached (2/2) to test disabled reason
      renewCount: l.id === 'LN-0002' ? 2 : 0,
    }))

    // Add mock reserved loans so reservations and renewal conflict checks can be demonstrated
    const reservedSeeds = [
      {
        id: 'LN-0015',
        accession: 'BB-0006',
        memberId: 'STU-004',
        memberName: 'Devraj Singh',
        issuedDate: '2026-09-12',
        dueDate: '2026-09-26',
        returnedDate: null,
        status: 'reserved',
        renewCount: 0,
      },
      {
        id: 'LN-0016',
        accession: 'BB-0005',
        memberId: 'STU-001',
        memberName: 'Aisha Patel',
        issuedDate: '2026-09-10',
        dueDate: '2026-09-24',
        returnedDate: null,
        status: 'reserved',
        renewCount: 0,
      },
    ]

    return [...base, ...reservedSeeds]
  })

  // Book actions
  const addBook = (bookData) => {
    const accession = bookData.accession || `BB-${String(Date.now()).slice(-4)}`
    const totalCopies = Number(bookData.totalCopies) || 1
    const availableCopies = bookData.availableCopies !== undefined ? Number(bookData.availableCopies) : totalCopies
    const newBook = {
      ...bookData,
      id: Date.now(),
      accession,
      totalCopies,
      availableCopies,
      bookStatus: bookData.bookStatus || (availableCopies > 0 ? 'Available' : 'On Loan'),
      retired: false,
    }
    setBooks(bs => [newBook, ...bs])
    return newBook
  }

  const updateBook = (accession, patch) => {
    setBooks(bs => bs.map(b => (b.accession === accession ? { ...b, ...patch } : b)))
  }

  const retireBook = (accession) => {
    setBooks(bs =>
      bs.map(b =>
        b.accession === accession ? { ...b, retired: true, bookStatus: 'Retired' } : b
      )
    )
  }

  const uploadCover = (accession, dataUrl) => {
    // TODO: replace with multipart upload to backend endpoint
    updateBook(accession, { coverGrid: dataUrl, coverLarge: dataUrl, uploadedCover: dataUrl })
  }

  // Loan actions
  const issueLoan = (loan) => {
    setLoans(ls => [loan, ...ls])
    setBooks(bs =>
      bs.map(b => {
        if (b.accession === loan.accession) {
          const newAvail = Math.max(0, (b.availableCopies ?? 1) - 1)
          return {
            ...b,
            availableCopies: newAvail,
            bookStatus: newAvail === 0 ? 'On Loan' : b.bookStatus,
          }
        }
        return b
      })
    )
    if (loan.memberId) {
      setMembers(ms =>
        ms.map(m => (m.id === loan.memberId ? { ...m, booksOut: (m.booksOut || 0) + 1 } : m))
      )
    }
  }

  const returnLoan = (loanId, today) => {
    let returnAccession = null
    let returnMemberId = null

    setLoans(ls =>
      ls.map(l => {
        if (l.id === loanId) {
          returnAccession = l.accession
          returnMemberId = l.memberId
          return { ...l, returnedDate: today, status: 'returned' }
        }
        return l
      })
    )

    if (returnAccession) {
      setBooks(bs =>
        bs.map(b => {
          if (b.accession === returnAccession) {
            const newAvail = (b.availableCopies ?? 0) + 1
            return {
              ...b,
              availableCopies: newAvail,
              bookStatus: 'Available',
            }
          }
          return b
        })
      )
    }

    if (returnMemberId) {
      setMembers(ms =>
        ms.map(m =>
          m.id === returnMemberId ? { ...m, booksOut: Math.max(0, (m.booksOut || 0) - 1) } : m
        )
      )
    }
  }

  const renewLoan = (loanId) => {
    setLoans(ls =>
      ls.map(l => {
        if (l.id !== loanId) return l
        const newDue = new Date(l.dueDate)
        newDue.setDate(newDue.getDate() + 14)
        return {
          ...l,
          dueDate: newDue.toISOString().split('T')[0],
          renewCount: (l.renewCount || 0) + 1,
          status: 'active',
        }
      })
    )
  }

  // Member actions
  const addMember = (member) => {
    setMembers(ms => [{ ...member, booksOut: member.booksOut || 0, fines: member.fines || 0 }, ...ms])
  }

  const updateMember = (id, patch) => {
    setMembers(ms => ms.map(m => (m.id === id ? { ...m, ...patch } : m)))
  }

  const toggleSuspendMember = (id) => {
    setMembers(ms =>
      ms.map(m =>
        m.id === id ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } : m
      )
    )
  }

  return (
    <AdminStoreContext.Provider
      value={{
        books,
        members,
        loans,
        addBook,
        updateBook,
        retireBook,
        uploadCover,
        issueLoan,
        returnLoan,
        renewLoan,
        addMember,
        updateMember,
        toggleSuspendMember,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  )
}

export function useAdminStore() {
  const ctx = useContext(AdminStoreContext)
  if (!ctx) throw new Error('useAdminStore must be used inside AdminStoreProvider')
  return ctx
}
