import type { Metadata } from 'next'
import './globals.css'
import LegacyFooter from './components/legacy-footer'

export const metadata: Metadata = {
  title: 'Pharmacy Management System',
  description: 'Clinical Flex - Pharmacy inventory, prescriptions, and order operations platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
        <main className="flex-1">{children}</main>
        <LegacyFooter />
      </body>
    </html>
  )
}
