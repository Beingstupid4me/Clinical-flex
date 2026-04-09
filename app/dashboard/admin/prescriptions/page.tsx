'use client'

import { useEffect, useState } from 'react'

interface PrescriptionRow {
  Prescription_No: number
  Drug_Name: string
  Dosage: string
  ExpiryDate: string
  Status: string | null
  RefillsRemaining: number | null
  customers: { Name: string }
  doctors: { FirstName: string | null; LastName: string | null }
}

export default function AdminPrescriptionsPage() {
  const [rows, setRows] = useState<PrescriptionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/prescriptions')
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
      <h2 className="text-xl font-semibold text-slate-900">Prescriptions</h2>
      <p className="mt-1 text-sm text-slate-600">Issued prescriptions with patient and doctor linkage.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading prescriptions...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      {!loading && !error && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[1080px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="py-2">Rx No.</th>
                <th className="py-2">Patient</th>
                <th className="py-2">Doctor</th>
                <th className="py-2">Drug</th>
                <th className="py-2">Dosage</th>
                <th className="py-2">Refills</th>
                <th className="py-2">Status</th>
                <th className="py-2">Expiry</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.Prescription_No} className="border-b border-slate-100">
                  <td className="py-3 text-slate-700">RX-{row.Prescription_No}</td>
                  <td className="py-3 text-slate-700">{row.customers.Name}</td>
                  <td className="py-3 text-slate-700">{`${row.doctors.FirstName || ''} ${row.doctors.LastName || ''}`.trim() || '--'}</td>
                  <td className="py-3 text-slate-700">{row.Drug_Name}</td>
                  <td className="py-3 text-slate-700">{row.Dosage}</td>
                  <td className="py-3 text-slate-700">{row.RefillsRemaining ?? 0}</td>
                  <td className="py-3 text-slate-700">{row.Status || 'ACTIVE'}</td>
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
