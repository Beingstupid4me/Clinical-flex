import Link from 'next/link'

export default function CustomerDashboard() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative min-h-[240px] p-6 md:p-8" style={{ backgroundImage: "url('/resources/medicine_cart_1.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative z-10 max-w-2xl text-white">
            <p className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">Customer Workspace</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">Your one stop shop for health needs</h2>
            <p className="mt-2 text-sm text-white/90">Quickly browse products, checkout, and track all prescriptions and orders.</p>
            <Link href="/dashboard/customer/products" className="mt-5 inline-block rounded-md bg-[#8EC641] px-4 py-2 text-sm font-semibold text-white hover:bg-[#79ae35]">
              Start Browsing Products
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { href: '/dashboard/customer/products', title: 'Browse Products', desc: 'Search and view available medications' },
          { href: '/dashboard/customer/orders', title: 'My Orders', desc: 'Track current and past orders' },
          { href: '/dashboard/customer/prescriptions', title: 'My Prescriptions', desc: 'View active and expired prescriptions' },
          { href: '/dashboard/customer/checkout', title: 'Checkout', desc: 'Confirm cart and place new orders' },
          { href: '/dashboard/customer/payments', title: 'Payments', desc: 'See payment history and status' },
          { href: '/dashboard/customer/profile', title: 'My Profile', desc: 'Update account details and address' },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="cf-card transition hover:shadow-md">
            <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{item.desc}</p>
          </Link>
        ))}
      </section>

      <section className="cf-card">
        <h3 className="text-lg font-semibold text-slate-900">Getting Started</h3>
        <div className="mt-3 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
          <p>1. Browse the products catalog and check available stock.</p>
          <p>2. Add medicines to cart and continue to checkout.</p>
          <p>3. If product is prescription-only, verify active prescription first.</p>
          <p>4. Track order delivery and payment status from this dashboard.</p>
        </div>
      </section>
    </div>
  )
}
