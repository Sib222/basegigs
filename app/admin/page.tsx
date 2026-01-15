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

type PlanKey = 'pay_per_gig' | 'starter' | 'professional'

const PLANS: Record<PlanKey, { label: string; gigs: number | null }> = {
  pay_per_gig: { label: 'Pay per Gig', gigs: 1 },
  starter: { label: 'Starter', gigs: 5 },
  professional: { label: 'Professional', gigs: null }, // unlimited
}

const ADMIN_PASSWORD = 'Simelane1*'

export default function AdminPage() {
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [subscriptions, setSubscriptions] = useState<Record<string, Subscription>>({})
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (authorized) {
      fetchData()
    }
  }, [authorized])

  async function fetchData() {
    setError(null)

    // Fetch users with user_type 'client' or 'both'
    const { data: clientData, error: clientError } = await supabase
      .from('profiles')
      .select('user_id, full_name, email')
      .in('user_type', ['client', 'both'])
      .order('full_name', { ascending: true })

    if (clientError) {
      setError('Failed to fetch clients')
      console.error(clientError)
      return
    }

    setClients(clientData || [])

    // Fetch subscriptions separately
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('user_id, plan_name, gig_posts_left, gigs_allowed, expires_at')

    if (subError) {
      console.error(subError)
      return
    }

    const map: Record<string, Subscription> = {}
    subData?.forEach((s) => {
      map[s.user_id] = s
    })

    setSubscriptions(map)
  }

  async function changePlan(userId: string, planKey: PlanKey | null) {
    if (!planKey) {
      await supabase.from('subscriptions').delete().eq('user_id', userId)
      fetchData()
      return
    }

    const now = new Date()
    const expires = new Date()
    expires.setDate(now.getDate() + 30)

    const plan = PLANS[planKey]

    // Set gigs_allowed based on plan, null means unlimited (professional)
    const gigsAllowed = plan.gigs === null ? null : plan.gigs

    // For professional plan, gig_posts_left should also be null (unlimited)
    // For others, set gig_posts_left = gigs_allowed
    const gigPostsLeft = gigsAllowed === null ? null : gigsAllowed

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan_name: planKey,
      gigs_allowed: gigsAllowed,
      gig_posts_left: gigPostsLeft,
      activated_at: now.toISOString(),
      expires_at: expires.toISOString(),
    })

    fetchData()
  }

  const filtered = clients.filter((c) =>
    `${c.full_name ?? ''} ${c.email ?? ''}`.toLowerCase().includes(search.toLowerCase())
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <form
          onSubmit={handlePasswordSubmit}
          className="bg-white p-6 rounded shadow-md max-w-sm w-full"
        >
          <h2 className="text-xl font-bold mb-4 text-center">Admin Login</h2>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter admin password"
            className="w-full p-2 border rounded mb-4"
            autoFocus
          />
          {authError && <p className="text-red-600 mb-4 text-center">{authError}</p>}
          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded hover:bg-green-600 transition"
          >
            Submit
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin – Client Subscriptions</h1>

      <input
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full p-2 border rounded"
      />

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full border bg-white rounded">
          <thead className="bg-gray-100 text-left">
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
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No clients found
                </td>
              </tr>
            )}

            {filtered.map((client) => {
              const sub = subscriptions[client.user_id]

              return (
                <tr key={client.user_id} className="border-t">
                  <td className="p-3">{client.full_name || '—'}</td>
                  <td className="p-3">{client.email || '—'}</td>
                  <td className="p-3 capitalize">
                    {sub ? sub.plan_name.replace('_', ' ') : 'No plan'}
                  </td>
                  <td className="p-3">
                    {sub
                      ? sub.gigs_allowed === null
                        ? '∞'
                        : sub.gigs_allowed
                      : '—'}
                  </td>
                  <td className="p-3">{sub ? daysLeft(sub.expires_at) : '—'}</td>
                  <td className="p-3 space-x-2">
                    {(Object.keys(PLANS) as PlanKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => changePlan(client.user_id, key)}
                        className={`px-2 py-1 text-sm rounded ${
                          sub?.plan_name === key
                            ? 'bg-primary text-white'
                            : 'bg-gray-200'
                        }`}
                      >
                        {PLANS[key].label}
                      </button>
                    ))}
                    <button
                      onClick={() => changePlan(client.user_id, null)}
                      className="px-2 py-1 text-sm bg-red-100 text-red-600 rounded"
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
  )
}
