/**
 * AdminIssueReturn.jsx
 * Search a member + search a book, then one-click Issue or Return.
 * Shows due date on Issue.
 */
import React, { useState, useMemo } from 'react'
import { ALL_BOOKS } from '../../data/books'
import { MOCK_MEMBERS, MOCK_LOANS } from '../../data/mockAdminData'
import { Button } from '../../components'

function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

export default function AdminIssueReturn() {
  const [memberQ, setMemberQ] = useState('')
  const [bookQ,   setBookQ]   = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedBook,   setSelectedBook]   = useState(null)
  const [transactions, setTransactions] = useState([...MOCK_LOANS])
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  /* ── Member search ── */
  const memberResults = useMemo(() => {
    if (!memberQ.trim()) return []
    const q = memberQ.toLowerCase()
    return MOCK_MEMBERS.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.dept.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [memberQ])

  /* ── Book search ── */
  const bookResults = useMemo(() => {
    if (!bookQ.trim()) return []
    const q = bookQ.toLowerCase()
    return ALL_BOOKS.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.accession?.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [bookQ])

  /* ── Active loan for selected book ── */
  const activeLoan = useMemo(() =>
    selectedBook
      ? transactions.find(t => t.accession === selectedBook.accession && (t.status === 'active' || t.status === 'overdue'))
      : null,
    [transactions, selectedBook]
  )

  const canIssue   = selectedMember && selectedBook && !activeLoan && (selectedBook.availableCopies ?? (selectedBook.available ? 1 : 0)) > 0
  const canReturn  = selectedMember && selectedBook && activeLoan

  const today    = new Date().toISOString().split('T')[0]
  const dueDate  = addDays(today, 14)

  const handleIssue = () => {
    const newLoan = {
      id: `LN-${String(transactions.length + 1).padStart(4, '0')}`,
      accession: selectedBook.accession,
      memberId:  selectedMember.id,
      memberName: selectedMember.name,
      issuedDate: today,
      dueDate,
      returnedDate: null,
      status: 'active',
    }
    setTransactions(t => [newLoan, ...t])
    showToast(`"${selectedBook.title}" issued to ${selectedMember.name}. Due: ${dueDate}`)
    setSelectedMember(null); setSelectedBook(null)
    setMemberQ(''); setBookQ('')
  }

  const handleReturn = () => {
    setTransactions(t =>
      t.map(l => l.id === activeLoan.id ? { ...l, returnedDate: today, status: 'returned' } : l)
    )
    showToast(`"${selectedBook.title}" returned by ${selectedMember.name}.`)
    setSelectedMember(null); setSelectedBook(null)
    setMemberQ(''); setBookQ('')
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px',
    border: '1px solid rgba(30,61,50,0.18)',
    borderRadius: 4,
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    outline: 'none',
    backgroundColor: '#fff',
  }

  const DropRow = ({ item, onSelect, isBook }) => (
    <button
      onClick={() => onSelect(item)}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 12px', border: 'none', borderBottom: '1px solid rgba(30,61,50,0.06)',
        background: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.8125rem',
      }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(30,61,50,0.04)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {isBook ? (
        <>
          <span style={{ fontWeight: 500 }}>{item.title}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-charcoal-60)', marginLeft: 8 }}>{item.accession}</span>
          <span style={{ marginLeft: 8, fontSize: '0.75rem', color: (item.availableCopies ?? (item.available ? 1 : 0)) > 0 ? 'var(--color-ink)' : 'var(--color-oxblood)' }}>
            {(item.availableCopies ?? (item.available ? 1 : 0)) > 0 ? '● Available' : '● On Loan'}
          </span>
        </>
      ) : (
        <>
          <span style={{ fontWeight: 500 }}>{item.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-charcoal-60)', marginLeft: 8 }}>{item.id}</span>
          <span style={{ marginLeft: 8, fontSize: '0.75rem', color: 'var(--color-charcoal-60)' }}>{item.dept}</span>
        </>
      )}
    </button>
  )

  return (
    <div style={{ maxWidth: 800 }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 300,
          padding: '12px 20px', borderRadius: 6,
          backgroundColor: toast.type === 'success' ? 'var(--color-ink)' : 'var(--color-oxblood)',
          color: 'var(--color-paper)', fontFamily: 'var(--font-body)', fontSize: '0.875rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}>
          {toast.msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 32 }}>

        {/* Member search */}
        <div>
          <label className="admin-field-label">Member</label>
          <div style={{ position: 'relative' }}>
            {selectedMember ? (
              <div style={{
                padding: '9px 12px', border: '1px solid var(--color-ochre)',
                borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'rgba(198,138,46,0.05)',
              }}>
                <div>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>{selectedMember.name}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-charcoal-60)', marginLeft: 8 }}>{selectedMember.id}</span>
                </div>
                <button onClick={() => { setSelectedMember(null); setMemberQ('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-charcoal-60)', fontSize: 16 }}>✕</button>
              </div>
            ) : (
              <>
                <input
                  style={inputStyle}
                  type="search"
                  placeholder="Name, ID, or department…"
                  value={memberQ}
                  onChange={e => setMemberQ(e.target.value)}
                  autoComplete="off"
                />
                {memberResults.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    backgroundColor: '#fff', border: '1px solid rgba(30,61,50,0.15)',
                    borderTop: 'none', borderRadius: '0 0 4px 4px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}>
                    {memberResults.map(m => (
                      <DropRow key={m.id} item={m} isBook={false} onSelect={m => { setSelectedMember(m); setMemberQ('') }} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Book search */}
        <div>
          <label className="admin-field-label">Book</label>
          <div style={{ position: 'relative' }}>
            {selectedBook ? (
              <div style={{
                padding: '9px 12px', border: '1px solid var(--color-ochre)',
                borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                backgroundColor: 'rgba(198,138,46,0.05)',
              }}>
                <div>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-body)', fontSize: '0.8125rem' }}>{selectedBook.title}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-charcoal-60)', marginLeft: 8 }}>{selectedBook.accession}</span>
                </div>
                <button onClick={() => { setSelectedBook(null); setBookQ('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-charcoal-60)', fontSize: 16 }}>✕</button>
              </div>
            ) : (
              <>
                <input
                  style={inputStyle}
                  type="search"
                  placeholder="Title, author, or accession…"
                  value={bookQ}
                  onChange={e => setBookQ(e.target.value)}
                  autoComplete="off"
                />
                {bookResults.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                    backgroundColor: '#fff', border: '1px solid rgba(30,61,50,0.15)',
                    borderTop: 'none', borderRadius: '0 0 4px 4px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}>
                    {bookResults.map(b => (
                      <DropRow key={b.accession} item={b} isBook={true} onSelect={b => { setSelectedBook(b); setBookQ('') }} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action panel */}
      <div style={{
        padding: '20px 24px', border: '1px solid rgba(30,61,50,0.12)', borderRadius: 6,
        backgroundColor: '#fff', marginBottom: 36,
      }}>
        {!selectedMember && !selectedBook && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--color-charcoal-60)', margin: 0 }}>
            Search and select a member and a book above to issue or return.
          </p>
        )}
        {selectedMember && selectedBook && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px', fontFamily: 'var(--font-body)', fontSize: '0.875rem' }}>
                <strong>{selectedMember.name}</strong> {' ↔ '} <strong>{selectedBook.title}</strong>
              </p>
              {activeLoan && (
                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: activeLoan.status === 'overdue' ? 'var(--color-oxblood)' : 'var(--color-charcoal-60)' }}>
                  {activeLoan.status === 'overdue' ? '⚠ ' : ''}Loan {activeLoan.id} — Issued {activeLoan.issuedDate} · Due {activeLoan.dueDate}
                </p>
              )}
              {canIssue && (
                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-charcoal-60)' }}>
                  Due date will be <strong>{dueDate}</strong> (14-day loan period)
                </p>
              )}
              {!activeLoan && !canIssue && selectedBook && (
                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-oxblood)' }}>
                  No copies available — book is fully on loan.
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ochre" onClick={handleIssue} disabled={!canIssue}>
                Issue Book
              </Button>
              <Button variant="secondary" onClick={handleReturn} disabled={!canReturn}>
                Return Book
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <h2 className="admin-section-title">Recent Transactions</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Loan ID</th>
            <th>Member</th>
            <th>Accession</th>
            <th>Issued</th>
            <th>Due</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.slice(0, 20).map(l => (
            <tr key={l.id}>
              <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.id}</td>
              <td>{l.memberName}</td>
              <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.accession}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{l.issuedDate}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: l.status === 'overdue' ? 'var(--color-oxblood)' : undefined }}>{l.dueDate}</td>
              <td>
                <span className={`admin-badge admin-badge--${l.status === 'active' ? 'avail' : l.status === 'overdue' ? 'overdue' : 'muted'}`}>
                  {l.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
