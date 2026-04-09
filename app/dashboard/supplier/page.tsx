'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface InventoryRow {
  InventoryID: number
}

interface AlertRow {
  InventoryID: number
}

export default function SupplierDashboard() {
  const [inventoryRows, setInventoryRows] = useState<InventoryRow[]>([])
  const [alertRows, setAlertRows] = useState<AlertRow[]>([])
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
        if (!user.UserID) {
          setError('Supplier session not found')
          return
        }

        const [inventoryResponse, alertsResponse] = await Promise.all([
          fetch(`/api/supplier/inventory?supplierId=${user.UserID}`),
          fetch(`/api/supplier/stock-alerts?supplierId=${user.UserID}`),
        ])

        const inventoryPayload = await inventoryResponse.json()
        const alertsPayload = await alertsResponse.json()

        if (!inventoryResponse.ok || !alertsResponse.ok) {
          setError('Unable to load supplier dashboard data')
          return
        }

        setInventoryRows(inventoryPayload.data || [])
        setAlertRows(alertsPayload.data || [])
      } catch (err) {
        setError('Unable to load supplier dashboard data')
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
          <p className="text-sm text-slate-500">Tracked Inventory Lines</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{inventoryRows.length}</p>
        </article>
        <article className="cf-card">
          <p className="text-sm text-slate-500">Critical Stock Alerts</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{alertRows.length}</p>
        </article>
      </section>

      <section className="cf-card">
        <h2 className="text-xl font-semibold text-slate-900">Quick Actions</h2>
        <p className="mt-1 text-sm text-slate-600">Manage supply pipeline and stock operations.</p>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/dashboard/supplier/add-batch" className="rounded-lg border border-slate-200 p-4 hover:border-[#8EC641]">
            <p className="font-semibold text-slate-900">Receive Batch</p>
            <p className="mt-1 text-sm text-slate-600">Add incoming stock to inventory with pricing.</p>
          </Link>
          <Link href="/dashboard/supplier/batches" className="rounded-lg border border-slate-200 p-4 hover:border-[#8EC641]">
            <p className="font-semibold text-slate-900">Review Batches</p>
            <p className="mt-1 text-sm text-slate-600">Track remaining quantity and expiry dates.</p>
          </Link>
          <Link href="/dashboard/supplier/stock-alerts" className="rounded-lg border border-slate-200 p-4 hover:border-[#8EC641]">
            <p className="font-semibold text-slate-900">Stock Alerts</p>
            <p className="mt-1 text-sm text-slate-600">See products below minimum level.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
