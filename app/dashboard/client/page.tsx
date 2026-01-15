'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Gig {
  id: number
  client_id: string
  client_name: string
  gig_name: string
  gig_type: string
  city: string
  province: string
  explanation: string
  requirements: string
  payment_amount: number
  payment_type: string
  skills: string[]
  deadline: string
  status: string
  applicant_count: number
  created_at: string
  expires_at: string
  deleted_at: string | null
}

interface Subscription {
  plan_name: string
  gig_posts_left: number
  gigs_allowed: number
  expires_at: string | null
}

export default function ClientDashboard() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [deleting, setDeleting] = useState(false)

  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [activeGigs, setActiveGigs] = useState<Gig[]>([])
  const [totalApplications, setTotalApplications] = useState(0)
  const [hiredSeekers, setHiredSeekers] = useState(0)

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
        setError('Could not load profile')
        setLoading(false)
        return
      }

      if (profileData.user_type !== 'client' && profileData.user_type !== 'both') {
        router.push('/dashboard/gig-seeker')
        return
      }

      setProfile(profileData)

      const { data: subsData } = await supabase
        .from('subscriptions')
        .select('plan_name, gig_posts_left, gigs_allowed, expires_at')
        .eq('user_id', user.id)
        .order('activated_at', { ascending: false })
        .limit(1)
        .single()

      setSubscription(subsData ?? null)

      const { data: gigsData } = await supabase
        .from('gigs')
        .select('*')
        .eq('client_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      setActiveGigs(gigsData ?? [])

      const gigIds =
        gigsData?.map((g) => g.id) ?? []

      const { data: appCount } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .in('gig_id', gigIds)

      setTotalApplications(appCount?.length ?? 0)

      const { data: hiredCount } = await supabase
        .from('applications')
        .select('id', { count: 'exact', head: true })
        .in('gig_id', gigIds)
        .eq('status', 'hired')

      setHiredSeekers(hiredCount?.length ?? 0)

      setLoading(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (deleting) return
    const confirmed = confirm(
      'Are you absolutely sure you want to delete your account? This action cannot be undone.'
    )
    if (!confirmed) return

    setDeleting(true)
    const { error } = await supabase.rpc('delete_my_account')
    if (error) {
      alert(error.message)
      setDeleting(false)
      return
    }
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteGig = async (gigId: number) => {
    if (deletingGigId !== null) return
    const confirmed = confirm('Delete this gig permanently?')
    if (!confirmed) return

    setDeletingGigId(gigId)
    await supabase
      .from('gigs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', gigId)
      .eq('client_id', profile.user_id)

    setActiveGigs((prev) => prev.filter((g) => g.id !== gigId))
    setDeletingGigId(null)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  const gigsPosted = activeGigs.length
  const gigsAllowed =
    subscription?.plan_name === 'professional'
      ? 'Unlimited'
      : subscription?.gigs_allowed ?? 0

  const expiresAt = subscription?.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString()
    : 'N/A'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary">B</span>
            <span className="ml-2 text-xl font-semibold">BaseGigs</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/my-contracts">📄 My Contracts</Link>
            <span>Welcome, {profile.full_name}</span>
            <Link href="/pricing" className="bg-green-600 text-white px-4 py-2 rounded-lg">
              Upgrade Plan
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Stat title="Active Gigs" value={activeGigs.length} />
          <Stat title="Total Applications" value={totalApplications} />
          <Stat title="Hired Seekers" value={hiredSeekers} />
        </div>

        <Section title="Subscription Details">
          {subscription ? (
            <>
              <p><strong>Plan:</strong> {subscription.plan_name}</p>
              <p><strong>Gigs Allowed:</strong> {gigsAllowed}</p>
              <p><strong>Gigs Posted:</strong> {gigsPosted}</p>
              <p><strong>Gigs Remaining:</strong> {subscription.gig_posts_left}</p>
              <p><strong>Expires At:</strong> {expiresAt}</p>
            </>
          ) : (
            <p>No active subscription.</p>
          )}
        </Section>

        <Section title="Your Gigs">
          {activeGigs.length === 0 ? (
            <p>No active gigs.</p>
          ) : (
            activeGigs.map((gig) => (
              <div key={gig.id} className="border p-4 flex justify-between">
                <div>
                  <h3 className="font-semibold">{gig.gig_name}</h3>
                  <p className="text-sm text-gray-600">
                    {gig.city}, {gig.province}
                  </p>
                </div>
                <button onClick={() => handleDeleteGig(gig.id)}>🗑️</button>
              </div>
            ))
          )}
        </Section>

        <div className="text-center mt-10">
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="px-6 py-3 bg-red-600 text-white rounded-lg animate-pulse"
          >
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  )
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white shadow rounded p-6">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-3xl font-bold text-primary">{value}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="bg-white shadow rounded p-6 mb-8">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  )
}
