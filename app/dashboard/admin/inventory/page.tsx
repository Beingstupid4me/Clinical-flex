'use client'

import { useEffect, useState } from 'react'

interface InventoryRow {
  Inv_ID: number
  Quantity_on_Hand: number
  ReorderLevel: number | null
  Price: number
  ExpiryDate: string
  products: { Product_Name: string; SKU: string | null }
  suppliers: { CompanyName: string | null }
}

export default function AdminInventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/inventory')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load inventory')
          return
        }
        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load inventory')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Inventory</h2>
      <p className="mt-1 text-sm text-slate-600">Stock records grouped by product-supplier combinations.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading inventory...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Inv ID</th>
                <th className="py-2">Product</th>
                <th className="py-2">Supplier</th>
                <th className="py-2">Stock</th>
                <th className="py-2">Reorder</th>
                <th className="py-2">Price</th>
                <th className="py-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.Inv_ID} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">{row.Inv_ID}</td>
                  <td className="py-3 text-slate-700">{row.products.Product_Name}</td>
                  <td className="py-3 text-slate-700">{row.suppliers.CompanyName || '--'}</td>
                  <td className="py-3 text-slate-700">{row.Quantity_on_Hand}</td>
                  <td className="py-3 text-slate-700">{row.ReorderLevel ?? 0}</td>
                  <td className="py-3 text-slate-700">Rs. {Number(row.Price).toFixed(2)}</td>
                  <td className="py-3 text-slate-700">{new Date(row.ExpiryDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
