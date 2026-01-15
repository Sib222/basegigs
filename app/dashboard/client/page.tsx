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
  const [subscription, setSubscription] = useState<any>(null)
  const [activeGigs, setActiveGigs] = useState<any[]>([])
  const [deletingGigId, setDeletingGigId] = useState<number | null>(null)

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

      // Fetch subscription
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('plan_name, gig_posts_left, gigs_allowed, expires_at')
        .eq('user_id', user.id)
        .order('activated_at', { ascending: false })
        .limit(1)
        .single()
      if (subsError && subsError.code !== 'PGRST116') {
        console.error('Subscription error:', subsError)
        setError('Could not load subscription info')
      } else {
        setSubscription(subsData)
      }

      // Fetch active gigs
      const { data: gigsData, error: gigsError } = await supabase
        .from('gigs')
        .select('*')
        .eq('client_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (gigsError) {
        console.error('Gigs error:', gigsError)
        setError('Could not load your gigs')
      } else {
        setActiveGigs(gigsData || [])
      }

      // Fetch application count
      const { count } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', user.id)
        .eq('status', 'pending')
      setApplicationCount(count || 0)

      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred')
      setLoading(false)
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

  const handleDeleteGig = async (gigId: number) => {
    if (deletingGigId !== null) return
    const confirmed = window.confirm('Are you sure you want to delete this gig? This cannot be undone.')
    if (!confirmed) return
    try {
      setDeletingGigId(gigId)
      const { error } = await supabase
        .from('gigs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', gigId)
        .eq('client_id', profile.user_id)
      if (error) throw error
      setActiveGigs((prev) => prev.filter((g) => g.id !== gigId))
    } catch (err: any) {
      alert('Failed to delete gig: ' + err.message)
    } finally {
      setDeletingGigId(null)
    }
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
          <button onClick={() => router.push('/login')} className="px-4 py-2 bg-primary text-white rounded-lg">
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  // Subscription calculations
  const gigsPosted = activeGigs.length
  const gigsAllowed =
    subscription?.plan_name === 'professional'
      ? 'Unlimited'
      : subscription?.gigs_allowed ?? 0
  const gigsLeft = subscription ? subscription.gig_posts_left : 0
  const expiresAt = subscription?.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString()
    : 'N/A'

  return (
    <div className="min-h-screen bg-gray-50">
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
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Dashboard</h1>
          <p className="text-gray-600">Manage your gigs and find talented gig seekers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Active Gigs</h3>
            <p className="text-3xl font-bold text-primary">{activeGigs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Pending Applications</h3>
            <p className="text-3xl font-bold text-primary">{applicationCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Hired Seekers</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Subscription Details</h2>
          {subscription ? (
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Plan:</strong> {subscription.plan_name}
              </p>
              <p>
                <strong>Gigs Allowed:</strong> {gigsAllowed}
              </p>
              <p>
                <strong>Gigs Posted:</strong> {gigsPosted}
              </p>
              <p>
                <strong>Gigs Remaining:</strong> {gigsLeft}
              </p>
              <p>
                <strong>Expires At:</strong> {expiresAt}
              </p>
            </div>
          ) : (
            <p>No active subscription found.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Gigs</h2>
          {activeGigs.length === 0 ? (
            <p className="text-gray-600">No active gigs at the moment.</p>
          ) : (
            <div className="space-y-4">
              {activeGigs.map((gig) => (
                <div key={gig.id} className="border rounded p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{gig.gig_name}</h3>
                    <p className="text-gray-600 text-sm">
                      {gig.gig_type} — {gig.city}, {gig.province}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteGig(gig.id)}
                    disabled={deletingGigId === gig.id}
                    aria-label={`Delete gig ${gig.gig_name}`}
                    className="text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-400 rounded"
                    title="Delete Gig"
                  >
                    {deletingGigId === gig.id ? 'Deleting...' : '🗑️'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-6">Client Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/my-contracts"
              className="p-6 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 text-center"
            >
              <div className="text-3xl mb-2">📄</div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">My Contracts</h3>
              <p className="text-gray-600">View and manage all contracts</p>
            </Link>
            <Link
              href="/post-gig"
              className="p-6 border-2 border-primary rounded-lg hover:bg-green-50 text-center"
            >
              <h3 className="text-xl font-semibold text-primary mb-2">Post a Gig</h3>
              <p className="text-gray-600">Create a new gig listing</p>
            </Link>
            <Link
              href="/find-talent"
              className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <h3 className="text-xl font-semibold mb-2">Find Talent</h3>
              <p className="text-gray-600">Browse verified gig seekers</p>
            </Link>
            <Link
              href="/browse-gigs"
              className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <h3 className="text-xl font-semibold mb-2">Browse Gigs</h3>
              <p className="text-gray-600">See what others are posting</p>
            </Link>
          </div>

          {/* DELETE ACCOUNT BUTTON */}
          <div className="mt-8 text-center">
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="inline-block px-6 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg
                transition duration-300
                focus:outline-none focus:ring-4 focus:ring-red-400
                animate-pulse"
              style={{ boxShadow: '0 0 12px 4px rgba(220,38,38,0.8)' }}
            >
              {deleting ? 'Deleting Account...' : 'Delete My Account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
