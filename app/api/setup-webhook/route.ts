import { NextResponse } from 'next/server'

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://basegigs.vercel.app'
  const secretKey = process.env.YOCO_SECRET_KEY || ''

  const response = await fetch('https://payments.yoco.com/api/webhooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${secretKey}`,
    },
    body: JSON.stringify({
      name: 'basegigs-payment-webhook',
      url: `${siteUrl}/api/yoco-webhook`,
    }),
  })

  const data = await response.json()

  return NextResponse.json({
    keyLoaded: secretKey.length > 0,
    keyPrefix: secretKey.slice(0, 8), // just enough to confirm it's sk_test_ or sk_live_, not the whole key
    keyLength: secretKey.length,
    status: response.status,
    yocoResponse: data,
  })
}
