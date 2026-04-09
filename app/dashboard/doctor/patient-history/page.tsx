'use client'

import { useEffect, useState } from 'react'

interface PatientOption {
  UserID: number
  Name: string
  users: { Email: string }
}

interface HistoryPayload {
  patient: {
    Name: string
    users: { Email: string }
    Phone: string | null
    City: string | null
  }
  orders: Array<{
    OrderID: number
    Date_of_order: string | null
    TotalAmount: number
    Status: string | null
  }>
  prescriptions: Array<{
    Prescription_No: number
    Drug_Name: string
    Status: string | null
    ExpiryDate: string
  }>
}

export default function DoctorPatientHistoryPage() {
  const [patients, setPatients] = useState<PatientOption[]>([])
  const [patientId, setPatientId] = useState(0)
  const [history, setHistory] = useState<HistoryPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      const response = await fetch('/api/doctor/patients')
      const payload = await response.json()
      if (response.ok) {
        setPatients(payload.data || [])
      }
    }

    void run()
  }, [])

  const loadHistory = async () => {
    if (!patientId) {
      setError('Select a patient first')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await fetch(`/api/doctor/patient-history?patientId=${patientId}`)
      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Failed to load patient history')
        return
      }
      setHistory(payload.data)
    } catch (err) {
      setError('Failed to load patient history')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="cf-card">
        <h2 className="text-xl font-semibold text-slate-900">Patient History</h2>
        <p className="mt-1 text-sm text-slate-600">View complete order and prescription trail for a patient.</p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <select value={patientId} onChange={(e) => setPatientId(Number(e.target.value))} className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option value={0}>Select patient</option>
            {patients.map((p) => (
              <option key={p.UserID} value={p.UserID}>{p.Name} ({p.users.Email})</option>
            ))}
          </select>
          <button onClick={loadHistory} className="rounded-md bg-[#8EC641] px-4 py-2 text-sm font-semibold text-white">Load History</button>
        </div>

        {error && <p className="mt-3 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      </section>

      {loading && <section className="cf-card"><p className="text-sm text-slate-600">Loading history...</p></section>}

      {history && (
        <>
          <section className="cf-card">
            <h3 className="text-lg font-semibold text-slate-900">Patient Details</h3>
            <p className="mt-2 text-sm text-slate-600">{history.patient.Name} • {history.patient.users.Email}</p>
            <p className="text-sm text-slate-600">{history.patient.Phone || '--'} • {history.patient.City || '--'}</p>
          </section>

          <section className="cf-card">
            <h3 className="text-lg font-semibold text-slate-900">Orders</h3>
            {history.orders.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No orders found.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {history.orders.map((order) => (
                  <li key={order.OrderID} className="rounded border border-slate-200 p-3">
                    ORD-{order.OrderID} • {order.Date_of_order ? new Date(order.Date_of_order).toLocaleDateString() : '--'} • Rs. {Number(order.TotalAmount).toFixed(2)} • {order.Status || 'PENDING'}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="cf-card">
            <h3 className="text-lg font-semibold text-slate-900">Prescriptions</h3>
            {history.prescriptions.length === 0 ? (
              <p className="mt-2 text-sm text-slate-600">No prescriptions found.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {history.prescriptions.map((rx) => (
                  <li key={rx.Prescription_No} className="rounded border border-slate-200 p-3">
                    RX-{rx.Prescription_No} • {rx.Drug_Name} • Expires {new Date(rx.ExpiryDate).toLocaleDateString()} • {rx.Status || 'ACTIVE'}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
