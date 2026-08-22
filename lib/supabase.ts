// SERVER-ONLY. Never import this file into a 'use client' component —
// it uses the Supabase service role key, which has full database access
// and must never reach the browser.
import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
