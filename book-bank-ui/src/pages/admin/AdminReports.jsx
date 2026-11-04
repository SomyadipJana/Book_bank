/**
 * AdminReports.jsx
 * 4 tabs:
 * 1. Overdue Items
 * 2. Inventory Status
 * 3. Most Borrowed
 * 4. Fines (Outstanding & Collected)
 * Export CSV button on each tab.
 * Connected to unified LibraryStore.
 */
import React, { useState, useMemo } from 'react'
import { useLibraryStore } from '../../data/libraryStore'
import { Button } from '../../components'

/* ── CSV export utility ── */
function toCSV(rows, cols) {
  const header = cols.map(c => `"${c.label}"`).join(',')
  const body = rows.map(r =>
    cols.map(c => {
      const v = typeof c.get === 'function' ? c.get(r) : r[c.key]
      return `"${String(v ?? '').replace(/"/g, '""')}"`
    }).join(',')
  ).join('\n')
  return `${header}\n${body}`
}

function downloadCSV(content, filename) {
  const blob = new Blob([content], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/* ── Tab 1: Overdue Items ── */
function OverdueTab() {
  const { loans } = useLibraryStore()
  const overdueLoans = useMemo(() => loans.filter(l => l.isOverdue), [loans])

  const cols = [
    { label: 'Loan ID',        key: 'id' },
    { label: 'Member Name',    key: 'memberName' },
    { label: 'Student ID',     key: 'memberId' },
    { label: 'Accession',      key: 'accession' },
    { label: 'Book Title',     key: 'bookTitle' },
    { label: 'Due Date',       key: 'dueDate' },
    { label: 'Days Overdue',   key: 'daysLate' },
    { label: 'Accrued Fine (₹)', get: r => `₹${r.accruedFine}` },
  ]

  const export_ = () => downloadCSV(toCSV(overdueLoans, cols), 'overdue_report.csv')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-charcoal-60)' }}>
          {overdueLoans.length} titles currently overdue (@ ₹5/day)
        </span>
        <Button variant="secondary" style={{ fontSize: '0.8125rem', padding: '7px 16px' }} onClick={export_}>
          Export CSV
        </Button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>{cols.map(c => <th key={c.label}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {overdueLoans.map(l => (
              <tr key={l.id}>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.id}</td>
                <td style={{ fontWeight: 500 }}>{l.memberName}</td>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.memberId}</td>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.accession}</td>
                <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {l.bookTitle}
                </td>
                <td style={{ color: 'var(--color-oxblood)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{l.dueDate}</td>
                <td style={{ color: 'var(--color-oxblood)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600 }}>
                  +{l.daysLate}d
                </td>
                <td style={{ color: 'var(--color-oxblood)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 700 }}>
                  ₹{l.accruedFine}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {overdueLoans.length === 0 && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-charcoal-60)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
          No overdue loans. All books returned on time!
        </div>
      )}
    </div>
  )
}

/* ── Tab 2: Inventory Status ── */
function InventoryTab() {
  const { books } = useLibraryStore()

  const cols = [
    { label: 'Accession',        key: 'accession' },
    { label: 'Title',            key: 'title' },
    { label: 'Author',           key: 'author' },
    { label: 'Category',         key: 'category' },
    { label: 'Total Copies',     key: 'totalCopies' },
    { label: 'Available Copies', key: 'availableCopies' },
    { label: 'Active Loans',     key: 'activeLoansCount' },
    { label: 'Status',           get: b => b.bookStatus || (b.retired ? 'Retired' : 'Available') },
  ]

  const export_ = () => downloadCSV(toCSV(books, cols), 'inventory_report.csv')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-charcoal-60)' }}>
          {books.length} unique titles registered in catalogue
        </span>
        <Button variant="secondary" style={{ fontSize: '0.8125rem', padding: '7px 16px' }} onClick={export_}>
          Export CSV
        </Button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>{cols.map(c => <th key={c.label}>{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b.accession} className={b.retired ? 'row--retired' : ''}>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{b.accession}</td>
                <td style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.title}
                </td>
                <td style={{ color: 'var(--color-charcoal-60)' }}>{b.author}</td>
                <td>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                    backgroundColor: 'rgba(30,61,50,0.07)', padding: '2px 6px', borderRadius: 3,
                  }}>
                    {b.category}
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{b.totalCopies ?? 1}</td>
                <td style={{
                  textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600,
                  color: (b.availableCopies ?? 0) === 0 ? 'var(--color-oxblood)' : 'var(--color-ink)',
                }}>
                  {b.availableCopies ?? 0}
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{b.activeLoansCount ?? 0}</td>
                <td>
                  <span className={`admin-badge admin-badge--${
                    b.retired ? 'overdue' : (b.availableCopies > 0 ? 'avail' : 'loan')
                  }`}>
                    {b.bookStatus || (b.retired ? 'Retired' : 'Available')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Tab 3: Most Borrowed ── */
function MostBorrowedTab() {
  const { books, loans } = useLibraryStore()

  const { rows, cols } = useMemo(() => {
    const counts = {}
    loans.forEach(l => {
      counts[l.accession] = (counts[l.accession] || 0) + 1
    })

    const r = books
      .map(b => ({ ...b, borrowCount: counts[b.accession] || 0 }))
      .sort((a, b) => b.borrowCount - a.borrowCount)
      .slice(0, 50)

    const c = [
      { label: 'Rank',         get: (_, i) => i + 1 },
      { label: 'Accession',    key: 'accession' },
      { label: 'Title',        key: 'title' },
      { label: 'Category',     key: 'category' },
      { label: 'Times Issued', key: 'borrowCount' },
    ]
    return { rows: r, cols: c }
  }, [books, loans])

  const export_ = () => downloadCSV(
    toCSV(rows.map((r, i) => ({ ...r, rank: i + 1 })), cols),
    'most_borrowed_report.csv'
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-charcoal-60)' }}>
          Top titles ranked by total checkout count
        </span>
        <Button variant="secondary" style={{ fontSize: '0.8125rem', padding: '7px 16px' }} onClick={export_}>
          Export CSV
        </Button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>#</th>
              <th>Accession</th>
              <th>Title</th>
              <th>Category</th>
              <th style={{ textAlign: 'center' }}>Times Issued</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b, i) => (
              <tr key={b.accession}>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-charcoal-60)' }}>
                  {i < 3 ? ['🥇','🥈','🥉'][i] : i + 1}
                </td>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{b.accession}</td>
                <td style={{ fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</td>
                <td style={{ color: 'var(--color-charcoal-60)' }}>{b.category}</td>
                <td style={{
                  textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.85rem',
                  fontWeight: 600, color: b.borrowCount > 0 ? 'var(--color-ochre)' : 'var(--color-charcoal-60)'
                }}>
                  {b.borrowCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Tab 4: Fines Outstanding & Collected ── */
function FinesTab() {
  const { fines, members, loans } = useLibraryStore()

  // Computed total outstanding: fixed unpaid fines + currently accrued overdue fines
  const totalOutstanding = useMemo(() => {
    const fixedUnpaid = fines.filter(f => f.status === 'unpaid').reduce((s, f) => s + Number(f.amount || 0), 0)
    const overdueAccrued = loans.filter(l => l.isOverdue).reduce((s, l) => s + Number(l.accruedFine || 0), 0)
    return fixedUnpaid + overdueAccrued
  }, [fines, loans])

  const totalCollected = useMemo(() => {
    return fines.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount || 0), 0)
  }, [fines])

  const cols = [
    { label: 'Fine ID',        key: 'id' },
    { label: 'Member Name',    key: 'memberName' },
    { label: 'Student ID',     key: 'memberId' },
    { label: 'Accession',      key: 'accession' },
    { label: 'Reason',         key: 'reason' },
    { label: 'Date Incurred',  key: 'dateIncurred' },
    { label: 'Amount (₹)',     get: f => `₹${Number(f.amount).toFixed(2)}` },
    { label: 'Status',         key: 'status' },
    { label: 'Date Paid',      get: f => f.paidDate || '—' },
  ]

  const export_ = () => downloadCSV(toCSV(fines, cols), 'fines_report.csv')

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(122,46,39,0.2)', padding: '16px 20px', borderRadius: 4 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-oxblood)', fontWeight: 700 }}>
            Total Outstanding Fines
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-oxblood)', marginTop: 4 }}>
            ₹{totalOutstanding.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-60)', marginTop: 2 }}>
            Uncollected overdue & fee charges
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid rgba(30,61,50,0.2)', padding: '16px 20px', borderRadius: 4 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--color-ink)', fontWeight: 700 }}>
            Total Collected Fines
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-ink)', marginTop: 4 }}>
            ₹{totalCollected.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-60)', marginTop: 2 }}>
            Settled and recorded as paid
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-charcoal-60)' }}>
          {fines.length} fine records in ledger
        </span>
        <Button variant="secondary" style={{ fontSize: '0.8125rem', padding: '7px 16px' }} onClick={export_}>
          Export CSV
        </Button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Invoice ID</th>
              <th>Member</th>
              <th>Accession</th>
              <th>Reason</th>
              <th>Incurred</th>
              <th>Amount (₹)</th>
              <th>Status</th>
              <th>Settled Date</th>
            </tr>
          </thead>
          <tbody>
            {fines.map(f => (
              <tr key={f.id}>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{f.id}</td>
                <td style={{ fontWeight: 500 }}>
                  {f.memberName}
                  <span className="mono-label" style={{ color: 'var(--color-charcoal-60)', fontSize: '0.7rem', marginLeft: 6 }}>
                    ({f.memberId})
                  </span>
                </td>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{f.accession || '—'}</td>
                <td>{f.reason}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{f.dateIncurred}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: f.status === 'unpaid' ? 'var(--color-oxblood)' : 'inherit' }}>
                  ₹{Number(f.amount).toFixed(2)}
                </td>
                <td>
                  <span className={`admin-badge admin-badge--${f.status === 'paid' ? 'avail' : 'overdue'}`}>
                    {f.status === 'paid' ? 'Settled' : 'Unpaid'}
                  </span>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-charcoal-60)' }}>
                  {f.paidDate || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Main Reports view ── */
const TABS = [
  { id: 'overdue',    label: 'Overdue Items' },
  { id: 'inventory',  label: 'Inventory Status' },
  { id: 'borrowed',   label: 'Most Borrowed' },
  { id: 'fines',      label: 'Fines (Outstanding & Collected)' },
]

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('overdue')

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 24,
        borderBottom: '1px solid rgba(30,61,50,0.12)',
        overflowX: 'auto',
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: activeTab === t.id ? 600 : 400,
              color: activeTab === t.id ? 'var(--color-charcoal)' : 'var(--color-charcoal-60)',
              background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid var(--color-ochre)' : '2px solid transparent',
              padding: '8px 18px 10px', cursor: 'pointer', marginBottom: -1,
              transition: 'color 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overdue'   && <OverdueTab />}
      {activeTab === 'inventory' && <InventoryTab />}
      {activeTab === 'borrowed'  && <MostBorrowedTab />}
      {activeTab === 'fines'     && <FinesTab />}
    </div>
  )
}
