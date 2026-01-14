'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type PlanKey = 'pay_per_gig' | 'starter' | 'professional'

const PLANS = {
  pay_per_gig: { name: 'Pay-per-Gig', gigs: 1 },
  starter: { name: 'Starter', gigs: 5 },
  professional: { name: 'Professional', gigs: Infinity },
}

function daysLeft(expiresAt: string | null) {
  if (!expiresAt) return 0
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : 0
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch clients with their subscription info
  const fetchClients = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('client_profiles')
        .select(
          `
            user_id,
            full_name,
            email,
            subscriptions (
              plan_name,
              gig_posts_left,
              activated_at,
              expires_at
            )
          `
        )
        .order('full_name')

      if (error) throw error

      setClients(data || [])
    } catch (error) {
      alert('Failed to fetch clients')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authenticated) {
      fetchClients()
    }
  }, [authenticated])

  const handleLogin = () => {
    if (password === 'Simelane1*') {
      setAuthenticated(true)
    } else {
      alert('Incorrect password')
    }
  }

  // Handle plan toggle
  const handlePlanChange = async (userId: string, newPlanKey: string) => {
    setLoading(true)
    try {
      if (!newPlanKey) {
        // Clear subscription
        const { error } = await supabase
          .from('subscriptions')
          .delete()
          .eq('user_id', userId)
        if (error) throw error
      } else {
        // Upsert subscription row for user with selected plan
        const plan = PLANS[newPlanKey as keyof typeof PLANS]
        if (!plan) throw new Error('Invalid plan')

        const activatedAt = new Date().toISOString()
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        const gigsLeft = plan.gigs === Infinity ? 9999 : plan.gigs

        // Upsert: update if exists, insert if not
        const { error } = await supabase
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              plan_name: plan.name,
              gig_posts_left: gigsLeft,
              activated_at: activatedAt,
              expires_at: expiresAt,
            },
            { onConflict: 'user_id' }
          )
        if (error) throw error
      }
      await fetchClients()
    } catch (error: any) {
      alert('Failed to update plan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded shadow-md w-80">
          <h1 className="text-2xl font-semibold mb-4">Admin Login</h1>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-4"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-primary text-white py-2 rounded hover:bg-green-600"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard - Client Subscriptions</h1>

      <input
        type="text"
        placeholder="Search clients by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-6 p-3 border border-gray-300 rounded w-full max-w-md"
      />

      {loading ? (
        <p>Loading clients...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg">
            <thead>
              <tr className="bg-primary text-white">
                <th className="py-3 px-6 text-left">Client Name</th>
                <th className="py-3 px-6 text-left">Email</th>
                <th className="py-3 px-6 text-center">Current Plan</th>
                <th className="py-3 px-6 text-center">Gig Posts Left</th>
                <th className="py-3 px-6 text-center">Days Left</th>
                <th className="py-3 px-6 text-center">Change Plan</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No clients found.
                  </td>
                </tr>
              )}
              {filteredClients.map((client) => {
                const sub = client.subscriptions?.[0] || null
                const currentPlanName = sub?.plan_name || 'No Subscription'
                const gigsLeft = sub?.gig_posts_left ?? 0
                const daysRemaining = sub?.expires_at ? daysLeft(sub.expires_at) : 0

                return (
                  <tr key={client.user_id} className="border-b">
                    <td className="py-3 px-6">{client.full_name}</td>
                    <td className="py-3 px-6">{client.email}</td>
                    <td className="py-3 px-6 text-center font-semibold">
                      {currentPlanName}
                    </td>
                    <td className="py-3 px-6 text-center">{gigsLeft}</td>
                    <td className="py-3 px-6 text-center">{daysRemaining}</td>
                    <td className="py-3 px-6 text-center space-x-2">
                      {Object.entries(PLANS).map(([key, plan]) => {
                        const isSelected = currentPlanName === plan.name
                        return (
                          <button
                            key={key}
                            disabled={loading}
                            onClick={() => handlePlanChange(client.user_id, isSelected ? '' : key)}
                            className={`px-3 py-1 rounded border ${
                              isSelected
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                            }`}
                          >
                            {plan.name}
                          </button>
                        )
                      })}
                      {/* Button to clear subscription */}
                      <button
                        disabled={loading}
                        onClick={() => handlePlanChange(client.user_id, '')}
                        className="px-3 py-1 rounded border border-red-500 text-red-500 hover:bg-red-100"
                      >
                        Clear Plan
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
