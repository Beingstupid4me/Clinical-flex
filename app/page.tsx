'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in from localStorage-backed session.
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      const user = JSON.parse(storedUser)
      setIsLoggedIn(true)
      setUserRole(user.Role)
    }
  }, [])

  const getDashboardLink = () => {
    switch (userRole) {
      case 'CUSTOMER':
        return '/dashboard/customer'
      case 'DOCTOR':
        return '/dashboard/doctor'
      case 'SUPPLIER':
        return '/dashboard/supplier'
      case 'ADMIN':
        return '/dashboard/admin'
      default:
        return '/login'
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="cf-topbar">
        <div className="cf-topbar-inner">
          <div className="flex items-center gap-3">
            <img src="/resources/logo.png" alt="Clinical Flex" className="h-8 w-8 rounded" />
            <p className="text-lg font-semibold">Clinical - Flex</p>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link href="/" className="cf-nav-link cf-nav-link-active">Overview</Link>
            <a href="#workflows" className="cf-nav-link">Workflows</a>
            <a href="#features" className="cf-nav-link">Features</a>
          </nav>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href={getDashboardLink()} className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#0f644c]">
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    localStorage.removeItem('currentUser')
                    setIsLoggedIn(false)
                    location.reload()
                  }}
                  className="rounded-md border border-white/70 px-3 py-2 text-sm font-semibold text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-md border border-white/80 px-3 py-2 text-sm font-semibold text-white">Login</Link>
                <Link href="/register" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#0f644c]">Register</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="cf-hero" style={{ backgroundImage: "url('/resources/back_main.jpeg')" }}>
        <div className="cf-overlay" />
        <div className="cf-hero-content">
          <h1 className="max-w-2xl text-5xl font-semibold tracking-wide md:text-7xl">Clinical - Flex</h1>
          <p className="mt-3 max-w-xl text-2xl text-white/90">Your one stop shop for all your health needs.</p>
          <div className="cf-search-card">
            <p className="text-sm font-semibold text-rose-500">Find your meds quick</p>
            <p className="mt-1 text-sm text-slate-600">See delivery and collection options</p>
            <div className="mt-4 flex gap-2">
              <input
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#8EC641]"
                placeholder="Enter Drug Name"
              />
              <Link href={isLoggedIn ? '/dashboard/customer/products' : '/login'} className="rounded-md bg-[#8EC641] px-4 py-2 text-sm font-semibold text-white">
                Check
              </Link>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Hello, sign in for the best experience. New to Freshcart?{' '}
              <Link href="/register" className="font-semibold text-[#0f644c]">Register</Link>
            </p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="cf-section-title">What's on your mind?</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: 'Customer Flow', desc: 'Search products, place order, track status' },
            { title: 'Doctor Flow', desc: 'Create prescriptions with expiry checks' },
            { title: 'Supplier Flow', desc: 'Manage inventory and batch entries' },
            { title: 'Admin View', desc: 'Review all records across DB tables' },
          ].map((card) => (
            <article key={card.title} className="cf-card">
              <p className="cf-chip">Operational Workflow</p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">{card.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{card.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="workflows" className="mx-auto max-w-6xl px-4 pb-12">
        <div className="cf-card flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Built for end-to-end pharmacy operations</h3>
            <p className="mt-1 text-sm text-slate-600">All critical modules are active across customer, doctor, supplier, and admin personas.</p>
          </div>
          <Link href={isLoggedIn ? getDashboardLink() : '/login'} className="rounded-md bg-[#0f644c] px-4 py-2 text-center text-sm font-semibold text-white">
            {isLoggedIn ? 'Open Dashboard' : 'Start with Login'}
          </Link>
        </div>
      </section>
    </div>
  )
}
