'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const GIG_TYPES = [
  'Creative & Design Services',
  'Media & Production',
  'Live Events & Entertainment',
  'Food & Culinary Services',
  'Transportation & Logistics',
  'Home & Maintenance Services',
  'Digital & Technology Services',
  'Education & Instruction',
  'Health, Wellness & Personal Care',
  'Business & Administrative Support',
  'Construction & Building Trades',
  'Carpentry, Woodcutting & Timber Work',
  'Agriculture, Gardening & Land Care',
  'Home Improvements & Renovations',
  'Security & Access Control Services',
  'Domestic & Household Support',
  'Transport, Moving & Hauling',
  'Mechanical & Technical Repairs',
  'Informal Trade & Skilled Labor',
  'Rural & Community Services',
  'Photography & Media'
]

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
]

export default function PostGigPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [clientName, setClientName] = useState('')

  const [gigName, setGigName] = useState('')
  const [gigType, setGigType] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [explanation, setExplanation] = useState('')
  const [requirements, setRequirements] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentType, setPaymentType] = useState('Fixed')
  const [skills, setSkills] = useState('')
  const [deadline, setDeadline] = useState('')

  const [subscription, setSubscription] = useState<any>(null)
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type, full_name')
      .eq('user_id', user.id)
      .single()

    if (profile?.user_type !== 'client' && profile?.user_type !== 'both') {
      alert('Only clients can post gigs')
      router.push('/dashboard/gig-seeker')
      return
    }

    setCurrentUser(user)
    setClientName(profile.full_name)

    // Fetch subscription on load
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setSubscription(sub)
  }

  const isSubscriptionActive = () => {
    if (!subscription) return false
    if (!subscription.expires_at) return false
    if (subscription.gig_posts_left <= 0) return false

    const now = new Date()
    const expires = new Date(subscription.expires_at)
    return expires > now
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gigName || !gigType || !city || !province || !explanation || !requirements || !paymentAmount) {
      alert('Please fill in all required fields')
      return
    }

    if (!isSubscriptionActive()) {
      setShowPaywall(true)
      return
    }

    setLoading(true)

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s)

      const { error: gigError } = await supabase
        .from('gigs')
        .insert({
          client_id: currentUser.id,
          client_name: clientName,
          gig_name: gigName,
          gig_type: gigType,
          city,
          province,
          explanation,
          requirements,
          payment_amount: parseInt(paymentAmount),
          payment_type: paymentType,
          skills: skillsArray,
          deadline: deadline || null,
          status: 'open',
          applicant_count: 0
        })

      if (gigError) throw gigError

      // Decrement gig_posts_left
      const { error: decError } = await supabase
        .from('subscriptions')
        .update({ gig_posts_left: subscription.gig_posts_left - 1 })
        .eq('user_id', currentUser.id)

      if (decError) {
        console.warn('Failed to decrement gig posts left:', decError)
      } else {
        // Update local state for gig_posts_left decrement
        setSubscription((prev: any) => ({
          ...prev,
          gig_posts_left: prev.gig_posts_left - 1,
        }))
      }

      alert('Gig posted successfully! Gig seekers can now apply.')
      router.push('/dashboard/client')
    } catch (error: any) {
      console.error('Error posting gig:', error)
      alert('Failed to post gig: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard/client" className="flex items-center">
              <span className="text-2xl font-bold text-primary">B</span>
              <span className="ml-2 text-xl font-semibold">BaseGigs</span>
            </Link>
            <Link href="/dashboard/client" className="text-gray-700 hover:text-primary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Post a Gig</h1>
          <p className="text-gray-600 mb-8">Fill in the details to create your gig listing</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gig Name *
              </label>
              <input
                type="text"
                value={gigName}
                onChange={(e) => setGigName(e.target.value)}
                placeholder="e.g., Wedding Photographer Needed"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gig Type *
              </label>
              <select
                value={gigType}
                onChange={(e) => setGigType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select gig type</option>
                {GIG_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Johannesburg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Province *
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Select province</option>
                  {PROVINCES.map(prov => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explanation *
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={4}
                placeholder="Describe what you need..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements *
              </label>
              <textarea
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                rows={3}
                placeholder="What skills or qualifications are needed?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills (comma separated)
              </label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Photography, Photo Editing, Event Coverage"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              />
              <p className="text-sm text-gray-500 mt-1">Separate skills with commas</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (ZAR) *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="e.g., 5000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type *
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="Fixed">Fixed</option>
                  <option value="Open to Offers">Open to Offers</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/dashboard/client')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
              >
                {loading ? 'Posting...' : 'Post Gig'}
              </button>
            </div>
          </form>
        </div>

        {/* Paywall Modal */}
        {showPaywall && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md p-6 mx-4 text-center">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">Upgrade Required</h2>
              <p className="mb-6 text-gray-700">
                You have no active subscription or you have used all your gig posts for this month.
                Please upgrade your plan to post more gigs.
              </p>
              <button
                onClick={() => {
                  setShowPaywall(false)
                  router.push('/dashboard/client/plans')
                }}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 font-semibold"
              >
                Upgrade Plan
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="mt-4 text-gray-600 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
