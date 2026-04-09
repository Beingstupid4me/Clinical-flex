'use client'

import { useEffect, useState } from 'react'

interface BatchRow {
  BatchID: number
  BatchNumber: string
  QuantityReceived: number
  QuantityAvailable: number
  ManufacturerDate: string
  inventory: {
    Price: number
    ExpiryDate: string
    products: {
      Product_Name: string
      SKU: string | null
    }
  }
}

export default function SupplierBatchesPage() {
  const [rows, setRows] = useState<BatchRow[]>([])
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
          setError('Supplier session not found')
          return
        }

        const response = await fetch(`/api/supplier/batches?supplierId=${user.UserID}`)
        const payload = await response.json()

        if (!response.ok) {
          setError(payload.error || 'Failed to load batches')
          return
        }

        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load batches')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">My Supplied Batches</h2>
      <p className="mt-1 text-sm text-slate-600">Batch-wise stock supplied by your company.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading batches...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="mt-4 text-sm text-slate-600">No batches found.</p>}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Batch</th>
                <th className="py-2">Product</th>
                <th className="py-2">Received</th>
                <th className="py-2">Remaining</th>
                <th className="py-2">Unit Price</th>
                <th className="py-2">Manufactured</th>
                <th className="py-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.BatchID} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-800">{row.BatchNumber}</td>
                  <td className="py-3 text-slate-600">{row.inventory.products.Product_Name}</td>
                  <td className="py-3 text-slate-600">{row.QuantityReceived}</td>
                  <td className="py-3 text-slate-600">{row.QuantityAvailable}</td>
                  <td className="py-3 text-slate-600">Rs. {Number(row.inventory.Price).toFixed(2)}</td>
                  <td className="py-3 text-slate-600">{new Date(row.ManufacturerDate).toLocaleDateString()}</td>
                  <td className="py-3 text-slate-600">{new Date(row.inventory.ExpiryDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
