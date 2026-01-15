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

  // 🔽 ADDITIONS
  const [subscription, setSubscription] = useState<any>(null)
  const [gigs, setGigs] = useState<any[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        setError('Could not load profile')
        setLoading(false)
        return
      }

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

      // 🔽 ADDITIONS
      await fetchSubscription(user.id)
      await fetchGigs(user.id)

      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  // 🔽 ADDITIONS
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
    const confirmed = confirm('Delete this gig permanently?')
    if (!confirmed) return

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
    const confirmed = window.confirm(
      '⚠️ This will permanently delete your account and ALL associated data. This action cannot be undone.\n\nDo you want to continue?'
    )
    if (!confirmed) return

    setDeleting(true)

    const { error } = await supabase.rpc('delete_my_account')
    if (error) {
      alert('Failed to delete account. Please contact support.')
      console.error(error)
      setDeleting(false)
      return
    }

    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Error: {error}</div>
          <button
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  const gigsPosted = gigs.length
  const gigsAllowed =
    subscription?.plan === 'professional'
      ? '—'
      : subscription?.gigs_allowed ?? 0

  const gigsRemaining =
    subscription?.plan === 'professional'
      ? 'Unlimited'
      : Math.max((subscription?.gigs_allowed || 0) - gigsPosted, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV — UNCHANGED */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary">B</span>
                <span className="ml-2 text-xl font-semibold">BaseGigs</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/my-contracts" className="px-4 py-2 text-gray-700 hover:text-primary font-medium">
                📄 My Contracts
              </Link>
              <span className="text-gray-700">Welcome, {profile?.full_name}</span>
              <Link
                href="/pricing"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Upgrade Plan
              </Link>
              <button onClick={handleLogout} className="px-4 py-2 text-gray-700 hover:text-primary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* HEADER — UNCHANGED */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Dashboard</h1>
          <p className="text-gray-600">Manage your gigs and find talented gig seekers</p>
        </div>

        {/* 🔽 ADDED: SUBSCRIPTION */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Subscription Details</h2>
          {subscription ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div><strong>Plan</strong><br />{subscription.plan}</div>
              <div><strong>Gigs Allowed</strong><br />{gigsAllowed}</div>
              <div><strong>Gigs Posted</strong><br />{gigsPosted}</div>
              <div><strong>Gigs Remaining</strong><br />{gigsRemaining}</div>
              <div>
                <strong>Expires</strong><br />
                {subscription.expires_at
                  ? new Date(subscription.expires_at).toLocaleDateString()
                  : 'Never'}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No active subscription</p>
          )}
        </div>

        {/* 🔽 ADDED: YOUR GIGS */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Gigs</h2>

          {gigs.length === 0 ? (
            <p className="text-gray-600">You have not posted any gigs yet.</p>
          ) : (
            <div className="space-y-3">
              {gigs.map(gig => (
                <div
                  key={gig.id}
                  className="flex justify-between items-center border rounded-lg p-4"
                >
                  <div>
                    <div className="font-semibold">{gig.gig_name}</div>
                    <div className="text-sm text-gray-600">
                      {gig.gig_type} • R{gig.payment_amount}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGig(gig.id)}
                    className="text-red-600 hover:text-red-800 text-xl"
                    title="Delete Gig"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* EVERYTHING BELOW — UNCHANGED */}
        {/* QUICK ACTIONS + DELETE ACCOUNT + UNDER CONSTRUCTION */}
        {/* YOUR ORIGINAL JSX CONTINUES EXACTLY AS BEFORE */}
