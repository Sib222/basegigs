'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Gig {
id: number
client_id: string
client_name: string
gig_name: string
gig_type: string
city: string
province: string
explanation: string
requirements: string
payment_amount: number
payment_type: string
skills: string[]
deadline: string
status: string
applicant_count: number
created_at: string
expires_at: string
}

export default function BrowseGigsPage() {
const [gigs, setGigs] = useState<Gig[]>([])
const [loading, setLoading] = useState(true)
const [currentUser, setCurrentUser] = useState<any>(null)
const [userType, setUserType] = useState<string | null>(null)
const [appliedGigs, setAppliedGigs] = useState<number[]>([])
const [applyingTo, setApplyingTo] = useState<number | null>(null)

const [searchTerm, setSearchTerm] = useState('')
const [selectedType, setSelectedType] = useState('All Types')
const [selectedProvince, setSelectedProvince] = useState('All Provinces')
const [selectedBudget, setSelectedBudget] = useState('Any Budget')

const gigTypes = [
'All Types',
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
'Rural & Community Services',
'Photography & Media'
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

const budgetRanges = [
'Any Budget',
'R0 - R1,000',
'R1,000 - R3,000',
'R3,000 - R5,000',
'R5,000+'
]

useEffect(() => {
checkUser()
fetchGigs()
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

// Fetch user's existing applications
const { data: applications } = await supabase
.from('applications')
.select('gig_id')
.eq('gig_seeker_id', user.id)

if (applications) {
setAppliedGigs(applications.map(app => app.gig_id))
}
}
}

const fetchGigs = async () => {
try {
const { data, error } = await supabase
.from('gigs')
.select('*')
.eq('status', 'open')
.gt('expires_at', new Date().toISOString()) // Only fetch non-expired gigs
.order('created_at', { ascending: false })

if (error) throw error
setGigs(data || [])
} catch (error) {
console.error('Error fetching gigs:', error)
} finally {
setLoading(false)
}
}

const handleApply = async (gig: Gig) => {
if (!currentUser) {
alert('Please log in to apply for gigs')
return
}

if (appliedGigs.includes(gig.id)) {
alert('You have already applied to this gig')
return
}

setApplyingTo(gig.id)

try {
// Create application
const { error: appError } = await supabase
.from('applications')
.insert({
gig_id: gig.id,
gig_seeker_id: currentUser.id,
client_id: gig.client_id,
status: 'pending'
})

if (appError) throw appError

// Update gig applicant count
const { error: gigError } = await supabase
.from('gigs')
.update({
applicant_count: gig.applicant_count + 1,
status: gig.applicant_count + 1 >= 10 ? 'full' : 'open'
})
.eq('id', gig.id)

if (gigError) throw gigError

// Update local state
setAppliedGigs([...appliedGigs, gig.id])
setGigs(gigs.map(g =>
g.id === gig.id
? { ...g, applicant_count: g.applicant_count + 1, status: g.applicant_count + 1 >= 10 ? 'full' : 'open' }
: g
))

alert('Application submitted successfully! The client will review your profile.')
} catch (error: any) {
console.error('Error applying:', error)
alert('Failed to submit application: ' + error.message)
} finally {
setApplyingTo(null)
}
}

const filterGigs = () => {
let filtered = gigs

if (searchTerm) {
filtered = filtered.filter(gig =>
gig.gig_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
gig.explanation.toLowerCase().includes(searchTerm.toLowerCase()) ||
gig.city.toLowerCase().includes(searchTerm.toLowerCase())
)
}

if (selectedType !== 'All Types') {
filtered = filtered.filter(gig => gig.gig_type === selectedType)
}

if (selectedProvince !== 'All Provinces') {
filtered = filtered.filter(gig => gig.province === selectedProvince)
}

if (selectedBudget !== 'Any Budget') {
filtered = filtered.filter(gig => {
const amount = gig.payment_amount
if (selectedBudget === 'R0 - R1,000') return amount <= 1000
if (selectedBudget === 'R1,000 - R3,000') return amount > 1000 && amount <= 3000
if (selectedBudget === 'R3,000 - R5,000') return amount > 3000 && amount <= 5000
if (selectedBudget === 'R5,000+') return amount > 5000
return true
})
}

return filtered
}

const getTimeAgo = (date: string) => {
const now = new Date()
const created = new Date(date)
const diffMs = now.getTime() - created.getTime()
const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

if (diffDays === 0) return 'Today'
if (diffDays === 1) return '1 day ago'
if (diffDays < 7) return `${diffDays} days ago`
if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
return `${Math.floor(diffDays / 30)} months ago`
}

const getTimeRemaining = (expiresAt: string) => {
const now = new Date()
const expiry = new Date(expiresAt)
const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

if (days < 0) return 'Expired'
if (days === 0) return 'Expires today'
if (days === 1) return 'Expires tomorrow'
if (days <= 3) return `${days} days left`
return null // Don't show if more than 3 days
}

const canApply = userType === 'gig_seeker' || userType === 'both'
const filteredGigs = filterGigs()

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="text-xl">Loading gigs...</div>
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
<Link href="/find-talent" className="text-gray-700 hover:text-primary">Find Talent</Link>
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
<h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Gigs</h1>
<p className="text-gray-600">Find your next opportunity from {gigs.length} available gigs</p>
</div>
</div>

<div className="bg-white border-b">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
<input
type="text"
placeholder="Search gigs..."
value={searchTerm}
onChange={(e) => setSearchTerm(e.target.value)}
className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
<select
value={selectedType}
onChange={(e) => setSelectedType(e.target.value)}
className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
{gigTypes.map(type => (
<option key={type} value={type}>{type}</option>
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
<select
value={selectedBudget}
onChange={(e) => setSelectedBudget(e.target.value)}
className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
{budgetRanges.map(range => (
<option key={range} value={range}>{range}</option>
))}
</select>
</div>
</div>
</div>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
{filteredGigs.length === 0 ? (
<div className="text-center py-12">
<p className="text-xl text-gray-600">No gigs found matching your filters.</p>
</div>
) : (
<div className="grid grid-cols-1 gap-6">
{filteredGigs.map((gig) => {
const timeRemaining = gig.expires_at ? getTimeRemaining(gig.expires_at) : null
return (
<div key={gig.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
<div className="flex justify-between items-start mb-4">
<div className="flex-1">
<div className="flex items-center gap-2 mb-1">
<span className="text-sm text-gray-500">{gig.gig_type}</span>
{timeRemaining && (
<span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
⏰ {timeRemaining}
</span>
)}
</div>
<h2 className="text-2xl font-bold text-gray-900 mb-2">{gig.gig_name}</h2>
<p className="text-gray-700 mb-3">{gig.explanation}</p>
</div>
</div>

<div className="mb-4">
<h3 className="font-semibold text-gray-900 mb-1">Requirements:</h3>
<p className="text-gray-600">{gig.requirements}</p>
</div>

<div className="flex flex-wrap gap-2 mb-4">
{gig.skills && gig.skills.map((skill, index) => (
<span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
{skill}
</span>
))}
</div>

<div className="flex justify-between items-center pt-4 border-t">
<div className="flex flex-col space-y-1">
<div className="text-sm text-gray-600">
📍 {gig.city}, {gig.province}
</div>
<div className="text-sm text-gray-600">
📅 {gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'No deadline'}
</div>
<div className="text-lg font-bold text-primary">
R{gig.payment_amount.toLocaleString()} ({gig.payment_type})
</div>
</div>

<div className="flex flex-col items-end space-y-2">
<div className="text-sm text-gray-500">
{getTimeAgo(gig.created_at)} • {gig.applicant_count} applicants
</div>
{canApply ? (
appliedGigs.includes(gig.id) ? (
<button disabled className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
Applied ✓
</button>
) : gig.status === 'full' || gig.applicant_count >= 10 ? (
<button disabled className="px-6 py-2 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed">
Currently Full
</button>
) : (
<button
onClick={() => handleApply(gig)}
disabled={applyingTo === gig.id}
className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
>
{applyingTo === gig.id ? 'Applying...' : 'Apply'}
</button>
)
) : (
<div className="text-sm text-gray-500 italic">
{currentUser ? 'Clients cannot apply' : 'Login to apply'}
</div>
)}
</div>
</div>

<div className="mt-3 text-xs text-gray-500">
Posted by: {gig.client_name}
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
