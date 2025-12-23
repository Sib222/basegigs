'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PROVINCES = [
  'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo',
  'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape'
]

const GIG_SERVICES = [
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

const EDUCATION_LEVELS = [
  'No Formal Education',
  'Primary School',
  'Some High School',
  'Matric / Grade 12',
  'Certificate',
  'Diploma',
  'Bachelor\'s Degree',
  'Honours Degree',
  'Master\'s Degree',
  'Doctorate'
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Universal fields
  const [fullName, setFullName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [city, setCity] = useState('')
  const [province, setProvince] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [hasCar, setHasCar] = useState(false)
  const [userType, setUserType] = useState('')

  // Client fields
  const [clientBackground, setClientBackground] = useState('')
  const [lookingFor, setLookingFor] = useState('')

  // Gig Seeker fields
  const [seekerBackground, setSeekerBackground] = useState('')
  const [gigServices, setGigServices] = useState<string[]>([])
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [educationLevel, setEducationLevel] = useState('')
  const [experience, setExperience] = useState('')
  const [documentFiles, setDocumentFiles] = useState<File[]>([])

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUserId(user.id)
    setEmail(user.email || '')
  }

  const handleNext = () => {
    // Basic validation before moving to next step
    if (step === 1 && (!fullName || !age || !gender)) {
      alert('Please fill in all required fields')
      return
    }
    if (step === 2 && (!city || !province || !idNumber || !phoneNumber)) {
      alert('Please fill in all required fields')
      return
    }
    if (step === 3 && !userType) {
      alert('Please select your user type')
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const toggleGigService = (service: string) => {
    if (gigServices.includes(service)) {
      setGigServices(gigServices.filter(s => s !== service))
    } else {
      setGigServices([...gigServices, service])
    }
  }

  const handleSubmit = async () => {
    if (!userId) return

    setLoading(true)

    try {
      // Insert into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          full_name: fullName,
          age: parseInt(age),
          gender,
          city,
          province,
          id_number: idNumber,
          phone_number: phoneNumber,
          email,
          has_car: hasCar,
          user_type: userType
        })

      if (profileError) throw profileError

      // If client or both, insert client profile
      if (userType === 'client' || userType === 'both') {
        const { error: clientError } = await supabase
          .from('client_profiles')
          .insert({
            user_id: userId,
            background: clientBackground,
            looking_for: lookingFor
          })

        if (clientError) throw clientError
      }

      // If gig_seeker or both, insert gig seeker profile
      if (userType === 'gig_seeker' || userType === 'both') {
        // TODO: Upload photo and documents to Supabase Storage
        // For now, we'll store placeholder URLs
        const { error: seekerError } = await supabase
          .from('gig_seeker_profiles')
          .insert({
            user_id: userId,
            background_story: seekerBackground,
            gig_services: gigServices,
            photo_url: null, // Will implement file upload later
            education_level: educationLevel,
            experience,
            documents: [], // Will implement file upload later
            verified: false
          })

        if (seekerError) throw seekerError
      }

      // Redirect to appropriate dashboard
      if (userType === 'client') {
        router.push('/dashboard/client')
      } else if (userType === 'gig_seeker') {
        router.push('/dashboard/gig-seeker')
      } else {
        router.push('/dashboard/both')
      }
    } catch (error: any) {
      alert('Error saving profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Let's get to know you</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Biological Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age *
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Where are you located?</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Province *
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Select province</option>
                {PROVINCES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID Number *
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={hasCar}
                onChange={(e) => setHasCar(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                I have a car
              </label>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">How will you use BaseGigs?</h2>
            <p className="text-gray-600">Select one option:</p>
            <div className="space-y-3">
              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                <input
                  type="radio"
                  name="userType"
                  value="client"
                  checked={userType === 'client'}
                  onChange={(e) => setUserType(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <div className="ml-3">
                  <div className="font-semibold">Client</div>
                  <div className="text-sm text-gray-600">I want to post gigs and hire talent</div>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                <input
                  type="radio"
                  name="userType"
                  value="gig_seeker"
                  checked={userType === 'gig_seeker'}
                  onChange={(e) => setUserType(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <div className="ml-3">
                  <div className="font-semibold">Gig Seeker</div>
                  <div className="text-sm text-gray-600">I want to find and apply for gigs</div>
                </div>
              </label>
              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary">
                <input
                  type="radio"
                  name="userType"
                  value="both"
                  checked={userType === 'both'}
                  onChange={(e) => setUserType(e.target.value)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <div className="ml-3">
                  <div className="font-semibold">Both</div>
                  <div className="text-sm text-gray-600">I want to both post gigs and apply for gigs</div>
                </div>
              </label>
            </div>
          </div>
        )

      case 4:
        if (userType === 'client') {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Background (max 120 words)
                </label>
                <textarea
                  value={clientBackground}
                  onChange={(e) => setClientBackground(e.target.value)}
                  rows={4}
                  maxLength={600}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Tell us a bit about yourself..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {clientBackground.split(' ').filter(w => w).length} / 120 words
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are you looking for?
                </label>
                <textarea
                  value={lookingFor}
                  onChange={(e) => setLookingFor(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Describe the type of talent or gigs you're interested in..."
                />
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-green-800 font-semibold">Almost done! Click Submit to complete your profile.</p>
              </div>
            </div>
          )
        } else if (userType === 'gig_seeker') {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Build your gig seeker profile</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Background Story (max 120 words)
                </label>
                <textarea
                  value={seekerBackground}
                  onChange={(e) => setSeekerBackground(e.target.value)}
                  rows={4}
                  maxLength={600}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Tell clients about yourself..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  {seekerBackground.split(' ').filter(w => w).length} / 120 words
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What type of gig services do you provide? *
                </label>
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
