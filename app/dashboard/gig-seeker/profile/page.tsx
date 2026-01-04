'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditProfilePage() {
const router = useRouter()
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [currentUser, setCurrentUser] = useState<any>(null)
const [profile, setProfile] = useState<any>(null)
const [seekerProfile, setSeekerProfile] = useState<any>(null)

const [photoFile, setPhotoFile] = useState<File | null>(null)
const [photoPreview, setPhotoPreview] = useState<string | null>(null)
const [uploadingPhoto, setUploadingPhoto] = useState(false)

const [documentFiles, setDocumentFiles] = useState<File[]>([])
const [uploadingDocs, setUploadingDocs] = useState(false)

useEffect(() => {
checkUserAndFetch()
}, [])

const checkUserAndFetch = async () => {
const { data: { user } } = await supabase.auth.getUser()

if (!user) {
router.push('/login')
return
}

const { data: profileData } = await supabase
.from('profiles')
.select('*')
.eq('user_id', user.id)
.single()

if (profileData?.user_type !== 'gig_seeker' && profileData?.user_type !== 'both') {
router.push('/dashboard/client')
return
}

const { data: seekerData } = await supabase
.from('gig_seeker_profiles')
.select('*')
.eq('user_id', user.id)
.single()

setCurrentUser(user)
setProfile(profileData)
setSeekerProfile(seekerData)

if (seekerData?.photo_url) {
setPhotoPreview(seekerData.photo_url)
}

setLoading(false)
}

const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
const file = e.target.files?.[0]
if (file) {
setPhotoFile(file)
const reader = new FileReader()
reader.onloadend = () => {
setPhotoPreview(reader.result as string)
}
reader.readAsDataURL(file)
}
}

const handlePhotoUpload = async () => {
if (!photoFile || !currentUser) return

setUploadingPhoto(true)

try {
const fileExt = photoFile.name.split('.').pop()
const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`
const filePath = `${fileName}`

const { error: uploadError } = await supabase.storage
.from('profile-photos')
.upload(filePath, photoFile, { upsert: true })

if (uploadError) throw uploadError

const { data: { publicUrl } } = supabase.storage
.from('profile-photos')
.getPublicUrl(filePath)

const { error: updateError } = await supabase
.from('gig_seeker_profiles')
.update({ photo_url: publicUrl })
.eq('user_id', currentUser.id)

if (updateError) throw updateError

alert('Photo uploaded successfully!')
setSeekerProfile({ ...seekerProfile, photo_url: publicUrl })
} catch (error: any) {
console.error('Error uploading photo:', error)
alert('Failed to upload photo: ' + error.message)
} finally {
setUploadingPhoto(false)
}
}

const handleDocumentUpload = async () => {
if (documentFiles.length === 0 || !currentUser) return

setUploadingDocs(true)

try {
const uploadPromises = documentFiles.map(async (file) => {
const fileExt = file.name.split('.').pop()
const fileName = `${currentUser.id}-${Date.now()}-${file.name}`
const filePath = `${fileName}`

const { error: uploadError } = await supabase.storage
.from('documents')
.upload(filePath, file)

if (uploadError) throw uploadError

return filePath
})

const uploadedPaths = await Promise.all(uploadPromises)

const existingDocs = seekerProfile?.documents || []
const updatedDocs = [...existingDocs, ...uploadedPaths]

const { error: updateError } = await supabase
.from('gig_seeker_profiles')
.update({ documents: updatedDocs })
.eq('user_id', currentUser.id)

if (updateError) throw updateError

alert('Documents uploaded successfully!')
setSeekerProfile({ ...seekerProfile, documents: updatedDocs })
setDocumentFiles([])
} catch (error: any) {
console.error('Error uploading documents:', error)
alert('Failed to upload documents: ' + error.message)
} finally {
setUploadingDocs(false)
}
}

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="text-xl">Loading profile...</div>
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

<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="bg-white rounded-lg shadow p-8 mb-6">
<h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
<p className="text-gray-600">Update your profile photo and documents</p>
</div>

<div className="bg-white rounded-lg shadow p-8 mb-6">
<h2 className="text-2xl font-bold mb-6">Profile Photo</h2>

<div className="flex items-center space-x-6 mb-6">
{photoPreview ? (
<img src={photoPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-gray-200" />
) : (
<div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
No Photo
</div>
)}

<div className="flex-1">
<input
type="file"
accept="image/*"
onChange={handlePhotoChange}
className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-green-600"
/>
<p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (max 5MB)</p>
</div>
</div>

{photoFile && (
<button
onClick={handlePhotoUpload}
disabled={uploadingPhoto}
className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
>
{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
</button>
)}
</div>

<div className="bg-white rounded-lg shadow p-8">
<h2 className="text-2xl font-bold mb-6">Documents</h2>

<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">
Upload Certificates, Qualifications, etc.
</label>
<input
type="file"
multiple
accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
onChange={(e) => setDocumentFiles(Array.from(e.target.files || []))}
className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
/>
<p className="text-sm text-gray-500 mt-2">PDF, DOC, DOCX, JPG, PNG (max 10MB each)</p>
</div>

{documentFiles.length > 0 && (
<div className="mb-6">
<p className="text-sm font-semibold mb-2">Selected files:</p>
<ul className="text-sm text-gray-600 space-y-1">
{documentFiles.map((file, idx) => (
<li key={idx}>• {file.name}</li>
))}
</ul>
</div>
)}

{documentFiles.length > 0 && (
<button
onClick={handleDocumentUpload}
disabled={uploadingDocs}
className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
>
{uploadingDocs ? 'Uploading...' : 'Upload Documents'}
</button>
)}

{seekerProfile?.documents && seekerProfile.documents.length > 0 && (
<div className="mt-8 pt-8 border-t">
<h3 className="font-semibold mb-4">Uploaded Documents ({seekerProfile.documents.length})</h3>
<div className="bg-gray-50 p-4 rounded">
<p className="text-sm text-gray-600">
{seekerProfile.documents.length} document(s) uploaded. Documents are securely stored and visible to clients when you apply to gigs.
</p>
</div>
</div>
)}
</div>

<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
<h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Profile Tips</h3>
<ul className="text-blue-800 space-y-1 text-sm">
<li>• Use a clear, professional photo for your profile</li>
<li>• Upload relevant certificates and qualifications</li>
<li>• Keep your documents organized and up-to-date</li>
<li>• A complete profile gets 3x more applications accepted!</li>
</ul>
</div>
</div>
</div>
)
}
