'use client'

import { useEffect, useState } from 'react'

interface SupplierRow {
  UserID: number
  CompanyName: string | null
  ContactPerson: string | null
  Phone: string | null
  users: { Email: string; IsActive: boolean | null }
  _count: { inventory: number; ratings: number }
}

export default function AdminSuppliersPage() {
  const [rows, setRows] = useState<SupplierRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/suppliers')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load suppliers')
          return
        }
        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load suppliers')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Suppliers</h2>
      <p className="mt-1 text-sm text-slate-600">Supplier accounts with inventory and rating footprints.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading suppliers...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Company</th>
                <th className="py-2">Contact</th>
                <th className="py-2">Email</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Inventory Rows</th>
                <th className="py-2">Ratings</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.UserID} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">{row.CompanyName || '--'}</td>
                  <td className="py-3 text-slate-700">{row.ContactPerson || '--'}</td>
                  <td className="py-3 text-slate-700">{row.users.Email}</td>
                  <td className="py-3 text-slate-700">{row.Phone || '--'}</td>
                  <td className="py-3 text-slate-700">{row._count.inventory}</td>
                  <td className="py-3 text-slate-700">{row._count.ratings}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
