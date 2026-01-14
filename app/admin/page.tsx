'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PLANS = {
  pay_per_gig: { name: 'Pay-per-Gig', gigs: 1 },
  starter: { name: 'Starter', gigs: 5 },
  professional: { name: 'Professional', gigs: Infinity },
}

export default function AdminPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  const ADMIN_PASSWORD = 'Simelane1*'

  // Login handler
  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true)
      fetchClients()
    } else {
      alert('Incorrect password')
    }
  }

  // Fetch clients + their subscriptions (left join)
  const fetchClients = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select(`
          user_id,
          full_name,
          email,
          subscriptions:subscriptions (
            plan_name,
            gig_posts_left,
            activated_at,
            expires_at
          )
        `)

      if (error) throw error

      // data is array of client_profiles with nested subscriptions array (maybe empty)
      // We'll normalize to one subscription (assuming one per user)
      const clientsWithSub = data?.map((client: any) => {
        const sub = client.subscriptions?.[0] || null
        return {
          user_id: client.user_id,
          full_name: client.full_name,
          email: client.email,
          subscription: sub,
        }
      }) || []

      setClients(clientsWithSub)
    } catch (error) {
      console.error('Error fetching clients:', error)
      alert('Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }

  // Calculates days left from now to expiration date
  const calculateDaysLeft = (expiresAt: string | null) => {
    if (!expiresAt) return 'N/A'
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Handles toggling subscription plan for a user
  const handlePlanChange = async (userId: string, newPlanKey: string | null) => {
    setLoading(true)

    try {
      if (!newPlanKey) {
        // Clear subscription for user (delete subscription row)
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', userId)

        if (error) throw error
      } else {
        // Upsert subscription row for user with selected plan
        const plan = PLANS[newPlanKey]
        if (!plan) throw new Error('Invalid plan')

        const activatedAt = new Date().toISOString()
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        const gigPostsLeft = plan.gigs === Infinity ? 99999 : plan.gigs // large number for unlimited

        // Check if subscription exists
        const { data: existingSub, error: selectError } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (selectError && selectError.code !== 'PGRST116') throw selectError

        if (existingSub) {
          // update
          const { error: updateError } = await supabase
            .from('subscriptions')
            .update({
              plan_name: plan.name,
              gig_posts_left: gigPostsLeft,
              activated_at: activatedAt,
              expires_at: expiresAt,
            })
            .eq('user_id', userId)

          if (updateError) throw updateError
        } else {
          // insert
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: userId,
              plan_name: plan.name,
              gig_posts_left: gigPostsLeft,
              activated_at: activatedAt,
              expires_at: expiresAt,
            })

          if (insertError) throw insertError
        }
      }

      await fetchClients()
    } catch (error: any) {
      console.error('Error updating subscription:', error)
      alert('Failed to update subscription: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter clients based on search term by name/email
  const filteredClients = clients.filter(client => {
    const term = searchTerm.toLowerCase()
    return (
      client.full_name.toLowerCase().includes(term) ||
      client.email.toLowerCase().includes(term)
    )
  })

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-md shadow-md p-8 max-w-sm w-full">
          <h1 className="text-2xl font-bold mb-4 text-center">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter admin password"
            className="w-full px-4 py-2 border border-gray-300 rounded mb-4 focus:outline-primary"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleLogin()
            }}
          />
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-white py-2 rounded hover:bg-green-600 font-semibold"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Admin Dashboard</h1>
        <input
          type="search"
          placeholder="Search clients by name or email"
          className="px-4 py-2 border border-gray-300 rounded w-full max-w-xs focus:outline-primary"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </header>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Loading...</div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center text-gray-600">No clients found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse border border-gray-300 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Current Plan</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Gigs Left</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Days Left</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Change Plan</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map(client => {
                const { subscription } = client
                const currentPlan = subscription?.plan_name || 'No subscription'
                const gigsLeft = subscription?.gig_posts_left ?? 0
                const daysLeft = subscription?.expires_at ? calculateDaysLeft(subscription.expires_at) : 'N/A'

                return (
                  <tr key={client.user_id} className="even:bg-white odd:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{client.full_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{client.email}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                      {currentPlan}
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{gigsLeft}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{daysLeft}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                      {/* Buttons for each plan */}
                      {Object.entries(PLANS).map(([key, plan]) => {
                        const isActive =
                          subscription && subscription.plan_name === plan.name
                        return (
                          <button
                            key={key}
                            onClick={() => handlePlanChange(client.user_id, key)}
                            disabled={loading}
                            className={`px-3 py-1 rounded border font-semibold ${
                              isActive
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {plan.name}
                          </button>
                        )
                      })}

                      {/* Button to clear plan */}
                      <button
                        onClick={() => handlePlanChange(client.user_id, null)}
                        disabled={loading}
                        className="px-3 py-1 rounded border border-red-500 text-red-600 font-semibold hover:bg-red-100"
                        title="Clear subscription"
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
      )}
    </div>
  )
}
