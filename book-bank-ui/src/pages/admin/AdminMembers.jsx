/**
 * AdminMembers.jsx
 * Searchable member table with create/edit/suspend actions.
 */
import React, { useState, useMemo } from 'react'
import { MOCK_MEMBERS } from '../../data/mockAdminData'
import { Button } from '../../components'

const DEPTS = ['Computer Science', 'Mathematics', 'Engineering', 'Networks', 'Psychology', 'Management', 'Systems & OS', 'Fiction']

function MemberForm({ member, onClose, onSave }) {
  const isEdit = !!member
  const [form, setForm] = useState({
    id:      member?.id || '',
    name:    member?.name || '',
    dept:    member?.dept || DEPTS[0],
    status:  member?.status || 'active',
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fieldStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 10px', border: '1px solid rgba(30,61,50,0.18)',
    borderRadius: 4, fontFamily: 'var(--font-body)', fontSize: '0.875rem',
    color: 'var(--color-charcoal)', backgroundColor: '#fff', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: 'var(--color-charcoal-60)', marginBottom: 5,
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30,61,50,0.3)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        backgroundColor: 'var(--color-paper)', borderLeft: '1px solid rgba(30,61,50,0.15)',
        zIndex: 201, overflowY: 'auto', padding: '32px 28px',
        boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-charcoal)', margin: 0 }}>
            {isEdit ? 'Edit Member' : 'Add Member'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-charcoal-60)' }}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { label: 'Member ID', key: 'id',   required: true },
            { label: 'Full Name', key: 'name', required: true },
          ].map(({ label, key, required }) => (
            <div key={key}>
              <label style={labelStyle}>{label}{required && ' *'}</label>
              <input style={fieldStyle} required={required} value={form[key]} onChange={e => set(key, e.target.value)} />
            </div>
          ))}
          <div>
            <label style={labelStyle}>Department *</label>
            <select style={{ ...fieldStyle }} value={form.dept} onChange={e => set('dept', e.target.value)}>
              {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select style={{ ...fieldStyle }} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button type="submit" variant="ochre" style={{ flex: 1 }}>{isEdit ? 'Save' : 'Add Member'}</Button>
            <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default function AdminMembers({ onAdd }) {
  const [members, setMembers] = useState(MOCK_MEMBERS)
  const [search, setSearch]   = useState('')
  const [slideOver, setSlideOver] = useState(null) // null | 'add' | member

  // Expose add action to parent header button
  React.useEffect(() => {
    if (onAdd) onAdd(() => setSlideOver('add'))
  }, [onAdd])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return q ? members.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.dept.toLowerCase().includes(q)
    ) : members
  }, [search, members])

  const toggleSuspend = (id) => {
    setMembers(ms => ms.map(m =>
      m.id === id ? { ...m, status: m.status === 'active' ? 'suspended' : 'active' } : m
    ))
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
        <input
          className="admin-search"
          type="search"
          placeholder="Search name, ID, department…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: '1 1 240px', minWidth: 200 }}
        />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-charcoal-60)' }}>
          {filtered.length} members
        </span>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Books Out</th>
            <th>Fines (₹)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(m => (
            <tr key={m.id}>
              <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{m.id}</td>
              <td style={{ fontWeight: 500 }}>{m.name}</td>
              <td style={{ color: 'var(--color-charcoal-60)' }}>{m.dept}</td>
              <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{m.booksOut}</td>
              <td style={{
                fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                color: m.fines > 0 ? 'var(--color-oxblood)' : 'var(--color-charcoal-60)',
              }}>
                {m.fines > 0 ? `₹${m.fines.toFixed(2)}` : '—'}
              </td>
              <td>
                <span className={`admin-badge admin-badge--${m.status === 'active' ? 'avail' : 'overdue'}`}>
                  {m.status}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="admin-action-btn" onClick={() => setSlideOver(m)}>Edit</button>
                  <button
                    className={`admin-action-btn ${m.status === 'active' ? 'admin-action-btn--danger' : ''}`}
                    onClick={() => toggleSuspend(m.id)}
                  >
                    {m.status === 'active' ? 'Suspend' : 'Reinstate'}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {slideOver !== null && (
        <MemberForm
          member={slideOver === 'add' ? null : slideOver}
          onClose={() => setSlideOver(null)}
          onSave={(data) => {
            if (slideOver === 'add') {
              setMembers(ms => [{ ...data, booksOut: 0, fines: 0 }, ...ms])
            } else {
              setMembers(ms => ms.map(m => m.id === data.id ? { ...m, ...data } : m))
            }
            setSlideOver(null)
          }}
        />
      )}
    </div>
  )
}
