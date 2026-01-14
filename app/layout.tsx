'use client'

import './globals.css'
import type { Metadata } from 'next'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export const metadata: Metadata = {
  title: 'BaseGigs - Professional Gig Marketplace',
  description: 'Connect with skilled professionals for short-term gigs in South Africa',
}

function Header() {
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      listener?.unsubscribe()
    }
  }, [])

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <Link href="/" className="text-2xl font-bold text-primary flex items-center">
        <span>B</span><span className="ml-1">BaseGigs</span>
      </Link>
      <nav className="space-x-4">
        {session ? (
          <>
            <Link href="/dashboard/client" className="text-gray-700 hover:text-primary">Dashboard</Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                window.location.reload()
              }}
              className="text-gray-700 hover:text-primary"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-700 hover:text-primary">Login</Link>
            <Link href="/signup" className="text-gray-700 hover:text-primary">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
