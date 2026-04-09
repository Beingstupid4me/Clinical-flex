'use client'

import { useEffect, useState } from 'react'

interface PaymentRow {
  PaymentID: string
  OrderID: number
  Amount: number
  PaymentStatus: string | null
  PaymentDate: string | null
  OrderDate: string | null
  PaymentMethod: string
}

interface PaymentSummary {
  totalPaid: number
  pending: number
  transactions: number
}

export default function CustomerPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [summary, setSummary] = useState<PaymentSummary>({ totalPaid: 0, pending: 0, transactions: 0 })
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

        const response = await fetch(`/api/customer/payments?customerId=${user.UserID}`)
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load payments')
          return
        }

        setPayments(payload.data || [])
        setSummary(payload.summary || { totalPaid: 0, pending: 0, transactions: 0 })
      } catch (err) {
        setError('Failed to load payments')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="cf-card">
          <p className="text-sm text-slate-500">Total Paid</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">Rs. {summary.totalPaid.toFixed(2)}</p>
        </article>
        <article className="cf-card">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-2xl font-semibold text-amber-600">Rs. {summary.pending.toFixed(2)}</p>
        </article>
        <article className="cf-card">
          <p className="text-sm text-slate-500">Transactions</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{summary.transactions}</p>
        </article>
      </section>

      <section className="cf-card">
        <h2 className="text-xl font-semibold text-slate-900">Payment History</h2>
        {loading && <p className="mt-4 text-sm text-slate-600">Loading payment history...</p>}
        {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
        {!loading && !error && payments.length === 0 && (
          <p className="mt-4 text-sm text-slate-600">No payment records found.</p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Payment ID</th>
                <th className="py-2">Order</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Method</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((item) => (
                <tr key={item.PaymentID} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-800">{item.PaymentID}</td>
                  <td className="py-3 text-slate-600">ORD-{item.OrderID}</td>
                  <td className="py-3 text-slate-700">Rs. {item.Amount.toFixed(2)}</td>
                  <td className="py-3 text-slate-600">{item.PaymentMethod}</td>
                  <td className="py-3">
                    <span className={`cf-chip ${item.PaymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {item.PaymentStatus || 'PENDING'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
