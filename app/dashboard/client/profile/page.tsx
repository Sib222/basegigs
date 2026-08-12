'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape']

export default function ClientEditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingAbout, setSavingAbout] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [clientProfile, setClientProfile] = useState<any>(null)

  // Personal & contact info
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState('')
  const [age, setAge] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')

  // About
  const [background, setBackground] = useState('')
  const [lookingFor, setLookingFor] = useState('')

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

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

    if (profileData?.user_type !== 'client' && profileData?.user_type !== 'both') {
      router.push('/dashboard/gig-seeker')
      return
    }

    const { data: clientData } = await supabase
      .from('client_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setCurrentUser(user)
    setProfile(profileData)
    setClientProfile(clientData)

    setFullName(profileData?.full_name || '')
    setGender(profileData?.gender || '')
    setAge(profileData?.age?.toString() || '')
    setCity(profileData?.city || '')
    setProvince(profileData?.province || '')
    setIdNumber(profileData?.id_number || '')
    setPhoneNumber(profileData?.phone_number || '')
    setEmail(profileData?.email || '')

    setBackground(clientData?.background || '')
    setLookingFor(clientData?.looking_for || '')

    if (clientData?.photo_url) {
      setPhotoPreview(clientData.photo_url)
    }

    setLoading(false)
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
        })
        .eq('user_id', currentUser.id)

      if (error) throw error

      alert('Personal info updated successfully!')
      setProfile({
        ...profile,
        full_name: fullName,
        gender,
        age: parseInt(age),
        city,
        province,
        id_number: idNumber,
        phone_number: phoneNumber,
        email,
      })
    } catch (error: any) {
      console.error('Error updating personal info:', error)
      alert('Failed to update personal info: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAbout = async () => {
    if (!currentUser) return

    setSavingAbout(true)

    try {
      const { error } = await supabase
        .from('client_profiles')
        .update({
          background,
          looking_for: lookingFor,
        })
        .eq('user_id', currentUser.id)

      if (error) throw error

      alert('About info updated successfully!')
      setClientProfile({ ...clientProfile, background, looking_for: lookingFor })
    } catch (error: any) {
      console.error('Error updating about info:', error)
      alert('Failed to update about info: ' + error.message)
    } finally {
      setSavingAbout(false)
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

      const { error: updateError } = await supabase
        .from('client_profiles')
        .update({ photo_url: publicUrl })
        .eq('user_id', currentUser.id)

      if (updateError) throw updateError

      alert('Photo uploaded successfully!')
      setClientProfile({ ...clientProfile, photo_url: publicUrl })
    } catch (error: any) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo: ' + error.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    )
  }

  const dashboardHref = profile?.user_type === 'both' ? '/dashboard/both' : '/dashboard/client'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href={dashboardHref} className="flex items-center">
              <span className="text-2xl font-bold text-primary">B</span>
              <span className="ml-2 text-xl font-semibold">BaseGigs</span>
            </Link>
            <Link href={dashboardHref} className="text-gray-700 hover:text-primary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-gray-600">
            Your photo, name and bio are shown to gig seekers when they click &quot;Posted by&quot; on your gigs.
          </p>
        </div>

        {/* Personal & Contact Info */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold mb-1">Personal & Contact Info</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your phone number, email and ID number are only used by BaseGigs — gig seekers never see them.
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

          <button
            onClick={handleSavePersonalInfo}
            disabled={saving}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
          >
            {saving ? 'Saving...' : 'Save Personal Info'}
          </button>
        </div>

        {/* About / Looking For */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-2xl font-bold mb-6">About You</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Short Background (max 120 words)</label>
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              rows={4}
              maxLength={600}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Tell gig seekers a bit about yourself or your business..."
            />
            <p className="text-sm text-gray-500 mt-1">{background.split(' ').filter(w => w).length} / 120 words</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">What Are You Looking For?</label>
            <textarea
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              placeholder="Describe the type of talent or gigs you're interested in..."
            />
          </div>

          <button
            onClick={handleSaveAbout}
            disabled={savingAbout}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-green-600 disabled:opacity-50 font-semibold"
          >
            {savingAbout ? 'Saving...' : 'Save About Info'}
          </button>
        </div>

        {/* Profile Photo / Logo */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">Profile Photo / Company Logo</h2>

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
              <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF (max 5MB). Can be a personal photo or a company logo.</p>
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
      </div>
    </div>
  )
}
