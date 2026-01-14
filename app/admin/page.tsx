'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type PlanKey = 'pay_per_gig' | 'starter' | 'professional'

const PLANS: Record<PlanKey, { name: string; gigs: number }> = {
  pay_per_gig: { name: 'Pay-per-gig', gigs: 1 },
  starter: { name: 'BaseGigs Starter', gigs: 5 },
  professional: { name: 'BaseGigs Professional', gigs: -1 }, // -1 means unlimited
}

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (authenticated) {
      fetchUsers()
    }
  }, [authenticated])

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.from('profiles').select('*')
      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    if (password === 'Simelane1*') {
      setAuthenticated(true)
      setPassword('')
    } else {
      alert('Incorrect password')
    }
  }

  const togglePlan = async (userId: string, currentPlan: any, newPlanKey: string) => {
    setLoading(true)
    setError('')

    try {
      const plan = PLANS[newPlanKey as PlanKey]
      if (!plan) throw new Error('Invalid plan')

      const now = new Date()
      const expirationDate = new Date()
      expirationDate.setDate(now.getDate() + 30) // 30 days from now

      const gigsRemaining = plan.gigs === -1 ? null : plan.gigs

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan_name: plan.name,
          gigs_remaining: gigsRemaining,
          expires_at: expirationDate.toISOString(),
          updated_at: now.toISOString(),
        }, { onConflict: 'user_id' })

      if (error) throw error

      alert(`Subscription for user updated to ${plan.name}`)
      fetchUsers()
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-3xl font-bold mb-6">Admin Login</h1>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary w-64"
        />
        <button
          onClick={handleLogin}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 font-semibold"
        >
          Login
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <input
        type="text"
        placeholder="Search users by name or email"
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg mb-6 w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {loading && (
        <div className="mb-4 text-lg font-semibold">Loading...</div>
      )}

      {error && (
        <div className="mb-4 text-red-600 font-semibold">{error}</div>
      )}

      <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-primary text-white">
          <tr>
            <th className="text-left px-4 py-2">Name</th>
            <th className="text-left px-4 py-2">Email</th>
            <th className="text-left px-4 py-2">Current Plan</th>
            <th className="text-left px-4 py-2">Gigs Remaining</th>
            <th className="text-left px-4 py-2">Expires At</th>
            <th className="text-left px-4 py-2">Change Plan</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => {
            const [subscription] = user.subscription || [] // assuming you join subscription data or fetch separately
            // We will fetch subscription separately below

            return <UserRow
              key={user.user_id}
              user={user}
              onTogglePlan={togglePlan}
            />
          })}
          {filteredUsers.length === 0 && (
            <tr>
              <td colSpan={6} className="text-center py-6 text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// Separate component for user row with subscription fetch and toggle

function UserRow({ user, onTogglePlan }: { user: any; onTogglePlan: (userId: string, currentPlan: any, newPlanKey: string) => void }) {
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.user_id)
        .single()

      if (!error) setSubscription(data)
    }
    fetchSubscription()
  }, [user.user_id])

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPlanKey = e.target.value
    if (!newPlanKey) return
    setLoading(true)
    onTogglePlan(user.user_id, subscription, newPlanKey)
    setLoading(false)
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString()
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3">{user.full_name}</td>
      <td className="px-4 py-3">{user.email}</td>
      <td className="px-4 py-3">{subscription?.plan_name || 'Free'}</td>
      <td className="px-4 py-3">{subscription?.gigs_remaining === null ? 'Unlimited' : subscription?.gigs_remaining ?? 0}</td>
      <td className="px-4 py-3">{formatDate(subscription?.expires_at)}</td>
      <td className="px-4 py-3">
        <select
          disabled={loading}
          onChange={handlePlanChange}
          defaultValue=""
          className="border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="" disabled>
            Change plan
          </option>
          <option value="pay_per_gig">Pay-per-gig</option>
          <option value="starter">BaseGigs Starter</option>
          <option value="professional">BaseGigs Professional</option>
        </select>
      </td>
    </tr>
  )
}
