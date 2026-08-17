'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface ClientProfileData {
  full_name: string | null
  age: number | null
  gender: string | null
  city: string | null
  province: string | null
}

interface ClientExtra {
  background: string | null
  looking_for: string | null
  photo_url: string | null
}

interface ClientGig {
  id: number
  gig_name: string
  gig_type: string
  city: string
  province: string
  payment_amount: number
  payment_type: string
  created_at: string
}

export default function ClientProfilePage({ params }: { params: { clientId: string } }) {
  const clientId = params.clientId
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [profile, setProfile] = useState<ClientProfileData | null>(null)
  const [clientExtra, setClientExtra] = useState<ClientExtra | null>(null)
  const [otherGigs, setOtherGigs] = useState<ClientGig[]>([])

  useEffect(() => {
    fetchClientProfile()
  }, [])

  const fetchClientProfile = async () => {
    try {
      // Only select non-sensitive columns — never phone_number, email, or id_number
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, age, gender, city, province')
        .eq('user_id', clientId)
        .single()

      if (profileError || !profileData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setProfile(profileData)

      const { data: extraData } = await supabase
        .from('client_profiles')
        .select('background, looking_for, photo_url')
        .eq('user_id', clientId)
        .single()

      setClientExtra(extraData || null)

      const { data: gigsData } = await supabase
        .from('gigs')
        .select('id, gig_name, gig_type, city, province, payment_amount, payment_type, created_at')
        .eq('client_id', clientId)
        .eq('status', 'open')
        .is('deleted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })

      setOtherGigs(gigsData || [])
    } catch (err) {
      console.error('Error loading client profile:', err)
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  const getPhotoUrl = (photoUrl: string | null) => {
    if (!photoUrl) return null
    if (photoUrl.startsWith('http')) return photoUrl
    const { data } = supabase.storage.from('profile-photos').getPublicUrl(photoUrl)
    return data.publicUrl
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading profile...</div>
      </div>
    )
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">This client profile could not be found.</p>
          <Link href="/browse-gigs" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-block">
            Back to Browse Gigs
          </Link>
        </div>
      </div>
    )
  }

  const photoUrl = getPhotoUrl(clientExtra?.photo_url || null)

  return (
    <div className="min-h-screen bg-sage">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="BaseGigs Logo" className="h-9 w-auto" />
              <span className="ml-2 text-xl font-semibold text-secondary">BaseGigs</span>
            </Link>
            <Link href="/browse-gigs" className="text-gray-700 hover:text-primary transition-colors">
              ← Back to Browse Gigs
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex items-start gap-6 p-8 bg-sage border-b">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-br from-primary-light to-sage flex-shrink-0">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={profile.full_name || 'Client'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name || 'Client')}&size=200&background=639922&color=fff&bold=true`
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-primary">🏢</div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{profile.full_name || 'BaseGigs Client'}</h1>
              <div className="text-sm text-gray-600 space-y-1">
                {(profile.age || profile.gender) && (
                  <div>
                    {profile.age ? `${profile.age} years` : ''}
                    {profile.age && profile.gender ? ' • ' : ''}
                    {profile.gender || ''}
                  </div>
                )}
                {(profile.city || profile.province) && (
                  <div>📍 {profile.city}{profile.city && profile.province ? ', ' : ''}{profile.province}</div>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            {clientExtra?.background && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{clientExtra.background}</p>
              </div>
            )}

            {clientExtra?.looking_for && (
              <div className="mb-2">
                <h2 className="text-lg font-bold text-gray-900 mb-2">What They&apos;re Looking For</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{clientExtra.looking_for}</p>
              </div>
            )}

            {!clientExtra?.background && !clientExtra?.looking_for && (
              <p className="text-gray-500 italic">This client hasn&apos;t added a bio yet.</p>
            )}
          </div>
        </div>

        {otherGigs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Other Open Gigs by {profile.full_name || 'This Client'}
            </h2>
            <div className="space-y-3">
              {otherGigs.map((gig) => (
                <div key={gig.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{gig.gig_name}</h3>
                      <p className="text-sm text-gray-600">{gig.gig_type} — {gig.city}, {gig.province}</p>
                    </div>
                    <div className="text-primary font-bold text-sm whitespace-nowrap">
                      R{gig.payment_amount?.toLocaleString()} ({gig.payment_type})
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/browse-gigs" className="mt-4 inline-block text-primary hover:underline text-sm font-semibold">
              View all gigs on Browse Gigs →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
