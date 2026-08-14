'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<string | null>(null) // <-- added
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean>(false)
  const [loadingSubs, setLoadingSubs] = useState<boolean>(true)

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user) {
        // Fetch user type from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', data.user.id)
          .single()
        setUserType(profile?.user_type ?? null)

        // Query subscriptions table for active subscription(s) for this user
        const { data: subsData, error } = await supabase
          .from('subscriptions')
          .select('id, status, expires_at') // updated field from expiry_date to expires_at
          .eq('user_id', data.user.id)
          .in('status', ['active', 'trialing']) // adjust statuses as per your app
          .gte('expires_at', new Date().toISOString()) // active means not expired
          .limit(1)
          .maybeSingle()

        if (error) {
          console.error('Error checking subscription:', error)
          setHasActiveSubscription(false)
        } else {
          setHasActiveSubscription(!!subsData)
        }
      }
      setLoadingSubs(false)
    }
    fetchUser()
  }, [])

  const plans = [
    {
      name: 'Pay-Per-Gig',
      price: 'R100',
      period: 'per gig',
      description: 'Perfect for occasional hiring',
      features: [
        'Post 1 gig for 30 days',
        'Unlimited applications',
        'Chat with applicants',
        'Contract generation',
        'Basic support'
      ],
      cta: 'Post a Gig',
      href: 'https://pay.yoco.com/r/2DGxWY',
      popular: false
    },
    {
      name: 'Starter',
      price: 'R300',
      period: 'per month',
      description: 'Great for growing businesses',
      features: [
        'Post up to 5 gigs/month',
        'Unlimited applications',
        'Chat with applicants',
        'Contract generation',
        'Standard support',
        'Basic analytics'
      ],
      cta: 'Get Started',
      href: 'https://pay.yoco.com/r/mOE30j',
      popular: true
    },
    {
      name: 'Professional',
      price: 'R700',
      period: 'per month',
      description: 'For frequent hirers',
      features: [
        'Unlimited gig posts',
        'Featured listings',
        'Priority support',
        'Advanced analytics',
        'Chat with applicants',
        'Contract generation',
        'Everything in Starter'
      ],
      cta: 'Go Pro',
      href: 'https://pay.yoco.com/r/7v1Y3o',
      popular: false
    }
  ]

  const faqs = [
    {
      q: 'Is there a fee for gig seekers?',
      a: 'No! BaseGigs is 100% free for gig seekers. Browse, apply, chat, and sign contracts at no cost.'
    },
    {
      q: 'How long does a gig posting stay active?',
      a: 'Each gig post stays active for 30 days. For Pay-Per-Gig, you pay R100 per post. With subscriptions, you can post multiple gigs that each stay active for 30 days.'
    },
    {
      q: 'Can I cancel my subscription anytime?',
      a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
    },
    {
      q: 'What happens if I exceed 5 gigs on the Starter plan?',
      a: 'You can either wait until next month, upgrade to Professional for unlimited posts, or pay R100 per additional gig post.'
    },
    {
      q: 'Do you take a commission on contracts?',
      a: 'No! We don\'t take any commission from your contracts. You only pay for posting gigs - everything else is free.'
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit/debit cards, EFT, and SnapScan. All payments are processed securely.'
    }
  ]

  function handlePaymentClick(planHref: string) {
    if (!user) {
      // Not logged in → redirect to login
      window.location.href = '/login'
      return
    }

    if (loadingSubs) {
      alert('Checking subscription status, please wait...')
      return
    }

    if (hasActiveSubscription) {
      alert('You currently have an active subscription plan. Please manage your existing plan before purchasing another.')
      return
    }

    // If no active subscription, open Yoco link in new tab
    window.open(planHref, '_blank', 'noopener,noreferrer')
  }

  // Helper to build correct dashboard link based on userType
  function dashboardLink() {
    if (!userType) return '/dashboard'
    if (userType === 'client') return '/dashboard/client'
    if (userType === 'both') return '/dashboard/both'
    if (userType === 'gig-seeker') return '/dashboard/gig-seeker'
    return '/dashboard'
  }

  return (
    <div className="min-h-screen bg-sage">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a href="/" className="flex items-center">
              <img src="/logo.png" alt="BaseGigs Logo" className="h-9 w-auto" />
              <span className="ml-2 text-xl font-semibold text-secondary">BaseGigs</span>
            </a>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <a href={dashboardLink()} className="text-gray-700 hover:text-primary font-medium transition-colors">Dashboard</a>
                  <a href="/logout" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors">Logout</a>
                </>
              ) : (
                <>
                  <a href="/login" className="text-gray-700 hover:text-primary font-medium transition-colors">Login</a>
                  <a href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors">Sign Up</a>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-b from-primary-light to-sage">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-secondary mb-4">Simple, Transparent Pricing</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your hiring needs. No hidden fees, cancel anytime.</p>
            <div className="mt-6 inline-flex items-center bg-white rounded-full px-6 py-3 shadow-sm">
              <span className="text-primary-dark font-semibold">✨ 100% Free for Gig Seekers</span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? 'shadow-xl ring-2 ring-primary'
                    : 'shadow-sm border border-gray-100'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-secondary mb-2">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center mb-2">
                    <span className="text-5xl font-bold text-primary">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Replace anchor with button and handle click */}
                <button
                  onClick={() => handlePaymentClick(plan.href)}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all text-center ${
                    plan.popular
                      ? 'bg-primary text-white hover:bg-primary-dark shadow-md'
                      : 'bg-primary-light text-primary-dark hover:bg-primary hover:text-white'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Bank Transfer Info */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-sm mb-16">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Alternative Payment Method</h2>
            <p className="text-gray-700 mb-2">Prefer not to use card? You can pay via bank transfer with the details below. Please use your email address as the reference number when making the payment.</p>
            <ul className="text-gray-700 space-y-1">
              <li><strong>Bank:</strong> Standard Bank</li>
              <li><strong>Account Holder:</strong> Miss TS Thwala</li>
              <li><strong>Account Number:</strong> 10 057 317 842</li>
              <li><strong>Account Type:</strong> Savings</li>
              <li><strong>Branch Code:</strong> 053252</li>
            </ul>
          </div>

          {/* Subscription & Payment Info */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-6 shadow-sm mb-16">
            <h2 className="text-2xl font-semibold text-secondary mb-4">Subscription & Payment Info</h2>
            <p className="text-gray-700 text-base leading-relaxed">
              BaseGigs does not use automatic recurring payments. To maintain an active subscription, you need to manually renew your plan by making a payment each time your gig post limit is reached or your subscription period ends (typically 30 days).
            </p>
            <p className="text-gray-700 text-base leading-relaxed mt-4">
              If you wish to cancel your subscription, simply stop making payments. Your current subscription will remain active until its expiration, after which no further charges will be applied. There are no automatic deductions or renewals.
            </p>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-secondary text-center mb-8">Pricing FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-sage rounded-xl overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-primary-light transition-colors"
                  >
                    <span className="font-semibold text-secondary">{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-primary transition-transform ${
                        openFaq === idx ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === idx && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-700">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-secondary rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to find your perfect gig worker?</h2>
            <p className="text-gray-200 mb-8 max-w-2xl mx-auto">Join hundreds of South African businesses hiring talented gig seekers on BaseGigs.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a href="/signup" className="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-md">
                Get Started Now
              </a>
              <a href="/find-talent" className="px-8 py-4 bg-white text-secondary rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Browse Talent
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
