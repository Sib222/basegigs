'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Message {
id: number
sender_id: string
receiver_id: string
message: string
created_at: string
read: boolean
}

interface ChatInfo {
gig_name: string
client_name: string
seeker_name: string
client_id: string
seeker_id: string
application_status: string
}

export default function ChatPage({ params }: { params: { applicationId: string } }) {
const router = useRouter()
const [messages, setMessages] = useState<Message[]>([])
const [newMessage, setNewMessage] = useState('')
const [loading, setLoading] = useState(true)
const [sending, setSending] = useState(false)
const [currentUser, setCurrentUser] = useState<any>(null)
const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null)
const [hasContract, setHasContract] = useState(false)
const messagesEndRef = useRef<HTMLDivElement>(null)
const applicationId = parseInt(params.applicationId)

useEffect(() => {
checkUserAndFetch()
}, [])

useEffect(() => {
if (currentUser && chatInfo) {
const channel = supabase
.channel(`chat-${applicationId}`)
.on('postgres_changes', {
event: 'INSERT',
schema: 'public',
table: 'chats',
filter: `application_id=eq.${applicationId}`
}, (payload) => {
setMessages(prev => [...prev, payload.new as Message])
})
.subscribe()

return () => {
supabase.removeChannel(channel)
}
}
}, [currentUser, chatInfo, applicationId])

useEffect(() => {
scrollToBottom()
}, [messages])

const scrollToBottom = () => {
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}

const checkUserAndFetch = async () => {
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
router.push('/login')
return
}

setCurrentUser(user)
await fetchChatInfo(user.id)
await fetchMessages()
await checkContract()
}

const fetchChatInfo = async (userId: string) => {
try {
const { data: application, error } = await supabase
.from('applications')
.select(`
gig_seeker_id,
client_id,
status,
gigs (gig_name, client_name),
profiles!applications_gig_seeker_id_fkey (full_name)
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
alert('You do not have access to this chat')
router.push('/dashboard/client')
return
}

setChatInfo({
gig_name: (application.gigs as any)?.gig_name || 'Unknown Gig',
client_name: (application.gigs as any)?.client_name || 'Unknown Client',
seeker_name: (application.profiles as any)?.full_name || 'Unknown Seeker',
client_id: application.client_id,
seeker_id: application.gig_seeker_id,
application_status: application.status || 'pending'
})
} catch (error: any) {
console.error('Error fetching chat info:', error)
alert('Error loading chat: ' + error.message)
} finally {
setLoading(false)
}
}

const checkContract = async () => {
try {
const { data, error } = await supabase
.from('contracts')
.select('id')
.eq('application_id', applicationId)
.single()

if (data) {
setHasContract(true)
}
} catch (error) {
// No contract exists yet, which is fine
setHasContract(false)
}
}

const fetchMessages = async () => {
try {
const { data, error } = await supabase
.from('chats')
.select('*')
.eq('application_id', applicationId)
.order('created_at', { ascending: true })

if (error) throw error
setMessages(data || [])
} catch (error) {
console.error('Error fetching messages:', error)
}
}

const handleSend = async (e: React.FormEvent) => {
e.preventDefault()

if (!newMessage.trim() || !currentUser || !chatInfo) return

setSending(true)

try {
const receiverId = currentUser.id === chatInfo.client_id
? chatInfo.seeker_id
: chatInfo.client_id

const { error } = await supabase
.from('chats')
.insert({
application_id: applicationId,
sender_id: currentUser.id,
receiver_id: receiverId,
message: newMessage.trim()
})

if (error) throw error

setNewMessage('')
} catch (error: any) {
console.error('Error sending message:', error)
alert('Failed to send message: ' + error.message)
} finally {
setSending(false)
}
}

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="text-xl">Loading chat...</div>
</div>
)
}

const isAccepted = chatInfo?.application_status === 'accepted'

return (
<div className="min-h-screen bg-gray-50 flex flex-col">
<nav className="bg-white shadow-sm">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<Link href={currentUser?.id === chatInfo?.client_id ? '/dashboard/client' : '/dashboard/gig-seeker'} className="flex items-center">
<span className="text-2xl font-bold text-primary">B</span>
<span className="ml-2 text-xl font-semibold">BaseGigs</span>
</Link>
<div className="text-center flex-1">
<div className="font-semibold">{chatInfo?.gig_name}</div>
<div className="text-sm text-gray-600">
{currentUser?.id === chatInfo?.client_id
? `Chatting with ${chatInfo?.seeker_name}`
: `Chatting with ${chatInfo?.client_name}`
}
</div>
</div>
<Link
href={currentUser?.id === chatInfo?.client_id ? '/dashboard/client/applications' : '/dashboard/gig-seeker/applications'}
className="text-gray-700 hover:text-primary"
>
← Back
</Link>
</div>
</div>
</nav>

{isAccepted && (
<div className="max-w-4xl w-full mx-auto mt-4 px-4">
<Link
href={`/contract/${applicationId}`}
className="block w-full bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all p-4 text-center"
>
<div className="flex items-center justify-center gap-3">
<span className="text-2xl">📄</span>
<div className="text-left">
<div className="font-bold text-lg">
{hasContract ? 'View Service Agreement' : 'Create Service Agreement'}
</div>
<div className="text-sm text-green-100">
{hasContract ? 'Review and sign your contract' : 'Auto-generated from gig details'}
</div>
</div>
<span className="text-xl">→</span>
</div>
</Link>
</div>
)}

<div className="flex-1 max-w-4xl w-full mx-auto flex flex-col bg-white shadow-lg my-4">
<div className="flex-1 overflow-y-auto p-6 space-y-4">
{messages.length === 0 ? (
<div className="text-center text-gray-500 py-12">
<p className="text-lg mb-2">No messages yet</p>
<p className="text-sm">Start the conversation!</p>
</div>
) : (
messages.map((msg) => (
<div
key={msg.id}
className={`flex ${msg.sender_id === currentUser?.id ? 'justify-end' : 'justify-start'}`}
>
<div
className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
msg.sender_id === currentUser?.id
? 'bg-primary text-white'
: 'bg-gray-200 text-gray-900'
}`}
>
<p className="break-words">{msg.message}</p>
<p className={`text-xs mt-1 ${
msg.sender_id === currentUser?.id ? 'text-green-100' : 'text-gray-500'
}`}>
{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
</p>
</div>
</div>
))
)}
<div ref={messagesEndRef} />
</div>

<form onSubmit={handleSend} className="border-t p-4 bg-gray-50">
<div className="flex space-x-2">
<input
type="text"
value={newMessage}
onChange={(e) => setNewMessage(e.target.value)}
placeholder="Type your message..."
className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
disabled={sending}
/>
<button
type="submit"
disabled={sending || !newMessage.trim()}
className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
>
{sending ? 'Sending...' : 'Send'}
</button>
</div>
</form>
</div>

{!isAccepted && (
<div className="bg-yellow-50 border-t border-yellow-200 p-4 text-center">
<p className="text-sm text-yellow-800">
⏳ Contract will be available once the application is accepted.
</p>
</div>
)}
</div>
)
}
