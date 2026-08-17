'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const PROVINCES = ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'North West', 'Northern Cape', 'Western Cape']

const GIG_SERVICES = ['Creative & Design Services', 'Media & Production', 'Live Events & Entertainment', 'Food & Culinary Services', 'Transportation & Logistics', 'Home & Maintenance Services', 'Digital & Technology Services', 'Education & Instruction', 'Health, Wellness & Personal Care', 'Business & Administrative Support', 'Construction & Building Trades', 'Carpentry, Woodcutting & Timber Work', 'Agriculture, Gardening & Land Care', 'Home Improvements & Renovations', 'Security & Access Control Services', 'Domestic & Household Support', 'Transport, Moving & Hauling', 'Mechanical & Technical Repairs', 'Informal Trade & Skilled Labor', 'Rural & Community Services']

const EDUCATION_LEVELS = ['No Formal Education', 'Primary School', 'Some High School', 'Matric / Grade 12', 'Certificate', 'Diploma', "Bachelor's Degree", 'Honours Degree', "Master's Degree", 'Doctorate']

const LANGUAGES = ['English', 'Afrikaans', 'Zulu', 'Xhosa', 'Sotho', 'Tswana', 'Pedi', 'Venda', 'Tsonga', 'Swati', 'Ndebele']

const AVAILABILITY_OPTIONS = ['Full-time', 'Part-time', 'Weekends Only', 'Flexible', 'Contract Basis']

const TRAVEL_DISTANCES = ['Within my city only', 'Within my province', 'Nationwide', 'Not willing to travel']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>('')

  // Basic info
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

  // Client
  const [clientBackground, setClientBackground] = useState('')
  const [lookingFor, setLookingFor] = useState('')

  // Gig seeker
  const [seekerBackground, setSeekerBackground] = useState('')
  const [gigServices, setGigServices] = useState<string[]>([])
  const [educationLevel, setEducationLevel] = useState('')
  const [experience, setExperience] = useState('')
  const [availability, setAvailability] = useState('')
  const [expectedRate, setExpectedRate] = useState('')
  const [yearsExperience, setYearsExperience] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [travelDistance, setTravelDistance] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')

  // Photo & documents
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [idDocFile, setIdDocFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null)

  const photoInputRef = useRef<HTMLInputElement>(null)

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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo must be under 5MB')
      return
    }
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleNext = () => {
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

  const handleBack = () => setStep(step - 1)

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

  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const filename = `${folder}/${userId}-${Date.now()}.${ext}`
    const { error } = await supabase.storage.from(bucket).upload(filename, file)
    if (error) {
      console.error('Upload error:', error)
      return null
    }
    return filename
  }

  const handleSubmit = async () => {
    if (!userId) return

    // Validate required docs for gig seekers
    if (userType === 'gig_seeker' || userType === 'both') {
      if (!cvFile) {
        alert('CV/Resume is required')
        return
      }
      if (!idDocFile) {
        alert('ID Document is required')
        return
      }
    }

    setLoading(true)

    try {
      // Upload profile photo
      let photoPath: string | null = null
      if (photoFile && (userType === 'gig_seeker' || userType === 'both')) {
        setUploadProgress('Uploading profile photo...')
        photoPath = await uploadFile(photoFile, 'profile-photos', 'photos')
      }

      // Upload documents
      const documentPaths: string[] = []

      if (cvFile) {
        setUploadProgress('Uploading CV/Resume...')
        const path = await uploadFile(cvFile, 'documents', 'cv')
        if (path) documentPaths.push(path)
      }

      if (idDocFile) {
        setUploadProgress('Uploading ID Document...')
        const path = await uploadFile(idDocFile, 'documents', 'id')
        if (path) documentPaths.push(path)
      }

      if (certFile) {
        setUploadProgress('Uploading Certification...')
        const path = await uploadFile(certFile, 'documents', 'cert')
        if (path) documentPaths.push(path)
      }

      if (referenceFile) {
        setUploadProgress('Uploading Reference Letter...')
        const path = await uploadFile(referenceFile, 'documents', 'reference')
        if (path) documentPaths.push(path)
      }

      if (portfolioFile) {
        setUploadProgress('Uploading Portfolio...')
        const path = await uploadFile(portfolioFile, 'documents', 'portfolio')
        if (path) documentPaths.push(path)
      }

      setUploadProgress('Saving your profile...')

      // Save main profile
      const { error: profileError } = await supabase.from('profiles').insert({
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

      // Save client profile
      if (userType === 'client' || userType === 'both') {
        const { error: clientError } = await supabase.from('client_profiles').insert({
          user_id: userId,
          background: clientBackground,
          looking_for: lookingFor
        })
        if (clientError) throw clientError
      }

      // Save gig seeker profile
      if (userType === 'gig_seeker' || userType === 'both') {
        const { error: seekerError } = await supabase.from('gig_seeker_profiles').insert({
          user_id: userId,
          background_story: seekerBackground,
          gig_services: gigServices,
          photo_url: photoPath,
          education_level: educationLevel,
          experience,
          documents: documentPaths,
          verified: false,
          availability,
          expected_hourly_rate: expectedRate ? parseInt(expectedRate) : null,
          years_of_experience: yearsExperience ? parseInt(yearsExperience) : null,
          languages,
          travel_distance: travelDistance,
          portfolio_url: portfolioUrl || null
        })
        if (seekerError) throw seekerError
      }

      if (userType === 'client') router.push('/dashboard/client')
      else if (userType === 'gig_seeker') router.push('/dashboard/gig-seeker')
      else router.push('/dashboard/both')

    } catch (error: any) {
      alert('Error saving profile: ' + error.message)
    } finally {
      setLoading(false)
      setUploadProgress('')
    }
  }

  // File upload box component
  const FileUploadBox = ({
    label,
    required,
    hint,
    file,
    onChange,
    accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png'
  }: {
    label: string
    required?: boolean
    hint?: string
    file: File | null
    onChange: (f: File | null) => void
    accept?: string
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400">(Optional)</span>}
      </label>
      {hint && <p className="text-xs text-primary-dark bg-primary-light rounded px-2 py-1 mb-2">{hint}</p>}
      <div
        onClick={() => document.getElementById(`file-${label}`)?.click()}
        className={`border-2 border-dashed rounded-lg p-4 cursor-pointer text-center transition-colors hover:border-primary ${
          file ? 'border-primary bg-primary-light' : 'border-gray-300'
        }`}
      >
        {file ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📄</span>
              <span className="text-sm font-medium text-primary-dark">{file.name}</span>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              className="text-red-500 text-xs hover:underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div>
            <span className="text-3xl">📁</span>
            <p className="text-sm text-gray-500 mt-1">Click to upload</p>
            <p className="text-xs text-gray-400">PDF, DOC, JPG, PNG accepted</p>
          </div>
        )}
      </div>
      <input
        id={`file-${label}`}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] || null)}
      />
    </div>
  )

  const renderStep = () => {
    // Step 1 - Basic Info
    if (step === 1) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Let&apos;s get to know you</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Biological Name *</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>
      )
    }

    // Step 2 - Location
    if (step === 2) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Where are you located?</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Province *</label>
            <select value={province} onChange={(e) => setProvince(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required>
              <option value="">Select province</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID Number *</label>
            <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
            <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email (optional)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" checked={hasCar} onChange={(e) => setHasCar(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
            <label className="ml-2 block text-sm text-gray-700">I have a car</label>
          </div>
        </div>
      )
    }

    // Step 3 - User Type
    if (step === 3) {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">How will you use BaseGigs?</h2>
          <p className="text-gray-600">Select one option:</p>
          <div className="space-y-3">
            {[
              { value: 'client', title: 'Client', desc: 'I want to post gigs and hire talent' },
              { value: 'gig_seeker', title: 'Gig Seeker', desc: 'I want to find and apply for gigs' },
              { value: 'both', title: 'Both', desc: 'I want to both post gigs and apply for gigs' },
            ].map(opt => (
              <label key={opt.value} className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary transition-colors">
                <input type="radio" name="userType" value={opt.value} checked={userType === opt.value} onChange={(e) => setUserType(e.target.value)} className="h-4 w-4 text-primary focus:ring-primary" />
                <div className="ml-3">
                  <div className="font-semibold">{opt.title}</div>
                  <div className="text-sm text-gray-600">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )
    }

    // Step 4
    if (step === 4) {
      if (userType === 'client') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Tell us about yourself</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Background (max 120 words)</label>
              <textarea value={clientBackground} onChange={(e) => setClientBackground(e.target.value)} rows={4} maxLength={600} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Tell us a bit about yourself..." />
              <p className="text-sm text-gray-500 mt-1">{clientBackground.split(' ').filter(w => w).length} / 120 words</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What are you looking for?</label>
              <textarea value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Describe the type of talent or gigs you're interested in..." />
            </div>
            <div className="bg-primary-light p-4 rounded-lg">
              <p className="text-primary-dark font-semibold">Almost done! Click Submit to complete your profile.</p>
            </div>
          </div>
        )
      }

      if (userType === 'gig_seeker' || userType === 'both') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {userType === 'both' ? 'Client Profile' : 'Tell us about yourself'}
            </h2>
            {userType === 'both' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Background (max 120 words)</label>
                  <textarea value={clientBackground} onChange={(e) => setClientBackground(e.target.value)} rows={4} maxLength={600} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Tell us about yourself as a client..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What are you looking for?</label>
                  <textarea value={lookingFor} onChange={(e) => setLookingFor(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
                </div>
              </>
            )}
            {userType === 'gig_seeker' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Short Background Story (max 120 words)</label>
                  <textarea value={seekerBackground} onChange={(e) => setSeekerBackground(e.target.value)} rows={4} maxLength={600} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Tell clients about yourself..." />
                  <p className="text-sm text-gray-500 mt-1">{seekerBackground.split(' ').filter(w => w).length} / 120 words</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">What type of gig services do you provide? *</label>
                  <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                    {GIG_SERVICES.map(service => (
                      <label key={service} className="flex items-center">
                        <input type="checkbox" checked={gigServices.includes(service)} onChange={() => toggleGigService(service)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <span className="ml-2 text-sm">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )
      }
    }

    // Step 5
    if (step === 5) {
      if (userType === 'both') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Gig Seeker Profile</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Short Background Story (max 120 words)</label>
              <textarea value={seekerBackground} onChange={(e) => setSeekerBackground(e.target.value)} rows={4} maxLength={600} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What type of gig services do you provide? *</label>
              <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {GIG_SERVICES.map(service => (
                  <label key={service} className="flex items-center">
                    <input type="checkbox" checked={gigServices.includes(service)} onChange={() => toggleGigService(service)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-sm">{service}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )
      }

      if (userType === 'gig_seeker') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Professional Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Highest Level of Education *</label>
              <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select education level</option>
                {EDUCATION_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <input type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="e.g., 3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Description</label>
              <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="Describe your experience..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select availability</option>
                {AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        )
      }
    }

    // Step 6
    if (step === 6) {
      if (userType === 'both') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Professional Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Highest Level of Education</label>
              <select value={educationLevel} onChange={(e) => setEducationLevel(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select education level</option>
                {EDUCATION_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
              <input type="number" value={yearsExperience} onChange={(e) => setYearsExperience(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Description</label>
              <textarea value={experience} onChange={(e) => setExperience(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select availability</option>
                {AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        )
      }

      if (userType === 'gig_seeker') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Additional Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Hourly Rate (ZAR)</label>
              <input type="number" value={expectedRate} onChange={(e) => setExpectedRate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="e.g., 150" />
              <p className="text-sm text-gray-500 mt-1">Leave blank if negotiable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {LANGUAGES.map(lang => (
                  <label key={lang} className="flex items-center">
                    <input type="checkbox" checked={languages.includes(lang)} onChange={() => toggleLanguage(lang)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Willing to Travel?</label>
              <select value={travelDistance} onChange={(e) => setTravelDistance(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select option</option>
                {TRAVEL_DISTANCES.map(dist => <option key={dist} value={dist}>{dist}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL (Optional)</label>
              <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="https://yourportfolio.com" />
              <p className="text-sm text-gray-500 mt-1">Link to your website, Instagram, or portfolio</p>
            </div>
          </div>
        )
      }
    }

    // Step 7
    if (step === 7) {
      if (userType === 'both') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Additional Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expected Hourly Rate (ZAR)</label>
              <input type="number" value={expectedRate} onChange={(e) => setExpectedRate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="e.g., 150" />
              <p className="text-sm text-gray-500 mt-1">Leave blank if negotiable</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Languages Spoken</label>
              <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                {LANGUAGES.map(lang => (
                  <label key={lang} className="flex items-center">
                    <input type="checkbox" checked={languages.includes(lang)} onChange={() => toggleLanguage(lang)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    <span className="ml-2 text-sm">{lang}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Willing to Travel?</label>
              <select value={travelDistance} onChange={(e) => setTravelDistance(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="">Select option</option>
                {TRAVEL_DISTANCES.map(dist => <option key={dist} value={dist}>{dist}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio URL (Optional)</label>
              <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" placeholder="https://yourportfolio.com" />
            </div>
          </div>
        )
      }

      // Gig seeker photo & documents
      if (userType === 'gig_seeker') {
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Photo & Documents</h2>
            <p className="text-gray-600 text-sm">This is the last step. Your profile photo and documents help clients trust and choose you.</p>

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo <span className="text-gray-400">(Optional but recommended)</span></label>
              <div className="flex items-center gap-4">
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden bg-sage"
                >
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl">📷</span>
                  )}
                </div>
                <div>
                  <button type="button" onClick={() => photoInputRef.current?.click()} className="px-4 py-2 bg-sage rounded-lg text-sm hover:bg-primary-light transition-colors">
                    {photoPreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  {photoPreview && (
                    <button type="button" onClick={() => { setPhotoPreview(null); setPhotoFile(null) }} className="ml-2 text-red-500 text-sm hover:underline">
                      Remove
                    </button>
                  )}
                  <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 5MB</p>
                </div>
              </div>
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoChange} />
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <FileUploadBox
                label="CV/Resume"
                required
                file={cvFile}
                onChange={setCvFile}
              />
              <FileUploadBox
                label="ID Document"
                required
                file={idDocFile}
                onChange={setIdDocFile}
              />
              <FileUploadBox
                label="Proof of Skill or Certification"
                hint="No certificate? Upload a portfolio document instead. Uploading either one boosts your chances of getting hired."
                file={certFile}
                onChange={setCertFile}
              />
              <FileUploadBox
                label="Portfolio Document"
                hint="Photos of past work, a PDF showcase, or any proof of your skill. Uploading this boosts your chances even if you have a certificate."
                file={portfolioFile}
                onChange={setPortfolioFile}
              />
              <FileUploadBox
                label="Reference Letter"
                hint="A letter from a past employer or client goes a long way in building trust with new clients."
                file={referenceFile}
                onChange={setReferenceFile}
              />
            </div>

            <div className="bg-primary-light p-4 rounded-lg">
              <p className="text-primary-dark font-semibold">Almost there! Click Submit to complete your profile.</p>
              <p className="text-primary-dark text-sm mt-1">Your profile will be reviewed and verified before appearing on the Find Talent page.</p>
            </div>
          </div>
        )
      }
    }

    // Step 8 - both user type photo & documents
    if (step === 8 && userType === 'both') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Profile Photo & Documents</h2>
          <p className="text-gray-600 text-sm">Your profile photo and documents help clients trust and choose you.</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo <span className="text-gray-400">(Optional but recommended)</span></label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => photoInputRef.current?.click()}
                className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden bg-sage"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>
              <div>
                <button type="button" onClick={() => photoInputRef.current?.click()} className="px-4 py-2 bg-sage rounded-lg text-sm hover:bg-primary-light transition-colors">
                  {photoPreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                {photoPreview && (
                  <button type="button" onClick={() => { setPhotoPreview(null); setPhotoFile(null) }} className="ml-2 text-red-500 text-sm hover:underline">
                    Remove
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-1">JPG or PNG, max 5MB</p>
              </div>
            </div>
            <input ref={photoInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handlePhotoChange} />
          </div>

          <div className="space-y-4">
            <FileUploadBox label="CV/Resume" required file={cvFile} onChange={setCvFile} />
            <FileUploadBox label="ID Document" required file={idDocFile} onChange={setIdDocFile} />
            <FileUploadBox
              label="Proof of Skill or Certification"
              hint="No certificate? Upload a portfolio document instead. Uploading either one boosts your chances of getting hired."
              file={certFile}
              onChange={setCertFile}
            />
            <FileUploadBox
              label="Portfolio Document"
              hint="Photos of past work, a PDF showcase, or any proof of your skill."
              file={portfolioFile}
              onChange={setPortfolioFile}
            />
            <FileUploadBox
              label="Reference Letter"
              hint="A letter from a past employer or client goes a long way in building trust."
              file={referenceFile}
              onChange={setReferenceFile}
            />
          </div>

          <div className="bg-primary-light p-4 rounded-lg">
            <p className="text-primary-dark font-semibold">Almost there! Click Submit to complete your profile.</p>
            <p className="text-primary-dark text-sm mt-1">Your profile will be reviewed and verified before appearing on the Find Talent page.</p>
          </div>
        </div>
      )
    }

    return null
  }

  const totalSteps = userType === 'client' ? 4 : userType === 'gig_seeker' ? 7 : userType === 'both' ? 8 : 3
  const isLastStep = step === totalSteps

  return (
    <div className="min-h-screen bg-sage py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="BaseGigs Logo" className="h-12 w-auto" />
        </div>
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: `${(step / totalSteps) * 100}%` }} />
            </div>
          </div>

          {renderStep()}

          {loading && uploadProgress && (
            <div className="mt-4 p-3 bg-primary-light rounded-lg text-sm text-primary-dark text-center">
              ⏳ {uploadProgress}
            </div>
          )}

          <div className="mt-8 flex justify-between">
            {step > 1 && (
              <button onClick={handleBack} disabled={loading} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-sage disabled:opacity-50 transition-colors">
                Back
              </button>
            )}
            <div className="ml-auto">
              {!isLastStep ? (
                <button onClick={handleNext} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                  Next
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
