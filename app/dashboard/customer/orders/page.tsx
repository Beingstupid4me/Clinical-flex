'use client'

import { useEffect, useState } from 'react'

interface OrderRow {
  OrderID: number
  Date_of_order: string | null
  TotalAmount: number
  Status: string | null
  orderitems: Array<{
    ProductID: number
    Quantity: number
    products: {
      Product_Name: string
      SKU: string | null
    }
  }>
}

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem('currentUser')
        if (!raw) {
          setError('Please login again')
          return
        }
        const user = JSON.parse(raw) as { UserID?: number }
        if (!user.UserID) {
          setError('Customer session not found')
          return
        }

        const response = await fetch(`/api/customer/orders?customerId=${user.UserID}`)
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load orders')
          return
        }
        setOrders(payload.data || [])
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
      <h2 className="text-xl font-semibold text-slate-900">My Orders</h2>
      <p className="mt-1 text-sm text-slate-600">Real-time order data from MySQL.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading orders...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && orders.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">No orders yet. Place your first order from checkout.</p>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="py-2">Order ID</th>
              <th className="py-2">Date</th>
              <th className="py-2">Total</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((item) => (
              <tr key={item.OrderID} className="border-b border-slate-100">
                <td className="py-3 font-medium text-slate-800">ORD-{item.OrderID}</td>
                <td className="py-3 text-slate-600">{item.Date_of_order ? new Date(item.Date_of_order).toLocaleDateString() : '--'}</td>
                <td className="py-3 text-slate-700">Rs. {Number(item.TotalAmount).toFixed(2)}</td>
                <td className="py-3">
                  <span className={`cf-chip ${item.Status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : item.Status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {item.Status || 'PENDING'}
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
