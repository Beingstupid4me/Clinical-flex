'use client'

import { useEffect, useState } from 'react'

interface UserRow {
  UserID: number
  Email: string
  Role: string
  IsActive: boolean | null
  CreatedAt: string | null
  customers: { Name: string } | null
  doctors: { FirstName: string | null; LastName: string | null } | null
  suppliers: { CompanyName: string | null } | null
}

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyUserId, setBusyUserId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  const toggleUserStatus = async (row: UserRow) => {
    try {
      setBusyUserId(row.UserID)
      setError('')
      setMessage('')

      const response = await fetch(`/api/admin/users/${row.UserID}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !row.IsActive }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Failed to update user status')
        return
      }

      setRows((prev) => prev.map((item) => (item.UserID === row.UserID ? { ...item, IsActive: payload.data.IsActive } : item)))
      setMessage(`User ${row.Email} is now ${payload.data.IsActive ? 'ACTIVE' : 'INACTIVE'}`)
    } catch (err) {
      setError('Failed to update user status')
    } finally {
      setBusyUserId(null)
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/users')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load users')
          return
        }
        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">All Users</h2>
      <p className="mt-1 text-sm text-slate-600">Cross-role view of all registered users.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading users...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">{message}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">User ID</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Profile Name</th>
                <th className="py-2">Status</th>
                <th className="py-2">Created</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const profileName = row.customers?.Name
                  || `${row.doctors?.FirstName || ''} ${row.doctors?.LastName || ''}`.trim()
                  || row.suppliers?.CompanyName
                  || '--'
                return (
                  <tr key={row.UserID} className="border-b border-slate-100">
                    <td className="py-3 text-slate-700">{row.UserID}</td>
                    <td className="py-3 text-slate-700">{row.Email}</td>
                    <td className="py-3 text-slate-700">{row.Role}</td>
                    <td className="py-3 text-slate-700">{profileName}</td>
                    <td className="py-3">
                      <span className={`cf-chip ${row.IsActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {row.IsActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{row.CreatedAt ? new Date(row.CreatedAt).toLocaleDateString() : '--'}</td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleUserStatus(row)}
                        disabled={busyUserId === row.UserID}
                        className={`rounded-md px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 ${row.IsActive ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                      >
                        {busyUserId === row.UserID ? 'Updating...' : row.IsActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
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
