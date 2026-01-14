'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function PostGigPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [canPost, setCanPost] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)

  const [gigName, setGigName] = useState('')
  const [explanation, setExplanation] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')

  /* ----------------------------------------------------
     CHECK SUBSCRIPTION
  ---------------------------------------------------- */
  useEffect(() => {
    const checkSubscription = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        setCanPost(false)
        setLoading(false)
        return
      }

      const now = new Date()
      const expiresAt = new Date(data.expires_at)

      if (expiresAt < now) {
        setCanPost(false)
        setSubscription(data)
        setLoading(false)
        return
      }

      // Professional = unlimited
      if (data.plan_name === 'professional') {
        setCanPost(true)
      } else {
        setCanPost(data.gig_posts_left > 0)
      }

      setSubscription(data)
      setLoading(false)
    }

    checkSubscription()
  }, [router])

  /* ----------------------------------------------------
     SUBMIT GIG
  ---------------------------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subscription) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    // Create gig
    const { error: gigError } = await supabase.from('gigs').insert({
      client_id: user.id,
      gig_name: gigName,
      explanation,
      payment_amount,
      status: 'open',
    })

    if (gigError) {
      alert('Failed to post gig')
      return
    }

    // Decrement gig_posts_left if NOT professional
    if (subscription.plan_name !== 'professional') {
      await supabase
        .from('subscriptions')
        .update({
          gig_posts_left: subscription.gig_posts_left - 1,
        })
        .eq('id', subscription.id)
    }

    router.push('/client-dashboard')
  }

  /* ----------------------------------------------------
     UI STATES
  ---------------------------------------------------- */
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Checking subscription...</p>
      </div>
    )
  }

  if (!canPost) {
    return (
      <div className="max-w-xl mx-auto mt-20 bg-white p-8 rounded-xl shadow">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Upgrade Required
        </h2>

        <p className="text-gray-600 mb-6">
          You’ve reached your gig posting limit or your plan has expired.
        </p>

        <button
          onClick={() => router.push('/pricing')}
          className="w-full bg-primary text-white py-2 rounded-lg hover:opacity-90"
        >
          View Pricing Plans
        </button>
      </div>
    )
  }

  /* ----------------------------------------------------
     POST GIG FORM
  ---------------------------------------------------- */
  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white p-8 rounded-xl shadow">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Post a New Gig
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Gig Title"
          value={gigName}
          onChange={(e) => setGigName(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2"
        />

        <textarea
          placeholder="Gig Description"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2 h-32"
        />

        <input
          type="number"
          placeholder="Payment Amount (ZAR)"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          required
          className="w-full border rounded-lg px-4 py-2"
        />

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-lg hover:opacity-90"
        >
          Post Gig
        </button>
      </form>

      {subscription.plan_name !== 'professional' && (
        <p className="text-sm text-gray-500 mt-4">
          Gig posts remaining: {subscription.gig_posts_left}
        </p>
      )}
    </div>
  )
}
