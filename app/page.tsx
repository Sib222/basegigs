'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

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
          {/* BIGGER NAVBAR */}
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* LOGO */}
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="BaseGigs Logo"
                className="h-10 md:h-14 w-auto"
              />
              <span className="ml-3 text-xl md:text-2xl font-semibold">
                BaseGigs
              </span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex space-x-8">
              <Link href="/browse-gigs" className="text-gray-700 hover:text-primary">Browse Gigs</Link>
              <Link href="/find-talent" className="text-gray-700 hover:text-primary">Find Talent</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary">Pricing</Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-primary">How It Works</Link>
            </div>

            {/* Auth */}
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
                  <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-green-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            Now accepting new members
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            The Professional Gig Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with skilled professionals for short-term gigs. Post opportunities, find talent, and manage contracts—all in one platform.
          </p>
          <div className="flex justify-center space-x-4">
            {user ? (
              <Link href={getDashboardLink()} className="px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-green-600">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-green-600">
                  Get Started Free
                </Link>
                <Link href="/how-it-works" className="px-8 py-3 bg-white text-primary border-2 border-primary rounded-lg text-lg font-semibold hover:bg-green-50">
                  See How It Works
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Real Gigs</div>
              <div className="text-gray-600">Posted by real people</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Real People</div>
              <div className="text-gray-600">Verified gig seekers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">Real Opportunities</div>
              <div className="text-gray-600">Local work that matters</div>
            </div>
          </div>
        </div>
      </section>

      {/* Three-Step Value */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3">Find Talent</h3>
              <p className="text-gray-600">Browse verified gig seekers with detailed profiles and portfolios.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3">Post Gigs</h3>
              <p className="text-gray-600">Create detailed gig listings with AI-powered descriptions.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3">Secure Contracts</h3>
              <p className="text-gray-600">AI-generated contracts with digital signatures and email delivery.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-xl font-bold mb-2">BaseGigs</h3>
            <p className="text-gray-400">
              Connecting clients with talented gig seekers for short-term opportunities.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Platform</h4>
            <ul className="space-y-1">
              <li><Link href="/browse-gigs">Browse Gigs</Link></li>
              <li><Link href="/find-talent">Find Talent</Link></li>
              <li><Link href="/how-it-works">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Company</h4>
            <ul className="space-y-1">
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Legal</h4>
            <ul className="space-y-1">
              <li><Link href="/privacy">Privacy Policy</Link></li>
              <li><Link href="/terms">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="text-center text-gray-500 mt-8">
          © 2025 BaseGigs. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
