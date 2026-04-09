'use client'

import { useEffect, useState } from 'react'

interface ProductRow {
  ProductID: number
  Product_Name: string
  SKU: string | null
  Manufacturer: string | null
  Strength: string | null
  DosageForm: string | null
  IsPrescriptionRequired: boolean | null
  _count: { inventory: number; orderitems: number }
}

export default function AdminProductsPage() {
  const [rows, setRows] = useState<ProductRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/products')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load products')
          return
        }
        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Products</h2>
      <p className="mt-1 text-sm text-slate-600">Master medicine catalog used by inventory and order workflows.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading products...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Product</th>
                <th className="py-2">SKU</th>
                <th className="py-2">Manufacturer</th>
                <th className="py-2">Strength</th>
                <th className="py-2">Dosage Form</th>
                <th className="py-2">Rx Required</th>
                <th className="py-2">Inventory Rows</th>
                <th className="py-2">Order Items</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.ProductID} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">{row.Product_Name}</td>
                  <td className="py-3 text-slate-700">{row.SKU || '--'}</td>
                  <td className="py-3 text-slate-700">{row.Manufacturer || '--'}</td>
                  <td className="py-3 text-slate-700">{row.Strength || '--'}</td>
                  <td className="py-3 text-slate-700">{row.DosageForm || '--'}</td>
                  <td className="py-3 text-slate-700">{row.IsPrescriptionRequired ? 'YES' : 'NO'}</td>
                  <td className="py-3 text-slate-700">{row._count.inventory}</td>
                  <td className="py-3 text-slate-700">{row._count.orderitems}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
