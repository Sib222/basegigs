'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function GigSeekerDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [seekerProfile, setSeekerProfile] = useState<any>(null)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [acceptedCount, setAcceptedCount] = useState(0)
  const [hasNotification, setHasNotification] = useState(false)

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

      if (profileData.user_type !== 'gig_seeker' && profileData.user_type !== 'both') {
        router.push('/dashboard/client')
        return
      }

      setProfile(profileData)

      // Fetch gig seeker profile photo
      const { data: seekerProfileData } = await supabase
        .from('gig_seeker_profiles')
        .select('photo_url')
        .eq('user_id', user.id)
        .single()
      setSeekerProfile(seekerProfileData)

      // Applications pending
      const { count: pending } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('gig_seeker_id', user.id)
        .eq('status', 'pending')

      // Accepted applications
      const { count: accepted } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('gig_seeker_id', user.id)
        .eq('status', 'accepted')

      // Unseen status changes (client accepted/declined and seeker hasn't viewed yet)
      const { count: unseen } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('gig_seeker_id', user.id)
        .eq('seeker_seen', false)

      setPendingCount(pending || 0)
      setAcceptedCount(accepted || 0)
      setHasNotification((unseen || 0) > 0)

      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const getPhotoUrl = (photoUrl: string | null | undefined) => {
    if (!photoUrl) return null
    if (photoUrl.startsWith('http')) return photoUrl
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(photoUrl)
    return data.publicUrl
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ This will permanently delete your account and ALL associated data.\n\nThis action cannot be undone. Continue?'
    )
    if (!confirmed) return

    setDeleting(true)

    const { error } = await supabase.rpc('delete_my_account')

    if (error) {
      console.error(error)
      alert('Failed to delete account. Please contact support.')
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
          <button onClick={() => router.push('/login')} className="px-4 py-2 bg-primary text-white rounded-lg">
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  const photoUrl = getPhotoUrl(seekerProfile?.photo_url)

  return (
    <div className="min-h-screen bg-sage">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img src="/logo.png" alt="BaseGigs Logo" className="h-9 w-auto" />
                <span className="ml-2 text-xl font-semibold text-secondary">BaseGigs</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/my-contracts"
                className="px-4 py-2 text-gray-700 hover:text-primary font-medium transition-colors"
              >
                📄 My Contracts
              </Link>
              <span className="text-gray-700 hidden sm:inline">Welcome, {profile?.full_name}</span>
              <button onClick={handleLogout} className="px-4 py-2 text-gray-700 hover:text-primary transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6 flex flex-col items-center text-center md:flex-row md:text-left gap-6">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary-light flex-shrink-0 bg-sage flex items-center justify-center">
            {photoUrl ? (
              <img src={photoUrl} alt={profile?.full_name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl">👤</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gig Seeker Dashboard</h1>
            <p className="text-gray-600">Find and apply for gigs that match your skills</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Applications Pending</h3>
            <p className="text-3xl font-bold text-primary">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Accepted Applications</h3>
            <p className="text-3xl font-bold text-primary">{acceptedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Completed Gigs</h3>
            <p className="text-3xl font-bold text-primary">0</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/my-contracts"
              className="p-6 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 text-center transition-colors"
            >
              <div className="text-3xl mb-2">📄</div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">My Contracts</h3>
              <p className="text-gray-600">View and sign contracts</p>
            </Link>

            <Link
              href="/browse-gigs"
              className="p-6 border-2 border-primary rounded-lg hover:bg-primary-light text-center transition-colors"
            >
              <h3 className="text-xl font-semibold text-primary mb-2">Browse Gigs</h3>
              <p className="text-gray-600">Find and apply for available gigs</p>
            </Link>

            <Link
              href="/dashboard/gig-seeker/profile"
              className="p-6 border-2 border-gray-300 rounded-lg hover:bg-sage text-center transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">Edit Profile</h3>
              <p className="text-gray-600">Update your skills and experience</p>
            </Link>

            <Link
              href="/dashboard/gig-seeker/applications"
              className="relative p-6 border-2 border-gray-300 rounded-lg hover:bg-sage text-center transition-colors"
            >
              {hasNotification && (
                <span
                  className="absolute top-3 right-3 w-3.5 h-3.5 bg-blue-500 rounded-full ring-2 ring-white"
                  title="You have application updates"
                ></span>
              )}
              <h3 className="text-xl font-semibold mb-2">My Applications</h3>
              <p className="text-gray-600">View all your gig applications</p>
            </Link>

            <Link
              href="/how-it-works"
              className="p-6 border-2 border-gray-300 rounded-lg hover:bg-sage text-center transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">How It Works</h3>
              <p className="text-gray-600">Learn how to maximize your success</p>
            </Link>

            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="p-6 border-2 border-red-600 bg-red-50 rounded-lg text-center hover:bg-red-100 animate-pulse"
            >
              <h3 className="text-xl font-semibold text-red-700 mb-2">
                {deleting ? 'Deleting Account…' : 'Delete My Account'}
              </h3>
              <p className="text-red-600">Permanently remove your account and all data</p>
            </button>
          </div>
        </div>

        <div className="bg-primary-light border border-primary/20 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-primary-dark mb-2">💚 BaseGigs is 100% Free for Gig Seekers!</h3>
          <p className="text-primary-dark">
            Apply to unlimited gigs, chat with clients, and sign contracts at no cost.
            We&apos;re here to help you find opportunities!
          </p>
        </div>
      </div>
    </div>
  )
}
