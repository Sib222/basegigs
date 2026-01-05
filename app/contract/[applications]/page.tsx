'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ContractPage({ params }: { params: { applicationId: string } }) {
const router = useRouter()
const [loading, setLoading] = useState(true)
const [currentUser, setCurrentUser] = useState<any>(null)
const [contractData, setContractData] = useState<any>(null)
const [clientSigned, setClientSigned] = useState(false)
const [seekerSigned, setSeekerSigned] = useState(false)

const applicationId = parseInt(params.applicationId)

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
await fetchContractData(user.id)
}

const fetchContractData = async (userId: string) => {
try {
const { data: application, error } = await supabase
.from('applications')
.select(`
id,
gig_seeker_id,
client_id,
gigs (gig_name, gig_type, payment_amount, payment_type, city, province, explanation, requirements),
profiles!applications_gig_seeker_id_fkey (full_name, phone_number, email),
client_profiles:profiles!applications_client_id_fkey (full_name, phone_number, email)
`)
.eq('id', applicationId)
.single()

if (error) throw error

if (!application) {
alert('Application not found')
router.push('/dashboard/client')
return
}

if (application.client_id !== userId && application.gig_seeker_id !== userId) {
alert('You do not have access to this contract')
router.push('/dashboard/client')
return
}

setContractData(application)
} catch (error: any) {
console.error('Error fetching contract data:', error)
alert('Error loading contract: ' + error.message)
} finally {
setLoading(false)
}
}

const handleSign = async () => {
if (!currentUser || !contractData) return

const isClient = currentUser.id === contractData.client_id

try {
if (isClient) {
setClientSigned(true)
alert('Contract signed by client! Waiting for gig seeker signature.')
} else {
setSeekerSigned(true)
alert('Contract signed by gig seeker! Waiting for client signature.')
}

if ((isClient && seekerSigned) || (!isClient && clientSigned)) {
alert('🎉 Contract fully signed by both parties! You can now proceed with the work.')
}
} catch (error: any) {
console.error('Error signing:', error)
alert('Failed to sign contract: ' + error.message)
}
}

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="text-xl">Loading contract...</div>
</div>
)
}

const isClient = currentUser?.id === contractData?.client_id
const gig = contractData?.gigs
const seekerInfo = contractData?.profiles
const clientInfo = contractData?.client_profiles?.[0]

return (
<div className="min-h-screen bg-gray-50">
<nav className="bg-white shadow-sm">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<Link href={isClient ? '/dashboard/client' : '/dashboard/gig-seeker'} className="flex items-center">
<span className="text-2xl font-bold text-primary">B</span>
<span className="ml-2 text-xl font-semibold">BaseGigs</span>
</Link>
<Link href={`/chat/${applicationId}`} className="text-gray-700 hover:text-primary">
← Back to Chat
</Link>
</div>
</div>
</nav>

<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="bg-white rounded-lg shadow-lg p-8">
<div className="text-center mb-8">
<h1 className="text-3xl font-bold text-gray-900 mb-2">Service Agreement Contract</h1>
<p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
</div>

<div className="space-y-6 text-gray-800">
<section>
<h2 className="text-xl font-bold mb-3">1. Parties</h2>
<p><strong>Client:</strong> {clientInfo?.full_name}</p>
<p><strong>Email:</strong> {clientInfo?.email}</p>
<p><strong>Phone:</strong> {clientInfo?.phone_number}</p>
<p className="mt-3"><strong>Service Provider (Gig Seeker):</strong> {seekerInfo?.full_name}</p>
<p><strong>Email:</strong> {seekerInfo?.email}</p>
<p><strong>Phone:</strong> {seekerInfo?.phone_number}</p>
</section>

<section>
<h2 className="text-xl font-bold mb-3">2. Service Description</h2>
<p><strong>Gig Name:</strong> {gig?.gig_name}</p>
<p><strong>Category:</strong> {gig?.gig_type}</p>
<p><strong>Location:</strong> {gig?.city}, {gig?.province}</p>
<p className="mt-3"><strong>Description:</strong></p>
<p className="bg-gray-50 p-3 rounded">{gig?.explanation}</p>
<p className="mt-3"><strong>Requirements:</strong></p>
<p className="bg-gray-50 p-3 rounded">{gig?.requirements}</p>
</section>

<section>
<h2 className="text-xl font-bold mb-3">3. Payment Terms</h2>
<p><strong>Amount:</strong> R{gig?.payment_amount?.toLocaleString()}</p>
<p><strong>Type:</strong> {gig?.payment_type}</p>
<p className="mt-2 text-sm text-gray-600">Payment shall be made upon satisfactory completion of the services as described above.</p>
</section>

<section>
<h2 className="text-xl font-bold mb-3">4. Terms & Conditions</h2>
<ul className="list-disc pl-6 space-y-2">
<li>The Service Provider agrees to complete the work as described in Section 2.</li>
<li>The Client agrees to pay the agreed amount upon completion.</li>
<li>Both parties agree to communicate professionally and promptly.</li>
<li>Either party may terminate this agreement with written notice if terms are not met.</li>
<li>This contract is governed by the laws of South Africa.</li>
</ul>
</section>

<section className="border-t pt-6">
<h2 className="text-xl font-bold mb-4">5. Signatures</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className={`border-2 p-4 rounded-lg ${clientSigned ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
<p className="font-semibold mb-2">Client Signature</p>
{clientSigned ? (
<div>
<p className="text-green-600 font-bold">✓ SIGNED</p>
<p className="text-sm text-gray-600">{clientInfo?.full_name}</p>
<p className="text-sm text-gray-600">{new Date().toLocaleString()}</p>
</div>
) : (
<p className="text-gray-500">Awaiting signature...</p>
)}
</div>

<div className={`border-2 p-4 rounded-lg ${seekerSigned ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
<p className="font-semibold mb-2">Service Provider Signature</p>
{seekerSigned ? (
<div>
<p className="text-green-600 font-bold">✓ SIGNED</p>
<p className="text-sm text-gray-600">{seekerInfo?.full_name}</p>
<p className="text-sm text-gray-600">{new Date().toLocaleString()}</p>
</div>
) : (
<p className="text-gray-500">Awaiting signature...</p>
)}
</div>
</div>

{!clientSigned && !seekerSigned && (
<div className="mt-6">
<button
onClick={handleSign}
className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 font-semibold text-lg"
>
Sign Contract as {isClient ? 'Client' : 'Service Provider'}
</button>
</div>
)}

{(clientSigned || seekerSigned) && !(clientSigned && seekerSigned) && (
<div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded">
<p className="text-yellow-800">
⏳ Waiting for {isClient ? 'Service Provider' : 'Client'} to sign the contract.
</p>
</div>
)}

{clientSigned && seekerSigned && (
<div className="mt-6 bg-green-50 border border-green-200 p-4 rounded">
<p className="text-green-800 font-semibold">
✓ Contract fully executed by both parties! You may now proceed with the work.
</p>
</div>
)}
</section>
</div>

<div className="mt-8 pt-8 border-t text-center">
<p className="text-sm text-gray-500">
This is a legally binding contract. Keep a copy for your records.
</p>
</div>
</div>
</div>
</div>
)
}
