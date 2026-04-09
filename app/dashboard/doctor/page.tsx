'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface PrescriptionRow {
  Prescription_No: number
}

interface PatientRow {
  UserID: number
}

export default function DoctorDashboard() {
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [prescriptions, setPrescriptions] = useState<PrescriptionRow[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem('currentUser')
        if (!raw) {
          setError('Please login again')
          return
        }

        const user = JSON.parse(raw) as { UserID?: number }

        const [patientsResponse, prescriptionsResponse] = await Promise.all([
          fetch('/api/doctor/patients'),
          fetch(`/api/doctor/prescriptions?doctorId=${user.UserID}`),
        ])

        const patientsPayload = await patientsResponse.json()
        const prescriptionsPayload = await prescriptionsResponse.json()

        if (!patientsResponse.ok || !prescriptionsResponse.ok) {
          setError('Unable to load doctor dashboard data')
          return
        }

        setPatients(patientsPayload.data || [])
        setPrescriptions(prescriptionsPayload.data || [])
      } catch (err) {
        setError('Unable to load doctor dashboard data')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  if (loading) {
    return <div className="cf-card text-sm text-slate-600">Loading overview...</div>
  }

  return (
    <div className="space-y-5">
      {error && <p className="rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="cf-card">
          <p className="text-sm text-slate-500">Total Patients</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{patients.length}</p>
        </article>
        <article className="cf-card">
          <p className="text-sm text-slate-500">Prescriptions Issued</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{prescriptions.length}</p>
        </article>
      </section>

      <section className="cf-card">
        <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
        <p className="mt-1 text-sm text-slate-600">Use the tools below to handle day-to-day clinical operations.</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/doctor/patients" className="rounded-lg border border-slate-200 p-4 hover:border-[#8EC641]">
            <p className="font-semibold text-slate-900">Search Patients</p>
            <p className="mt-1 text-sm text-slate-600">Find patient records by name, email, or phone.</p>
          </Link>
          <Link href="/dashboard/doctor/prescriptions/new" className="rounded-lg border border-slate-200 p-4 hover:border-[#8EC641]">
            <p className="font-semibold text-slate-900">Create Prescription</p>
            <p className="mt-1 text-sm text-slate-600">Write and issue a new prescription instantly.</p>
          </Link>
          <Link href="/dashboard/doctor/patient-history" className="rounded-lg border border-slate-200 p-4 hover:border-[#8EC641]">
            <p className="font-semibold text-slate-900">Patient History</p>
            <p className="mt-1 text-sm text-slate-600">Review prior orders and prescription timeline.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
