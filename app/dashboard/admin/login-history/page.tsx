'use client'

import { useEffect, useState } from 'react'

interface LoginHistoryRow {
  HistoryID: number
  isSuccess: boolean | null
  DateTime_Attempt: string | null
  IPAddress: string | null
  LoginMethod: string | null
  LogoutTime: string | null
  users: { Email: string; Role: string }
}

export default function AdminLoginHistoryPage() {
  const [rows, setRows] = useState<LoginHistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/login-history')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load login history')
          return
        }
        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load login history')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Login History</h2>
      <p className="mt-1 text-sm text-slate-600">Authentication audit trail for all users.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading login history...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">History ID</th>
                <th className="py-2">User</th>
                <th className="py-2">Role</th>
                <th className="py-2">Success</th>
                <th className="py-2">Attempt Time</th>
                <th className="py-2">IP</th>
                <th className="py-2">Method</th>
                <th className="py-2">Logout</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.HistoryID} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">{row.HistoryID}</td>
                  <td className="py-3 text-slate-700">{row.users.Email}</td>
                  <td className="py-3 text-slate-700">{row.users.Role}</td>
                  <td className="py-3 text-slate-700">{row.isSuccess === false ? 'NO' : 'YES'}</td>
                  <td className="py-3 text-slate-700">{row.DateTime_Attempt ? new Date(row.DateTime_Attempt).toLocaleString() : '--'}</td>
                  <td className="py-3 text-slate-700">{row.IPAddress || '--'}</td>
                  <td className="py-3 text-slate-700">{row.LoginMethod || '--'}</td>
                  <td className="py-3 text-slate-700">{row.LogoutTime ? new Date(row.LogoutTime).toLocaleString() : '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
