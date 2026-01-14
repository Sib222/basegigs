'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PASSWORD = 'Simelane1*'

type ClientRow = {
  user_id: string
  full_name: string
  email: string
}

const PLANS = {
  none: {
    name: null,
    gig_posts_left: null
  },
  pay_per_gig: {
    name: 'Pay-Per-Gig',
    gig_posts_left: 1
  },
  starter: {
    name: 'Starter',
    gig_posts_left: 5
  },
  professional: {
    name: 'Professional',
    gig_posts_left: null // unlimited
  }
} as const

type PlanKey = keyof typeof PLANS

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [clients, setClients] = useState<ClientRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true)
      loadClients()
    } else {
      alert('Wrong password')
    }
  }

  const loadClients = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('client_profiles')
      .select(`
        user_id,
        profiles (
          full_name,
          email
        )
      `)

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    const mapped: ClientRow[] =
      data?.map((row: any) => ({
        user_id: row.user_id,
        full_name: row.profiles.full_name,
        email: row.profiles.email
      })) || []

    setClients(mapped)
    setLoading(false)
  }

  const applyPlan = async (userId: string, planKey: PlanKey) => {
    const plan = PLANS[planKey]

    const activatedAt = plan.name ? new Date() : null
    const expiresAt = plan.name
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : null

    // delete existing subscription first (clean reset)
    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', userId)

    // if "none", stop here
    if (!plan.name) {
      alert('Plan cleared')
      return
    }

    const { error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_name: plan.name,
        gig_posts_left: plan.gig_posts_left,
        activated_at: activatedAt,
        expires_at: expiresAt
      })

    if (error) {
      alert(error.message)
    } else {
      alert('Plan activated')
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded shadow w-80">
          <h1 className="text-xl font-bold mb-4">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-4"
            placeholder="Admin password"
          />
          <button
            onClick={login}
            className="w-full bg-black text-white py-2 rounded"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Admin – Client Subscriptions</h1>

      {loading && <p>Loading clients...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="space-y-4">
        {clients.map(client => (
          <div
            key={client.user_id}
            className="bg-white border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <p className="font-semibold">{client.full_name}</p>
              <p className="text-sm text-gray-600">{client.email}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPlan(client.user_id, 'pay_per_gig')}
                className="px-3 py-1 border rounded"
              >
                Pay-Per-Gig
              </button>

              <button
                onClick={() => applyPlan(client.user_id, 'starter')}
                className="px-3 py-1 border rounded"
              >
                Starter
              </button>

              <button
                onClick={() => applyPlan(client.user_id, 'professional')}
                className="px-3 py-1 border rounded"
              >
                Professional
              </button>

              <button
                onClick={() => applyPlan(client.user_id, 'none')}
                className="px-3 py-1 border border-red-400 text-red-600 rounded"
              >
                Clear Plan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
