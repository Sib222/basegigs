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
            <p className="text-3xl font-bold text-primary">0</p>
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/my-contracts"
              className="p-6 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 text-center"
            >
              <div className="text-3xl mb-2">📄</div>
              <h3 className="text-xl font-semibold text-blue-700 mb-2">My Contracts</h3>
              <p className="text-gray-600">View and manage all contracts</p>
            </Link>
            <Link
              href="/dashboard/client/applications"
              className="p-6 border-2 border-primary rounded-lg hover:bg-green-50 text-center"
            >
              <h3 className="text-xl font-semibold text-primary mb-2">View Applications</h3>
              <p className="text-gray-600">Review applications from gig seekers</p>
              {applicationCount > 0 && (
                <div className="mt-2 inline-block px-3 py-1 bg-primary text-white rounded-full text-sm font-semibold">
                  {applicationCount} pending
                </div>
              )}
            </Link>
            <Link
              href="/post-gig"
              className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-center"
            >
              <h3 className="text-xl font-semibold mb-2">Post a Gig</h3>
              <p className="text-gray-600">Create a new gig listing to find talent</p>
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
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Dashboard Under Construction</h3>
          <p className="text-blue-800">
            We&apos;re building out the full dashboard features. You can now view applications! Post Gig functionality
            will be available soon!
          </p>
        </div>
      </div>
    </div>
  )
}
