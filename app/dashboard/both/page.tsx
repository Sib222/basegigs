'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BothDashboard() {
const router = useRouter()
const [loading, setLoading] = useState(true)
const [profile, setProfile] = useState<any>(null)
const [activeView, setActiveView] = useState<'client' | 'seeker'>('client')
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
const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
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

const handleLogout = async () => {
await supabase.auth.signOut()
router.push('/')
}

if (loading) {
return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading...</div></div>
}

if (error) {
return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><div className="text-xl text-red-600 mb-4">Error: {error}</div><button onClick={() => router.push('/login')} className="px-4 py-2 bg-primary text-white rounded-lg">Back to Login</button></div></div>
}

return (
<div className="min-h-screen bg-gray-50">
<nav className="bg-white shadow-sm">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<Link href="/" className="flex items-center"><span className="text-2xl font-bold text-primary">B</span><span className="ml-2 text-xl font-semibold">BaseGigs</span></Link>
<div className="flex items-center space-x-4">
<span className="text-gray-700">Welcome, {profile?.full_name}</span>
<button onClick={handleLogout} className="px-4 py-2 text-gray-700 hover:text-primary">Logout</button>
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
<button onClick={() => setActiveView('client')} className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activeView === 'client' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Client View</button>
<button onClick={() => setActiveView('seeker')} className={`px-6 py-2 rounded-lg font-semibold transition-colors ${activeView === 'seeker' ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>Gig Seeker View</button>
</div>
{activeView === 'client' && (
<div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-2">Active Gigs</h3><p className="text-3xl font-bold text-primary">0</p></div>
<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-2">Total Applications</h3><p className="text-3xl font-bold text-primary">0</p></div>
<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-2">Hired Seekers</h3><p className="text-3xl font-bold text-primary">0</p></div>
</div>
<div className="bg-white rounded-lg shadow p-6">
<h2 className="text-2xl font-bold mb-6">Client Actions</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Link href="/post-gig" className="p-6 border-2 border-primary rounded-lg hover:bg-green-50 text-center"><h3 className="text-xl font-semibold text-primary mb-2">Post a Gig</h3><p className="text-gray-600">Create a new gig listing</p></Link>
<Link href="/find-talent" className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-center"><h3 className="text-xl font-semibold mb-2">Find Talent</h3><p className="text-gray-600">Browse verified gig seekers</p></Link>
</div>
</div>
</div>
)}
{activeView === 'seeker' && (
<div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-2">Applications Pending</h3><p className="text-3xl font-bold text-primary">0</p></div>
<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-2">Accepted Applications</h3><p className="text-3xl font-bold text-primary">0</p></div>
<div className="bg-white rounded-lg shadow p-6"><h3 className="text-lg font-semibold mb-2">Completed Gigs</h3><p className="text-3xl font-bold text-primary">0</p></div>
</div>
<div className="bg-white rounded-lg shadow p-6">
<h2 className="text-2xl font-bold mb-6">Gig Seeker Actions</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<Link href="/browse-gigs" className="p-6 border-2 border-primary rounded-lg hover:bg-green-50 text-center"><h3 className="text-xl font-semibold text-primary mb-2">Browse Gigs</h3><p className="text-gray-600">Find and apply for gigs</p></Link>
<Link href="/dashboard/gig-seeker/profile" className="p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 text-center"><h3 className="text-xl font-semibold mb-2">Edit Profile</h3><p className="text-gray-600">Update your skills</p></Link>
</div>
</div>
</div>
)}
<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
<h3 className="text-lg font-semibold text-blue-900 mb-2">🚧 Dashboard Under Construction</h3>
<p className="text-blue-800">Full dashboard features are being built. You can browse gigs and find talent now. More functionality coming soon!</p>
</div>
</div>
</div>
)
}
