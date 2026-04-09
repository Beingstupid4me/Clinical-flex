import Link from 'next/link'

export default function DoctorPlaceholderPage({ params }: { params: { slug: string[] } }) {
  const section = params.slug.join(' / ')

  return (
    <div className="cf-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Doctor Portal</p>
      <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The route <span className="font-medium text-slate-800">{section}</span> is not part of the doctor workflow.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link href="/dashboard/doctor/patients" className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-[#8EC641]">
          Search Patients
        </Link>
        <Link href="/dashboard/doctor/prescriptions/new" className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-[#8EC641]">
          Create Prescription
        </Link>
        <Link href="/dashboard/doctor/prescriptions" className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-[#8EC641]">
          My Prescriptions
        </Link>
        <Link href="/dashboard/doctor/patient-history" className="rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700 hover:border-[#8EC641]">
          Patient History
        </Link>
      </div>

      <Link href="/dashboard/doctor" className="mt-5 inline-block rounded-md bg-[#0f644c] px-4 py-2 text-sm font-semibold text-white">
        Back To Doctor Dashboard
      </Link>
    </div>
  )
}
