'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface GigSeeker {
user_id: string
profiles: any
background_story: string | null
gig_services: string[] | null
education_level: string | null
experience: string | null
years_of_experience: number | null
availability: string | null
expected_hourly_rate: number | null
verified: boolean
photo_url: string | null
documents: string[] | null
languages: string | null
travel_distance: string | null
portfolio_url: string | null
}

export default function FindTalentPage() {
const [seekers, setSeekers] = useState<GigSeeker[]>([])
const [loading, setLoading] = useState(true)
const [currentUser, setCurrentUser] = useState<any>(null)
const [userType, setUserType] = useState<string | null>(null)
const [selectedSeeker, setSelectedSeeker] = useState<GigSeeker | null>(null)
const [showModal, setShowModal] = useState(false)
const [showInviteModal, setShowInviteModal] = useState(false)
const [clientGigs, setClientGigs] = useState<any[]>([])
const [inviting, setInviting] = useState(false)

const [searchTerm, setSearchTerm] = useState('')
const [selectedService, setSelectedService] = useState('All Services')
const [selectedProvince, setSelectedProvince] = useState('All Provinces')

const services = [
'All Services',
'Creative & Design Services',
'Media & Production',
'Live Events & Entertainment',
'Food & Culinary Services',
'Transportation & Logistics',
'Home & Maintenance Services',
'Digital & Technology Services',
'Education & Instruction',
'Health, Wellness & Personal Care',
'Business & Administrative Support',
'Construction & Building Trades',
'Carpentry, Woodcutting & Timber Work',
'Agriculture, Gardening & Land Care',
'Home Improvements & Renovations',
'Security & Access Control Services',
'Domestic & Household Support',
'Transport, Moving & Hauling',
'Mechanical & Technical Repairs',
'Informal Trade & Skilled Labor',
'Rural & Community Services'
]

const provinces = [
'All Provinces',
'Eastern Cape',
'Free State',
'Gauteng',
'KwaZulu-Natal',
'Limpopo',
'Mpumalanga',
'North West',
'Northern Cape',
'Western Cape'
]

useEffect(() => {
checkUser()
fetchSeekers()
}, [])

const checkUser = async () => {
const { data: { user } } = await supabase.auth.getUser()
if (user) {
setCurrentUser(user)
const { data: profile } = await supabase
.from('profiles')
.select('user_type')
.eq('user_id', user.id)
.single()
setUserType(profile?.user_type || null)
}
}

const fetchSeekers = async () => {
try {
const { data, error } = await supabase
.from('gig_seeker_profiles')
.select(`
user_id,
background_story,
gig_services,
education_level,
experience,
years_of_experience,
availability,
expected_hourly_rate,
verified,
photo_url,
documents,
languages,
travel_distance,
portfolio_url
`)
.eq('verified', true)
.order('user_id', { ascending: false })

if (error) throw error

const enrichedData = await Promise.all(
(data || []).map(async (seeker) => {
const { data: profile } = await supabase
.from('profiles')
.select('full_name, age, gender, city, province, has_car')
.eq('user_id', seeker.user_id)
.single()

return {
...seeker,
profiles: profile
}
})
)

setSeekers(enrichedData as any)
} catch (error) {
console.error('Error fetching seekers:', error)
} finally {
setLoading(false)
}
}

const filterSeekers = () => {
let filtered = seekers

if (searchTerm) {
filtered = filtered.filter(seeker =>
seeker.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
seeker.background_story?.toLowerCase().includes(searchTerm.toLowerCase()) ||
seeker.profiles?.city?.toLowerCase().includes(searchTerm.toLowerCase())
)
}

if (selectedService !== 'All Services') {
filtered = filtered.filter(seeker =>
seeker.gig_services?.includes(selectedService)
)
}

if (selectedProvince !== 'All Provinces') {
filtered = filtered.filter(seeker =>
seeker.profiles?.province === selectedProvince
)
}

return filtered
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

const openProfile = (seeker: GigSeeker) => {
setSelectedSeeker(seeker)
setShowModal(true)
}

const openInviteModal = async () => {
if (!currentUser) {
alert('Please log in to invite gig seekers')
return
}

try {
const { data, error } = await supabase
.from('gigs')
.select('*')
.eq('client_id', currentUser.id)
.eq('status', 'open')
.gt('expires_at', new Date().toISOString())
.order('created_at', { ascending: false })

if (error) throw error

if (!data || data.length === 0) {
alert('You have no active gigs. Please post a gig first!')
return
}

setClientGigs(data)
setShowInviteModal(true)
} catch (error: any) {
console.error('Error fetching gigs:', error)
alert('Failed to load your gigs: ' + error.message)
}
}

const handleInvite = async (gigId: number) => {
if (!selectedSeeker || !currentUser) return

setInviting(true)

try {
const { data: existing } = await supabase
.from('applications')
.select('id')
.eq('gig_id', gigId)
.eq('gig_seeker_id', selectedSeeker.user_id)
.single()

if (existing) {
alert('This gig seeker has already applied or been invited to this gig.')
setInviting(false)
return
}

const { error } = await supabase
.from('applications')
.insert({
gig_id: gigId,
gig_seeker_id: selectedSeeker.user_id,
client_id: currentUser.id,
status: 'pending'
})

if (error) throw error

alert(`Invitation sent to ${selectedSeeker.profiles?.full_name}! They'll be notified.`)
setShowInviteModal(false)
setShowModal(false)
} catch (error: any) {
console.error('Error inviting:', error)
alert('Failed to send invitation: ' + error.message)
} finally {
setInviting(false)
}
}

const isClient = userType === 'client' || userType === 'both'
const filteredSeekers = filterSeekers()

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="text-xl">Loading talent...</div>
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
{currentUser ? (
<>
<Link href={userType === 'client' ? '/dashboard/client' : userType === 'both' ? '/dashboard/both' : '/dashboard/gig-seeker'} className="text-gray-700 hover:text-primary">
Dashboard
</Link>
<Link href="/browse-gigs" className="text-gray-700 hover:text-primary">Browse Gigs</Link>
</>
) : (
<>
<Link href="/login" className="text-gray-700 hover:text-primary">Login</Link>
<Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600">Sign Up</Link>
</>
)}
</div>
</div>
</div>
</nav>

<div className="bg-white border-b">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<h1 className="text-3xl font-bold text-gray-900 mb-2">Find Talent</h1>
<p className="text-gray-600">Browse {seekers.length} verified gig seekers</p>
</div>
</div>

<div className="bg-white border-b">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<input
type="text"
placeholder="Search by name or location..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
<select
value={selectedService}
onChange={(e) => setSelectedService(e.target.value)}
className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
{services.map(service => (
<option key={service} value={service}>{service}</option>
))}
</select>
<select
value={selectedProvince}
onChange={(e) => setSelectedProvince(e.target.value)}
className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
{provinces.map(province => (
<option key={province} value={province}>{province}</option>
))}
</select>
</div>
</div>
</div>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
{filteredSeekers.length === 0 ? (
<div className="text-center py-12">
<p className="text-xl text-gray-600">No gig seekers found matching your filters.</p>
</div>
) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
{filteredSeekers.map((seeker) => {
const photoUrl = getPhotoUrl(seeker.photo_url)
return (
<div key={seeker.user_id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
<div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200">
{photoUrl ? (
<img
src={photoUrl}
alt={seeker.profiles?.full_name || 'Profile'}
className="w-full h-full object-cover"
onError={(e) => {
e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(seeker.profiles?.full_name || 'User')}&size=400&background=10b981&color=fff&bold=true`
}}
/>
) : (
<div className="w-full h-full flex items-center justify-center">
<div className="text-6xl text-green-600">👤</div>
</div>
)}
{seeker.verified && (
<span className="absolute top-3 right-3 px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-lg">
✓ Verified
</span>
)}
</div>

<div className="p-6">
<div className="mb-4">
<h3 className="text-xl font-bold text-gray-900 mb-1">
{seeker.profiles?.full_name || 'Anonymous'}
</h3>
<div className="text-sm text-gray-600">
{seeker.profiles?.age} years • {seeker.profiles?.gender}
</div>
<div className="text-sm text-gray-600">
📍 {seeker.profiles?.city}, {seeker.profiles?.province}
</div>
</div>

{seeker.background_story && (
<p className="text-gray-700 text-sm mb-4 line-clamp-3">
{seeker.background_story}
</p>
)}

<div className="mb-4">
<div className="text-sm font-semibold text-gray-900 mb-2">Services:</div>
<div className="flex flex-wrap gap-1">
{seeker.gig_services?.slice(0, 3).map((service, idx) => (
<span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
{service}
</span>
))}
{(seeker.gig_services?.length || 0) > 3 && (
<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
+{(seeker.gig_services?.length || 0) - 3} more
</span>
)}
</div>
</div>

<div className="text-sm text-gray-600 mb-4 space-y-1">
<div>🎓 {seeker.education_level || 'Not specified'}</div>
<div>💼 {seeker.years_of_experience || 0} years experience</div>
<div>📅 {seeker.availability || 'Not specified'}</div>
{seeker.expected_hourly_rate && (
<div>💰 R{seeker.expected_hourly_rate}/hour</div>
)}
<div>🚗 {seeker.profiles?.has_car ? 'Has a car' : 'No car'}</div>
</div>

{isClient ? (
<button
onClick={() => openProfile(seeker)}
className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 font-semibold"
>
View Full Profile
</button>
) : (
<div className="text-center text-sm text-gray-500 italic py-2">
{currentUser ? 'Upgrade to Client to view' : 'Login as Client to view'}
</div>
)}
</div>
</div>
)
})}
</div>
)}
</div>

{/* Full Profile Modal */}
{showModal && selectedSeeker && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
<div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
<h2 className="text-2xl font-bold">Full Profile</h2>
<button
onClick={() => setShowModal(false)}
className="text-gray-500 hover:text-gray-700 text-2xl"
>
×
</button>
</div>

<div className="p-6">
<div className="flex items-start gap-6 mb-6">
<div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-green-200 flex-shrink-0">
{getPhotoUrl(selectedSeeker.photo_url) ? (
<img
src={getPhotoUrl(selectedSeeker.photo_url)!}
alt={selectedSeeker.profiles?.full_name || 'Profile'}
className="w-full h-full object-cover"
/>
) : (
<div className="w-full h-full flex items-center justify-center text-4xl text-green-600">
👤
</div>
)}
</div>
<div className="flex-1">
<h3 className="text-2xl font-bold mb-2">{selectedSeeker.profiles?.full_name}</h3>
<div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
<div>📧 Age: {selectedSeeker.profiles?.age}</div>
<div>🚻 Gender: {selectedSeeker.profiles?.gender}</div>
<div>📍 Location: {selectedSeeker.profiles?.city}, {selectedSeeker.profiles?.province}</div>
<div>🚗 Car: {selectedSeeker.profiles?.has_car ? 'Yes' : 'No'}</div>
{selectedSeeker.languages && <div>🗣️ Languages: {selectedSeeker.languages}</div>}
{selectedSeeker.travel_distance && <div>🚶 Travel: {selectedSeeker.travel_distance}</div>}
</div>
</div>
</div>

{selectedSeeker.background_story && (
<div className="mb-6">
<h4 className="text-lg font-bold mb-2">About Me</h4>
<p className="text-gray-700 whitespace-pre-wrap">{selectedSeeker.background_story}</p>
</div>
)}

<div className="mb-6">
<h4 className="text-lg font-bold mb-2">Services Offered</h4>
<div className="flex flex-wrap gap-2">
{selectedSeeker.gig_services?.map((service, idx) => (
<span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
{service}
</span>
))}
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
<div>
<h4 className="text-lg font-bold mb-2">Experience</h4>
<div className="bg-gray-50 p-4 rounded-lg">
<p className="text-sm text-gray-600 mb-2">
<strong>Level:</strong> {selectedSeeker.experience || 'Not specified'}
</p>
<p className="text-sm text-gray-600">
<strong>Years:</strong> {selectedSeeker.years_of_experience || 0} years
</p>
</div>
</div>
<div>
<h4 className="text-lg font-bold mb-2">Education</h4>
<div className="bg-gray-50 p-4 rounded-lg">
<p className="text-sm text-gray-600">
{selectedSeeker.education_level || 'Not specified'}
</p>
</div>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
<div>
<h4 className="text-lg font-bold mb-2">Availability</h4>
<div className="bg-gray-50 p-4 rounded-lg">
<p className="text-sm text-gray-600">{selectedSeeker.availability || 'Not specified'}</p>
</div>
</div>
{selectedSeeker.expected_hourly_rate && (
<div>
<h4 className="text-lg font-bold mb-2">Expected Rate</h4>
<div className="bg-gray-50 p-4 rounded-lg">
<p className="text-sm text-gray-600">R{selectedSeeker.expected_hourly_rate}/hour</p>
</div>
</div>
)}
</div>

{selectedSeeker.portfolio_url && (
<div className="mb-6">
<h4 className="text-lg font-bold mb-2">Portfolio</h4>
<a
href={selectedSeeker.portfolio_url}
target="_blank"
rel="noopener noreferrer"
className="text-blue-600 hover:underline"
>
{selectedSeeker.portfolio_url}
</a>
</div>
)}

{selectedSeeker.documents && selectedSeeker.documents.length > 0 && (
<div className="mb-6">
<h4 className="text-lg font-bold mb-2">Supporting Documents</h4>
<div className="space-y-2">
{selectedSeeker.documents.map((doc, idx) => (
<a
key={idx}
href={getDocumentUrl(doc)}
target="_blank"
rel="noopener noreferrer"
className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
>
<div className="flex items-center gap-2">
<span className="text-2xl">📄</span>
<span className="text-sm font-medium">{getDocumentName(doc)}</span>
</div>
<span className="text-blue-600 text-sm">Download →</span>
</a>
))}
</div>
</div>
)}

<div className="flex gap-3 pt-4 border-t">
<button
onClick={() => setShowModal(false)}
className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
>
Close
</button>
<button
onClick={openInviteModal}
className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
>
📨 Invite to Apply
</button>
</div>
</div>
</div>
</div>
)}

{/* Invite Modal */}
{showInviteModal && selectedSeeker && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
<div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
<div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
<h2 className="text-2xl font-bold">Invite to Your Gig</h2>
<button
onClick={() => setShowInviteModal(false)}
className="text-gray-500 hover:text-gray-700 text-2xl"
>
×
</button>
</div>

<div className="p-6">
<p className="text-gray-600 mb-6">
Select which gig you'd like to invite <strong>{selectedSeeker.profiles?.full_name}</strong> to apply for:
</p>

<div className="space-y-4">
{clientGigs.map((gig) => (
<div key={gig.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
<div className="flex justify-between items-start mb-2">
<div className="flex-1">
<h3 className="font-bold text-lg">{gig.gig_name}</h3>
<p className="text-sm text-gray-600">{gig.gig_type}</p>
<p className="text-sm text-gray-600">📍 {gig.city}, {gig.province}</p>
<p className="text-green-600 font-semibold mt-2">R{gig.payment_amount?.toLocaleString()} ({gig.payment_type})</p>
</div>
<button
onClick={() => handleInvite(gig.id)}
disabled={inviting}
className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
>
{inviting ? 'Inviting...' : 'Send Invite'}
</button>
</div>
</div>
))}
</div>
</div>
</div>
</div>
)}
</div>
)
}
