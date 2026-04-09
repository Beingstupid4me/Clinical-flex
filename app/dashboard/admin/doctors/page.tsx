'use client'

import { useEffect, useState } from 'react'

interface DoctorRow {
  UserID: number
  FirstName: string | null
  LastName: string | null
  Specialty: string | null
  LicenseNumber: string | null
  Phone: string | null
  users: { Email: string; IsActive: boolean | null }
  _count: { prescription: number }
}

export default function AdminDoctorsPage() {
  const [rows, setRows] = useState<DoctorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/doctors')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load doctors')
          return
        }
        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load doctors')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Doctors</h2>
      <p className="mt-1 text-sm text-slate-600">Clinical providers and issued prescription counts.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading doctors...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Doctor</th>
                <th className="py-2">Email</th>
                <th className="py-2">Specialty</th>
                <th className="py-2">License</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Prescriptions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.UserID} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">{`${row.FirstName || ''} ${row.LastName || ''}`.trim() || '--'}</td>
                  <td className="py-3 text-slate-700">{row.users.Email}</td>
                  <td className="py-3 text-slate-700">{row.Specialty || '--'}</td>
                  <td className="py-3 text-slate-700">{row.LicenseNumber || '--'}</td>
                  <td className="py-3 text-slate-700">{row.Phone || '--'}</td>
                  <td className="py-3 text-slate-700">{row._count.prescription}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
