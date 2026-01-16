'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single()
      setUserType(profile?.user_type || null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUserType(null)
  }

  const getDashboardLink = () => {
    if (userType === 'client') return '/dashboard/client'
    if (userType === 'gig_seeker') return '/dashboard/gig-seeker'
    if (userType === 'both') return '/dashboard/both'
    return '/dashboard/client'
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="BaseGigs logo"
                width={36}
                height={36}
                className="mr-2"
                priority
              />
              <span className="text-xl font-semibold">BaseGigs</span>
            </Link>

            <div className="hidden md:flex space-x-8">
              <Link href="/browse-gigs" className="text-gray-700 hover:text-primary">Browse Gigs</Link>
              <Link href="/find-talent" className="text-gray-700 hover:text-primary">Find Talent</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary">Pricing</Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-primary">How It Works</Link>
            </div>

            <div className="flex space-x-4">
              {user ? (
                <>
                  <Link href={getDashboardLink()} className="px-4 py-2 text-gray-700 hover:text-primary font-medium">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-primary">Login</Link>
                  <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* rest of the file unchanged */}
    </div>
  )
}
