/**
 * mockAdminData.js
 *
 * Single source of truth for admin-specific entities:
 *   MOCK_MEMBERS  — student/member records
 *   MOCK_VENDORS  — vendor directory
 *   MOCK_ORDERS   — book purchase orders (reference MOCK_VENDORS)
 *   MOCK_LOANS    — active / historical loan records (reference ALL_BOOKS accessions)
 *
 * Books themselves come from ALL_BOOKS (data/books.js) — never duplicate that array here.
 */

/* ── Members ───────────────────────────────────────────────── */
export const MOCK_MEMBERS = [
  { id: 'STU-001', name: 'Aisha Patel',      dept: 'Computer Science', booksOut: 2, fines: 0,    status: 'active' },
  { id: 'STU-002', name: 'Rahul Mehta',      dept: 'Mathematics',      booksOut: 0, fines: 15.50, status: 'active' },
  { id: 'STU-003', name: 'Priya Sharma',     dept: 'Engineering',      booksOut: 3, fines: 0,    status: 'active' },
  { id: 'STU-004', name: 'Devraj Singh',     dept: 'Networks',         booksOut: 1, fines: 5.00,  status: 'active' },
  { id: 'STU-005', name: 'Meera Rao',        dept: 'Psychology',       booksOut: 0, fines: 0,    status: 'suspended' },
  { id: 'STU-006', name: 'Kiran Joshi',      dept: 'Management',       booksOut: 1, fines: 0,    status: 'active' },
  { id: 'STU-007', name: 'Ananya Verma',     dept: 'Computer Science', booksOut: 2, fines: 22.00, status: 'active' },
  { id: 'STU-008', name: 'Siddharth Nair',   dept: 'Engineering',      booksOut: 0, fines: 0,    status: 'active' },
  { id: 'STU-009', name: 'Tanvi Gupta',      dept: 'Mathematics',      booksOut: 1, fines: 0,    status: 'active' },
  { id: 'STU-010', name: 'Arjun Krishnan',   dept: 'Systems & OS',     booksOut: 4, fines: 50.00, status: 'suspended' },
]

/* ── Vendors ───────────────────────────────────────────────── */
export const MOCK_VENDORS = [
  { id: 'VND-001', name: 'Technocraft Books',   contact: 'technocraft@bookdist.in',  phone: '+91-11-2345-6789' },
  { id: 'VND-002', name: 'Rupa Publications',    contact: 'orders@rupapub.com',        phone: '+91-22-4567-8901' },
  { id: 'VND-003', name: 'Oxford India',         contact: 'india@oup.com',             phone: '+91-11-9876-5432' },
  { id: 'VND-004', name: 'MIT Press Direct',     contact: 'directorders@mitpress.edu', phone: '+1-617-253-5646'  },
  { id: 'VND-005', name: 'Springer Distribution',contact: 'dist@springer.com',         phone: '+91-80-2341-2345' },
]

/* ── Orders ────────────────────────────────────────────────── */
export const MOCK_ORDERS = [
  { id: 'ORD-001', title: 'Clean Code',                          vendorId: 'VND-001', qty: 3, status: 'received',  orderedDate: '2026-07-10', receivedDate: '2026-07-22' },
  { id: 'ORD-002', title: 'Design Patterns: GoF',                vendorId: 'VND-002', qty: 2, status: 'pending',   orderedDate: '2026-09-01', receivedDate: null },
  { id: 'ORD-003', title: 'Computer Networks (Tanenbaum)',        vendorId: 'VND-003', qty: 5, status: 'received',  orderedDate: '2026-06-15', receivedDate: '2026-06-30' },
  { id: 'ORD-004', title: 'The Algorithm Design Manual',         vendorId: 'VND-004', qty: 2, status: 'pending',   orderedDate: '2026-09-12', receivedDate: null },
  { id: 'ORD-005', title: 'Operating Systems: Internals (SGG)', vendorId: 'VND-005', qty: 4, status: 'shipped',   orderedDate: '2026-09-05', receivedDate: null },
  { id: 'ORD-006', title: 'Introduction to Psychology',          vendorId: 'VND-002', qty: 3, status: 'received',  orderedDate: '2026-08-01', receivedDate: '2026-08-14' },
]

/* ── Active Loans ──────────────────────────────────────────── */
// accession references ALL_BOOKS so data is shared, not duplicated
export const MOCK_LOANS = [
  { id: 'LN-0001', accession: 'BB-0001', memberId: 'STU-003', memberName: 'Priya Sharma',   issuedDate: '2026-08-20', dueDate: '2026-09-03', returnedDate: null,         status: 'overdue'   },
  { id: 'LN-0002', accession: 'BB-0004', memberId: 'STU-001', memberName: 'Aisha Patel',    issuedDate: '2026-09-01', dueDate: '2026-09-15', returnedDate: null,         status: 'active'    },
  { id: 'LN-0003', accession: 'BB-0007', memberId: 'STU-007', memberName: 'Ananya Verma',   issuedDate: '2026-08-25', dueDate: '2026-09-08', returnedDate: null,         status: 'overdue'   },
  { id: 'LN-0004', accession: 'BB-0010', memberId: 'STU-010', memberName: 'Arjun Krishnan', issuedDate: '2026-08-15', dueDate: '2026-08-29', returnedDate: null,         status: 'overdue'   },
  { id: 'LN-0005', accession: 'BB-0003', memberId: 'STU-006', memberName: 'Kiran Joshi',    issuedDate: '2026-09-05', dueDate: '2026-09-19', returnedDate: null,         status: 'active'    },
  { id: 'LN-0006', accession: 'BB-0005', memberId: 'STU-009', memberName: 'Tanvi Gupta',    issuedDate: '2026-09-10', dueDate: '2026-09-24', returnedDate: null,         status: 'active'    },
  { id: 'LN-0007', accession: 'BB-0002', memberId: 'STU-004', memberName: 'Devraj Singh',   issuedDate: '2026-09-12', dueDate: '2026-09-26', returnedDate: null,         status: 'active'    },
  { id: 'LN-0008', accession: 'BB-0006', memberId: 'STU-003', memberName: 'Priya Sharma',   issuedDate: '2026-09-01', dueDate: '2026-09-15', returnedDate: null,         status: 'active'    },
  { id: 'LN-0009', accession: 'BB-0008', memberId: 'STU-007', memberName: 'Ananya Verma',   issuedDate: '2026-08-10', dueDate: '2026-08-24', returnedDate: '2026-08-23', status: 'returned'  },
  { id: 'LN-0010', accession: 'BB-0011', memberId: 'STU-002', memberName: 'Rahul Mehta',    issuedDate: '2026-07-20', dueDate: '2026-08-03', returnedDate: '2026-08-10', status: 'overdue'   },
  { id: 'LN-0011', accession: 'BB-0009', memberId: 'STU-010', memberName: 'Arjun Krishnan', issuedDate: '2026-08-01', dueDate: '2026-08-15', returnedDate: null,         status: 'overdue'   },
  { id: 'LN-0012', accession: 'BB-0012', memberId: 'STU-010', memberName: 'Arjun Krishnan', issuedDate: '2026-08-01', dueDate: '2026-08-15', returnedDate: null,         status: 'overdue'   },
  { id: 'LN-0013', accession: 'BB-0013', memberId: 'STU-010', memberName: 'Arjun Krishnan', issuedDate: '2026-08-05', dueDate: '2026-08-19', returnedDate: null,         status: 'overdue'   },
  { id: 'LN-0014', accession: 'BB-0015', memberId: 'STU-007', memberName: 'Ananya Verma',   issuedDate: '2026-08-18', dueDate: '2026-09-01', returnedDate: null,         status: 'overdue'   },
]

/* ── Helpers ───────────────────────────────────────────────── */
export function getVendorById(id) {
  return MOCK_VENDORS.find(v => v.id === id) ?? null
}

export function getMemberById(id) {
  return MOCK_MEMBERS.find(m => m.id === id) ?? null
}

export function getActiveLoans() {
  return MOCK_LOANS.filter(l => l.status === 'active' || l.status === 'overdue')
}

export function getOverdueLoans() {
  return MOCK_LOANS.filter(l => l.status === 'overdue')
}
