'use client'

import { useEffect, useState } from 'react'

interface PrescriptionRow {
  Prescription_No: number
  Drug_Name: string
  Dosage: string
  ExpiryDate: string
  Status: string | null
  RefillsRemaining: number | null
  customers: {
    Name: string
    users: {
      Email: string
    }
  }
}

export default function DoctorPrescriptionsPage() {
  const [rows, setRows] = useState<PrescriptionRow[]>([])
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
        const response = await fetch(`/api/doctor/prescriptions?doctorId=${user.UserID}`)
        const payload = await response.json()

        if (!response.ok) {
          setError(payload.error || 'Failed to load prescriptions')
          return
        }

        setRows(payload.data || [])
      } catch (err) {
        setError('Failed to load prescriptions')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">My Prescriptions</h2>
      <p className="mt-1 text-sm text-slate-600">Live doctor-issued prescription records from MySQL.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading prescriptions...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="mt-4 text-sm text-slate-600">No prescriptions created yet.</p>}

      {rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Rx No.</th>
                <th className="py-2">Patient</th>
                <th className="py-2">Drug</th>
                <th className="py-2">Dosage</th>
                <th className="py-2">Expiry</th>
                <th className="py-2">Refills</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.Prescription_No} className="border-b border-slate-100">
                  <td className="py-3 font-medium text-slate-800">RX-{row.Prescription_No}</td>
                  <td className="py-3 text-slate-600">{row.customers.Name}</td>
                  <td className="py-3 text-slate-700">{row.Drug_Name}</td>
                  <td className="py-3 text-slate-600">{row.Dosage}</td>
                  <td className="py-3 text-slate-600">{new Date(row.ExpiryDate).toLocaleDateString()}</td>
                  <td className="py-3 text-slate-600">{row.RefillsRemaining ?? 0}</td>
                  <td className="py-3">
                    <span className={`cf-chip ${row.Status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                      {row.Status || 'ACTIVE'}
                    </span>
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
