'use client'

import { useEffect, useState } from 'react'

interface OrderRow {
  OrderID: number
  Date_of_order: string | null
  TotalAmount: number
  Status: string | null
  PaymentStatus: string | null
  customers: { Name: string }
  orderitems: Array<{ products: { Product_Name: string } }>
}

interface OrderDraft {
  status: string
  paymentStatus: string
}

const ORDER_STATUS = ['PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const PAYMENT_STATUS = ['PENDING', 'PAID', 'FAILED', 'REFUNDED']

export default function AdminOrdersPage() {
  const [rows, setRows] = useState<OrderRow[]>([])
  const [draftByOrder, setDraftByOrder] = useState<Record<number, OrderDraft>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savingOrderId, setSavingOrderId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const updateDraft = (orderId: number, patch: Partial<OrderDraft>) => {
    setDraftByOrder((prev) => ({
      ...prev,
      [orderId]: {
        status: prev[orderId]?.status || 'PENDING',
        paymentStatus: prev[orderId]?.paymentStatus || 'PENDING',
        ...patch,
      },
    }))
  }

  const saveOrderStatus = async (order: OrderRow) => {
    const draft = draftByOrder[order.OrderID]
    if (!draft) return

    try {
      setSavingOrderId(order.OrderID)
      setError('')
      setMessage('')

      const response = await fetch(`/api/admin/orders/${order.OrderID}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: draft.status,
          paymentStatus: draft.paymentStatus,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Failed to update order status')
        return
      }

      setRows((prev) =>
        prev.map((item) =>
          item.OrderID === order.OrderID
            ? { ...item, Status: payload.data.Status, PaymentStatus: payload.data.PaymentStatus }
            : item
        )
      )
      setMessage(`Order ORD-${order.OrderID} updated successfully`)
    } catch (err) {
      setError('Failed to update order status')
    } finally {
      setSavingOrderId(null)
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/orders')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load orders')
          return
        }
        const data = payload.data || []
        setRows(data)
        const initialDrafts: Record<number, OrderDraft> = {}
        for (const order of data) {
          initialDrafts[order.OrderID] = {
            status: order.Status || 'PENDING',
            paymentStatus: order.PaymentStatus || 'PENDING',
          }
        }
        setDraftByOrder(initialDrafts)
      } catch (err) {
        setError('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
      <p className="mt-1 text-sm text-slate-600">Complete order ledger with customer and item-level context.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading orders...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">{message}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1260px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Order</th>
                <th className="py-2">Customer</th>
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Payment</th>
                <th className="py-2">Items</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const draft = draftByOrder[row.OrderID] || {
                  status: row.Status || 'PENDING',
                  paymentStatus: row.PaymentStatus || 'PENDING',
                }

                return (
                  <tr key={row.OrderID} className="border-b border-slate-100">
                    <td className="py-3 text-slate-700">ORD-{row.OrderID}</td>
                    <td className="py-3 text-slate-700">{row.customers.Name}</td>
                    <td className="py-3 text-slate-700">{row.Date_of_order ? new Date(row.Date_of_order).toLocaleDateString() : '--'}</td>
                    <td className="py-3 text-slate-700">Rs. {Number(row.TotalAmount).toFixed(2)}</td>
                    <td className="py-3 text-slate-700">
                      <select
                        value={draft.status}
                        onChange={(event) => updateDraft(row.OrderID, { status: event.target.value })}
                        className="rounded-md border border-slate-300 px-2 py-1"
                      >
                        {ORDER_STATUS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-slate-700">
                      <select
                        value={draft.paymentStatus}
                        onChange={(event) => updateDraft(row.OrderID, { paymentStatus: event.target.value })}
                        className="rounded-md border border-slate-300 px-2 py-1"
                      >
                        {PAYMENT_STATUS.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 text-slate-700">{row.orderitems.slice(0, 2).map((item) => item.products.Product_Name).join(', ') || '--'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => saveOrderStatus(row)}
                        disabled={savingOrderId === row.OrderID}
                        className="rounded-md bg-[#0f644c] px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
                      >
                        {savingOrderId === row.OrderID ? 'Saving...' : 'Save'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
