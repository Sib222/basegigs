'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [status, setStatus] = useState('Testing...')
  const [details, setDetails] = useState<any>({})

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      // Test 1: Check if supabase client exists
      setDetails((prev: any) => ({ ...prev, clientExists: !!supabase }))

      // Test 2: Try to get session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      setDetails((prev: any) => ({ 
        ...prev, 
        sessionCheck: sessionError ? 'ERROR: ' + sessionError.message : 'OK',
        session: sessionData?.session ? 'Logged in' : 'Not logged in'
      }))

      // Test 3: Try a simple database query
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        setStatus('❌ Database connection FAILED')
        setDetails((prev: any) => ({ ...prev, dbError: error.message }))
      } else {
        setStatus('✅ Supabase connection works!')
        setDetails((prev: any) => ({ ...prev, dbSuccess: true }))
      }
    } catch (err: any) {
      setStatus('❌ Error: ' + err.message)
      setDetails((prev: any) => ({ ...prev, catchError: err.message }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="text-2xl mb-6">{status}</div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Details:</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>

        <div className="mt-6">
          <h3 className="font-bold mb-2">Environment Variables:</h3>
          <div className="text-sm">
            <div>URL exists: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Yes' : '❌ No'}</div>
            <div>Key exists: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Yes' : '❌ No'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
