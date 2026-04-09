'use client'

import { useEffect, useState } from 'react'

interface ProductStatsRow {
  ProductID: number
  Product_Name: string
  SKU: string | null
  AveragePrice: number
  TotalQuantity: number
  MostRecentExpiry: string | null
  UpdatedAt: string | null
}

export default function AdminProductStatsPage() {
  const [rows, setRows] = useState<ProductStatsRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadRows = async () => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/admin/product-stats')
      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Failed to load product stats')
        return
      }

      setRows(payload.data || [])
    } catch (err) {
      setError('Failed to load product stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadRows()
  }, [])

  return (
    <div className="cf-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Product Inventory Stats</h2>
          <p className="mt-1 text-sm text-slate-600">
            Trigger-maintained rollup from ProductInventoryStats (average price, total quantity, latest expiry).
          </p>
        </div>
        <button
          onClick={() => void loadRows()}
          className="rounded-md bg-[#0f644c] px-3 py-2 text-xs font-semibold text-white"
        >
          Refresh Stats
        </button>
      </div>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading product stats...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="mt-4 text-sm text-slate-600">No rollup rows found yet.</p>}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Product</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Average Price</th>
                <th className="py-2">Total Quantity</th>
                <th className="py-2">Most Recent Expiry</th>
                <th className="py-2">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ProductID} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">{row.Product_Name}</td>
                  <td className="py-3 text-slate-700">{row.SKU || '--'}</td>
                  <td className="py-3 text-slate-700">Rs. {Number(row.AveragePrice).toFixed(2)}</td>
                  <td className="py-3 text-slate-700">{row.TotalQuantity}</td>
                  <td className="py-3 text-slate-700">{row.MostRecentExpiry ? new Date(row.MostRecentExpiry).toLocaleDateString() : '--'}</td>
                  <td className="py-3 text-slate-700">{row.UpdatedAt ? new Date(row.UpdatedAt).toLocaleString() : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
