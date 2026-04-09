'use client'

import { useEffect, useState } from 'react'

interface CustomerRow {
  UserID: number
  Name: string
  City: string | null
  Phone: string | null
  isBanned: boolean | null
  users: { Email: string; IsActive: boolean | null }
  _count: { orders: number; prescription: number }
}

export default function AdminCustomersPage() {
  const [rows, setRows] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyCustomerId, setBusyCustomerId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const toggleCustomerBan = async (row: CustomerRow) => {
    try {
      setBusyCustomerId(row.UserID)
      setError('')
      setMessage('')

      const response = await fetch(`/api/admin/customers/${row.UserID}/ban`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !row.isBanned }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Failed to update customer ban status')
        return
      }

      setRows((prev) => prev.map((item) => (item.UserID === row.UserID ? { ...item, isBanned: payload.data.isBanned } : item)))
      setMessage(`Customer ${row.Name} is now ${payload.data.isBanned ? 'BANNED' : 'UNBANNED'}`)
    } catch (err) {
      setError('Failed to update customer ban status')
    } finally {
      setBusyCustomerId(null)
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/customers')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load customers')
          return
        }
        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load customers')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Customers</h2>
      <p className="mt-1 text-sm text-slate-600">Customer accounts with order and prescription volumes.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading customers...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">{message}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Phone</th>
                <th className="py-2">City</th>
                <th className="py-2">Orders</th>
                <th className="py-2">Rx</th>
                <th className="py-2">Flags</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.UserID} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">{row.Name}</td>
                  <td className="py-3 text-slate-700">{row.users.Email}</td>
                  <td className="py-3 text-slate-700">{row.Phone || '--'}</td>
                  <td className="py-3 text-slate-700">{row.City || '--'}</td>
                  <td className="py-3 text-slate-700">{row._count.orders}</td>
                  <td className="py-3 text-slate-700">{row._count.prescription}</td>
                  <td className="py-3">
                    {row.isBanned ? <span className="cf-chip bg-red-100 text-red-700">BANNED</span> : <span className="cf-chip bg-emerald-100 text-emerald-700">OK</span>}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => toggleCustomerBan(row)}
                      disabled={busyCustomerId === row.UserID}
                      className={`rounded-md px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 ${row.isBanned ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {busyCustomerId === row.UserID ? 'Updating...' : row.isBanned ? 'Unban' : 'Ban'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
