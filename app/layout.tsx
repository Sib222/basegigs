import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BaseGigs - Professional Gig Marketplace',
  description: 'Connect with skilled professionals for short-term gigs in South Africa',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
