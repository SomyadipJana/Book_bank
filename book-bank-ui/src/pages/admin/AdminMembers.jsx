/**
 * AdminMembers.jsx
 * Searchable member directory with student detail panel:
 * - Filters: All, Has Overdue, Has Unpaid Fines, Suspended
 * - Student detail panel: Current loans with due dates, reservations, history, fines, and student activity
 * - Mark Paid action for unpaid fines
 * - Active loan warning on suspension
 */
import React, { useState, useMemo, useEffect } from 'react'
import { useLibraryStore } from '../../data/libraryStore'
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
    email: member?.email || '',
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

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
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
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Student / Member ID</label>
            <input
              style={{ ...fieldStyle, fontFamily: 'var(--font-mono)' }}
              value={form.id}
              onChange={e => set('id', e.target.value.toUpperCase())}
              disabled={isEdit}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              style={fieldStyle}
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <input
              type="email"
              style={fieldStyle}
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required
            />
          </div>

          <div>
            <label style={labelStyle}>Department</label>
            <select
              style={fieldStyle}
              value={form.dept}
              onChange={e => set('dept', e.target.value)}
            >
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Account Status</label>
            <select
              style={fieldStyle}
              value={form.status}
              onChange={e => set('status', e.target.value)}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
            <Button type="submit" variant="ochre" style={{ flex: 1 }}>
              {isEdit ? 'Save Changes' : 'Create Member'}
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

/* ── Student Detail Slide Panel ── */
function StudentDetailPanel({ member, onClose }) {
  const {
    today,
    books,
    loans,
    reservations,
    fines,
    activityLog,
    toggleSuspendMember,
    markFinePaid,
  } = useLibraryStore()

  const [tab, setTab] = useState('loans') // 'loans' | 'reservations' | 'history' | 'fines' | 'activity'

  const activeLoans = useMemo(() => {
    return loans.filter(l => l.memberId === member.id && l.status === 'active')
  }, [loans, member.id])

  const historyLoans = useMemo(() => {
    return loans.filter(l => l.memberId === member.id && l.status === 'returned')
  }, [loans, member.id])

  const memberReservations = useMemo(() => {
    return reservations.filter(r => r.memberId === member.id && (r.status === 'ready' || r.status === 'waiting'))
  }, [reservations, member.id])

  const memberFines = useMemo(() => {
    return fines.filter(f => f.memberId === member.id)
  }, [fines, member.id])

  const memberActivity = useMemo(() => {
    return activityLog.filter(a => a.memberId === member.id)
  }, [activityLog, member.id])

  // Overdue breakdown with live accrued fine
  const overdueLoans = activeLoans.filter(l => l.isOverdue)
  const totalFinesDue = member.totalFinesDue ?? 0

  const handleToggleSuspend = () => {
    if (member.status === 'active' && activeLoans.length > 0) {
      if (!window.confirm(`Warning: ${member.name} currently holds ${activeLoans.length} active loan(s). Are you sure you want to suspend this account?`)) {
        return
      }
    }
    toggleSuspendMember(member.id, 'Librarian')
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(30,61,50,0.3)',
          zIndex: 200,
        }}
      />

      <div className="member-detail-panel">
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>
                {member.studentId || member.id}
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
              Department of {member.dept} · {member.email}
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
            onClick={handleToggleSuspend}
          >
            {member.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
          </Button>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-60)', fontFamily: 'var(--font-mono)' }}>
            Active loans: {activeLoans.length} · Overdue: {overdueLoans.length}
          </span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(30,61,50,0.12)', gap: 14, overflowX: 'auto' }}>
          {[
            { id: 'loans', label: `Loans (${activeLoans.length})` },
            { id: 'reservations', label: `Reservations (${memberReservations.length})` },
            { id: 'history', label: `History (${historyLoans.length})` },
            { id: 'fines', label: `Fines (${totalFinesDue > 0 ? `₹${totalFinesDue.toFixed(2)}` : '₹0'})` },
            { id: 'activity', label: `Activity (${memberActivity.length})` },
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
                whiteSpace: 'nowrap',
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
                    <th>Due</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoans.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{l.bookTitle}</div>
                        <div className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.accession}</div>
                      </td>
                      <td
                        style={{
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          color: l.isOverdue ? 'var(--color-oxblood)' : 'inherit',
                          fontWeight: l.isOverdue ? 600 : 400,
                        }}
                      >
                        {l.dueDate}
                      </td>
                      <td>
                        {l.isOverdue ? (
                          <span className="admin-badge admin-badge--overdue">Overdue (+{l.daysLate}d)</span>
                        ) : (
                          <span className="admin-badge admin-badge--avail">{l.daysLeft}d left</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab Content: Reservations ── */}
        {tab === 'reservations' && (
          <div>
            {memberReservations.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-charcoal-60)', fontSize: '0.85rem' }}>
                No active reservations or waitlists.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Status</th>
                    <th>Hold / Details</th>
                  </tr>
                </thead>
                <tbody>
                  {memberReservations.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{r.bookTitle}</div>
                        <div className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{r.accession}</div>
                      </td>
                      <td>
                        {r.status === 'ready' ? (
                          <span className="admin-badge admin-badge--avail">Ready for pickup</span>
                        ) : (
                          <span className="admin-badge admin-badge--loan">Waitlist #{r.queuePosition}</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.75rem' }}>
                        {r.status === 'ready' ? `Hold expires ${r.holdExpiresAt}` : 'Queued for next return'}
                      </td>
                    </tr>
                  ))}
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
                  {historyLoans.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{l.bookTitle}</div>
                        <div className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.accession}</div>
                      </td>
                      <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{l.issuedDate}</td>
                      <td style={{ fontSize: '0.75rem', whiteSpace: 'nowrap', color: 'var(--color-ink)' }}>
                        {l.returnedDate || 'Returned'}
                      </td>
                    </tr>
                  ))}
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

            {/* Overdue live fines */}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', margin: '8px 0 0', fontWeight: 600 }}>
              Accruing Overdue Penalties
            </h3>
            {overdueLoans.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-60)' }}>No items currently overdue.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Due Date</th>
                    <th>Late</th>
                    <th>Accrued</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueLoans.map(l => (
                    <tr key={l.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{l.bookTitle}</div>
                        <div className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{l.accession}</div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--color-oxblood)' }}>{l.dueDate}</td>
                      <td style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>+{l.daysLate}d</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-oxblood)' }}>
                        ₹{l.accruedFine.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Invoiced Fixed Fines with Mark Paid */}
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', margin: '14px 0 0', fontWeight: 600 }}>
              Fixed Fine Invoices
            </h3>
            {memberFines.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--color-charcoal-60)' }}>No invoice records.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Invoice / Reason</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {memberFines.map(f => (
                    <tr key={f.id}>
                      <td>
                        <div style={{ fontWeight: 500, fontSize: '0.8125rem' }}>{f.reason}</div>
                        <div className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{f.id} · {f.dateIncurred}</div>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ₹{Number(f.amount).toFixed(2)}
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge--${f.status === 'paid' ? 'avail' : 'overdue'}`}>
                          {f.status === 'paid' ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>
                      <td>
                        {f.status === 'unpaid' ? (
                          <button
                            className="admin-action-btn"
                            style={{ color: 'var(--color-ochre)', borderColor: 'var(--color-ochre)' }}
                            onClick={() => markFinePaid(f.id, 'Librarian')}
                            title="Mark this fine as settled / paid"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-charcoal-60)' }}>Settled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab Content: Activity ── */}
        {tab === 'activity' && (
          <div>
            {memberActivity.length === 0 ? (
              <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-charcoal-60)', fontSize: '0.85rem' }}>
                No recent activity for this member.
              </div>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {memberActivity.map(act => (
                  <li key={act.id} style={{ fontSize: '0.8rem', paddingBottom: 8, borderBottom: '1px solid rgba(30,61,50,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-ink)' }}>
                        {act.action?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-charcoal-60)' }}>
                        {act.timestamp?.includes('T') ? act.timestamp.replace('T', ' ').slice(0, 16) : act.timestamp}
                      </span>
                    </div>
                    <div>{act.description}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-charcoal-60)', marginTop: 2 }}>
                      Actor: {act.actor}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

      </div>
    </>
  )
}

/* ── Main Members Component ── */
export default function AdminMembers({ onAdd }) {
  const { members, registerMember, toggleSuspendMember } = useLibraryStore()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all' | 'overdue' | 'fines' | 'suspended'
  const [selectedMember, setSelectedMember] = useState(null)
  const [formSlideOver, setFormSlideOver] = useState(null) // null | 'add' | member object

  useEffect(() => {
    if (onAdd) {
      onAdd(() => setFormSlideOver('add'))
    }
  }, [onAdd])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return members
      .filter(m => {
        if (filterType === 'overdue') return m.overdueCount > 0
        if (filterType === 'fines') return m.totalFinesDue > 0
        if (filterType === 'suspended') return m.status === 'suspended'
        return true
      })
      .filter(m => {
        if (!q) return true
        return (
          m.name.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.studentId?.toLowerCase().includes(q) ||
          m.dept.toLowerCase().includes(q) ||
          m.email?.toLowerCase().includes(q)
        )
      })
  }, [search, filterType, members])

  const handleSaveMember = (data) => {
    try {
      if (formSlideOver === 'add') {
        registerMember({
          name: data.name,
          email: data.email,
          studentId: data.id,
          dept: data.dept,
        })
      }
      setFormSlideOver(null)
    } catch (err) {
      alert(err.message)
    }
  }

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
          placeholder="Search name, student ID, department, email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: 200 }}
        />

        {/* Filter dropdown */}
        <select
          className="admin-select"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">All Members ({members.length})</option>
          <option value="overdue">Has Overdue Loans ({members.filter(m => m.overdueCount > 0).length})</option>
          <option value="fines">Has Unpaid Fines ({members.filter(m => m.totalFinesDue > 0).length})</option>
          <option value="suspended">Suspended Accounts ({members.filter(m => m.status === 'suspended').length})</option>
        </select>

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
              <th style={{ textAlign: 'center' }}>Overdue</th>
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
                  {m.studentId || m.id}
                </td>
                <td style={{ fontWeight: 500 }}>{m.name}</td>
                <td style={{ color: 'var(--color-charcoal-60)' }}>{m.dept}</td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  {m.booksOut}
                </td>
                <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                  <span style={{ color: m.overdueCount > 0 ? 'var(--color-oxblood)' : 'inherit', fontWeight: m.overdueCount > 0 ? 700 : 400 }}>
                    {m.overdueCount}
                  </span>
                </td>
                <td
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    color: m.totalFinesDue > 0 ? 'var(--color-oxblood)' : 'var(--color-charcoal-60)',
                    fontWeight: m.totalFinesDue > 0 ? 600 : 400,
                  }}
                >
                  {m.totalFinesDue > 0 ? `₹${m.totalFinesDue.toFixed(2)}` : '—'}
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
                      onClick={() => setSelectedMember(m)}
                    >
                      Inspect
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
            No members match your search or filter.
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
