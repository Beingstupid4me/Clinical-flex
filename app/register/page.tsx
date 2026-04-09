'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserRole = 'CUSTOMER' | 'DOCTOR' | 'SUPPLIER'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<UserRole>('CUSTOMER')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    licenseNumber: '', // For doctors
    companyName: '', // For suppliers
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        return
      }

      // Redirect to login
      router.push('/login')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="cf-topbar">
        <div className="cf-topbar-inner">
          <Link href="/" className="flex items-center gap-3">
            <img src="/resources/logo.png" alt="Clinical Flex" className="h-8 w-8 rounded" />
            <p className="text-lg font-semibold">Clinical - Flex</p>
          </Link>
          <Link href="/login" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#0f644c]">
            Login
          </Link>
        </div>
      </header>

      <section className="cf-hero" style={{ backgroundImage: "url('/resources/back_main.jpeg')" }}>
        <div className="cf-overlay" />
        <div className="relative z-10 mx-auto grid min-h-[78vh] w-full max-w-6xl items-center gap-6 px-4 py-8 md:grid-cols-2">
          <div className="text-white">
            <h1 className="text-4xl font-semibold md:text-5xl">Create Your Account</h1>
            <p className="mt-2 max-w-md text-lg text-white/90">Register once and continue with customer, doctor, or supplier workflows.</p>
          </div>

          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl md:justify-self-end">
            <h2 className="text-3xl font-bold text-slate-900">Register</h2>
            <p className="mt-1 text-sm text-slate-600">Choose your role and provide the required details.</p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['CUSTOMER', 'DOCTOR', 'SUPPLIER'].map((r) => (
                <label key={r} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-2 py-2">
                  <input
                    type="radio"
                    name="role"
                    value={r}
                    checked={role === r}
                    onChange={() => setRole(r as UserRole)}
                    className="h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-gray-700">{r.charAt(0) + r.slice(1).toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Common Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full name"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Your address"
              className="input-field"
              rows={2}
            />
          </div>

          {/* Doctor-specific */}
          {role === 'DOCTOR' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder="Your medical license"
                className="input-field"
                required
              />
            </div>
          )}

          {/* Supplier-specific */}
          {role === 'SUPPLIER' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Your company"
                className="input-field"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[#8EC641] px-4 py-2 font-semibold text-white hover:bg-[#79ae35] disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

            <p className="mt-5 text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[#0f644c] hover:underline">
            Login here
              </Link>
            </p>
          </div>
        </div>
      </section>
      </div>
  )
}
