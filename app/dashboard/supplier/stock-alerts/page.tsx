'use client'

import { useEffect, useState } from 'react'

interface StockAlertRow {
  Inv_ID: number
  Quantity_on_Hand: number
  ReorderLevel: number | null
  UpdatedAt: string | null
  products: {
    Product_Name: string
    SKU: string | null
  }
}

export default function SupplierStockAlertsPage() {
  const [rows, setRows] = useState<StockAlertRow[]>([])
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

        const response = await fetch(`/api/supplier/stock-alerts?supplierId=${user.UserID}`)
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load stock alerts')
          return
        }
        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load stock alerts')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Low Stock Alerts</h2>
      <p className="mt-1 text-sm text-slate-600">Products that need immediate replenishment.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading alerts...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="mt-4 text-sm text-slate-600">No low stock alerts right now.</p>}

      {rows.length > 0 && (
        <ul className="mt-4 space-y-3">
          {rows.map((row) => (
            <li key={row.Inv_ID} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="font-semibold text-slate-800">{row.products.Product_Name}</p>
              <p className="text-sm text-slate-700">Current: {row.Quantity_on_Hand} | Min: {row.ReorderLevel ?? 0}</p>
              <p className="text-xs text-slate-500">SKU: {row.products.SKU || '--'}</p>
              <p className="text-xs text-slate-500">Last Restock: {row.UpdatedAt ? new Date(row.UpdatedAt).toLocaleDateString() : '--'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
