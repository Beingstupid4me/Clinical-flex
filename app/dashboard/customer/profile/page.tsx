'use client'

import { useEffect, useState } from 'react'

export default function CustomerProfilePage() {
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
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

        const parsed = JSON.parse(raw) as { UserID?: number; Email?: string }
        setCustomerId(parsed.UserID ?? null)
        setEmail(parsed.Email ?? '')

        if (!parsed.UserID) {
          setError('Customer session not found')
          return
        }

        const response = await fetch(`/api/customer/profile?customerId=${parsed.UserID}`)
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load profile')
          return
        }

        setName(payload.data.Name || '')
        setPhone(payload.data.Phone || '')
        setCity(payload.data.City || '')
        setAddress(payload.data.AddressLine1 || '')
      } catch (err) {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  const saveProfile = async () => {
    if (!customerId) {
      setError('Customer session not found')
      return
    }

    try {
      setSaving(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          name,
          phone,
          city,
          address,
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
      <p className="mt-1 text-sm text-slate-600">Update your account details used for orders and delivery.</p>

      {loading && <p className="mt-3 text-sm text-slate-600">Loading profile...</p>}
      {error && <p className="mt-3 rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-3 rounded-md bg-emerald-100 p-2 text-sm text-emerald-700">{message}</p>}

      <form className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Full Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter full name"
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#8EC641]"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Email</span>
          <input
            value={email}
            readOnly
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">Phone</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91"
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#8EC641]"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700">City</span>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#8EC641]"
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-medium text-slate-700">Address</span>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address line"
            className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#8EC641]"
          />
        </label>

        <div className="md:col-span-2">
          <button
            type="button"
            disabled={saving || loading}
            onClick={saveProfile}
            className="rounded-md bg-[#0f644c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0a4b39] disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
