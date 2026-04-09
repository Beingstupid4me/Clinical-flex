'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

interface PatientRow {
  UserID: number
  Name: string
  Phone: string | null
  City: string | null
  users: { Email: string }
  _count: { orders: number; prescription: number }
}

export default function DoctorPatientsPage() {
  const [query, setQuery] = useState('')
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPatients = async (search = '') => {
    try {
      setLoading(true)
      setError('')
      const qs = search.trim() ? `?query=${encodeURIComponent(search.trim())}` : ''
      const response = await fetch(`/api/doctor/patients${qs}`)
      const payload = await response.json()

      if (!response.ok) {
        setError(payload.error || 'Failed to load patients')
        return
      }

      setPatients(payload.data || [])
    } catch (err) {
      setError('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadPatients()
  }, [])

  return (
    <div className="space-y-5">
      <section className="cf-card">
        <h2 className="text-xl font-semibold text-slate-900">Search Patients</h2>
        <p className="mt-1 text-sm text-slate-600">Find patients by name, email, or phone number.</p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#8EC641]"
          />
          <button onClick={() => loadPatients(query)} className="rounded-md bg-[#8EC641] px-4 py-2 text-sm font-semibold text-white">
            Search
          </button>
        </div>

        {error && <p className="mt-3 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      </section>

      <section className="cf-card">
        {loading ? (
          <p className="text-sm text-slate-600">Loading patients...</p>
        ) : patients.length === 0 ? (
          <p className="text-sm text-slate-600">No patients found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-500">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Phone</th>
                  <th className="py-2">Orders</th>
                  <th className="py-2">Prescriptions</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.UserID} className="border-b border-slate-100">
                    <td className="py-3 font-medium text-slate-800">{patient.Name}</td>
                    <td className="py-3 text-slate-600">{patient.users.Email}</td>
                    <td className="py-3 text-slate-600">{patient.Phone || '--'}</td>
                    <td className="py-3 text-slate-600">{patient._count.orders}</td>
                    <td className="py-3 text-slate-600">{patient._count.prescription}</td>
                    <td className="py-3">
                      <Link
                        href={`/dashboard/doctor/prescriptions/new?patientId=${patient.UserID}&patientName=${encodeURIComponent(patient.Name)}`}
                        className="rounded-md bg-[#0f644c] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Create Rx
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
