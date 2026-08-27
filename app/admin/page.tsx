'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ClientProfile = {
  user_id: string
  full_name: string | null
  email: string | null
}

type Subscription = {
  user_id: string
  plan_name: string
  gig_posts_left: number | null
  gigs_allowed: number | null
  expires_at: string
}

type GigSeeker = {
  user_id: string
  full_name: string | null
  email: string | null
  id_number: string | null
  gender: string | null
  age: number | null
  photo_url: string | null
  verified: boolean
}

type PlanKey = 'pay_per_gig' | 'starter' | 'professional'

const PLANS: Record<PlanKey, { label: string; gigs: number | null }> = {
  pay_per_gig: { label: 'Pay per Gig', gigs: 1 },
  starter: { label: 'Starter', gigs: 5 },
  professional: { label: 'Professional', gigs: null },
}

const ADMIN_PASSWORD = 'Simelane1*'

export default function AdminPage() {
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({})
  const [gigSeekers, setGigSeekers] = useState<GigSeeker[]>([])
  const [search, setSearch] = useState('')
  const [seekerSearch, setSeekerSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState<'clients' | 'seekers'>('clients')
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  useEffect(() => {
    if (authorized) {
      fetchData()
    }
  }, [authorized])

  async function fetchData() {
    setError(null)
    await Promise.all([fetchClients(), fetchGigSeekers()])
  }

  async function fetchClients() {
    const { data: clientData, error: clientError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .in('user_type', ['client', 'both'])
      .order('full_name', { ascending: true })

    if (clientError) {
      setError('Failed to fetch clients')
      return
    }
    setClients(clientData || [])

    const { data: subData } = await supabase
      .from('subscriptions')
      .select('user_id, plan_name, gig_posts_left, gigs_allowed, expires_at')

    const map: Record<string, Subscription> = {}
    subData?.forEach((s) => { map[s.user_id] = s })
    setSubscriptions(map)
  }

  async function fetchGigSeekers() {
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email, id_number, gender, age')
      .in('user_type', ['gig_seeker', 'both'])
      .order('full_name', { ascending: true })

    if (profileError) {
      setError('Failed to fetch gig seekers')
      return
    }

    const enriched = await Promise.all(
      (profileData || []).map(async (profile) => {
        const { data: seekerData } = await supabase
          .from('gig_seeker_profiles')
          .select('verified, photo_url')
          .eq('user_id', profile.user_id)
          .single()

        return {
          ...profile,
          verified: seekerData?.verified ?? false,
          photo_url: seekerData?.photo_url ?? null,
        }
      })
    )

    setGigSeekers(enriched)
  }

  async function handleVerify(userId: string, verify: boolean) {
    setVerifyingId(userId)
    const { error } = await supabase
      .from('gig_seeker_profiles')
      .update({ verified: verify })
      .eq('user_id', userId)

    if (error) {
      alert('Failed to update: ' + error.message)
    } else {
      await fetchGigSeekers()
    }
    setVerifyingId(null)
  }

  async function changePlan(userId: string, planKey: PlanKey | null) {
    if (!planKey) {
      await supabase.from('subscriptions').delete().eq('user_id', userId)
      fetchClients()
      return
    }

    const now = new Date()
    const expires = new Date()
    expires.setDate(now.getDate() + 30)
    const plan = PLANS[planKey]
    const gigsAllowed = plan.gigs === null ? null : plan.gigs
    const gigPostsLeft = gigsAllowed === null ? null : gigsAllowed

    await supabase.from('subscriptions').upsert({
  user_id: userId,
  plan_name: planKey,
  gigs_allowed: gigsAllowed,
  gig_posts_left: gigPostsLeft,
  activated_at: now.toISOString(),
  expires_at: expires.toISOString(),
}, { onConflict: 'user_id' })

    fetchClients()
  }

  function getPhotoUrl(photoUrl: string | null) {
    if (!photoUrl) return null
    if (photoUrl.startsWith('http')) return photoUrl
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(photoUrl)
    return data.publicUrl
  }

  const filteredClients = clients.filter((c) =>
    `${c.full_name ?? ''} ${c.email ?? ''}`.toLowerCase().includes(search.toLowerCase())
  )

  const filteredSeekers = gigSeekers.filter((s) =>
    `${s.full_name ?? ''} ${s.email ?? ''}`.toLowerCase().includes(seekerSearch.toLowerCase())
  )

  function daysLeft(date: string) {
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthorized(true)
      setAuthError('')
    } else {
      setAuthError('Incorrect password, try again.')
      setPasswordInput('')
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage p-4">
        <form onSubmit={handlePasswordSubmit} className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="BaseGigs Logo" className="h-12 w-auto" />
          </div>
          <h2 className="text-xl font-bold mb-4 text-center text-secondary">Admin Login</h2>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-2 border rounded mb-4 focus:ring-primary focus:border-primary"
            autoFocus
          />
          {authError && <p className="text-red-600 mb-4 text-center">{authError}</p>}
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-primary-dark transition-colors">
            Submit
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sage p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <img src="/logo.png" alt="BaseGigs Logo" className="h-8 w-auto" />
          <h1 className="text-2xl font-bold text-secondary">BaseGigs Admin</h1>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-6 py-2 font-semibold text-sm rounded-t-lg transition-colors ${
              activeTab === 'clients'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-primary-light'
            }`}
          >
            Clients ({clients.length})
          </button>
          <button
            onClick={() => setActiveTab('seekers')}
            className={`px-6 py-2 font-semibold text-sm rounded-t-lg transition-colors ${
              activeTab === 'seekers'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-primary-light'
            }`}
          >
            Gig Seekers ({gigSeekers.length})
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Clients Tab */}
        {activeTab === 'clients' && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-secondary">Client Subscriptions</h2>
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 w-full p-2 border rounded focus:ring-primary focus:border-primary"
            />
            <div className="overflow-x-auto">
              <table className="w-full border bg-white rounded">
                <thead className="bg-sage text-left">
                  <tr>
                    <th className="p-3">Client Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Current Plan</th>
                    <th className="p-3">Gig Posts Left</th>
                    <th className="p-3">Days Left</th>
                    <th className="p-3">Change Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500">No clients found</td>
                    </tr>
                  )}
                  {filteredClients.map((client) => {
                    const sub = subscriptions[client.user_id]
                    return (
                      <tr key={client.user_id} className="border-t">
                        <td className="p-3">{client.full_name || '—'}</td>
                        <td className="p-3">{client.email || '—'}</td>
                        <td className="p-3 capitalize">{sub ? sub.plan_name.replace('_', ' ') : 'No plan'}</td>
                        <td className="p-3">
                          {sub ? (sub.gigs_allowed === null ? '∞' : sub.gigs_allowed) : '—'}
                        </td>
                        <td className="p-3">{sub ? daysLeft(sub.expires_at) : '—'}</td>
                        <td className="p-3 space-x-2">
                          {(Object.keys(PLANS) as PlanKey[]).map((key) => (
                            <button
                              key={key}
                              onClick={() => changePlan(client.user_id, key)}
                              className={`px-2 py-1 text-sm rounded transition-colors ${
                                sub?.plan_name === key ? 'bg-primary text-white' : 'bg-sage hover:bg-primary-light'
                              }`}
                            >
                              {PLANS[key].label}
                            </button>
                          ))}
                          <button
                            onClick={() => changePlan(client.user_id, null)}
                            className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                          >
                            Clear
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Gig Seekers Tab */}
        {activeTab === 'seekers' && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-secondary">Gig Seeker Verification</h2>
            <input
              type="text"
              placeholder="Search by name or email"
              value={seekerSearch}
              onChange={(e) => setSeekerSearch(e.target.value)}
              className="mb-4 w-full p-2 border rounded focus:ring-primary focus:border-primary"
            />

            {/* Stats */}
            <div className="flex space-x-4 mb-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm">
                <span className="font-semibold text-yellow-700">Pending: </span>
                <span className="text-yellow-700">{gigSeekers.filter(s => !s.verified).length}</span>
              </div>
              <div className="bg-primary-light border border-primary/20 rounded-lg px-4 py-2 text-sm">
                <span className="font-semibold text-primary-dark">Verified: </span>
                <span className="text-primary-dark">{gigSeekers.filter(s => s.verified).length}</span>
              </div>
            </div>

            <div className="space-y-4">
              {filteredSeekers.length === 0 && (
                <p className="text-center text-gray-500 py-8">No gig seekers found</p>
              )}
              {filteredSeekers.map((seeker) => {
                const photoUrl = getPhotoUrl(seeker.photo_url)
                const isProcessing = verifyingId === seeker.user_id
                return (
                  <div key={seeker.user_id} className={`bg-white border rounded-lg p-4 flex items-center gap-4 ${seeker.verified ? 'border-primary/40' : 'border-gray-200'}`}>
                    
                    {/* Profile Photo */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-sage flex-shrink-0 border-2 border-gray-200">
                      {photoUrl ? (
                        <img src={photoUrl} alt={seeker.full_name || 'Profile'} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">👤</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Full Name</p>
                        <p className="font-semibold">{seeker.full_name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Email</p>
                        <p>{seeker.email || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">ID Number</p>
                        <p className="font-mono">{seeker.id_number || '—'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Age / Gender</p>
                        <p>{seeker.age || '—'} / {seeker.gender || '—'}</p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${seeker.verified ? 'bg-primary-light text-primary-dark' : 'bg-yellow-100 text-yellow-700'}`}>
                        {seeker.verified ? '✓ Verified' : '⏳ Pending'}
                      </span>
                      <div className="flex gap-2">
                        {!seeker.verified ? (
                          <button
                            onClick={() => handleVerify(seeker.user_id, true)}
                            disabled={isProcessing}
                            className="px-3 py-1 bg-primary text-white text-sm rounded hover:bg-primary-dark disabled:opacity-50 transition-colors"
                          >
                            {isProcessing ? '...' : 'Verify'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(seeker.user_id, false)}
                            disabled={isProcessing}
                            className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
                          >
                            {isProcessing ? '...' : 'Unverify'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
