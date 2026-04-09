'use client'

import { useEffect, useState } from 'react'

export default function DoctorProfilePage() {
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const raw = localStorage.getItem('currentUser')
        if (!raw) {
          setError('Please login again')
          return
        }

        const user = JSON.parse(raw) as { UserID?: number }
        setDoctorId(user.UserID ?? null)

        const response = await fetch(`/api/doctor/profile?doctorId=${user.UserID}`)
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load profile')
          return
        }

        setEmail(payload.data.Email || '')
        setFirstName(payload.data.FirstName || '')
        setLastName(payload.data.LastName || '')
        setSpecialty(payload.data.Specialty || '')
        setLicenseNumber(payload.data.LicenseNumber || '')
        setPhone(payload.data.Phone || '')
      } catch (err) {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  const saveProfile = async () => {
    if (!doctorId) {
      setError('Doctor session not found')
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/doctor/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId,
          firstName,
          lastName,
          specialty,
          phone,
        }),
      })

      const payload = await response.json()
      if (!response.ok) {
        setError(payload.error || 'Failed to save profile')
        return
      }

      setMessage('Profile updated successfully')
    } catch (err) {
      setError('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="cf-card">
      <h2 className="text-xl font-semibold text-slate-900">My Profile</h2>
      <p className="mt-1 text-sm text-slate-600">Manage your professional details.</p>

      {loading && <p className="mt-3 text-sm text-slate-600">Loading profile...</p>}
      {error && <p className="mt-3 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-3 rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">{message}</p>}

      <form className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">First Name</span>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Last Name</span>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Specialty</span>
          <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Phone</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">License Number</span>
          <input value={licenseNumber} readOnly className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email</span>
          <input value={email} readOnly className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500" />
        </label>

        <div className="md:col-span-2">
          <button type="button" onClick={saveProfile} disabled={saving || loading} className="rounded-md bg-[#0f644c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
