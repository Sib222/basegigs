'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Subscription {
  plan: string
  gigs_allowed: number
  expires_at: string | null
}

interface Gig {
  id: number
  gig_name: string
  gig_type: string
  payment_amount: number
  created_at: string
}

export default function ClientDashboardPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [gigs, setGigs] = useState<Gig[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    init()
  }, [])

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUserId(user.id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('user_id', user.id)
      .single()

    if (profile?.user_type !== 'client' && profile?.user_type !== 'both') {
      router.push('/dashboard/gig-seeker')
      return
    }

    await Promise.all([
      fetchSubscription(user.id),
      fetchGigs(user.id)
    ])

    setLoading(false)
  }

  const fetchSubscription = async (uid: string) => {
    const { data } = await supabase
      .from('subscriptions')
      .select('plan, gigs_allowed, expires_at')
      .eq('user_id', uid)
      .single()

    if (data) setSubscription(data)
  }

  const fetchGigs = async (uid: string) => {
    const { data } = await supabase
      .from('gigs')
      .select('id, gig_name, gig_type, payment_amount, created_at')
      .eq('client_id', uid)
      .order('created_at', { ascending: false })

    if (data) setGigs(data)
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      'This will permanently delete your account and all associated data. This cannot be undone. Are you sure?'
    )
    if (!confirmed || !userId) return

    await supabase.from('profiles').delete().eq('user_id', userId)
    await supabase.auth.signOut()

    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    )
  }

  const gigsPosted = gigs.length
  const gigsAllowed = subscription?.gigs_allowed ?? 0
  const gigsRemaining = Math.max(gigsAllowed - gigsPosted, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard/client" className="font-bold text-xl">
            BaseGigs
          </Link>
          <Link href="/dashboard/client/applications" className="text-gray-700 hover:text-primary">
            View Applications
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* SUBSCRIPTION CARD */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Your Subscription</h2>

          {subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              <div><strong>Plan:</strong><br />{subscription.plan}</div>
              <div><strong>Gigs Allowed:</strong><br />{gigsAllowed}</div>
              <div><strong>Gigs Posted:</strong><br />{gigsPosted}</div>
              <div><strong>Gigs Remaining:</strong><br />{gigsRemaining}</div>
              <div>
                <strong>Expires:</strong><br />
                {subscription.expires_at
                  ? new Date(subscription.expires_at).toLocaleDateString()
                  : 'Never'}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No active subscription found.</p>
          )}
        </div>

        {/* YOUR GIGS */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Your Gigs</h2>
            <Link
              href="/post-gig"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600"
            >
              + Post New Gig
            </Link>
          </div>

          {gigs.length === 0 ? (
            <p className="text-gray-600">You haven’t posted any gigs yet.</p>
          ) : (
            <div className="space-y-4">
              {gigs.map(gig => (
                <div
                  key={gig.id}
                  className="border rounded-lg p-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-semibold">{gig.gig_name}</div>
                    <div className="text-sm text-gray-600">
                      {gig.gig_type} • R{gig.payment_amount}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/client/gigs/${gig.id}`}
                    className="text-primary hover:underline"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DELETE ACCOUNT */}
        <div className="flex justify-end">
          <button
            onClick={handleDeleteAccount}
            className="px-6 py-3 rounded-lg font-semibold text-white
                       bg-red-600 hover:bg-red-700
                       shadow-[0_0_20px_rgba(239,68,68,0.8)]
                       animate-pulse"
          >
            Delete Account
          </button>
        </div>

      </div>
    </div>
  )
}
