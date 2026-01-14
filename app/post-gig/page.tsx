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

    // 🔑 Fetch ACTIVE subscription only
    const { data: activeSub } = await supabase
      .from('active_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // ❌ No subscription → pricing
    if (!activeSub) {
      router.push('/pricing')
      return
    }

    // ❌ Out of gig posts (except professional)
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

      // ⬇️ Decrement gig posts (NOT professional)
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
          <Link href="/dashboard/client">← Back</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6 bg-white mt-6 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-6">Post a Gig</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="input" placeholder="Gig name" value={gigName} onChange={e => setGigName(e.target.value)} />
          <select className="input" value={gigType} onChange={e => setGigType(e.target.value)}>
            <option value="">Select gig type</option>
            {GIG_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>

          <input className="input" placeholder="City" value={city} onChange={e => setCity(e.target.value)} />

          <select className="input" value={province} onChange={e => setProvince(e.target.value)}>
            <option value="">Select province</option>
            {PROVINCES.map(p => <option key={p}>{p}</option>)}
          </select>

          <textarea className="input" placeholder="Explanation" value={explanation} onChange={e => setExplanation(e.target.value)} />
          <textarea className="input" placeholder="Requirements" value={requirements} onChange={e => setRequirements(e.target.value)} />
          <input className="input" placeholder="Skills (comma separated)" value={skills} onChange={e => setSkills(e.target.value)} />
          <input type="number" className="input" placeholder="Payment (ZAR)" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} />
          <input type="date" className="input" value={deadline} onChange={e => setDeadline(e.target.value)} />

          <button disabled={loading} className="w-full bg-primary text-white py-3 rounded">
            {loading ? 'Posting…' : 'Post Gig'}
          </button>
        </form>
      </div>
    </div>
  )
}
