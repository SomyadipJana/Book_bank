/**
 * AdminMembers.jsx
 * Searchable member directory with student detail panel:
 * - Click row to inspect loans, history, and calculated fines (₹5/day overdue)
 * - Add & edit member support
 * - Connected to shared AdminStore
 */
import React, { useState, useMemo, useEffect } from 'react'
import { useAdminStore } from '../../data/adminStore'
import { Button } from '../../components'

const DEPTS = [
  'Computer Science',
  'Mathematics',
  'Engineering',
  'Networks',
  'Psychology',
  'Management',
  'Systems & OS',
  'Fiction',
]

/* ── Add / Edit Member Form ── */
function MemberForm({ member, onClose, onSave }) {
  const isEdit = !!member
  const [form, setForm] = useState({
    id: member?.id || `STU-${String(Math.floor(100 + Math.random() * 900))}`,
    name: member?.name || '',
    dept: member?.dept || DEPTS[0],
    status: member?.status || 'active',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30,61,50,0.3)', zIndex: 200 }}
      />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 420,
          maxWidth: '90vw',
          backgroundColor: 'var(--color-paper)',
          borderLeft: '1px solid rgba(30,61,50,0.15)',
          zIndex: 201,
          overflowY: 'auto',
          padding: '32px 28px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--color-charcoal)',
              margin: 0,
            }}
          >
            {isEdit ? 'Edit Member' : 'Add Member'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: 'var(--color-charcoal-60)',
            }}
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={e => {
            e.preventDefault()
            onSave(form)
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
        >
          <div>
            <label style={labelStyle}>Member ID *</label>
            <input
              style={fieldStyle}
              required
              value={form.id}
              disabled={isEdit}
              onChange={e => set('id', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              style={fieldStyle}
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Department *</label>
            <select
              style={fieldStyle}
              value={form.dept}
              onChange={e => set('dept', e.target.value)}
            >
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select
              style={fieldStyle}
              value={form.status}
              onChange={e => set('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button type="submit" variant="ochre" style={{ flex: 1 }}>
              {isEdit ? 'Save Changes' : 'Add Member'}
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

/* ── Student Detail Panel ── */
function StudentDetailPanel({ member, onClose }) {
  const { books, loans, toggleSuspendMember } = useAdminStore()
  const [tab, setTab] = useState('loans') // 'loans' | 'history' | 'fines'

  // Get active / overdue loans for this student
  const activeLoans = useMemo(() => {
    return loans.filter(
      l => l.memberId === member.id && (l.status === 'active' || l.status === 'overdue')
    )
  }, [loans, member.id])

  // Get returned history
  const historyLoans = useMemo(() => {
    return loans.filter(l => l.memberId === member.id && l.status === 'returned')
  }, [loans, member.id])

  // Calculate overdue fines (₹5 per day overdue)
  const overdueBreakdown = useMemo(() => {
    const today = new Date()
    return activeLoans
      .filter(l => {
        const dueDate = new Date(l.dueDate)
        return l.status === 'overdue' || dueDate < today
      })
      .map(l => {
        const due = new Date(l.dueDate)
        const days = Math.max(1, Math.floor((today - due) / 86400000))
        const fineAmount = days * 5
        const book = books.find(b => b.accession === l.accession)
        return {
          loanId: l.id,
          title: book?.title || l.accession,
          accession: l.accession,
          dueDate: l.dueDate,
          daysOverdue: days,
          fineAmount,
        }
      })
  }, [activeLoans, books])

  const calculatedFinesTotal = overdueBreakdown.reduce((sum, item) => sum + item.fineAmount, 0)
  const totalFinesDue = Math.max(calculatedFinesTotal, member.fines || 0)

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

      {/* Slide Panel */}
      <div className="member-detail-panel">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>
                {member.id}
              </span>
              <span className={`admin-badge admin-badge--${member.status === 'active' ? 'avail' : 'overdue'}`}>
                {member.status}
              </span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.4rem',
                fontWeight: 700,
                color: 'var(--color-charcoal)',
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {member.name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-charcoal-60)', marginTop: 4 }}>
              Department of {member.dept}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 22,
              cursor: 'pointer',
              color: 'var(--color-charcoal-60)',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Member status actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid rgba(30,61,50,0.1)' }}>
          <Button
            type="button"
            variant="secondary"
            style={{
              fontSize: '0.75rem',
              padding: '6px 14px',
              color: member.status === 'active' ? 'var(--color-oxblood)' : 'var(--color-ink)',
            }}
            onClick={() => toggleSuspendMember(member.id)}
          >
            {member.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
          </Button>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-60)', fontFamily: 'var(--font-mono)' }}>
            Active loans: {activeLoans.length}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(30,61,50,0.12)', gap: 16 }}>
          {[
            { id: 'loans', label: `Current Loans (${activeLoans.length})` },
            { id: 'history', label: `History (${historyLoans.length})` },
            { id: 'fines', label: `Fines (${totalFinesDue > 0 ? `₹${totalFinesDue}` : '₹0'})` },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '8px 0',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? 'var(--color-ink)' : 'var(--color-charcoal-60)',
                borderBottom: tab === t.id ? '2px solid var(--color-ochre)' : '2px solid transparent',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab Content: Current Loans ── */}
        {tab === 'loans' && (
          <div>
            {activeLoans.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-charcoal-60)', fontSize: '0.85rem' }}>
                No active loans for this member.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Issued</th>
                    <th>Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoans.map(l => {
                    const book = books.find(b => b.accession === l.accession)
                    const isOverdue = l.status === 'overdue' || new Date(l.dueDate) < new Date()
                    return (
                      <tr key={l.id}>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                            {book?.title || l.accession}
                          </div>
                          <div className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>
                            {l.accession}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{l.issuedDate}</td>
                        <td
                          style={{
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap',
                            color: isOverdue ? 'var(--color-oxblood)' : 'inherit',
                            fontWeight: isOverdue ? 600 : 400,
                          }}
                        >
                          {l.dueDate}
                        </td>
                        <td>
                          {isOverdue ? (
                            <span className="admin-badge admin-badge--overdue">Overdue</span>
                          ) : (
                            <span className="admin-badge admin-badge--avail">Active</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab Content: History ── */}
        {tab === 'history' && (
          <div>
            {historyLoans.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-charcoal-60)', fontSize: '0.85rem' }}>
                No past returned loans on file.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Issued</th>
                    <th>Returned</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLoans.map(l => {
                    const book = books.find(b => b.accession === l.accession)
                    return (
                      <tr key={l.id}>
                        <td>
                          <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>
                            {book?.title || l.accession}
                          </div>
                          <div className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>
                            {l.accession}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{l.issuedDate}</td>
                        <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', color: 'var(--color-ink)' }}>
                          {l.returnedDate || 'Returned'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab Content: Fines ── */}
        {tab === 'fines' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: totalFinesDue > 0 ? 'rgba(122,46,39,0.06)' : 'rgba(30,61,50,0.05)',
                border: `1px solid ${totalFinesDue > 0 ? 'rgba(122,46,39,0.2)' : 'rgba(30,61,50,0.12)'}`,
                borderRadius: 4,
              }}
            >
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-charcoal-60)' }}>
                Total Fines Due
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  color: totalFinesDue > 0 ? 'var(--color-oxblood)' : 'var(--color-ink)',
                  marginTop: 4,
                }}
              >
                ₹{totalFinesDue.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-60)', marginTop: 4 }}>
                Rate: ₹5.00 per day overdue on all overdue items.
              </div>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', margin: '8px 0 0', fontWeight: 600 }}>
              Overdue Fine Breakdown
            </h3>

            {overdueBreakdown.length === 0 ? (
              <div style={{ padding: '16px 0', color: 'var(--color-charcoal-60)', fontSize: '0.85rem' }}>
                No active overdue penalties incurred.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Due Date</th>
                    <th>Days Late</th>
                    <th>Fine (₹5/day)</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueBreakdown.map(o => (
                    <tr key={o.loanId}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{o.title}</div>
                        <div className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{o.accession}</div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--color-oxblood)' }}>{o.dueDate}</td>
                      <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                        {o.daysOverdue}d
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-oxblood)' }}>
                        ₹{o.fineAmount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </>
  )
}

/* ── Main Members Component ── */
export default function AdminMembers({ onAdd }) {
  const { members, addMember, updateMember } = useAdminStore()
  const [search, setSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState(null)
  const [formSlideOver, setFormSlideOver] = useState(null) // null | 'add' | member object

  // Expose "+ Add Member" action to parent header button if provided
  useEffect(() => {
    if (onAdd) {
      onAdd(() => setFormSlideOver('add'))
    }
  }, [onAdd])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q
      ? members.filter(
          m =>
            m.name.toLowerCase().includes(q) ||
            m.id.toLowerCase().includes(q) ||
            m.dept.toLowerCase().includes(q)
        )
      : members
  }, [search, members])

  const handleSaveMember = (data) => {
    if (formSlideOver === 'add') {
      addMember(data)
    } else {
      updateMember(data.id, data)
    }
    setFormSlideOver(null)
  }

  // Keep selectedMember up-to-date with store updates
  const activeSelectedMember = selectedMember
    ? members.find(m => m.id === selectedMember.id) || selectedMember
    : null

  return (
    <div>
      {/* Top controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          className="admin-search"
          type="search"
          placeholder="Search name, ID, department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: 200 }}
        />
        <Button
          variant="secondary"
          style={{ fontSize: '0.8125rem', padding: '8px 16px' }}
          onClick={() => setFormSlideOver('add')}
        >
          + Add Member
        </Button>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-charcoal-60)' }}>
          {filtered.length} members (Click row to inspect)
        </span>
      </div>

      {/* Member Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th style={{ textAlign: 'center' }}>Books Out</th>
              <th>Fines (₹)</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr
                key={m.id}
                onClick={() => setSelectedMember(m)}
                style={{ cursor: 'pointer' }}
              >
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>
                  {m.id}
                </td>
                <td style={{ fontWeight: 500 }}>{m.name}</td>
                <td style={{ color: 'var(--color-charcoal-60)' }}>{m.dept}</td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  {m.booksOut}
                </td>
                <td
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: m.fines > 0 ? 'var(--color-oxblood)' : 'var(--color-charcoal-60)',
                  }}
                >
                  {m.fines > 0 ? `₹${m.fines.toFixed(2)}` : '—'}
                </td>
                <td>
                  <span className={`admin-badge admin-badge--${m.status === 'active' ? 'avail' : 'overdue'}`}>
                    {m.status}
                  </span>
                </td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      className="admin-action-btn"
                      onClick={() => setFormSlideOver(m)}
                    >
                      Edit
                    </button>
                    <button
                      className="admin-action-btn"
                      onClick={() => setSelectedMember(m)}
                    >
                      View Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
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
            No members match your search.
          </div>
        )}
      </div>

      {/* Member Edit/Add Slide-over */}
      {formSlideOver !== null && (
        <MemberForm
          member={formSlideOver === 'add' ? null : formSlideOver}
          onClose={() => setFormSlideOver(null)}
          onSave={handleSaveMember}
        />
      )}

      {/* Student Detail Panel */}
      {activeSelectedMember && (
        <StudentDetailPanel
          member={activeSelectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  )
}
