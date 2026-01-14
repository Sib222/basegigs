'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PLANS = [
  {
    key: 'pay_per_gig',
    name: 'Pay Per Gig',
    price: 'Free',
    gigsIncluded: 'No limit',
    description: 'Pay for each gig you post separately.',
  },
  {
    key: 'starter',
    name: 'Starter',
    price: 'R100 / month',
    gigsIncluded: '5 gigs',
    description: 'Best for occasional posters.',
  },
  {
    key: 'professional',
    name: 'Professional',
    price: 'R300 / month',
    gigsIncluded: 'Unlimited gigs',
    description: 'Perfect for frequent posters.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionUser = supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    // Listen to auth state changes to update menu immediately
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <>
      {/* Navigation / Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-primary">B</span>
              <span className="text-2xl font-semibold">BaseGigs</span>
            </Link>
            <div className="flex items-center space-x-4">
              {!loading && user ? (
                <>
                  <Link
                    href="/dashboard/client"
                    className="text-gray-700 hover:text-primary font-medium"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-primary font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="text-primary font-semibold hover:text-green-600"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Pricing Content */}
      <main className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">
          Choose Your Plan
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white flex flex-col"
            >
              <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
              <p className="text-3xl font-bold mb-4">{plan.price}</p>
              <p className="mb-4">{plan.description}</p>
              <p className="mb-6 font-medium">Includes: {plan.gigsIncluded}</p>

              <Link
                href="/login"
                className="mt-auto inline-block w-full text-center bg-primary text-white py-2 rounded hover:bg-green-600"
              >
                Select Plan
              </Link>
            </div>
          ))}
        </div>

        {/* Bank Transfer Info Section */}
        <section className="mt-16 bg-white border border-gray-200 rounded-lg p-6 shadow-sm max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4">
            Alternative Payment Method
          </h3>
          <p className="mb-4 text-gray-700">
            Prefer not to pay online? You can make a bank transfer using the details below.
            Please use your registered email address as the payment reference to ensure your subscription is correctly linked.
          </p>

          <div className="space-y-2 text-gray-800 font-medium">
            <div><span className="font-semibold">Bank:</span> Standard Bank</div>
            <div><span className="font-semibold">Account Holder:</span> Miss TS Thwala</div>
            <div><span className="font-semibold">Account Number:</span> 10 057 317 842</div>
            <div><span className="font-semibold">Account Type:</span> Savings</div>
            <div><span className="font-semibold">Branch Code:</span> 053252</div>
          </div>
        </section>
      </main>
    </>
  )
}
