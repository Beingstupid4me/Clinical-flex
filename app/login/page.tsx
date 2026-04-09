'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      // Store user info in localStorage
      localStorage.setItem('currentUser', JSON.stringify(data.user))

      // Redirect to dashboard
      const dashboardPath = data.user.Role === 'CUSTOMER' ? '/dashboard/customer'
        : data.user.Role === 'DOCTOR' ? '/dashboard/doctor'
        : data.user.Role === 'SUPPLIER' ? '/dashboard/supplier'
        : '/dashboard/admin'

      router.push(dashboardPath)
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
          <div className="flex gap-2">
            <Link href="/register" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#0f644c]">Register</Link>
          </div>
        </div>
      </header>

      <section className="cf-hero" style={{ backgroundImage: "url('/resources/back_main.jpeg')" }}>
        <div className="cf-overlay" />
        <div className="relative z-10 mx-auto grid min-h-[78vh] w-full max-w-6xl items-center gap-6 px-4 py-8 md:grid-cols-2">
          <div className="text-white">
            <h1 className="text-5xl font-semibold">Welcome Back</h1>
            <p className="mt-2 max-w-md text-lg text-white/90">Login to continue with product browsing, checkout, and order tracking.</p>
          </div>

          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl md:justify-self-end">
            <h2 className="text-3xl font-bold text-slate-900">Login</h2>
            <p className="mt-1 text-sm text-slate-600">Use your registered account credentials.</p>

            {error && (
              <div className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
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
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-[#8EC641] px-4 py-2 font-semibold text-white hover:bg-[#79ae35] disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="mt-5 text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-[#0f644c] hover:underline">
                Register here
              </Link>
            </p>

            <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-semibold text-slate-700">Quick Access Accounts</p>
              <p>customer1@test.com / password</p>
              <p>doctor1@test.com / password</p>
              <p>supplier1@test.com / password</p>
              <p>admin@local.test / admin123 (always works)</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
