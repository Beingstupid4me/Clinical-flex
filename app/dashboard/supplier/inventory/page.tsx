'use client'

import { useEffect, useState } from 'react'

interface InventoryRow {
  Inv_ID: number
  ProductID: number
  Quantity_on_Hand: number
  ReorderLevel: number | null
  UpdatedAt: string | null
  products: {
    Product_Name: string
    DosageForm: string | null
  }
}

export default function SupplierInventoryPage() {
  const [rows, setRows] = useState<InventoryRow[]>([])
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

        const response = await fetch(`/api/supplier/inventory?supplierId=${user.UserID}`)
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
      <h2 className="text-xl font-semibold text-slate-900">Inventory Status</h2>
      <p className="mt-1 text-sm text-slate-600">Real-time stock levels from central inventory records.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading inventory...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="mt-4 text-sm text-slate-600">No inventory records found.</p>}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Product</th>
                <th className="py-2">Category</th>
                <th className="py-2">Current Stock</th>
                <th className="py-2">Min Level</th>
                <th className="py-2">Stock Health</th>
                <th className="py-2">Last Restock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const minLevel = row.ReorderLevel ?? 0
                const low = row.Quantity_on_Hand <= minLevel
                return (
                  <tr key={row.Inv_ID} className="border-b border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{row.products.Product_Name}</td>
                    <td className="py-3 text-slate-600">{row.products.DosageForm || '--'}</td>
                    <td className="py-3 text-slate-700">{row.Quantity_on_Hand}</td>
                    <td className="py-3 text-slate-600">{minLevel}</td>
                    <td className="py-3">
                      <span className={`cf-chip ${low ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {low ? 'Low Stock' : 'Healthy'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{row.UpdatedAt ? new Date(row.UpdatedAt).toLocaleDateString() : '--'}</td>
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
