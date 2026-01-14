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

    // Check subscription plan and gigs left
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_name, gig_posts_left, expires_at')
      .eq('user_id', user.id)
      .single()

    if (!subscription || subscription.gig_posts_left === 0 || new Date(subscription.expires_at) < new Date()) {
      // Redirect to pricing page if no valid subscription or no gigs left or expired
      router.push('/pricing')
      return
    }

    setCurrentUser(user)
    setClientName(profile.full_name)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!gigName || !gigType || !city || !province || !explanation || !requirements || !paymentAmount) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(s => true)

      const { error } = await supabase
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

      if (error) throw error

      // Decrease gigs_left by 1 for this user in subscriptions
      const { error: updateError } = await supabase
        .from('subscriptions')
        .update({ gig_posts_left: (subscription?.gig_posts_left || 1) - 1 })
        .eq('user_id', currentUser.id)

      if (updateError) throw updateError

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

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tips for posting a great gig</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Be clear and specific about what you need</li>
            <li>• List all required skills and qualifications</li>
            <li>• Set a fair payment amount</li>
            <li>• Include a realistic deadline</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
