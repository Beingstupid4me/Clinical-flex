'use client'

import { useEffect, useState } from 'react'

interface PrescriptionRow {
  Prescription_No: number
  Drug_Name: string
  Dosage: string
  ExpiryDate: string
  Status: string | null
  doctors: {
    FirstName: string | null
    LastName: string | null
    Specialty: string | null
  }
}

export default function CustomerPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([])
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

        const response = await fetch(`/api/customer/prescriptions?customerId=${user.UserID}`)
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load prescriptions')
          return
        }

        setPrescriptions(payload.data || [])
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
      <p className="mt-1 text-sm text-slate-600">Use active prescriptions for prescription-only products during checkout.</p>

      {loading && <p className="mt-4 text-sm text-slate-600">Loading prescriptions...</p>}
      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {!loading && !error && prescriptions.length === 0 && (
        <p className="mt-4 text-sm text-slate-600">No prescriptions found.</p>
      )}

      <div className="mt-5 grid gap-3">
        {prescriptions.map((item) => (
          <article key={item.Prescription_No} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">RX-{item.Prescription_No}</p>
                <h3 className="text-lg font-semibold text-slate-900">{item.Drug_Name}</h3>
              </div>
              <span className={`cf-chip ${item.Status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                {item.Status || 'ACTIVE'}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-600">Dosage: {item.Dosage}</p>
            <p className="text-sm text-slate-600">Expiry: {new Date(item.ExpiryDate).toLocaleDateString()}</p>
            <p className="text-sm text-slate-600">
              Doctor: {item.doctors?.FirstName || ''} {item.doctors?.LastName || ''}
              {item.doctors?.Specialty ? ` (${item.doctors.Specialty})` : ''}
            </p>
          </article>
        ))}
      </div>
    </div>
  )
}
