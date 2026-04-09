'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

interface SessionUser {
  UserID: number
  Email: string
  Role: string
}

const navItems = [
  { href: '/dashboard/admin', label: 'Overview' },
  { href: '/dashboard/admin/stats', label: 'Stats' },
  { href: '/dashboard/admin/users', label: 'Users' },
  { href: '/dashboard/admin/customers', label: 'Customers' },
  { href: '/dashboard/admin/doctors', label: 'Doctors' },
  { href: '/dashboard/admin/suppliers', label: 'Suppliers' },
  { href: '/dashboard/admin/products', label: 'Products' },
  { href: '/dashboard/admin/inventory', label: 'Inventory' },
  { href: '/dashboard/admin/product-stats', label: 'Product Stats' },
  { href: '/dashboard/admin/orders', label: 'Orders' },
  { href: '/dashboard/admin/prescriptions', label: 'Prescriptions' },
  { href: '/dashboard/admin/login-history', label: 'Login History' },
  { href: '/dashboard/admin/transactions', label: 'Transactions' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem('currentUser')
    if (!raw) {
      router.replace('/login')
      return
    }

    const parsed = JSON.parse(raw) as SessionUser
    if (parsed.Role !== 'ADMIN') {
      router.replace('/')
      return
    }

    setUser(parsed)
    setLoading(false)
  }, [router])

  const currentTitle = useMemo(() => {
    const item = navItems.find((entry) => pathname === entry.href)
    return item?.label ?? 'Admin'
  }, [pathname])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading admin workspace...</div>
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="cf-topbar">
        <div className="cf-topbar-inner">
          <Link href="/" className="flex items-center gap-3">
            <img src="/resources/logo.png" alt="Clinical Flex" className="h-8 w-8 rounded" />
            <span className="font-semibold tracking-wide">Clinical - Flex</span>
          </Link>

          <nav className="hidden items-center gap-4 xl:flex">
            {navItems.slice(0, 8).map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className={`cf-nav-link ${isActive ? 'cf-nav-link-active' : ''}`}>
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs sm:block">
              <p className="font-semibold">Admin Portal</p>
              <p className="text-white/90">{user.Email}</p>
            </div>
            <img src="/resources/user-profile-icon.png" alt="User" className="h-8 w-8 rounded-full bg-white/80" />
            <button
              onClick={() => {
                localStorage.removeItem('currentUser')
                router.push('/login')
              }}
              className="rounded-md border border-white/80 px-3 py-2 text-xs font-semibold text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pb-1 pt-4">
        <h1 className="text-2xl font-semibold text-slate-900">{currentTitle}</h1>
        <Link href="/dashboard/admin/stats" className="rounded-md bg-[#8EC641] px-3 py-2 text-xs font-semibold text-white hover:bg-[#79ae35]">
          View Statistics
        </Link>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-2">
        <div className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive ? 'bg-[#0f644c] text-white' : 'bg-white text-slate-600 border border-slate-200'}`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 pb-10 pt-2">{children}</main>
    </div>
  )
}
