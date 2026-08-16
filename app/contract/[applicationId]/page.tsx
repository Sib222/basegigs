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
const [gig, setGig] = useState<any>(null)
const [contract, setContract] = useState<any>(null)

const [showChangeModal, setShowChangeModal] = useState(false)
const [submittingChange, setSubmittingChange] = useState(false)
const [proposedAmount, setProposedAmount] = useState('')
const [proposedType, setProposedType] = useState('Fixed')
const [proposedDescription, setProposedDescription] = useState('')
const [proposedRequirements, setProposedRequirements] = useState('')
const [proposedNote, setProposedNote] = useState('')

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

const { data: profile } = await supabase
.from('profiles')
.select('id, user_id')
.eq('user_id', user.id)
.single()

if (!profile) {
alert('Profile not found')
router.push('/dashboard')
return
}

setCurrentUser({ ...user, profile_id: profile.id, user_id: profile.user_id })
await fetchContractData(profile.user_id)
}

const fetchContractData = async (userId: string) => {
try {
const { data: application, error: appError } = await supabase
.from('applications')
.select('id, gig_seeker_id, client_id, gig_id')
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

// Fetch gig details (name, category, location stay tied to the live listing —
// these identify which gig the contract is for and aren't negotiable)
const { data: gigData, error: gigError } = await supabase
.from('gigs')
.select('*')
.eq('id', application.gig_id)
.single()

if (gigError) throw gigError
setGig(gigData)

// Check for an existing contract first
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
// No contract yet — snapshot both parties' contact info and the gig's
// current terms into a brand new contract record
const { data: seekerProfile, error: seekerError } = await supabase
.from('profiles')
.select('full_name, phone_number, email')
.eq('user_id', application.gig_seeker_id)
.single()

if (seekerError) throw seekerError

const { data: clientProfile, error: clientError } = await supabase
.from('profiles')
.select('full_name, phone_number, email')
.eq('user_id', application.client_id)
.single()

if (clientError) throw clientError

const { data: newContract, error: createError } = await supabase
.from('contracts')
.insert({
application_id: applicationId,
client_id: application.client_id,
gig_seeker_id: application.gig_seeker_id,
client_full_name: clientProfile.full_name,
client_email: clientProfile.email,
client_phone: clientProfile.phone_number,
seeker_full_name: seekerProfile.full_name,
seeker_email: seekerProfile.email,
seeker_phone: seekerProfile.phone_number,
contract_payment_amount: gigData.payment_amount,
contract_payment_type: gigData.payment_type,
contract_description: gigData.explanation,
contract_requirements: gigData.requirements,
contract_version: 1,
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
if (!currentUser || !contract || signing) return

if (contract.proposed_at) {
alert('Cannot sign while there is a pending change proposal. Please resolve it first.')
return
}

setSigning(true)
const isClientUser = currentUser.user_id === contract.client_id

try {
const updateData: any = {}
const now = new Date().toISOString()

if (isClientUser) {
updateData.client_signed_at = now
} else {
updateData.seeker_signed_at = now
}

const otherPartySigned = isClientUser ? contract.seeker_signed_at : contract.client_signed_at
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
alert(`Contract signed successfully! Waiting for ${isClientUser ? 'service provider' : 'client'} signature.`)
}

} catch (error: any) {
console.error('Error signing:', error)
alert('Failed to sign contract: ' + error.message)
} finally {
setSigning(false)
}
}

const openChangeModal = () => {
setProposedAmount(contract?.contract_payment_amount?.toString() || '')
setProposedType(contract?.contract_payment_type || 'Fixed')
setProposedDescription(contract?.contract_description || '')
setProposedRequirements(contract?.contract_requirements || '')
setProposedNote('')
setShowChangeModal(true)
}

const handleRequestChange = async () => {
if (!proposedAmount || isNaN(Number(proposedAmount)) || Number(proposedAmount) <= 0) {
alert('Please enter a valid payment amount.')
return
}

setSubmittingChange(true)

try {
const { data: updatedContract, error } = await supabase
.from('contracts')
.update({
proposed_payment_amount: Number(proposedAmount),
proposed_payment_type: proposedType,
proposed_description: proposedDescription,
proposed_requirements: proposedRequirements,
proposed_note: proposedNote || null,
proposed_by: currentUser.user_id,
proposed_at: new Date().toISOString()
})
.eq('id', contract.id)
.select()
.single()

if (error) throw error

setContract(updatedContract)
setShowChangeModal(false)
alert('Change proposal submitted! The other party will be notified.')

} catch (error: any) {
console.error('Error requesting change:', error)
alert('Failed to submit change proposal: ' + error.message)
} finally {
setSubmittingChange(false)
}
}

const handleApproveChanges = async () => {
if (!confirm('Approve these changes? Both parties will need to sign again afterward.')) return

try {
const history = contract.change_history || []
history.push({
version: (contract.contract_version || 1) + 1,
requested_by: contract.proposed_by,
approved_at: new Date().toISOString(),
note: contract.proposed_note || null,
from: {
payment_amount: contract.contract_payment_amount,
payment_type: contract.contract_payment_type,
description: contract.contract_description,
requirements: contract.contract_requirements,
},
to: {
payment_amount: contract.proposed_payment_amount,
payment_type: contract.proposed_payment_type,
description: contract.proposed_description,
requirements: contract.proposed_requirements,
}
})

const { data: updatedContract, error } = await supabase
.from('contracts')
.update({
contract_payment_amount: contract.proposed_payment_amount,
contract_payment_type: contract.proposed_payment_type,
contract_description: contract.proposed_description,
contract_requirements: contract.proposed_requirements,
contract_version: (contract.contract_version || 1) + 1,
change_history: history,
proposed_payment_amount: null,
proposed_payment_type: null,
proposed_description: null,
proposed_requirements: null,
proposed_note: null,
proposed_by: null,
proposed_at: null,
client_signed_at: null,
seeker_signed_at: null,
fully_executed_at: null,
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
proposed_payment_amount: null,
proposed_payment_type: null,
proposed_description: null,
proposed_requirements: null,
proposed_note: null,
proposed_by: null,
proposed_at: null,
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

const isClient = currentUser?.user_id === contract?.client_id

const clientSigned = !!contract?.client_signed_at
const seekerSigned = !!contract?.seeker_signed_at
const fullyExecuted = !!contract?.fully_executed_at

const userHasSigned = isClient ? clientSigned : seekerSigned
const hasPendingChanges = !!contract?.proposed_at
const canSign = !userHasSigned && !fullyExecuted && !hasPendingChanges
const isChangeRequester = contract?.proposed_by === currentUser?.user_id
const canApproveChanges = hasPendingChanges && !isChangeRequester

const amountChanged = hasPendingChanges && Number(contract.proposed_payment_amount) !== Number(contract.contract_payment_amount)
const typeChanged = hasPendingChanges && contract.proposed_payment_type !== contract.contract_payment_type
const descriptionChanged = hasPendingChanges && contract.proposed_description !== contract.contract_description
const requirementsChanged = hasPendingChanges && contract.proposed_requirements !== contract.contract_requirements

return (
<div className="min-h-screen bg-sage">
<nav className="bg-white shadow-sm print:hidden">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<Link href={isClient ? '/dashboard/client' : '/dashboard/gig-seeker'} className="flex items-center">
<img src="/logo.png" alt="BaseGigs Logo" className="h-8 w-auto" />
<span className="ml-2 text-xl font-semibold text-secondary">BaseGigs</span>
</Link>
<div className="flex items-center gap-4">
<Link href={`/chat/${applicationId}`} className="text-gray-700 hover:text-primary transition-colors">
💬 Open Chat
</Link>
<Link href="/my-contracts" className="text-gray-700 hover:text-primary transition-colors">
← Back to Contracts
</Link>
</div>
</div>
</div>
</nav>

<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="bg-white rounded-lg shadow-lg p-8">
<div className="text-center mb-8">
<img src="/logo.png" alt="BaseGigs" className="h-20 mx-auto mb-4" />
<h1 className="text-3xl font-bold text-gray-900 mb-2">Service Agreement Contract</h1>
<p className="text-gray-600">
Contract ID: #{contract?.id} | Version {contract?.contract_version || 1} | Created: {new Date(contract?.created_at).toLocaleDateString()}
</p>
</div>

{hasPendingChanges && (
<div className="mb-6 bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 print:hidden">
<h3 className="font-bold text-yellow-900 mb-2">⚠️ Pending Change Proposal</h3>
<p className="text-yellow-800 mb-3">
<strong>{isChangeRequester ? 'You' : (isClient ? 'Service Provider' : 'Client')}</strong> proposed these changes on {new Date(contract.proposed_at).toLocaleString()}:
</p>
<div className="bg-white rounded border border-yellow-200 p-3 mb-3 space-y-2 text-sm">
{amountChanged && (
<p><strong>Payment Amount:</strong> R{Number(contract.contract_payment_amount).toLocaleString()} → R{Number(contract.proposed_payment_amount).toLocaleString()}</p>
)}
{typeChanged && (
<p><strong>Payment Type:</strong> {contract.contract_payment_type} → {contract.proposed_payment_type}</p>
)}
{descriptionChanged && (
<div>
<p><strong>Description:</strong></p>
<p className="text-gray-500 line-through">{contract.contract_description}</p>
<p className="text-primary-dark">{contract.proposed_description}</p>
</div>
)}
{requirementsChanged && (
<div>
<p><strong>Requirements:</strong></p>
<p className="text-gray-500 line-through">{contract.contract_requirements}</p>
<p className="text-primary-dark">{contract.proposed_requirements}</p>
</div>
)}
{contract.proposed_note && (
<p className="pt-2 border-t"><strong>Note:</strong> {contract.proposed_note}</p>
)}
{!amountChanged && !typeChanged && !descriptionChanged && !requirementsChanged && (
<p className="text-gray-500 italic">No actual changes were made to the terms.</p>
)}
</div>
{canApproveChanges && (
<div className="flex gap-3">
<button
onClick={handleApproveChanges}
className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-colors"
>
✓ Approve Changes
</button>
<button
onClick={handleRejectChanges}
className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
>
✗ Reject Changes
</button>
</div>
)}
{isChangeRequester && (
<p className="text-sm text-yellow-700">Waiting for {isClient ? 'service provider' : 'client'} to review your proposal...</p>
)}
</div>
)}

<div className="space-y-6 text-gray-800">
<section>
<h2 className="text-xl font-bold mb-3">1. Parties</h2>
<p><strong>Client:</strong> {contract?.client_full_name}</p>
<p><strong>Email:</strong> {contract?.client_email}</p>
<p><strong>Phone:</strong> {contract?.client_phone}</p>
<p className="mt-3"><strong>Service Provider (Gig Seeker):</strong> {contract?.seeker_full_name}</p>
<p><strong>Email:</strong> {contract?.seeker_email}</p>
<p><strong>Phone:</strong> {contract?.seeker_phone}</p>
</section>

<section>
<h2 className="text-xl font-bold mb-3">2. Service Description</h2>
<p><strong>Gig Name:</strong> {gig?.gig_name}</p>
<p><strong>Category:</strong> {gig?.gig_type}</p>
<p><strong>Location:</strong> {gig?.city}, {gig?.province}</p>
<p className="mt-3"><strong>Description:</strong></p>
<p className="bg-sage p-3 rounded whitespace-pre-wrap">{contract?.contract_description}</p>
<p className="mt-3"><strong>Requirements:</strong></p>
<p className="bg-sage p-3 rounded whitespace-pre-wrap">{contract?.contract_requirements}</p>
</section>

<section>
<h2 className="text-xl font-bold mb-3">3. Payment Terms</h2>
<p><strong>Amount:</strong> R{Number(contract?.contract_payment_amount || 0).toLocaleString()}</p>
<p><strong>Type:</strong> {contract?.contract_payment_type}</p>
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
<div key={idx} className="bg-sage p-3 rounded text-sm">
<p className="font-semibold">Version {change.version} — Approved {new Date(change.approved_at).toLocaleString()}</p>
{Number(change.to?.payment_amount) !== Number(change.from?.payment_amount) && (
<p>Payment Amount: R{Number(change.from?.payment_amount || 0).toLocaleString()} → R{Number(change.to?.payment_amount || 0).toLocaleString()}</p>
)}
{change.to?.payment_type !== change.from?.payment_type && (
<p>Payment Type: {change.from?.payment_type} → {change.to?.payment_type}</p>
)}
{change.note && <p className="mt-1 italic">&quot;{change.note}&quot;</p>}
</div>
))}
</div>
</section>
)}

<section className="border-t pt-6">
<h2 className="text-xl font-bold mb-4">5. Signatures</h2>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className={`border-2 p-4 rounded-lg ${clientSigned ? 'border-primary bg-primary-light' : 'border-gray-300'}`}>
<p className="font-semibold mb-2">Client Signature</p>
{clientSigned ? (
<div>
<p className="text-primary-dark font-bold">✓ SIGNED</p>
<p className="text-sm text-gray-600">{contract?.client_full_name}</p>
<p className="text-sm text-gray-600">
{new Date(contract.client_signed_at).toLocaleString()}
</p>
</div>
) : (
<p className="text-gray-500">Awaiting signature...</p>
)}
</div>

<div className={`border-2 p-4 rounded-lg ${seekerSigned ? 'border-primary bg-primary-light' : 'border-gray-300'}`}>
<p className="font-semibold mb-2">Service Provider Signature</p>
{seekerSigned ? (
<div>
<p className="text-primary-dark font-bold">✓ SIGNED</p>
<p className="text-sm text-gray-600">{contract?.seeker_full_name}</p>
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
className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
>
{signing ? 'Signing...' : `Sign Contract as ${isClient ? 'Client' : 'Service Provider'}`}
</button>
)}

{!fullyExecuted && !hasPendingChanges && (
<button
onClick={openChangeModal}
className="w-full px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary-light font-semibold transition-colors"
>
📝 Propose Changes
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
<div className="bg-primary-light border border-primary/30 p-4 rounded">
<p className="text-primary-dark font-semibold">
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
className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
>
🖨️ Download PDF
</button>
</div>
</div>
</div>

{showChangeModal && (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
<div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
<h2 className="text-2xl font-bold mb-2">Propose Contract Changes</h2>
<p className="text-gray-600 mb-6">
Update the terms below to reflect what you&apos;ve agreed on. The other party will need to approve before it becomes official, and you&apos;ll both need to sign again afterward.
</p>

<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount (ZAR) *</label>
<input
type="number"
min="0"
value={proposedAmount}
onChange={(e) => setProposedAmount(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
</div>
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
<select
value={proposedType}
onChange={(e) => setProposedType(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
<option value="Fixed">Fixed</option>
<option value="Hourly">Hourly</option>
<option value="Negotiable">Negotiable</option>
</select>
</div>
</div>

<div className="mb-4">
<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
<textarea
value={proposedDescription}
onChange={(e) => setProposedDescription(e.target.value)}
rows={3}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
</div>

<div className="mb-4">
<label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
<textarea
value={proposedRequirements}
onChange={(e) => setProposedRequirements(e.target.value)}
rows={3}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
</div>

<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">Note (optional)</label>
<textarea
value={proposedNote}
onChange={(e) => setProposedNote(e.target.value)}
rows={2}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
placeholder="Anything you want the other party to know about this change..."
/>
</div>

<div className="flex gap-3">
<button
onClick={handleRequestChange}
disabled={submittingChange}
className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:bg-gray-400 transition-colors"
>
{submittingChange ? 'Submitting...' : 'Submit Proposal'}
</button>
<button
onClick={() => setShowChangeModal(false)}
className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
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
