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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
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
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <Link href="/" className="flex items-center">
              <img
                src="/logo.png"
                alt="BaseGigs Logo"
                className="h-10 md:h-14 w-auto"
              />
              <span className="ml-3 text-xl md:text-2xl font-semibold text-secondary">
                BaseGigs
              </span>
            </Link>

            <div className="hidden md:flex space-x-8">
              <Link href="/browse-gigs" className="text-gray-700 hover:text-primary transition-colors">Browse Gigs</Link>
              <Link href="/find-talent" className="text-gray-700 hover:text-primary transition-colors">Find Talent</Link>
              <Link href="/pricing" className="text-gray-700 hover:text-primary transition-colors">Pricing</Link>
              <Link href="/how-it-works" className="text-gray-700 hover:text-primary transition-colors">How It Works</Link>
            </div>

            <div className="flex space-x-4">
              {user ? (
                <>
                  <Link href={getDashboardLink()} className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors">
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-gray-700 hover:text-primary transition-colors">Login</Link>
                  <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-light to-sage py-20">
        <div
          className="hidden md:block absolute -top-20 -right-20 w-96 h-96 bg-secondary"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%)' }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-block bg-white text-primary-dark px-4 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
            Now accepting new members
          </div>
          <h1 className="text-5xl font-bold text-secondary mb-6">
            The Professional Gig Marketplace
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
            Connect with skilled professionals for short-term gigs. Post opportunities, find talent, and manage contracts—all in one platform.
          </p>
          <div className="flex justify-center space-x-4">
            {user ? (
              <Link href={getDashboardLink()} className="px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors shadow-md">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors shadow-md">
                  Get Started Free
                </Link>
                <Link href="/how-it-works" className="px-8 py-3 bg-white text-secondary border-2 border-secondary rounded-lg text-lg font-semibold hover:bg-secondary hover:text-white transition-colors">
                  See How It Works
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white reveal opacity-0">
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
      <section className="py-20 bg-sage reveal opacity-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3 text-secondary">Find Talent</h3>
              <p className="text-gray-600">Browse verified gig seekers with detailed profiles and portfolios.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3 text-secondary">Post Gigs</h3>
              <p className="text-gray-600">Create detailed gig listings with AI-powered descriptions.</p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3 text-secondary">Secure Contracts</h3>
              <p className="text-gray-600">AI-generated contracts with digital signatures and email delivery.</p>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/how-it-works" className="text-primary font-semibold hover:underline">
              See the full step-by-step guide →
            </Link>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-white reveal opacity-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary mb-2">About BaseGigs</h2>
          <p className="text-xl text-gray-600 mb-6">Built for South Africa. Built for real people.</p>
          <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
            BaseGigs was built out of a simple observation — South Africa is full of talented, hardworking people who struggle to find short-term work, and clients who struggle to find reliable help fast. Whether it&apos;s a granny needing her lawn mowed, a family needing a mover, or a couple needing a photographer for their wedding, the process of finding the right person has always been word-of-mouth, unreliable, and often unsafe.
          </p>
          <Link href="/about" className="inline-block mt-6 text-primary font-semibold hover:underline">
            Learn more about us →
          </Link>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 bg-sage reveal opacity-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary mb-2">Simple, Transparent Pricing</h2>
            <div className="inline-flex items-center bg-primary-light rounded-full px-6 py-2 mt-2">
              <span className="text-primary-dark font-semibold text-sm">100% Free for Gig Seekers</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-secondary mb-1">Pay-Per-Gig</h3>
              <p className="text-gray-600 text-sm mb-4">Perfect for occasional hiring</p>
              <div className="text-3xl font-bold text-primary mb-1">R100<span className="text-sm text-gray-500 font-normal"> /per gig</span></div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border-2 border-primary relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">Most Popular</span>
              <h3 className="text-lg font-bold text-secondary mb-1">Starter</h3>
              <p className="text-gray-600 text-sm mb-4">Great for growing businesses</p>
              <div className="text-3xl font-bold text-primary mb-1">R300<span className="text-sm text-gray-500 font-normal"> /per month</span></div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-secondary mb-1">Professional</h3>
              <p className="text-gray-600 text-sm mb-4">For frequent hirers</p>
              <div className="text-3xl font-bold text-primary mb-1">R700<span className="text-sm text-gray-500 font-normal"> /per month</span></div>
            </div>
          </div>
          <div className="text-center mt-10">
            <Link href="/pricing" className="text-primary font-semibold hover:underline">
              View full pricing and features →
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Preview */}
      <section className="py-20 bg-white reveal opacity-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-secondary mb-3">Get in Touch</h2>
          <p className="text-gray-600 mb-8">Whether you have a question, a problem, or just want to share feedback — reach out. We respond within 24–48 hours.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-sage rounded-xl p-4">
              <div className="text-2xl mb-2">📧</div>
              <h3 className="font-semibold text-secondary text-sm">Email</h3>
              <p className="text-gray-600 text-sm">support@basegigs.co.za</p>
            </div>
            <div className="bg-sage rounded-xl p-4">
              <div className="text-2xl mb-2">🇿🇦</div>
              <h3 className="font-semibold text-secondary text-sm">Based In</h3>
              <p className="text-gray-600 text-sm">South Africa</p>
            </div>
            <div className="bg-sage rounded-xl p-4">
              <div className="text-2xl mb-2">⏱️</div>
              <h3 className="font-semibold text-secondary text-sm">Response Time</h3>
              <p className="text-gray-600 text-sm">Within 24–48 hours on weekdays</p>
            </div>
          </div>
          <Link href="/contact" className="inline-block mt-8 text-primary font-semibold hover:underline">
            Contact us →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-secondary text-white py-20 reveal opacity-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-200">Join BaseGigs today — free to sign up, free to browse.</p>
          <Link href="/signup" className="inline-block px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary-dark transition-colors shadow-md">
            Create Your Account
          </Link>
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
              <li><Link href="/browse-gigs" className="hover:text-primary transition-colors">Browse Gigs</Link></li>
              <li><Link href="/find-talent" className="hover:text-primary transition-colors">Find Talent</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Company</h4>
            <ul className="space-y-1">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-2">Legal</h4>
            <ul className="space-y-1">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
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
