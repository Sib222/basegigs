import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const PLAN_CONFIG: Record<string, { amountCents: number; gigsAllowed: number | null }> = {
  pay_per_gig: { amountCents: 6000, gigsAllowed: 1 },
  starter: { amountCents: 10000, gigsAllowed: 5 },
  professional: { amountCents: 20000, gigsAllowed: null },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const planKey = body?.planKey

    const plan = PLAN_CONFIG[planKey]
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization') || ''
    const accessToken = authHeader.replace('Bearer ', '')
    if (!accessToken) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(accessToken)
    if (userError || !userData?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const userId = userData.user.id

    const { data: checkoutRow, error: insertError } = await supabaseAdmin
      .from('payment_checkouts')
      .insert({
        user_id: userId,
        plan_key: planKey,
        amount_cents: plan.amountCents,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError || !checkoutRow) {
      console.error('Error creating checkout record:', insertError)
      return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 })
    }

    const ref = checkoutRow.id
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://basegigs.vercel.app'

    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: plan.amountCents,
        currency: 'ZAR',
        successUrl: `${siteUrl}/payment-success?ref=${ref}`,
        cancelUrl: `${siteUrl}/payment-cancelled?ref=${ref}`,
        failureUrl: `${siteUrl}/payment-cancelled?ref=${ref}`,
        externalId: ref,
        metadata: {
          ref,
          user_id: userId,
          plan_key: planKey,
        },
      }),
    })

    const yocoData = await yocoResponse.json()

    if (!yocoResponse.ok) {
      console.error('Yoco checkout creation failed:', yocoData)
      await supabaseAdmin
        .from('payment_checkouts')
        .update({ status: 'failed' })
        .eq('id', ref)
      return NextResponse.json({ error: 'Could not start payment with Yoco' }, { status: 500 })
    }

    await supabaseAdmin
      .from('payment_checkouts')
      .update({ yoco_checkout_id: yocoData.id })
      .eq('id', ref)

    return NextResponse.json({ redirectUrl: yocoData.redirectUrl })
  } catch (error: any) {
    console.error('Create checkout error:', error)
    return NextResponse.json({ error: 'Unexpected error starting payment' }, { status: 500 })
  }
}
