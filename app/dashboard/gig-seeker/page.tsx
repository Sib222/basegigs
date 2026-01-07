'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function GigSeekerDashboard() {
const router = useRouter()
const [loading, setLoading] = useState(true)
const [profile, setProfile] = useState<any>(null)
const [error, setError] = useState('')

useEffect(() => {
checkUser()
}, [])

const checkUser = async () => {
try {
const { data: { user }, error: userError } = await supabase.auth.getUser()

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
<Link href="/my-contracts" className="px-4 py-2 text-gray-700 hover:text-primary font-medium">📄 My Contracts</Link>
<span className="text-gray-700">Welcome, {profile?.full_name}</span>
<button onClick={handleLogout} className="px-4 py-2 text-gray-700 hover:text-primary">
Logout
</button>
</div>
</div>
</div>
</nav>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="bg-white rounded-lg shadow p-6 mb-6">
<h1 className="text-3xl font-bold text-gray-900 mb-2">Gig Seeker Dashboard</h1>
<p className="text-gray-600">Find and apply for gigs that match your skills</p>
</div>

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
<div className="flex justify-between items-center mb-6">
<h2 className="text-2xl font-bold">Quick Actions</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<Link href="/my-contracts" className="p-6 border-2 border-blue-500 bg-blue-50 rounded-lg hover:bg-blue-100 text-center">
<div className="text-3xl mb-2">📄</div>
<h3 className="text-xl font-semibold text-blue-700 mb-2">My Contracts</h3>
<p className="text-gray-600">View and sign contracts</p>
</Link>
<Link href="/browse-gigs" className="p-6 border-2 border-primary rounded-lg hover:bg-green-50 text-center">
<h3 className="text-xl font-semibold text-primary mb-2">Browse Gigs</h3>
<p className="text-gray-600">Find and apply for available gigs</p>
</Link>
<Link href="/dashboard/gig-seeker/profile" className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-center">
<h3 className="text-xl font-semibold mb-2">Edit Profile</h3>
<p className="text-gray-600">Update your skills and experience</p>
</Link>
<Link href="/dashboard/gig-seeker/applications" className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-center">
<h3 className="text-xl font-semibold mb-2">My Applications</h3>
<p className="text-gray-600">View all your gig applications</p>
</Link>
<Link href="/how-it-works" className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-center">
<h3 className="text-xl font-semibold mb-2">How It Works</h3>
<p className="text-gray-600">Learn how to maximize your success</p>
</Link>
</div>
</div>

<div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
<h3 className="text-lg font-semibold text-green-900 mb-2">💚 BaseGigs is 100% Free for Gig Seekers!</h3>
<p className="text-green-800">
Apply to unlimited gigs, chat with clients, and sign contracts at no cost.
We&apos;re here to help you find opportunities!
</p>
</div>

<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
<h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Dashboard Under Construction</h3>
<p className="text-blue-800">
We&apos;re building out the full dashboard features. For now, you can browse and apply to gigs.
Application tracking coming soon!
</p>
</div>
</div>
</div>
)
}
