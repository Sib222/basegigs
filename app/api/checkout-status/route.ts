import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')
  if (!ref) {
    return NextResponse.json({ status: 'not_found' })
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { data, error } = await supabaseAdmin
    .from('payment_checkouts')
    .select('status, plan_key')
    .eq('id', ref)
    .single()

  if (error || !data) {
    return NextResponse.json({ status: 'not_found' })
  }

  return NextResponse.json({ status: data.status, plan_key: data.plan_key })
}
