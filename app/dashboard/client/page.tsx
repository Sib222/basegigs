'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ClientDashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState('')
  const [applicationCount, setApplicationCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  // ✅ ADDITIONS
  const [subscription, setSubscription] = useState<any>(null)
  const [gigs, setGigs] = useState<any[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!profileData) {
        router.push('/onboarding')
        return
      }

      if (profileData.user_type !== 'client' && profileData.user_type !== 'both') {
        router.push('/dashboard/gig-seeker')
        return
      }

      setProfile(profileData)

      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'pending')

      setApplicationCount(count || 0)

      await fetchSubscription(user.id)
      await fetchGigs(user.id)

      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  // ✅ ADDITIONS
  const fetchSubscription = async (userId: string) => {
    const { data } = await supabase
      .from('subscriptions')
      .select('plan, gigs_allowed, expires_at')
      .eq('user_id', userId)
      .single()

    if (data) setSubscription(data)
  }

  const fetchGigs = async (userId: string) => {
    const { data } = await supabase
      .from('gigs')
      .select('id, gig_name, gig_type, payment_amount, created_at')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })

    if (data) setGigs(data)
  }

  const handleDeleteGig = async (gigId: number) => {
    if (!confirm('Delete this gig permanently?')) return

    const { error } = await supabase.from('gigs').delete().eq('id', gigId)
    if (!error) {
      setGigs(prev => prev.filter(g => g.id !== gigId))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('⚠️ This will permanently delete your account. Continue?')) return

    setDeleting(true)
    const { error } = await supabase.rpc('delete_my_account')

    if (error) {
      alert('Failed to delete account')
      setDeleting(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
  }

  const gigsPosted = gigs.length
  const gigsAllowed =
    subscription?.plan === 'professional'
      ? 'Unlimited'
      : subscription?.gigs_allowed ?? 0

  const gigsRemaining =
    subscription?.plan === 'professional'
      ? 'Unlimited'
      : Math.max((subscription?.gigs_allowed || 0) - gigsPosted, 0)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 🔹 NAV (UNCHANGED) */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">B</span>
            <span className="ml-2 text-xl font-semibold">BaseGigs</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/my-contracts">📄 My Contracts</Link>
            <span>Welcome, {profile?.full_name}</span>
            <Link href="/pricing" className="bg-green-600 text-white px-4 py-2 rounded-lg">
              Upgrade Plan
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* 🔹 HEADER */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-gray-600">Manage your gigs</p>
        </div>

        {/* ✅ SUBSCRIPTION (ADDED) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div><strong>Plan</strong><br />{subscription?.plan ?? 'None'}</div>
            <div><strong>Gigs Allowed</strong><br />{gigsAllowed}</div>
            <div><strong>Gigs Posted</strong><br />{gigsPosted}</div>
            <div><strong>Remaining</strong><br />{gigsRemaining}</div>
            <div>
              <strong>Expires</strong><br />
              {subscription?.expires_at
                ? new Date(subscription.expires_at).toLocaleDateString()
                : 'Never'}
            </div>
          </div>
        </div>

        {/* ✅ YOUR GIGS (ADDED) */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Gigs</h2>

          {gigs.length === 0 ? (
            <p className="text-gray-600">No gigs posted yet.</p>
          ) : (
            <div className="space-y-3">
              {gigs.map(gig => (
                <div key={gig.id} className="flex justify-between items-center border p-4 rounded-lg">
                  <div>
                    <div className="font-semibold">{gig.gig_name}</div>
                    <div className="text-sm text-gray-600">
                      {gig.gig_type} • R{gig.payment_amount}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGig(gig.id)}
                    className="text-red-600 text-xl hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 🔴 DELETE ACCOUNT (UNCHANGED) */}
        <button
          onClick={handleDeleteAccount}
          disabled={deleting}
          className="p-6 border-2 border-red-600 bg-red-50 rounded-lg hover:bg-red-100 animate-pulse"
        >
          {deleting ? 'Deleting Account…' : 'Delete My Account'}
        </button>

      </div>
    </div>
  )
}
