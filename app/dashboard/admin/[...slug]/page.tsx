import Link from 'next/link'

export default function AdminPlaceholderPage({ params }: { params: { slug: string[] } }) {
  const section = params.slug.join(' / ')

  const links = [
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

  return (
    <div className="cf-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Admin Portal</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The route <span className="font-medium text-slate-800">{section}</span> is not configured yet. Use one of the active admin pages below.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-[#8EC641]">
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
