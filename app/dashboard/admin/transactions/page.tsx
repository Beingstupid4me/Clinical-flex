'use client'

import { useEffect, useState } from 'react'

interface TransactionRow {
  TransactionID: number
  TransactionType: string
  Quantity: number
  Reason: string | null
  ReferenceID: number | null
  TransactionDate: string | null
  inventory: {
    products: { Product_Name: string }
    suppliers: { CompanyName: string | null }
  }
}

export default function AdminTransactionsPage() {
  const [rows, setRows] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/transactions')
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
      <p className="mt-1 text-sm text-slate-600">Stock movement ledger across receipts, sales, and adjustments.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading transactions...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Transaction ID</th>
                <th className="py-2">Date</th>
                <th className="py-2">Product</th>
                <th className="py-2">Supplier</th>
                <th className="py-2">Type</th>
                <th className="py-2">Quantity</th>
                <th className="py-2">Reference</th>
                <th className="py-2">Reason</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.TransactionID} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">{row.TransactionID}</td>
                  <td className="py-3 text-slate-700">{row.TransactionDate ? new Date(row.TransactionDate).toLocaleString() : '--'}</td>
                  <td className="py-3 text-slate-700">{row.inventory.products.Product_Name}</td>
                  <td className="py-3 text-slate-700">{row.inventory.suppliers.CompanyName || '--'}</td>
                  <td className="py-3 text-slate-700">{row.TransactionType}</td>
                  <td className="py-3 text-slate-700">{row.Quantity}</td>
                  <td className="py-3 text-slate-700">{row.ReferenceID ?? '--'}</td>
                  <td className="py-3 text-slate-700">{row.Reason || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
