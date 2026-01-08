'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ContractPage({ params }: { params: { applicationId: string } }) {
const router = useRouter()
const [loading, setLoading] = useState(true)
const [signing, setSigning] = useState(false)
const [currentUser, setCurrentUser] = useState<any>(null)
const [contractData, setContractData] = useState<any>(null)
const [contract, setContract] = useState<any>(null)
const [showChangeModal, setShowChangeModal] = useState(false)
const [changeRequest, setChangeRequest] = useState('')
const [submittingChange, setSubmittingChange] = useState(false)

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
const { data: application, error: appError } = await supabase
.from('applications')
.select(`
id,
gig_seeker_id,
client_id,
gig_id
`)
.eq('id', applicationId)
.single()

if (appError) throw appError

if (!application) {
alert('Application not found')
router.push('/dashboard')
return
}

if (application.client_id !== userId && application.gig_seeker_id !== userId) {
alert('You do not have access to this contract')
router.push('/dashboard')
return
}

// Fetch gig details
const { data: gig, error: gigError } = await supabase
.from('gigs')
.select('*')
.eq('id', application.gig_id)
.single()

if (gigError) throw gigError

// Fetch gig seeker profile
const { data: seekerProfile, error: seekerError } = await supabase
.from('profiles')
.select('full_name, phone_number, email')
.eq('user_id', application.gig_seeker_id)
.single()

if (seekerError) throw seekerError

// Fetch client profile
const { data: clientProfile, error: clientError } = await supabase
.from('profiles')
.select('full_name, phone_number, email')
.eq('user_id', application.client_id)
.single()

if (clientError) throw clientError

setContractData({
...application,
gigs: gig,
profiles: seekerProfile,
client_profiles: clientProfile
})

const { data: existingContract, error: contractError } = await supabase
.from('contracts')
.select('*')
.eq('application_id', applicationId)
.single()

if (contractError && contractError.code !== 'PGRST116') {
throw contractError
}

if (existingContract) {
setContract(existingContract)
} else {
const { data: newContract, error: createError } = await supabase
.from('contracts')
.insert({
application_id: applicationId,
client_id: application.client_id,
gig_seeker_id: application.gig_seeker_id
})
.select()
.single()

if (createError) throw createError
setContract(newContract)
}

} catch (error: any) {
console.error('Error fetching contract data:', error)
alert('Error loading contract: ' + error.message)
} finally {
setLoading(false)
}
}

const handleSign = async () => {
if (!currentUser || !contractData || !contract || signing) return

if (contract.pending_changes) {
alert('Cannot sign while there are pending change requests. Please resolve them first.')
return
}

setSigning(true)
const isClient = currentUser.id === contractData.client_id

try {
const updateData: any = {}
const now = new Date().toISOString()

if (isClient) {
updateData.client_signed_at = now
} else {
updateData.seeker_signed_at = now
}

const otherPartySigned = isClient ? contract.seeker_signed_at : contract.client_signed_at
if (otherPartySigned) {
updateData.fully_executed_at = now
}

const { data: updatedContract, error } = await supabase
.from('contracts')
.update(updateData)
.eq('id', contract.id)
.select()
.single()

if (error) throw error

setContract(updatedContract)

if (updatedContract.fully_executed_at) {
alert('🎉 Contract fully signed by both parties! You can now proceed with the work.')
} else {
alert(`Contract signed successfully! Waiting for ${isClient ? 'service provider' : 'client'} signature.`)
}

} catch (error: any) {
console.error('Error signing:', error)
alert('Failed to sign contract: ' + error.message)
} finally {
setSigning(false)
}
}

const handleRequestChange = async () => {
if (!changeRequest.trim()) {
alert('Please describe the changes you want to make.')
return
}

setSubmittingChange(true)

try {
const { data: updatedContract, error } = await supabase
.from('contracts')
.update({
pending_changes: changeRequest,
pending_changes_by: currentUser.id,
pending_changes_at: new Date().toISOString()
})
.eq('id', contract.id)
.select()
.single()

if (error) throw error

setContract(updatedContract)
setShowChangeModal(false)
setChangeRequest('')
alert('Change request submitted! The other party will be notified.')

} catch (error: any) {
console.error('Error requesting change:', error)
alert('Failed to submit change request: ' + error.message)
} finally {
setSubmittingChange(false)
}
}

const handleApproveChanges = async () => {
if (!confirm('Are you sure you want to approve these changes?')) return

try {
const history = contract.change_history || []
history.push({
version: contract.contract_version + 1,
changes: contract.pending_changes,
requested_by: contract.pending_changes_by,
approved_at: new Date().toISOString()
})

const { data: updatedContract, error } = await supabase
.from('contracts')
.update({
contract_version: contract.contract_version + 1,
change_history: history,
pending_changes: null,
pending_changes_by: null,
pending_changes_at: null,
client_signed_at: null,
seeker_signed_at: null,
fully_executed_at: null
})
.eq('id', contract.id)
.select()
.single()

if (error) throw error

setContract(updatedContract)
alert('Changes approved! Contract updated to version ' + updatedContract.contract_version + '. Both parties need to sign again.')

} catch (error: any) {
console.error('Error approving changes:', error)
alert('Failed to approve changes: ' + error.message)
}
}

const handleRejectChanges = async () => {
if (!confirm('Are you sure you want to reject these changes?')) return

try {
const { data: updatedContract, error } = await supabase
.from('contracts')
.update({
pending_changes: null,
pending_changes_by: null,
pending_changes_at: null
})
.eq('id', contract.id)
.select()
.single()

if (error) throw error

setContract(updatedContract)
alert('Changes rejected.')

} catch (error: any) {
console.error('Error rejecting changes:', error)
alert('Failed to reject changes: ' + error.message)
}
}

const handleDownloadPDF = () => {
window.print()
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
const clientInfo = contractData?.client_profiles

const clientSigned = !!contract?.client_signed_at
const seekerSigned = !!contract?.seeker_signed_at
const fullyExecuted = !!contract?.fully_executed_at

const userHasSigned = isClient ? clientSigned : seekerSigned
const canSign = !userHasSigned && !fullyExecuted && !contract?.pending_changes
const hasPendingChanges = !!contract?.pending_changes
const isChangeRequester = contract?.pending_changes_by === currentUser?.id
const canApproveChanges = hasPendingChanges && !isChangeRequester

return (
<div className="min-h-screen bg-gray-50">
<nav className="bg-white shadow-sm print:hidden">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<Link href={isClient ? '/dashboard/client' : '/dashboard/gig-seeker'} className="flex items-center">
<span className="text-2xl font-bold text-green-600">B</span>
<span className="ml-2 text-xl font-semibold">BaseGigs</span>
</Link>
<div className="flex items-center gap-4">
<Link href={`/chat/${applicationId}`} className="text-gray-700 hover:text-green-600">
💬 Open Chat
</Link>
<Link href="/my-contracts" className="text-gray-700 hover:text-green-600">
← Back to Contracts
</Link>
</div>
</div>
</div>
</nav>

<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="bg-white rounded-lg shadow-lg p-8">
<div className="text-center mb-8">
<h1 className="text-3xl font-bold text-gray-900 mb-2">Service Agreement Contract</h1>
<p className="text-gray-600">
Contract ID: #{contract?.id} | Version {contract?.contract_version || 1} | Created: {new Date(contract?.created_at).toLocaleDateString()}
</p>
</div>

{hasPendingChanges && (
<div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
<h3 className="font-bold text-yellow-900 mb-2">⚠️ Pending Change Request</h3>
<p className="text-yellow-800 mb-2">
<strong>{isChangeRequester ? 'You' : (isClient ? 'Service Provider' : 'Client')}</strong> requested changes on {new Date(contract.pending_changes_at).toLocaleString()}:
</p>
<p className="text-gray-700 bg-white p-3 rounded border border-yellow-200 mb-3">
{contract.pending_changes}
</p>
{canApproveChanges && (
<div className="flex gap-3">
<button
onClick={handleApproveChanges}
className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
>
✓ Approve Changes
</button>
<button
onClick={handleRejectChanges}
className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
>
✗ Reject Changes
</button>
</div>
)}
{isChangeRequester && (
<p className="text-sm text-yellow-700">Waiting for {isClient ? 'service provider' : 'client'} to review your request...</p>
)}
</div>
)}

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

{contract?.change_history && contract.change_history.length > 0 && (
<section className="border-t pt-6">
<h2 className="text-xl font-bold mb-3">Change History</h2>
<div className="space-y-2">
{contract.change_history.map((change: any, idx: number) => (
<div key={idx} className="bg-gray-50 p-3 rounded">
<p className="font-semibold">Version {change.version}</p>
<p className="text-sm text-gray-600">Approved: {new Date(change.approved_at).toLocaleString()}</p>
<p className="text-sm mt-1">{change.changes}</p>
</div>
))}
</div>
</section>
)}

<section className="border-t pt-6">
<h2 className="text-xl font-bold mb-4">5. Signatures</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className={`border-2 p-4 rounded-lg ${clientSigned ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}>
<p className="font-semibold mb-2">Client Signature</p>
{clientSigned ? (
<div>
<p className="text-green-600 font-bold">✓ SIGNED</p>
<p className="text-sm text-gray-600">{clientInfo?.full_name}</p>
<p className="text-sm text-gray-600">
{new Date(contract.client_signed_at).toLocaleString()}
</p>
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
<p className="text-sm text-gray-600">
{new Date(contract.seeker_signed_at).toLocaleString()}
</p>
</div>
) : (
<p className="text-gray-500">Awaiting signature...</p>
)}
</div>
</div>

<div className="mt-6 space-y-3 print:hidden">
{canSign && (
<button
onClick={handleSign}
disabled={signing}
className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
>
{signing ? 'Signing...' : `Sign Contract as ${isClient ? 'Client' : 'Service Provider'}`}
</button>
)}

{!fullyExecuted && !hasPendingChanges && (
<button
onClick={() => setShowChangeModal(true)}
className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
>
📝 Request Changes
</button>
)}

{userHasSigned && !fullyExecuted && !hasPendingChanges && (
<div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
<p className="text-yellow-800">
⏳ You have signed. Waiting for {isClient ? 'Service Provider' : 'Client'} to sign the contract.
</p>
</div>
)}

{fullyExecuted && (
<div className="bg-green-50 border border-green-200 p-4 rounded">
<p className="text-green-800 font-semibold">
✓ Contract fully executed on {new Date(contract.fully_executed_at).toLocaleDateString()}! You may now proceed with the work.
</p>
</div>
)}
</div>
</section>
</div>

<div className="mt-8 pt-8 border-t text-center print:hidden">
<p className="text-sm text-gray-500 mb-4">
This is a legally binding contract. Keep a copy for your records.
</p>
<button
onClick={handleDownloadPDF}
className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
>
🖨️ Download PDF
</button>
</div>
</div>
</div>

{showChangeModal && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
<div className="bg-white rounded-lg max-w-2xl w-full p-6">
<h2 className="text-2xl font-bold mb-4">Request Contract Changes</h2>
<p className="text-gray-600 mb-4">
Describe the changes you'd like to make to this contract. The other party will be notified and can approve or reject your request.
</p>
<textarea
value={changeRequest}
onChange={(e) => setChangeRequest(e.target.value)}
className="w-full border rounded-lg p-3 mb-4 h-32"
placeholder="Example: Change payment from hourly to fixed rate of R5000..."
/>
<div className="flex gap-3">
<button
onClick={handleRequestChange}
disabled={submittingChange}
className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
>
{submittingChange ? 'Submitting...' : 'Submit Request'}
</button>
<button
onClick={() => {
setShowChangeModal(false)
setChangeRequest('')
}}
className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
>
Cancel
</button>
</div>
</div>
</div>
)}

<style jsx global>{`
@media print {
body * {
visibility: hidden;
}
.max-w-4xl, .max-w-4xl * {
visibility: visible;
}
.max-w-4xl {
position: absolute;
left: 0;
top: 0;
width: 100%;
}
.print\\:hidden {
display: none !important;
}
}
`}</style>
</div>
)
}
