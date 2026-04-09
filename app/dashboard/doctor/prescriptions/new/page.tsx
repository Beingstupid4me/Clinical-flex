'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface PatientOption {
  UserID: number
  Name: string
  users: { Email: string }
}

export default function DoctorCreatePrescriptionPage() {
  const searchParams = useSearchParams()
  const patientFromQuery = Number(searchParams.get('patientId') ?? 0)

  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [patientId, setPatientId] = useState<number>(patientFromQuery || 0)
  const [drugName, setDrugName] = useState('')
  const [dosage, setDosage] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [refills, setRefills] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const run = async () => {
      const raw = localStorage.getItem('currentUser')
      if (!raw) {
        setError('Please login again')
        return
      }
      const user = JSON.parse(raw) as { UserID?: number }
      setDoctorId(user.UserID ?? null)

      const response = await fetch('/api/doctor/patients')
      const payload = await response.json()
      if (response.ok) {
        setPatients(payload.data || [])
      }
    }

    void run()
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!doctorId) {
      setError('Doctor session not found')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          patientId,
          drugName,
          dosage,
          expiryDate,
          refills,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Failed to create prescription')
        return
      }

      setMessage(`Prescription created successfully (RX-${payload.data.Prescription_No})`)
      setDrugName('')
      setDosage('')
      setExpiryDate('')
      setRefills(0)
    } catch (err) {
      setError('Failed to create prescription')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">Create Prescription</h2>
      <p className="mt-1 text-sm text-slate-600">Issue a new prescription for a selected patient.</p>

      {error && <p className="mt-4 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">{message}</p>}

      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-slate-700">Patient</span>
          <select
            value={patientId}
            onChange={(e) => setPatientId(Number(e.target.value))}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            required
          >
            <option value={0}>Select patient</option>
            {patients.map((p) => (
              <option key={p.UserID} value={p.UserID}>{p.Name} ({p.users.Email})</option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Drug Name</span>
          <input value={drugName} onChange={(e) => setDrugName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Dosage</span>
          <input value={dosage} onChange={(e) => setDosage(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Expiry Date</span>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" required />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Refills Remaining</span>
          <input type="number" min={0} value={refills} onChange={(e) => setRefills(Number(e.target.value))} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <div className="md:col-span-2">
          <button disabled={submitting} className="rounded-md bg-[#8EC641] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {submitting ? 'Creating...' : 'Create Prescription'}
          </button>
        </div>
      </form>
    </div>
  )
}
