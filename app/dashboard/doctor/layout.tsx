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
  { href: '/dashboard/doctor', label: 'Overview' },
  { href: '/dashboard/doctor/patients', label: 'Patients' },
  { href: '/dashboard/doctor/prescriptions/new', label: 'Create Rx' },
  { href: '/dashboard/doctor/prescriptions', label: 'My Prescriptions' },
  { href: '/dashboard/doctor/patient-history', label: 'Patient History' },
  { href: '/dashboard/doctor/profile', label: 'Profile' },
]

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
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
    if (parsed.Role !== 'DOCTOR') {
      router.replace('/')
      return
    }

    setUser(parsed)
    setLoading(false)
  }, [router])

  const currentTitle = useMemo(() => {
    const found = navItems.find((item) => pathname === item.href)
    return found?.label ?? 'Doctor'
  }, [pathname])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-600">Loading doctor workspace...</div>
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

          <nav className="hidden items-center gap-4 lg:flex">
            {navItems.map((item) => {
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
              <p className="font-semibold">Doctor Portal</p>
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

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pb-1 pt-4">
        <h1 className="text-2xl font-semibold text-slate-900">{currentTitle}</h1>
        <Link href="/dashboard/doctor/prescriptions/new" className="rounded-md bg-[#8EC641] px-3 py-2 text-xs font-semibold text-white hover:bg-[#79ae35]">
          Create Prescription
        </Link>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-10 pt-2">{children}</main>
    </div>
  )
}
