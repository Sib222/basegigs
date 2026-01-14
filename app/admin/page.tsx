'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const PASSWORD = 'Simelane1*'

const PLANS = {
  'pay_per_gig': { name: 'Pay-per-gig', gigs: 1 },
  'starter': { name: 'Starter', gigs: 5 },
  'professional': { name: 'Professional', gigs: -1 } // -1 means unlimited
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch all users with subscription info
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          user_id,
          full_name,
          email,
          subscriptions (
            id,
            plan_name,
            gigs_remaining,
            expiration_date
          )
        `)
      
      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      setError('Failed to load users: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (loggedIn) fetchUsers()
  }, [loggedIn])

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput === PASSWORD) {
      setLoggedIn(true)
      setPasswordInput('')
      setError('')
    } else {
      setError('Incorrect password')
    }
  }

  // Calculate expiration date 30 days from today
  const calcExpirationDate = () => {
    const today = new Date()
    today.setDate(today.getDate() + 30)
    return today.toISOString()
  }

  // Handle plan toggle
  const togglePlan = async (userId: string, currentPlan: any, newPlanKey: string) => {
    setLoading(true)
    setError('')

    try {
      // Plan details
      const plan = PLANS[newPlanKey]
      if (!plan) throw new Error('Invalid plan')

      // Calculate gigs_remaining and expiration_date based on plan
      const gigs_remaining = plan.gigs
      const expiration_date = plan.name === 'Pay-per-gig' ? null : calcExpirationDate()

      // Check if subscription exists for user
      const { data: existingSubs } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (existingSubs) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            plan_name: plan.name,
            gigs_remaining,
            expiration_date
          })
          .eq('id', existingSubs.id)
        if (updateError) throw updateError
      } else {
        // Insert new subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: userId,
            plan_name: plan.name,
            gigs_remaining,
            expiration_date
          })
        if (insertError) throw insertError
      }

      await fetchUsers()
    } catch (err: any) {
      setError('Failed to update subscription: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search input (name or email)
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (!loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow max-w-sm w-full">
          <h1 className="text-2xl mb-4 font-bold text-center">Admin Login</h1>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <input
            type="password"
            placeholder="Enter password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded"
            required
          />
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-green-600 font-semibold">
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}

      <input
        type="text"
        placeholder="Search users by name or email"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-6 px-4 py-2 border rounded"
      />

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Current Plan</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Gigs Remaining</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Expires On</th>
              <th className="border border-gray-300 px-4 py-2 text-left">Change Plan</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : filteredUsers.map(user => {
              const sub = user.subscriptions || null
              return (
                <tr key={user.user_id} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">{user.full_name}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{sub?.plan_name || 'Free'}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {sub?.gigs_remaining === -1 ? 'Unlimited' : sub?.gigs_remaining ?? 0}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {sub?.expiration_date ? new Date(sub.expiration_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={sub?.plan_name ? sub.plan_name.toLowerCase().replace(/\s/g, '_') : 'free'}
                      onChange={e => togglePlan(user.user_id, sub, e.target.value)}
                      className="p-1 rounded border border-gray-300"
                    >
                      <option value="free" disabled>
                        Select Plan
                      </option>
                      {Object.entries(PLANS).map(([key, val]) => (
                        <option key={key} value={key}>{val.name}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
