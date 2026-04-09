'use client'

import { useEffect, useState } from 'react'

interface TransactionRow {
  TransactionID: number
  TransactionType: string
  Quantity: number
  TransactionDate: string
  Notes: string | null
  inventory: {
    products: {
      Name: string
    }
  }
}

export default function SupplierTransactionsPage() {
  const [rows, setRows] = useState<TransactionRow[]>([])
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
        const response = await fetch(`/api/supplier/transactions?supplierId=${user.UserID}`)
        const payload = await response.json()

        if (!response.ok) {
          setError(payload.error || 'Failed to load transactions')
          return
        }

        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Inventory Transactions</h2>
      <p className="mt-1 text-sm text-slate-600">All stock movements linked to your supplied batches.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading transactions...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="mt-4 text-sm text-slate-600">No transactions found.</p>}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Date</th>
                <th className="py-2">Product</th>
                <th className="py-2">Type</th>
                <th className="py-2">Quantity</th>
                <th className="py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.TransactionID} className="border-b border-slate-100">
                  <td className="py-3 text-slate-600">{new Date(row.TransactionDate).toLocaleString()}</td>
                  <td className="py-3 font-medium text-slate-800">{row.inventory.products.Name}</td>
                  <td className="py-3">
                    <span className={`cf-chip ${row.TransactionType === 'IN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                      {row.TransactionType}
                    </span>
                  </td>
                  <td className="py-3 text-slate-700">{row.Quantity}</td>
                  <td className="py-3 text-slate-600">{row.Notes || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
