'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MyContractsPage() {
const router = useRouter()
const [loading, setLoading] = useState(true)
const [currentUser, setCurrentUser] = useState<any>(null)
const [userRole, setUserRole] = useState<string>('')
const [contracts, setContracts] = useState<any[]>([])
const [filter, setFilter] = useState<'all' | 'pending' | 'signed'>('all')

useEffect(() => {
checkUserAndFetch()
}, [])

const checkUserAndFetch = async () => {
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
router.push('/login')
return
}

setCurrentUser(user)

// Get user role
const { data: profile } = await supabase
.from('profiles')
.select('role, user_type')
.eq('id', user.id)
.single()

if (profile) {
setUserRole(profile.user_type || profile.role)
}

await fetchContracts(user.id, profile?.user_type || profile?.role)
}

const fetchContracts = async (userId: string, role: string) => {
try {
let query = supabase
.from('contracts')
.select(`
id,
application_id,
client_id,
gig_seeker_id,
client_signed_at,
seeker_signed_at,
fully_executed_at,
created_at,
contract_payment_amount,
contract_payment_type,
applications (
id,
gigs (
gig_name,
gig_type,
city,
province
)
),
client_profile:profiles!contracts_client_id_fkey (full_name),
seeker_profile:profiles!contracts_gig_seeker_id_fkey (full_name)
`)
.order('created_at', { ascending: false })

// Filter based on user role
if (role === 'client') {
query = query.eq('client_id', userId)
} else if (role === 'gig_seeker') {
query = query.eq('gig_seeker_id', userId)
} else if (role === 'both') {
query = query.or(`client_id.eq.${userId},gig_seeker_id.eq.${userId}`)
}

const { data, error } = await query

if (error) throw error

setContracts(data || [])
} catch (error: any) {
console.error('Error fetching contracts:', error)
alert('Error loading contracts: ' + error.message)
} finally {
setLoading(false)
}
}

const getContractStatus = (contract: any) => {
if (contract.fully_executed_at) {
return { label: 'Fully Signed', color: 'bg-primary-light text-primary-dark', icon: '✓' }
} else if (contract.client_signed_at || contract.seeker_signed_at) {
return { label: 'Partially Signed', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' }
} else {
return { label: 'Pending Signatures', color: 'bg-gray-100 text-gray-800', icon: '○' }
}
}

const getFilteredContracts = () => {
if (filter === 'all') return contracts
if (filter === 'signed') return contracts.filter(c => c.fully_executed_at)
if (filter === 'pending') return contracts.filter(c => !c.fully_executed_at)
return contracts
}

const filteredContracts = getFilteredContracts()

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="text-xl">Loading contracts...</div>
</div>
)
}

const isClient = userRole === 'client'
const isGigSeeker = userRole === 'gig_seeker'

return (
<div className="min-h-screen bg-sage">
<nav className="bg-white shadow-sm sticky top-0 z-50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<Link href={isClient ? '/dashboard/client' : (isGigSeeker ? '/dashboard/gig-seeker' : '/dashboard/both')} className="flex items-center">
<img src="/logo.png" alt="BaseGigs Logo" className="h-9 w-auto" />
<span className="ml-2 text-xl font-semibold text-secondary">BaseGigs</span>
</Link>
<Link
href={isClient ? '/dashboard/client' : (isGigSeeker ? '/dashboard/gig-seeker' : '/dashboard/both')}
className="text-gray-700 hover:text-primary transition-colors"
>
← Back to Dashboard
</Link>
</div>
</div>
</nav>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="mb-8">
<h1 className="text-3xl font-bold text-gray-900 mb-2">My Contracts</h1>
<p className="text-gray-600">View and manage all your service agreements</p>
</div>

{/* Filter Buttons */}
<div className="mb-6 flex gap-3">
<button
onClick={() => setFilter('all')}
className={`px-4 py-2 rounded-lg font-medium transition-colors ${
filter === 'all'
? 'bg-primary text-white'
: 'bg-white text-gray-700 border border-gray-300 hover:bg-sage'
}`}
>
All ({contracts.length})
</button>
<button
onClick={() => setFilter('pending')}
className={`px-4 py-2 rounded-lg font-medium transition-colors ${
filter === 'pending'
? 'bg-primary text-white'
: 'bg-white text-gray-700 border border-gray-300 hover:bg-sage'
}`}
>
Pending ({contracts.filter(c => !c.fully_executed_at).length})
</button>
<button
onClick={() => setFilter('signed')}
className={`px-4 py-2 rounded-lg font-medium transition-colors ${
filter === 'signed'
? 'bg-primary text-white'
: 'bg-white text-gray-700 border border-gray-300 hover:bg-sage'
}`}
>
Fully Signed ({contracts.filter(c => c.fully_executed_at).length})
</button>
</div>

{/* Contracts List */}
{filteredContracts.length === 0 ? (
<div className="bg-white rounded-lg shadow p-12 text-center">
<div className="text-6xl mb-4">📄</div>
<h3 className="text-xl font-semibold text-gray-900 mb-2">No contracts found</h3>
<p className="text-gray-600 mb-6">
{filter === 'all'
? (isGigSeeker
? "You don't have any contracts yet. Contracts are created after your application has been accepted."
: "You don't have any contracts yet. Contracts are created when you accept applicants.")
: `No ${filter} contracts found.`}
</p>
<Link
href={isClient ? '/dashboard/client' : (isGigSeeker ? '/dashboard/gig-seeker' : '/dashboard/both')}
className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors"
>
Go to Dashboard
</Link>
</div>
) : (
<div className="space-y-4">
{filteredContracts.map((contract) => {
const status = getContractStatus(contract)
const gig = contract.applications?.gigs
const otherPartyName = isClient
? contract.seeker_profile?.full_name
: contract.client_profile?.full_name

const userHasSigned = isClient
? contract.client_signed_at
: contract.seeker_signed_at

// Use the contract's own negotiated terms, falling back to the
// original gig listing only for very old contracts pre-dating this
const paymentAmount = contract.contract_payment_amount ?? null
const paymentType = contract.contract_payment_type ?? null

return (
<div key={contract.id} className="bg-white rounded-lg shadow hover:shadow-md transition p-6">
<div className="flex items-start justify-between">
<div className="flex-1">
<div className="flex items-center gap-3 mb-2">
<h3 className="text-xl font-semibold text-gray-900">
{gig?.gig_name || 'Untitled Gig'}
</h3>
<span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
{status.icon} {status.label}
</span>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
<div>
<p><strong>Category:</strong> {gig?.gig_type}</p>
<p><strong>Location:</strong> {gig?.city}, {gig?.province}</p>
<p>
<strong>Payment:</strong>{' '}
{paymentAmount !== null
? `R${Number(paymentAmount).toLocaleString()} (${paymentType})`
: 'See contract'}
</p>
</div>
<div>
<p><strong>{isClient ? 'Service Provider' : 'Client'}:</strong> {otherPartyName}</p>
<p><strong>Contract ID:</strong> #{contract.id}</p>
<p><strong>Created:</strong> {new Date(contract.created_at).toLocaleDateString()}</p>
</div>
</div>

{/* Signature Status */}
<div className="mt-4 pt-4 border-t">
<div className="flex items-center gap-6 text-sm">
<div className="flex items-center gap-2">
<span className={contract.client_signed_at ? 'text-primary' : 'text-gray-400'}>
{contract.client_signed_at ? '✓' : '○'}
</span>
<span>Client {contract.client_signed_at ? 'Signed' : 'Pending'}</span>
{contract.client_signed_at && (
<span className="text-gray-500 text-xs">
({new Date(contract.client_signed_at).toLocaleDateString()})
</span>
)}
</div>
<div className="flex items-center gap-2">
<span className={contract.seeker_signed_at ? 'text-primary' : 'text-gray-400'}>
{contract.seeker_signed_at ? '✓' : '○'}
</span>
<span>Service Provider {contract.seeker_signed_at ? 'Signed' : 'Pending'}</span>
{contract.seeker_signed_at && (
<span className="text-gray-500 text-xs">
({new Date(contract.seeker_signed_at).toLocaleDateString()})
</span>
)}
</div>
</div>
</div>
</div>

<div className="ml-6 flex flex-col gap-2">
<Link
href={`/contract/${contract.application_id}`}
className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium text-center whitespace-nowrap transition-colors"
>
View Contract
</Link>
{!userHasSigned && !contract.fully_executed_at && (
<Link
href={`/contract/${contract.application_id}`}
className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light font-medium text-center whitespace-nowrap transition-colors"
>
Sign Now
</Link>
)}
<Link
href={`/chat/${contract.application_id}`}
className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-sage font-medium text-center whitespace-nowrap transition-colors"
>
Open Chat
</Link>
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
