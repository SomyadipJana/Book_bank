/**
 * AdminVendors.jsx
 * Vendor directory table + Book Orders list with a "+ New Order" form.
 */
import React, { useState } from 'react'
import { MOCK_VENDORS, MOCK_ORDERS, getVendorById } from '../../data/mockAdminData'
import { Button } from '../../components'

const STATUS_COLORS = {
  pending:  { bg: 'rgba(198,138,46,0.12)', fg: '#8B5C00' },
  shipped:  { bg: 'rgba(30,61,50,0.10)',   fg: 'var(--color-ink)' },
  received: { bg: 'rgba(43,38,32,0.08)',   fg: 'var(--color-charcoal-60)' },
}

function OrderForm({ vendors, onClose, onSave }) {
  const [form, setForm] = useState({ title: '', vendorId: vendors[0]?.id || '', qty: 1 })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const fieldStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 10px', border: '1px solid rgba(30,61,50,0.18)',
    borderRadius: 4, fontFamily: 'var(--font-body)', fontSize: '0.875rem', outline: 'none', backgroundColor: '#fff',
  }
  const labelStyle = {
    display: 'block', fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
    letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-charcoal-60)', marginBottom: 5,
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(30,61,50,0.3)', zIndex: 200 }} />
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380,
        backgroundColor: 'var(--color-paper)', borderLeft: '1px solid rgba(30,61,50,0.15)',
        zIndex: 201, overflowY: 'auto', padding: '32px 28px',
        boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>New Order</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-charcoal-60)' }}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form) }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Book Title *</label>
            <input style={fieldStyle} required value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Clean Code" />
          </div>
          <div>
            <label style={labelStyle}>Vendor *</label>
            <select style={{ ...fieldStyle }} value={form.vendorId} onChange={e => set('vendorId', e.target.value)}>
              {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Quantity *</label>
            <input style={fieldStyle} type="number" min={1} required value={form.qty} onChange={e => set('qty', +e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <Button type="submit" variant="ochre" style={{ flex: 1 }}>Place Order</Button>
            <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          </div>
        </form>
      </div>
    </>
  )
}

export default function AdminVendors() {
  const [orders, setOrders] = useState(MOCK_ORDERS)
  const [showForm, setShowForm] = useState(false)

  const handleNewOrder = (data) => {
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      ...data,
      orderedDate: new Date().toISOString().split('T')[0],
      receivedDate: null,
      status: 'pending',
    }
    setOrders(o => [newOrder, ...o])
    setShowForm(false)
  }

  const markReceived = (id) => {
    setOrders(o => o.map(ord =>
      ord.id === id ? { ...ord, status: 'received', receivedDate: new Date().toISOString().split('T')[0] } : ord
    ))
  }

  return (
    <div>
      {/* Vendors table */}
      <h2 className="admin-section-title">Vendors</h2>
      <table className="admin-table" style={{ marginBottom: 36 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Contact Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {MOCK_VENDORS.map(v => (
            <tr key={v.id}>
              <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{v.id}</td>
              <td style={{ fontWeight: 500 }}>{v.name}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-charcoal-60)' }}>{v.contact}</td>
              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--color-charcoal-60)' }}>{v.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Orders */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 className="admin-section-title" style={{ margin: 0 }}>Book Orders</h2>
        <Button variant="ochre" style={{ fontSize: '0.8125rem', padding: '8px 16px' }} onClick={() => setShowForm(true)}>
          + New Order
        </Button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Title</th>
            <th>Vendor</th>
            <th>Qty</th>
            <th>Ordered</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => {
            const vendor = getVendorById(o.vendorId)
            const colors = STATUS_COLORS[o.status] || STATUS_COLORS.pending
            return (
              <tr key={o.id}>
                <td className="mono-label" style={{ color: 'var(--color-charcoal-60)' }}>{o.id}</td>
                <td style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.title}</td>
                <td style={{ color: 'var(--color-charcoal-60)' }}>{vendor?.name ?? o.vendorId}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', textAlign: 'center' }}>{o.qty}</td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-charcoal-60)' }}>{o.orderedDate}</td>
                <td>
                  <span style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 3,
                    fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    backgroundColor: colors.bg, color: colors.fg,
                  }}>
                    {o.status}
                  </span>
                </td>
                <td>
                  {o.status !== 'received' && (
                    <button
                      className="admin-action-btn"
                      onClick={() => markReceived(o.id)}
                    >
                      Mark Received
                    </button>
                  )}
                  {o.status === 'received' && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--color-charcoal-60)' }}>
                      {o.receivedDate}
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {showForm && (
        <OrderForm
          vendors={MOCK_VENDORS}
          onClose={() => setShowForm(false)}
          onSave={handleNewOrder}
        />
      )}
    </div>
  )
}
