'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'

export default function ClientDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState('')
  const [applicationCount, setApplicationCount] = useState(0)
  const [deleting, setDeleting] = useState(false)

  const [subscription, setSubscription] = useState<any>(null)
  const [gigs, setGigs] = useState<any[]>([])
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

      if (profileError || !profileData) {
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

  const fetchSubscription = async (userId: string) => {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    setSubscription(data)
  }

  const fetchGigs = async (userId: string) => {
    const { data } = await supabase
      .from('gigs')
      .select('*')
      .eq('client_id', userId)
      .order('created_at', { ascending: false })

    setGigs(data || [])
  }

  const handleDeleteGig = async (gigId: number) => {
    const confirmed = window.confirm('Delete this gig permanently?')
    if (!confirmed) return

    setDeletingGigId(gigId)

    const { error } = await supabase.from('gigs').delete().eq('id', gigId)

    if (error) {
      alert('Failed to delete gig')
      setDeletingGigId(null)
      return
    }

    setGigs((prev) => prev.filter((g) => g.id !== gigId))
    setDeletingGigId(null)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ This will permanently delete your account and ALL associated data.'
    )
    if (!confirmed) return

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

  const gigsAllowed =
    subscription?.plan_name === 'professional'
      ? '—'
      : subscription?.gig_posts_left ?? '—'

  const gigsPosted = gigs.length
  const gigsRemaining =
    subscription?.plan_name === 'professional'
      ? '—'
      : Math.max((subscription?.gig_posts_left ?? 0) - gigsPosted, 0)

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">B</span>
            <span className="ml-2 text-xl font-semibold">BaseGigs</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="px-4 py-2 bg-green-600 text-white rounded-lg">
              Upgrade Plan
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Subscription Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Subscription Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div><strong>Plan</strong><br />{subscription?.plan_name || 'None'}</div>
            <div><strong>Gigs Allowed</strong><br />{gigsAllowed}</div>
            <div><strong>Gigs Posted</strong><br />{gigsPosted}</div>
            <div><strong>Gigs Remaining</strong><br />{gigsRemaining}</div>
            <div><strong>Expires</strong><br />{subscription?.expires_at ? new Date(subscription.expires_at).toLocaleDateString() : '—'}</div>
          </div>
        </div>

        {/* Your Gigs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Your Gigs</h2>

          {gigs.length === 0 ? (
            <p className="text-gray-600">You haven’t posted any gigs yet.</p>
          ) : (
            <div className="space-y-4">
              {gigs.map((gig) => (
                <div key={gig.id} className="flex justify-between items-center border p-4 rounded-lg">
                  <div>
                    <h3 className="font-semibold">{gig.gig_name}</h3>
                    <p className="text-sm text-gray-500">{gig.gig_type}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteGig(gig.id)}
                    disabled={deletingGigId === gig.id}
                    className="p-3 bg-red-600 text-white rounded-full animate-pulse hover:bg-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Client Actions</h2>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="px-6 py-3 bg-red-600 text-white rounded-lg animate-pulse"
          >
            {deleting ? 'Deleting Account…' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
