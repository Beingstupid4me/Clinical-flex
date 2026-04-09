import Link from 'next/link'

export default function SupplierPlaceholderPage({ params }: { params: { slug: string[] } }) {
  const section = params.slug.join(' / ')

  return (
    <div className="cf-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supplier Portal</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The route <span className="font-medium text-slate-800">{section}</span> is not part of the supplier workflow.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/dashboard/supplier/inventory" className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-[#8EC641]">
          Inventory Status
        </Link>
        <Link href="/dashboard/supplier/add-batch" className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-[#8EC641]">
          Receive New Batch
        </Link>
        <Link href="/dashboard/supplier/batches" className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-[#8EC641]">
          My Batches
        </Link>
        <Link href="/dashboard/supplier/transactions" className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-[#8EC641]">
          Transactions
        </Link>
      </div>

      <Link href="/dashboard/supplier" className="mt-5 inline-block rounded-md bg-[#0f644c] px-4 py-2 text-sm font-semibold text-white">
        Back To Supplier Dashboard
      </Link>
    </div>
  )
}
