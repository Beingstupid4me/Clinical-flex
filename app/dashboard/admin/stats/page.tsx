'use client'

import { useEffect, useState } from 'react'

interface StatsPayload {
  totalUsers: number
  totalCustomers: number
  totalDoctors: number
  totalSuppliers: number
  totalProducts: number
  totalOrders: number
  totalPrescriptions: number
  totalDeliveries: number
  pendingOrders: number
  paidOrders: number
  totalOrderValue: number
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<StatsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        const payload = await response.json()
        if (!response.ok) {
          setError(payload.error || 'Failed to load statistics')
          return
        }
        setStats(payload.data)
      } catch (err) {
        setError('Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    void run()
  }, [])

  if (loading) return <div className="cf-card text-sm text-slate-600">Loading statistics...</div>
  if (error || !stats) return <div className="cf-card text-sm text-red-700">{error || 'No stats available'}</div>

  const cards = [
    { label: 'Users', value: stats.totalUsers },
    { label: 'Customers', value: stats.totalCustomers },
    { label: 'Doctors', value: stats.totalDoctors },
    { label: 'Suppliers', value: stats.totalSuppliers },
    { label: 'Products', value: stats.totalProducts },
    { label: 'Orders', value: stats.totalOrders },
    { label: 'Prescriptions', value: stats.totalPrescriptions },
    { label: 'Deliveries', value: stats.totalDeliveries },
    { label: 'Pending Orders', value: stats.pendingOrders },
    { label: 'Paid Orders', value: stats.paidOrders },
  ]

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <article key={card.label} className="cf-card">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="cf-card">
        <h2 className="text-xl font-semibold text-slate-900">Revenue Snapshot</h2>
        <p className="mt-1 text-sm text-slate-600">Sum of paid orders tracked by the current database.</p>
        <p className="mt-4 text-3xl font-bold text-[#0f644c]">Rs. {Number(stats.totalOrderValue).toFixed(2)}</p>
      </section>
    </div>
  )
}
