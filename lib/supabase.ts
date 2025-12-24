import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log to help debug
if (typeof window !== 'undefined') {
  console.log('Supabase URL exists:', !!supabaseUrl)
  console.log('Supabase Key exists:', !!supabaseAnonKey)
  console.log('Supabase URL:', supabaseUrl)
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
