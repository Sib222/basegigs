'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape']

const GIG_SERVICES = ['Creative & Design Services', 'Media & Production', 'Live Events & Entertainment', 'Food & Culinary Services', 'Transportation & Logistics', 'Home & Maintenance Services', 'Digital & Technology Services', 'Education & Instruction', 'Health, Wellness & Personal Care', 'Business & Administrative Support', 'Construction & Building Trades', 'Carpentry, Woodcutting & Timber Work', 'Agriculture, Gardening & Land Care', 'Home Improvements & Renovations', 'Security & Access Control Services', 'Domestic & Household Support', 'Transport, Moving & Hauling', 'Mechanical & Technical Repairs', 'Informal Trade & Skilled Labor', 'Rural & Community Services']

const LANGUAGES = ['English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho', 'Tswana', 'Pedi', 'Venda', 'Tsonga', 'Swati', 'Ndebele']

const AVAILABILITY_OPTIONS = ['Full-time', 'Part-time', 'Weekends Only', 'Flexible', 'Contract Basis']

const TRAVEL_DISTANCES = ['Within my city only', 'Within my province', 'Nationwide', 'Not willing to travel']

const EDUCATION_LEVELS = ['No Formal Education', 'Primary School', 'Some High School', 'Matric / Grade 12', 'Certificate', 'Diploma', "Bachelor's Degree", 'Honours Degree', "Master's Degree", 'Doctorate']

export default function EditProfilePage() {
const router = useRouter()
const [loading, setLoading] = useState(true)
const [saving, setSaving] = useState(false)
const [savingProfessional, setSavingProfessional] = useState(false)
const [currentUser, setCurrentUser] = useState<any>(null)
const [profile, setProfile] = useState<any>(null)
const [seekerProfile, setSeekerProfile] = useState<any>(null)

// Personal & contact info
const [fullName, setFullName] = useState('')
const [gender, setGender] = useState('')
const [age, setAge] = useState('')
const [city, setCity] = useState('')
const [province, setProvince] = useState('')
const [idNumber, setIdNumber] = useState('')
const [phoneNumber, setPhoneNumber] = useState('')
const [email, setEmail] = useState('')
const [hasCar, setHasCar] = useState(false)

// Professional info
const [educationLevel, setEducationLevel] = useState('')
const [backgroundStory, setBackgroundStory] = useState('')
const [gigServices, setGigServices] = useState<string[]>([])
const [experience, setExperience] = useState('')
const [yearsExperience, setYearsExperience] = useState('')
const [availability, setAvailability] = useState('')
const [expectedRate, setExpectedRate] = useState('')
const [languages, setLanguages] = useState<string[]>([])
const [travelDistance, setTravelDistance] = useState('')

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

// Populate personal info
setFullName(profileData?.full_name || '')
setGender(profileData?.gender || '')
setAge(profileData?.age?.toString() || '')
setCity(profileData?.city || '')
setProvince(profileData?.province || '')
setIdNumber(profileData?.id_number || '')
setPhoneNumber(profileData?.phone_number || '')
setEmail(profileData?.email || '')
setHasCar(profileData?.has_car || false)

// Populate professional info
setEducationLevel(seekerData?.education_level || '')
setBackgroundStory(seekerData?.background_story || '')
setGigServices(seekerData?.gig_services || [])
setExperience(seekerData?.experience || '')
setYearsExperience(seekerData?.years_of_experience?.toString() || '')
setAvailability(seekerData?.availability || '')
setExpectedRate(seekerData?.expected_hourly_rate?.toString() || '')
setLanguages(seekerData?.languages || [])
setTravelDistance(seekerData?.travel_distance || '')

if (seekerData?.photo_url) {
setPhotoPreview(seekerData.photo_url)
}

setLoading(false)
}

const toggleGigService = (service: string) => {
setGigServices(prev =>
prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
)
}

const toggleLanguage = (language: string) => {
setLanguages(prev =>
prev.includes(language) ? prev.filter(l => l !== language) : [...prev, language]
)
}

const handleSavePersonalInfo = async () => {
if (!currentUser) return

if (!fullName || !gender || !age || !city || !province || !idNumber || !phoneNumber) {
alert('Please fill in Full Name, Gender, Age, City, Province, ID Number and Phone Number — these are required.')
return
}

setSaving(true)

try {
const { error } = await supabase
.from('profiles')
.update({
full_name: fullName,
gender,
age: parseInt(age),
city,
province,
id_number: idNumber,
phone_number: phoneNumber,
email,
has_car: hasCar,
})
.eq('user_id', currentUser.id)

if (error) throw error

alert('Personal info updated successfully!')
setProfile({ ...profile, full_name: fullName, gender, age: parseInt(age), city, province, id_number: idNumber, phone_number: phoneNumber, email, has_car: hasCar })
} catch (error: any) {
console.error('Error updating personal info:', error)
alert('Failed to update personal info: ' + error.message)
} finally {
setSaving(false)
}
}

const handleSaveProfessionalInfo = async () => {
if (!currentUser) return

if (gigServices.length === 0) {
alert('Please select at least one gig service.')
return
}

setSavingProfessional(true)

try {
// Upsert instead of update: if a gig_seeker_profiles row is somehow
// missing, update() would silently affect zero rows and this would
// appear to succeed while saving nothing.
const { error } = await supabase
.from('gig_seeker_profiles')
.upsert(
{
user_id: currentUser.id,
education_level: educationLevel,
background_story: backgroundStory,
gig_services: gigServices,
experience,
years_of_experience: yearsExperience ? parseInt(yearsExperience) : null,
availability,
expected_hourly_rate: expectedRate ? parseInt(expectedRate) : null,
languages,
travel_distance: travelDistance,
},
{ onConflict: 'user_id' }
)

if (error) throw error

alert('Professional info updated successfully!')
setSeekerProfile({
...seekerProfile,
education_level: educationLevel,
background_story: backgroundStory,
gig_services: gigServices,
experience,
years_of_experience: yearsExperience ? parseInt(yearsExperience) : null,
availability,
expected_hourly_rate: expectedRate ? parseInt(expectedRate) : null,
languages,
travel_distance: travelDistance,
})
} catch (error: any) {
console.error('Error updating professional info:', error)
alert('Failed to update professional info: ' + error.message)
} finally {
setSavingProfessional(false)
}
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

// Upsert instead of update — see note in handleSaveProfessionalInfo.
// This is the fix for photos appearing to upload successfully but
// never actually showing up on the dashboard.
const { error: updateError } = await supabase
.from('gig_seeker_profiles')
.upsert(
{
user_id: currentUser.id,
photo_url: publicUrl,
},
{ onConflict: 'user_id' }
)

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

// Upsert here too, for the same reason as photo_url above.
const { error: updateError } = await supabase
.from('gig_seeker_profiles')
.upsert(
{
user_id: currentUser.id,
documents: updatedDocs,
},
{ onConflict: 'user_id' }
)

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

// Route back to the correct dashboard — /dashboard/both for hybrid users,
// not the standalone gig-seeker-only dashboard
const dashboardHref = profile?.user_type === 'both' ? '/dashboard/both' : '/dashboard/gig-seeker'

return (
<div className="min-h-screen bg-sage">
<nav className="bg-white shadow-sm sticky top-0 z-50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<Link href={dashboardHref} className="flex items-center">
<img src="/logo.png" alt="BaseGigs Logo" className="h-9 w-auto" />
<span className="ml-2 text-xl font-semibold text-secondary">BaseGigs</span>
</Link>
<Link href={dashboardHref} className="text-gray-700 hover:text-primary transition-colors">
← Back to Dashboard
</Link>
</div>
</div>
</nav>

<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
<div className="bg-white rounded-lg shadow p-8 mb-6">
<h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
<p className="text-gray-600">Keep your information accurate and up to date so clients see the real you</p>
</div>

{/* Personal & Contact Info */}
<div className="bg-white rounded-lg shadow p-8 mb-6">
<h2 className="text-2xl font-bold mb-1">Personal & Contact Info</h2>
<p className="text-sm text-gray-500 mb-6">
Your phone number and email are only used by BaseGigs — clients never see them directly.
</p>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
<input
type="text"
value={fullName}
onChange={(e) => setFullName(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
<select
value={gender}
onChange={(e) => setGender(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
<option value="">Select gender</option>
<option value="Male">Male</option>
<option value="Female">Female</option>
<option value="Other">Other</option>
<option value="Prefer not to say">Prefer not to say</option>
</select>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
<input
type="number"
value={age}
onChange={(e) => setAge(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">ID Number *</label>
<input
type="text"
value={idNumber}
onChange={(e) => setIdNumber(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
<input
type="text"
value={city}
onChange={(e) => setCity(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
<select
value={province}
onChange={(e) => setProvince(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
<option value="">Select province</option>
{PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
</select>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Cellphone Number *</label>
<input
type="tel"
value={phoneNumber}
onChange={(e) => setPhoneNumber(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
<input
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
/>
</div>
</div>

<div className="flex items-center mb-6">
<input
type="checkbox"
checked={hasCar}
onChange={(e) => setHasCar(e.target.checked)}
className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
/>
<label className="ml-2 block text-sm text-gray-700">I have a car</label>
</div>

<button
onClick={handleSavePersonalInfo}
disabled={saving}
className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-semibold transition-colors"
>
{saving ? 'Saving...' : 'Save Personal Info'}
</button>
</div>

{/* Professional Info */}
<div className="bg-white rounded-lg shadow p-8 mb-6">
<h2 className="text-2xl font-bold mb-6">Professional Info</h2>

<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">Highest Level of Education</label>
<select
value={educationLevel}
onChange={(e) => setEducationLevel(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
<option value="">Select education level</option>
{EDUCATION_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
</select>
</div>

<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">About Me / Background (max 120 words)</label>
<textarea
value={backgroundStory}
onChange={(e) => setBackgroundStory(e.target.value)}
rows={4}
maxLength={600}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
placeholder="Tell clients about yourself..."
/>
<p className="text-sm text-gray-500 mt-1">{backgroundStory.split(' ').filter(w => w).length} / 120 words</p>
</div>

<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">Gig Services *</label>
<div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
{GIG_SERVICES.map(service => (
<label key={service} className="flex items-center">
<input
type="checkbox"
checked={gigServices.includes(service)}
onChange={() => toggleGigService(service)}
className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
/>
<span className="ml-2 text-sm">{service}</span>
</label>
))}
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
<input
type="number"
value={yearsExperience}
onChange={(e) => setYearsExperience(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
placeholder="e.g., 5"
/>
</div>

<div>
<label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
<select
value={availability}
onChange={(e) => setAvailability(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
<option value="">Select availability</option>
{AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
</select>
</div>
</div>

<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">Experience Description</label>
<textarea
value={experience}
onChange={(e) => setExperience(e.target.value)}
rows={3}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
placeholder="Describe your experience..."
/>
</div>

<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">Expected Hourly Rate (ZAR)</label>
<input
type="number"
value={expectedRate}
onChange={(e) => setExpectedRate(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
placeholder="e.g., 150"
/>
<p className="text-sm text-gray-500 mt-1">Leave blank if negotiable</p>
</div>

<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
<div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
{LANGUAGES.map(lang => (
<label key={lang} className="flex items-center">
<input
type="checkbox"
checked={languages.includes(lang)}
onChange={() => toggleLanguage(lang)}
className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
/>
<span className="ml-2 text-sm">{lang}</span>
</label>
))}
</div>
</div>

<div className="mb-6">
<label className="block text-sm font-medium text-gray-700 mb-2">Willing to Travel?</label>
<select
value={travelDistance}
onChange={(e) => setTravelDistance(e.target.value)}
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
>
<option value="">Select option</option>
{TRAVEL_DISTANCES.map(dist => <option key={dist} value={dist}>{dist}</option>)}
</select>
</div>

<button
onClick={handleSaveProfessionalInfo}
disabled={savingProfessional}
className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-semibold transition-colors"
>
{savingProfessional ? 'Saving...' : 'Save Professional Info'}
</button>
</div>

{/* Profile Photo */}
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
className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
/>
<p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (max 5MB)</p>
</div>
</div>

{photoFile && (
<button
onClick={handlePhotoUpload}
disabled={uploadingPhoto}
className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-semibold transition-colors"
>
{uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
</button>
)}
</div>

{/* Documents */}
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
className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-sage file:text-secondary hover:file:bg-primary-light"
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
className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 font-semibold transition-colors"
>
{uploadingDocs ? 'Uploading...' : 'Upload Documents'}
</button>
)}

{seekerProfile?.documents && seekerProfile.documents.length > 0 && (
<div className="mt-8 pt-8 border-t">
<h3 className="font-semibold mb-4">Uploaded Documents ({seekerProfile.documents.length})</h3>
<div className="bg-sage p-4 rounded">
<p className="text-sm text-gray-600">
{seekerProfile.documents.length} document(s) uploaded. Documents are securely stored and visible to clients when you apply to gigs.
</p>
</div>
</div>
)}
</div>

<div className="bg-primary-light border border-primary/20 rounded-lg p-6 mt-6">
<h3 className="text-lg font-semibold text-primary-dark mb-2">💡 Profile Tips</h3>
<ul className="text-primary-dark space-y-1 text-sm">
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
