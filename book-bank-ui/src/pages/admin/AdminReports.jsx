/**
 * AdminReports.jsx
 * 3 tabs: Overdue items, Inventory status, Most borrowed.
 * Export CSV button on each tab.
 */
import React, { useState, useMemo } from 'react'
import { ALL_BOOKS } from '../../data/books'
import { MOCK_LOANS, getOverdueLoans } from '../../data/mockAdminData'
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
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

/* ── Tab: Overdue ── */
function OverdueTab() {
  const loans = getOverdueLoans()

  const cols = [
    { label: 'Loan ID',    key: 'id' },
    { label: 'Member',     key: 'memberName' },
    { label: 'Accession',  key: 'accession' },
    { label: 'Book Title', get: r => ALL_BOOKS.find(b => b.accession === r.accession)?.title ?? r.accession },
    { label: 'Due Date',   key: 'dueDate' },
    { label: 'Days Late',  get: r => {
      const diff = Math.floor((Date.now() - new Date(r.dueDate)) / 86400000)
      return diff > 0 ? diff : 0
    }},
  ]

  const export_ = () => downloadCSV(toCSV(loans, cols), 'overdue_report.csv')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Button variant="secondary" style={{ fontSize: '0.8125rem', padding: '7px 16px' }} onClick={export_}>
          Export CSV
        </Button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>{cols.map(c => <th key={c.label}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {loans.map(l => {
            const book = ALL_BOOKS.find(b => b.accession === l.accession)
            const daysLate = Math.floor((Date.now() - new Date(l.dueDate)) / 86400000)
            return (
              <tr key={l.id}>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.id}</td>
                <td style={{ fontWeight: 500 }}>{l.memberName}</td>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.accession}</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {book?.title ?? l.accession}
                </td>
                <td style={{ color: 'var(--color-oxblood)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{l.dueDate}</td>
                <td style={{ color: 'var(--color-oxblood)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600 }}>
                  {daysLate > 0 ? `+${daysLate}d` : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {loans.length === 0 && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-charcoal-60)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
          No overdue loans. Great news!
        </div>
      )}
    </div>
  )
}

/* ── Tab: Inventory ── */
function InventoryTab() {
  const cols = [
    { label: 'Accession',  key: 'accession' },
    { label: 'Title',      key: 'title' },
    { label: 'Category',   key: 'category' },
    { label: 'Total',      key: 'totalCopies' },
    { label: 'Available',  get: b => b.availableCopies ?? (b.available ? 1 : 0) },
    { label: 'On Loan',    get: b => (b.totalCopies || 1) - (b.availableCopies ?? (b.available ? 1 : 0)) },
  ]

  const rows = ALL_BOOKS.map(b => ({ ...b })).sort((a, b) => {
    const aAvail = a.availableCopies ?? (a.available ? 1 : 0)
    const bAvail = b.availableCopies ?? (b.available ? 1 : 0)
    return aAvail - bAvail // least available first
  })

  const export_ = () => downloadCSV(toCSV(rows, cols), 'inventory_report.csv')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Button variant="secondary" style={{ fontSize: '0.8125rem', padding: '7px 16px' }} onClick={export_}>
          Export CSV
        </Button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Accession</th>
            <th>Title</th>
            <th>Category</th>
            <th style={{ textAlign: 'center' }}>Total</th>
            <th style={{ textAlign: 'center' }}>Available</th>
            <th style={{ textAlign: 'center' }}>On Loan</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(b => {
            const avail  = b.availableCopies ?? (b.available ? 1 : 0)
            const onLoan = (b.totalCopies || 1) - avail
            return (
              <tr key={b.accession}>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{b.accession}</td>
                <td style={{ fontWeight: 500, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', backgroundColor: 'rgba(30,61,50,0.07)', padding: '2px 6px', borderRadius: 3 }}>
                    {b.category}
                  </span>
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{b.totalCopies || 1}</td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: avail === 0 ? 'var(--color-oxblood)' : 'var(--color-ink)' }}>
                  {avail}
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: onLoan > 0 ? 'var(--color-ochre)' : 'var(--color-charcoal-60)' }}>
                  {onLoan}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ── Tab: Most Borrowed ── */
function MostBorrowedTab() {
  // Count loan occurrences per accession
  const counts = {}
  MOCK_LOANS.forEach(l => { counts[l.accession] = (counts[l.accession] || 0) + 1 })

  const rows = ALL_BOOKS
    .map(b => ({ ...b, borrowCount: counts[b.accession] || 0 }))
    .sort((a, b) => b.borrowCount - a.borrowCount)
    .slice(0, 50)

  const cols = [
    { label: 'Rank',       get: (_, i) => i + 1 },
    { label: 'Accession',  key: 'accession' },
    { label: 'Title',      key: 'title' },
    { label: 'Category',   key: 'category' },
    { label: 'Times Issued', key: 'borrowCount' },
  ]

  const export_ = () => downloadCSV(
    toCSV(rows.map((r, i) => ({ ...r, rank: i + 1 })), cols),
    'most_borrowed_report.csv'
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <Button variant="secondary" style={{ fontSize: '0.8125rem', padding: '7px 16px' }} onClick={export_}>
          Export CSV
        </Button>
      </div>
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
  )
}

/* ── Main Reports view ── */
const TABS = [
  { id: 'overdue',    label: 'Overdue Items' },
  { id: 'inventory',  label: 'Inventory Status' },
  { id: 'borrowed',   label: 'Most Borrowed' },
]

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState('overdue')

  return (
    <div>
      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 24,
        borderBottom: '1px solid rgba(30,61,50,0.12)',
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
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overdue'   && <OverdueTab />}
      {activeTab === 'inventory' && <InventoryTab />}
      {activeTab === 'borrowed'  && <MostBorrowedTab />}
    </div>
  )
}
