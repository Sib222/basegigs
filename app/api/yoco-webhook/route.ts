import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'
import crypto from 'crypto'

function verifyYocoSignature(
  rawBody: string,
  webhookId: string | null,
  webhookTimestamp: string | null,
  webhookSignature: string | null,
  secret: string
): boolean {
  if (!webhookId || !webhookTimestamp || !webhookSignature || !secret) return false

  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(webhookTimestamp, 10)) > 300) return false

  const signedContent = `${webhookId}.${webhookTimestamp}.${rawBody}`
  const secretBytes = Buffer.from(secret.replace('whsec_', ''), 'base64')
  const expectedSignature = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64')

  return webhookSignature.split(' ').some((entry) => {
    const sig = entry.split(',')[1]
    if (!sig) return false
    try {
      return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature))
    } catch {
      return false
    }
  })
}

const PLAN_CONFIG: Record<string, { gigsAllowed: number | null }> = {
  pay_per_gig: { gigsAllowed: 1 },
  starter: { gigsAllowed: 5 },
  professional: { gigsAllowed: null },
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()

  const webhookId = request.headers.get('webhook-id')
  const webhookTimestamp = request.headers.get('webhook-timestamp')
  const webhookSignature = request.headers.get('webhook-signature')

  const isValid = verifyYocoSignature(
    rawBody,
    webhookId,
    webhookTimestamp,
    webhookSignature,
    process.env.YOCO_WEBHOOK_SECRET || ''
  )

  if (!isValid) {
    console.error('Rejected webhook: invalid or missing signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: any
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  if (event.type !== 'payment.succeeded') {
    return NextResponse.json({ received: true })
  }

  const checkoutId = event.payload?.metadata?.checkoutId
  if (!checkoutId) {
    console.error('payment.succeeded webhook missing metadata.checkoutId')
    return NextResponse.json({ received: true })
  }

  const supabaseAdmin = getSupabaseAdmin()

  const { data: checkoutRow, error: fetchError } = await supabaseAdmin
    .from('payment_checkouts')
    .select('*')
    .eq('yoco_checkout_id', checkoutId)
    .single()

  if (fetchError || !checkoutRow) {
    console.error('No matching checkout record for Yoco checkout id:', checkoutId)
    return NextResponse.json({ received: true })
  }

  if (checkoutRow.status === 'completed') {
    return NextResponse.json({ received: true })
  }

  const plan = PLAN_CONFIG[checkoutRow.plan_key]
  if (!plan) {
    console.error('Unknown plan_key on checkout row:', checkoutRow.plan_key)
    return NextResponse.json({ received: true })
  }

  const now = new Date()
  const expires = new Date()
  expires.setDate(now.getDate() + 30)

  // onConflict: 'user_id' is the fix — without it, upsert only checks the
  // table's primary key (id), which is always a fresh UUID, so it would
  // never find a match and would keep inserting new rows forever.
  const { error: subError } = await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: checkoutRow.user_id,
      plan_name: checkoutRow.plan_key,
      gigs_allowed: plan.gigsAllowed,
      gig_posts_left: plan.gigsAllowed,
      activated_at: now.toISOString(),
      expires_at: expires.toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (subError) {
    console.error('Failed to activate subscription:', subError)
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 })
  }

  await supabaseAdmin
    .from('payment_checkouts')
    .update({ status: 'completed', completed_at: now.toISOString() })
    .eq('id', checkoutRow.id)

  return NextResponse.json({ received: true })
}
