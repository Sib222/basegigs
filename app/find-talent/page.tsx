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
}

export default function FindTalentPage() {
const [seekers, setSeekers] = useState<GigSeeker[]>([])
const [loading, setLoading] = useState(true)
const [currentUser, setCurrentUser] = useState<any>(null)
const [userType, setUserType] = useState<string | null>(null)

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
photo_url
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
// If it's already a full URL, return it
if (photoUrl.startsWith('http')) return photoUrl
// If it's a storage path, construct the public URL
const { data } = supabase.storage.from('profile-photos').getPublicUrl(photoUrl)
return data.publicUrl
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
{/* Profile Photo */}
<div className="relative h-48 bg-gradient-to-br from-green-100 to-green-200">
{photoUrl ? (
<img
src={photoUrl}
alt={seeker.profiles?.full_name || 'Profile'}
className="w-full h-full object-cover"
onError={(e) => {
// Fallback to placeholder if image fails to load
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

{/* Profile Info */}
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
<button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 font-semibold">
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
</div>
)
}
