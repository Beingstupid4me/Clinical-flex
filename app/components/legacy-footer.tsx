import Link from 'next/link'

const companyLinks = [
  { label: 'About', href: '/' },
  { label: 'Careers', href: '/' },
  { label: 'Blog', href: '/' },
  { label: 'Contact', href: '/' },
]

const supportLinks = [
  { label: 'Help Center', href: '/' },
  { label: 'Privacy Policy', href: '/' },
  { label: 'Terms of Service', href: '/' },
  { label: 'FAQs', href: '/' },
]

export default function LegacyFooter() {
  return (
    <footer className="cf-footer-wrap mt-14">
      <section className="cf-footer-news">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid gap-6 md:grid-cols-[1.7fr,1fr] md:items-center">
            <div>
              <h3 className="text-2xl font-semibold text-white">Let's talk about your health goals</h3>
              <p className="mt-2 text-sm text-white/85">
                Subscribe for medicine updates, wellness resources, and platform announcements.
              </p>
              <form className="mt-4 flex max-w-lg flex-col gap-2 sm:flex-row" action="#" method="post">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full rounded-md border border-white/30 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
                />
                <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Subscribe</button>
              </form>
            </div>

            <div className="rounded-lg border border-white/20 bg-white/10 p-4 text-sm text-white/95">
              <p>Call: +92 300 1234567</p>
              <p className="mt-1">Hours: 9am to 5pm (Sunday Closed)</p>
              <p className="mt-1">Email: support@clinicalflex.pk</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cf-footer-main">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <img src="/resources/logo.png" alt="Clinical Flex" className="h-9 w-9 rounded" />
                <span className="text-lg font-semibold text-white">Clinical - Flex</span>
              </div>
              <p className="text-sm text-slate-300">153 Williamson Plaza, Maggieberg</p>
              <p className="text-sm text-slate-300">+1 (062) 109-9222</p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Company</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Support</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">Platform</h4>
              <p className="text-sm text-slate-300">
                Pharmacy inventory, prescriptions, supplier management, and order workflows connected to MySQL.
              </p>
              <div className="mt-4 flex gap-2">
                <span className="cf-chip bg-white/10 text-white">DB Connected</span>
                <span className="cf-chip bg-white/10 text-white">Enterprise Ready</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-4 text-xs text-slate-400">
            <p>© {new Date().getFullYear()} Clinical - Flex. All rights reserved.</p>
          </div>
        </div>
      </section>
    </footer>
  )
}
