'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Application {
id: number
gig_id: number
status: string
applied_at: string
gigs: {
gig_name: string
gig_type: string
city: string
province: string
payment_amount: number
payment_type: string
client_name: string
}
}

export default function GigSeekerApplicationsPage() {
const router = useRouter()
const [applications, setApplications] = useState<Application[]>([])
const [loading, setLoading] = useState(true)
const [currentUser, setCurrentUser] = useState<any>(null)
const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all')

useEffect(() => {
checkUserAndFetch()
}, [])

const checkUserAndFetch = async () => {
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
router.push('/login')
return
}

const { data: profile } = await supabase
.from('profiles')
.select('user_type')
.eq('user_id', user.id)
.single()

if (profile?.user_type !== 'gig_seeker' && profile?.user_type !== 'both') {
router.push('/dashboard/client')
return
}

setCurrentUser(user)
await fetchApplications(user.id)
}

const fetchApplications = async (userId: string) => {
try {
const { data, error } = await supabase
.from('applications')
.select(`
id,
gig_id,
status,
applied_at,
gigs (
gig_name,
gig_type,
city,
province,
payment_amount,
payment_type,
client_name
)
`)
.eq('gig_seeker_id', userId)
.order('applied_at', { ascending: false })

if (error) throw error
setApplications((data as any) || [])
} catch (error: any) {
console.error('Error fetching applications:', error)
alert('Error loading applications: ' + error.message)
} finally {
setLoading(false)
}
}

const filteredApplications = filter === 'all'
? applications
: applications.filter(app => app.status === filter)

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="text-xl">Loading applications...</div>
</div>
)
}

return (
<div className="min-h-screen bg-gray-50">
<nav className="bg-white shadow-sm">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<Link href="/dashboard/gig-seeker" className="flex items-center">
<span className="text-2xl font-bold text-primary">B</span>
<span className="ml-2 text-xl font-semibold">BaseGigs</span>
</Link>
<Link href="/dashboard/gig-seeker" className="text-gray-700 hover:text-primary">
← Back to Dashboard
</Link>
</div>
</div>
</nav>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="bg-white rounded-lg shadow p-6 mb-6">
<h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
<p className="text-gray-600">Track your gig applications and their status</p>
</div>

<div className="bg-white rounded-lg shadow p-4 mb-6">
<div className="flex space-x-4">
<button
onClick={() => setFilter('all')}
className={`px-4 py-2 rounded-lg font-semibold ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
>
All ({applications.length})
</button>
<button
onClick={() => setFilter('pending')}
className={`px-4 py-2 rounded-lg font-semibold ${filter === 'pending' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
>
Pending ({applications.filter(a => a.status === 'pending').length})
</button>
<button
onClick={() => setFilter('accepted')}
className={`px-4 py-2 rounded-lg font-semibold ${filter === 'accepted' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
>
Accepted ({applications.filter(a => a.status === 'accepted').length})
</button>
<button
onClick={() => setFilter('declined')}
className={`px-4 py-2 rounded-lg font-semibold ${filter === 'declined' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
>
Declined ({applications.filter(a => a.status === 'declined').length})
</button>
</div>
</div>

{filteredApplications.length === 0 ? (
<div className="bg-white rounded-lg shadow p-12 text-center">
<p className="text-xl text-gray-600 mb-4">No applications yet.</p>
<Link href="/browse-gigs" className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600">
Browse Gigs
</Link>
</div>
) : (
<div className="space-y-4">
{filteredApplications.map((app) => (
<div key={app.id} className="bg-white rounded-lg shadow-md p-6">
<div className="flex justify-between items-start mb-4">
<div className="flex-1">
<div className="text-sm text-gray-500 mb-1">{app.gigs?.gig_type}</div>
<h2 className="text-2xl font-bold text-gray-900 mb-2">{app.gigs?.gig_name || 'Unknown Gig'}</h2>
<div className="text-sm text-gray-600">
📍 {app.gigs?.city}, {app.gigs?.province}
</div>
<div className="text-sm text-gray-600 mt-1">
Posted by: {app.gigs?.client_name}
</div>
</div>
<div className={`px-4 py-2 rounded-full text-sm font-semibold ${
app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
app.status === 'accepted' ? 'bg-green-100 text-green-800' :
'bg-red-100 text-red-800'
}`}>
{app.status.charAt(0).toUpperCase() + app.status.slice(1)}
</div>
</div>

<div className="flex justify-between items-center pt-4 border-t">
<div className="text-lg font-bold text-primary">
R{app.gigs?.payment_amount?.toLocaleString()} ({app.gigs?.payment_type})
</div>
<div className="text-sm text-gray-500">
Applied: {new Date(app.applied_at).toLocaleDateString()}
</div>
</div>

{app.status === 'accepted' && (
<div className="mt-4 pt-4 border-t">
<Link href={`/chat/${app.id}`} className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-center">
Open Chat 💬
</Link>
</div>
)}

{app.status === 'pending' && (
<div className="mt-4 pt-4 border-t bg-yellow-50 p-4 rounded">
<p className="text-sm text-yellow-800">
⏳ Your application is being reviewed by the client. You&apos;ll be notified once they make a decision.
</p>
</div>
)}

{app.status === 'declined' && (
<div className="mt-4 pt-4 border-t bg-red-50 p-4 rounded">
<p className="text-sm text-red-800">
❌ This application was declined. Keep applying to other gigs!
</p>
</div>
)}
</div>
))}
</div>
)}
</div>
</div>
)
}
