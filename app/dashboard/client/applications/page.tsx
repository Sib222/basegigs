'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Application {
id: number
gig_id: number
gig_seeker_id: string
status: string
applied_at: string
gigs: {
gig_name: string
gig_type: string
payment_amount: number
}
profiles: {
full_name: string
age: number
gender: string
city: string
province: string
phone_number: string
email: string
has_car: boolean
}
gig_seeker_profiles: {
background_story: string
gig_services: string[]
education_level: string
experience: string
years_of_experience: number
availability: string
expected_hourly_rate: number
languages: string[]
travel_distance: string
portfolio_url: string
photo_url: string
documents: string[]
}
}

export default function ClientApplicationsPage() {
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

if (profile?.user_type !== 'client' && profile?.user_type !== 'both') {
router.push('/dashboard/gig-seeker')
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
gig_seeker_id,
status,
applied_at,
gigs (
gig_name,
gig_type,
payment_amount
)
`)
.eq('client_id', userId)
.order('applied_at', { ascending: false })

if (error) throw error

const enrichedData = await Promise.all(
(data || []).map(async (app) => {
const { data: profile } = await supabase
.from('profiles')
.select('*')
.eq('user_id', app.gig_seeker_id)
.single()

const { data: seekerProfile } = await supabase
.from('gig_seeker_profiles')
.select('*')
.eq('user_id', app.gig_seeker_id)
.single()

return {
...app,
profiles: profile,
gig_seeker_profiles: seekerProfile
}
})
)

setApplications(enrichedData as any)
} catch (error: any) {
console.error('Error fetching applications:', error)
alert('Error loading applications: ' + error.message)
} finally {
setLoading(false)
}
}

const handleAccept = async (applicationId: number) => {
try {
const { error } = await supabase
.from('applications')
.update({ status: 'accepted' })
.eq('id', applicationId)

if (error) throw error

setApplications(applications.map(app =>
app.id === applicationId ? { ...app, status: 'accepted' } : app
))

alert('Application accepted! You can now chat with this gig seeker.')
} catch (error: any) {
console.error('Error accepting:', error)
alert('Failed to accept application: ' + error.message)
}
}

const handleDecline = async (applicationId: number) => {
if (!confirm('Are you sure you want to decline this application?')) return

try {
const { error } = await supabase
.from('applications')
.update({ status: 'declined' })
.eq('id', applicationId)

if (error) throw error

setApplications(applications.map(app =>
app.id === applicationId ? { ...app, status: 'declined' } : app
))

alert('Application declined.')
} catch (error: any) {
console.error('Error declining:', error)
alert('Failed to decline application: ' + error.message)
}
}

const getPhotoUrl = (photoUrl: string | null) => {
if (!photoUrl) return null
if (photoUrl.startsWith('http')) return photoUrl
const { data } = supabase.storage.from('profile-photos').getPublicUrl(photoUrl)
return data.publicUrl
}

const getDocumentUrl = (docPath: string) => {
if (docPath.startsWith('http')) return docPath
const { data } = supabase.storage.from('documents').getPublicUrl(docPath)
return data.publicUrl
}

const getDocumentName = (docPath: string) => {
const parts = docPath.split('/')
const filename = parts[parts.length - 1]
const cleanName = filename.replace(/^[a-f0-9-]+-/, '')
return cleanName
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
<Link href="/dashboard/client" className="flex items-center">
<span className="text-2xl font-bold text-primary">B</span>
<span className="ml-2 text-xl font-semibold">BaseGigs</span>
</Link>
<Link href="/dashboard/client" className="text-gray-700 hover:text-primary">
← Back to Dashboard
</Link>
</div>
</div>
</nav>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="bg-white rounded-lg shadow p-6 mb-6">
<h1 className="text-3xl font-bold text-gray-900 mb-2">Applications</h1>
<p className="text-gray-600">Review applications from gig seekers</p>
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
<p className="text-xl text-gray-600">No applications yet.</p>
<Link href="/dashboard/client" className="mt-4 inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600">
Go to Dashboard
</Link>
</div>
) : (
<div className="space-y-6">
{filteredApplications.map((app) => {
const photoUrl = getPhotoUrl(app.gig_seeker_profiles?.photo_url)
return (
<div key={app.id} className="bg-white rounded-lg shadow-md overflow-hidden">
{/* Header with Photo */}
<div className="flex items-start gap-4 p-6 bg-gray-50 border-b">
{photoUrl ? (
<img
src={photoUrl}
alt={app.profiles?.full_name}
className="w-20 h-20 rounded-full object-cover"
onError={(e) => {
e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(app.profiles?.full_name || 'User')}&size=200&background=10b981&color=fff&bold=true`
}}
/>
) : (
<div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-3xl">
👤
</div>
)}
<div className="flex-1">
<div className="text-sm text-gray-500 mb-1">Applied to: {app.gigs?.gig_name || 'Unknown Gig'}</div>
<h2 className="text-2xl font-bold text-gray-900">{app.profiles?.full_name || 'Unknown'}</h2>
<div className="text-sm text-gray-600 mt-1">
{app.profiles?.age} years old • {app.profiles?.gender} • {app.profiles?.city}, {app.profiles?.province}
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

<div className="p-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
<div>
<h3 className="font-semibold text-gray-900 mb-2">Contact:</h3>
<p className="text-gray-600">📞 {app.profiles?.phone_number}</p>
{app.profiles?.email && <p className="text-gray-600">📧 {app.profiles.email}</p>}
<p className="text-gray-600 mt-2">🚗 {app.profiles?.has_car ? 'Has a car' : 'No car'}</p>
</div>

<div>
<h3 className="font-semibold text-gray-900 mb-2">Professional Details:</h3>
<p className="text-gray-600">🎓 {app.gig_seeker_profiles?.education_level || 'Not specified'}</p>
<p className="text-gray-600">💼 {app.gig_seeker_profiles?.years_of_experience || 0} years experience</p>
<p className="text-gray-600">📅 {app.gig_seeker_profiles?.availability || 'Not specified'}</p>
{app.gig_seeker_profiles?.expected_hourly_rate && (
<p className="text-gray-600">💰 R{app.gig_seeker_profiles.expected_hourly_rate}/hour</p>
)}
</div>
</div>

{app.gig_seeker_profiles?.background_story && (
<div className="mb-4">
<h3 className="font-semibold text-gray-900 mb-2">About:</h3>
<p className="text-gray-600">{app.gig_seeker_profiles.background_story}</p>
</div>
)}

{app.gig_seeker_profiles?.experience && (
<div className="mb-4">
<h3 className="font-semibold text-gray-900 mb-2">Experience:</h3>
<p className="text-gray-600">{app.gig_seeker_profiles.experience}</p>
</div>
)}

{app.gig_seeker_profiles?.gig_services && app.gig_seeker_profiles.gig_services.length > 0 && (
<div className="mb-4">
<h3 className="font-semibold text-gray-900 mb-2">Services:</h3>
<div className="flex flex-wrap gap-2">
{app.gig_seeker_profiles.gig_services.map((service, idx) => (
<span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
{service}
</span>
))}
</div>
</div>
)}

{app.gig_seeker_profiles?.languages && app.gig_seeker_profiles.languages.length > 0 && (
<div className="mb-4">
<h3 className="font-semibold text-gray-900 mb-2">Languages:</h3>
<p className="text-gray-600">{app.gig_seeker_profiles.languages.join(', ')}</p>
</div>
)}

{app.gig_seeker_profiles?.travel_distance && (
<div className="mb-4">
<h3 className="font-semibold text-gray-900 mb-2">Travel:</h3>
<p className="text-gray-600">{app.gig_seeker_profiles.travel_distance}</p>
</div>
)}

{app.gig_seeker_profiles?.portfolio_url && (
<div className="mb-4">
<h3 className="font-semibold text-gray-900 mb-2">Portfolio:</h3>
<a href={app.gig_seeker_profiles.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
{app.gig_seeker_profiles.portfolio_url}
</a>
</div>
)}

{/* Supporting Documents Section */}
{app.gig_seeker_profiles?.documents && app.gig_seeker_profiles.documents.length > 0 && (
<div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
<h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
<span className="text-xl">📎</span>
Supporting Documents
</h3>
<div className="space-y-2">
{app.gig_seeker_profiles.documents.map((doc, idx) => (
<a
key={idx}
href={getDocumentUrl(doc)}
target="_blank"
rel="noopener noreferrer"
className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-gray-50 transition border border-blue-100"
>
<div className="flex items-center gap-3">
<span className="text-2xl">📄</span>
<span className="text-sm font-medium text-gray-700">{getDocumentName(doc)}</span>
</div>
<span className="text-blue-600 text-sm font-medium">View/Download →</span>
</a>
))}
</div>
</div>
)}

{app.status === 'pending' && (
<div className="flex space-x-4 pt-4 border-t">
<button
onClick={() => handleAccept(app.id)}
className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 font-semibold"
>
Accept Application
</button>
<button
onClick={() => handleDecline(app.id)}
className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold"
>
Decline
</button>
</div>
)}

{app.status === 'accepted' && (
<div className="pt-4 border-t">
<Link href={`/chat/${app.id}`} className="block w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold text-center">
Open Chat 💬
</Link>
</div>
)}

<div className="mt-4 text-xs text-gray-500">
Applied: {new Date(app.applied_at).toLocaleString()}
</div>
</div>
</div>
)
})}
</div>
)}
</div>
</div>
)
}
