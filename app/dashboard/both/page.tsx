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

export default function BothDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [activeView, setActiveView] = useState<'client' | 'seeker'>('client')
  const [error, setError] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [clientGigs, setClientGigs] = useState<Gig[]>([])
  const [loadingGigs, setLoadingGigs] = useState(false)
  const [deletingGigId, setDeletingGigId] = useState<number | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (profile && activeView === 'client') {
      fetchClientGigs()
    }
  }, [profile, activeView])

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
      if (profileData.user_type !== 'both') {
        if (profileData.user_type === 'client') {
          router.push('/dashboard/client')
        } else {
          router.push('/dashboard/gig-seeker')
        }
        return
      }
      setProfile(profileData)
      setLoading(false)
    } catch (err: any) {
      console.error('Error:', err)
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  const fetchClientGigs = async () => {
    setLoadingGigs(true)
    try {
      const { data, error } = await supabase
        .from('gigs')
        .select('*')
        .eq('client_id', profile.user_id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      setClientGigs(data || [])
    } catch (err) {
      console.error('Error fetching client gigs:', err)
    } finally {
      setLoadingGigs(false)
    }
  }

  const handleDeleteGig = async (gigId: number) => {
    if (deletingGigId !== null) return
    const confirmed = confirm('Are you sure you want to delete this gig? This action cannot be undone.')
    if (!confirmed) return

    try {
      setDeletingGigId(gigId)
      const { error } = await supabase
        .from('gigs')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', gigId)
        .eq('client_id', profile.user_id)
      if (error) {
        alert('Failed to delete gig: ' + error.message)
        setDeletingGigId(null)
        return
      }
      alert('Gig deleted successfully.')
      fetchClientGigs()
    } catch (err: any) {
      alert('Unexpected error: ' + err.message)
    } finally {
      setDeletingGigId(null)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleDeleteAccount = async () => {
    if (deletingAccount) return
    const confirmed = confirm(
      'Are you absolutely sure you want to delete your account? This action cannot be undone.'
    )
    if (!confirmed) return

    try {
      setDeletingAccount(true)
      // Call the SQL function that cascades delete everything related to user
      const { error } = await supabase.rpc('delete_my_account')
      if (error) {
        alert('Failed to delete account: ' + error.message)
        setDeletingAccount(false)
        return
      }
      alert('Your account has been deleted successfully.')
      await supabase.auth.signOut()
      router.push('/')
    } catch (err: any) {
      alert('An unexpected error occurred: ' + err.message)
      setDeletingAccount(false)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary">B</span>
              <span className="ml-2 text-xl font-semibold">BaseGigs</span>
            </Link>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hybrid Dashboard</h1>
          <p className="text-gray-600">Switch between Client and Gig Seeker views</p>
        </div>
        <div className="bg-white rounded-lg shadow p-2 mb-6 inline-flex">
          <button
            onClick={() => setActiveView('client')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeView === 'client' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Client View
          </button>
          <button
            onClick={() => setActiveView('seeker')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              activeView === 'seeker' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Gig Seeker View
          </button>
        </div>

        {/* CLIENT VIEW */}
        {activeView === 'client' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Active Gigs</h3>
                <p className="text-3xl font-bold text-primary">{clientGigs.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Total Applications</h3>
                <p className="text-3xl font-bold text-primary">0</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Hired Seekers</h3>
                <p className="text-3xl font-bold text-primary">0</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-2xl font-bold mb-6">Your Gigs</h2>
              {loadingGigs ? (
                <p>Loading your gigs...</p>
              ) : clientGigs.length === 0 ? (
                <p className="text-gray-600">No active gigs at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {clientGigs.map((gig) => (
                    <div key={gig.id} className="border rounded-lg p-4 flex justify-between items-center bg-gray-50">
                      <div>
                        <h3 className="text-lg font-semibold">{gig.gig_name}</h3>
                        <p className="text-sm text-gray-600">
                          {gig.gig_type} — {gig.city}, {gig.province}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteGig(gig.id)}
                        disabled={deletingGigId === gig.id}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="Delete Gig"
                        aria-label={`Delete gig ${gig.gig_name}`}
                      >
                        {deletingGigId === gig.id ? (
                          <svg
                            className="animate-spin h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8H4z"
                            ></path>
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Client Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>

              {/* DELETE ACCOUNT BUTTON */}
              <div className="mt-8 text-center">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deletingAccount}
                  className="inline-block px-6 py-3 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg
                    transition duration-300
                    focus:outline-none focus:ring-4 focus:ring-red-400
                    animate-pulse"
                  style={{ boxShadow: '0 0 12px 4px rgba(220,38,38,0.8)' }}
                >
                  {deletingAccount ? 'Deleting Account...' : 'Delete My Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SEEKER VIEW */}
        {activeView === 'seeker' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Applications Pending</h3>
                <p className="text-3xl font-bold text-primary">0</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Accepted Applications</h3>
                <p className="text-3xl font-bold text-primary">0</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-2">Completed Gigs</h3>
                <p className="text-3xl font-bold text-primary">0</p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Gig Seeker Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                  href="/my-contracts"
                  className="p-6 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 text-center"
                >
                  <div className="text-3xl mb-2">📄</div>
                  <h3 className="text-xl font-semibold text-blue-700 mb-2">My Contracts</h3>
                  <p className="text-gray-600">View and sign contracts</p>
                </Link>
                <Link
                  href="/browse-gigs"
                  className="p-6 border-2 border-primary rounded-lg hover:bg-green-50 text-center"
                >
                  <h3 className="text-xl font-semibold text-primary mb-2">Browse Gigs</h3>
                  <p className="text-gray-600">Find and apply for gigs</p>
                </Link>
                <Link
                  href="/dashboard/gig-seeker/profile"
                  className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-center"
                >
                  <h3 className="text-xl font-semibold mb-2">Edit Profile</h3>
                  <p className="text-gray-600">Update your skills</p>
                </Link>
              </div>
            </div>
          </div>
        )}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Dashboard Under Construction</h3>
          <p className="text-blue-800">
            Full dashboard features are being built. You can browse gigs and find talent now. More functionality
            coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}
