'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface StatsPayload {
  totalUsers: number
  totalCustomers: number
  totalDoctors: number
  totalSuppliers: number
  totalProducts: number
  totalOrders: number
  totalPrescriptions: number
  pendingOrders: number
  totalOrderValue: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsPayload | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load admin stats')
          return
        }
        setStats(payload.data)
      } catch (err) {
        setError('Failed to load admin stats')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  if (loading) {
    return <div className="cf-card text-sm text-slate-600">Loading admin overview...</div>
  }

  const adminSections = [
    { title: 'Users', path: '/dashboard/admin/users', subtitle: 'Role and account state' },
    { title: 'Customers', path: '/dashboard/admin/customers', subtitle: 'Customer operations view' },
    { title: 'Doctors', path: '/dashboard/admin/doctors', subtitle: 'Clinical provider panel' },
    { title: 'Suppliers', path: '/dashboard/admin/suppliers', subtitle: 'Procurement partners view' },
    { title: 'Products', path: '/dashboard/admin/products', subtitle: 'Master medicine catalog' },
    { title: 'Inventory', path: '/dashboard/admin/inventory', subtitle: 'Stock and expiry tracking' },
    { title: 'Product Stats', path: '/dashboard/admin/product-stats', subtitle: 'Trigger-generated rollup view' },
    { title: 'Orders', path: '/dashboard/admin/orders', subtitle: 'Order and payment status' },
    { title: 'Prescriptions', path: '/dashboard/admin/prescriptions', subtitle: 'Prescription governance' },
    { title: 'Login History', path: '/dashboard/admin/login-history', subtitle: 'Security audit trail' },
    { title: 'Transactions', path: '/dashboard/admin/transactions', subtitle: 'Inventory movement ledger' },
  ]

  const cards = [
    { label: 'Users', value: stats?.totalUsers ?? 0 },
    { label: 'Orders', value: stats?.totalOrders ?? 0 },
    { label: 'Products', value: stats?.totalProducts ?? 0 },
    { label: 'Pending Orders', value: stats?.pendingOrders ?? 0 },
  ]

  return (
    <div className="space-y-5">
      {error && <p className="rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="cf-card">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="cf-card">
        <h2 className="text-xl font-semibold text-slate-900">Admin Sections</h2>
        <p className="mt-1 text-sm text-slate-600">Open any module for database-level visibility.</p>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {adminSections.map((section) => (
            <Link key={section.path} href={section.path} className="rounded-lg border border-slate-200 p-4 transition hover:border-[#8EC641]">
              <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{section.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="cf-card">
        <h3 className="text-lg font-semibold text-slate-900">Revenue Snapshot</h3>
        <p className="mt-2 text-sm text-slate-600">Paid order value currently stored in the system.</p>
        <p className="mt-3 text-3xl font-bold text-[#0f644c]">Rs. {Number(stats?.totalOrderValue || 0).toFixed(2)}</p>
      </section>
    </div>
  )
}
