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
  'Photography & Media',
]

const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape',
]

export default function PostGigPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [clientName, setClientName] = useState('')
  const [subscription, setSubscription] = useState<any>(null)

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

    if (!profile || (profile.user_type !== 'client' && profile.user_type !== 'both')) {
      router.push('/dashboard/gig-seeker')
      return
    }

    const { data: activeSub } = await supabase
      .from('active_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!activeSub) {
      router.push('/pricing')
      return
    }

    if (
      activeSub.plan_name !== 'professional' &&
      activeSub.gig_posts_left <= 0
    ) {
      router.push('/pricing')
      return
    }

    setCurrentUser(user)
    setClientName(profile.full_name)
    setSubscription(activeSub)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !gigName ||
      !gigType ||
      !city ||
      !province ||
      !explanation ||
      !requirements ||
      !paymentAmount
    ) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const skillsArray = skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      const { error: insertError } = await supabase
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
          payment_amount: Number(paymentAmount),
          payment_type: paymentType,
          skills: skillsArray,
          deadline: deadline || null,
          status: 'open',
          applicant_count: 0,
        })

      if (insertError) throw insertError

      if (subscription.plan_name !== 'professional') {
        await supabase
          .from('subscriptions')
          .update({
            gig_posts_left: subscription.gig_posts_left - 1,
          })
          .eq('user_id', currentUser.id)
      }

      alert('Gig posted successfully!')
      router.push('/dashboard/client')
    } catch (err: any) {
      alert(err.message)
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
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/dashboard/client" className="font-bold text-primary text-xl">
            BaseGigs
          </Link>
          <Link href="/dashboard/client" className="text-gray-700 hover:underline">
            ← Back
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto p-6 bg-white mt-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Post a Gig</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="gigName" className="block mb-1 font-semibold">Gig Name *</label>
            <input
              id="gigName"
              type="text"
              value={gigName}
              onChange={e => setGigName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter gig name"
              required
            />
          </div>

          <div>
            <label htmlFor="gigType" className="block mb-1 font-semibold">Gig Type *</label>
            <select
              id="gigType"
              value={gigType}
              onChange={e => setGigType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select gig type</option>
              {GIG_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block mb-1 font-semibold">City *</label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter city"
              required
            />
          </div>

          <div>
            <label htmlFor="province" className="block mb-1 font-semibold">Province *</label>
            <select
              id="province"
              value={province}
              onChange={e => setProvince(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Select province</option>
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="explanation" className="block mb-1 font-semibold">Explanation *</label>
            <textarea
              id="explanation"
              value={explanation}
              onChange={e => setExplanation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Describe the gig"
              required
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block mb-1 font-semibold">Requirements *</label>
            <textarea
              id="requirements"
              value={requirements}
              onChange={e => setRequirements(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="List requirements"
              required
            />
          </div>

          <div>
            <label htmlFor="skills" className="block mb-1 font-semibold">Skills (comma separated)</label>
            <input
              id="skills"
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. photography, editing"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="paymentAmount" className="block mb-1 font-semibold">Payment (ZAR) *</label>
              <input
                id="paymentAmount"
                type="number"
                min="0"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Amount in ZAR"
                required
              />
            </div>

            <div>
              <label htmlFor="paymentType" className="block mb-1 font-semibold">Payment Type</label>
              <select
                id="paymentType"
                value={paymentType}
                onChange={e => setPaymentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Fixed">Fixed</option>
                <option value="Hourly">Hourly</option>
                <option value="Negotiable">Negotiable</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="deadline" className="block mb-1 font-semibold">Deadline</label>
            <input
              id="deadline"
              type="date"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-3 rounded hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? 'Posting…' : 'Post Gig'}
          </button>
        </form>
      </main>
    </div>
  )
}
