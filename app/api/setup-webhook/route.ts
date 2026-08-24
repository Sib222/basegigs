import { NextResponse } from 'next/server'

const OLD_WEBHOOK_IDS = [
  'sub_4xbq4vbRmXGtlM5IlARh7egy',
  'sub_9g0yPVWzJbMfYq0ia22cdkxV',
  'sub_kg9YPO8WJNZsbD8c1JkiDJmg',
  'sub_9Ee74JKrOByFD7Pip1KfK97x',
  'sub_0Ll14JR4zeehlM4S6pGIRawE',
]

export async function GET() {
  const secretKey = process.env.YOCO_SECRET_KEY || ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://basegigs.vercel.app'

  const deleteResults = []
  for (const id of OLD_WEBHOOK_IDS) {
    const res = await fetch(`https://payments.yoco.com/api/webhooks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${secretKey}` },
    })
    deleteResults.push({ id, status: res.status })
  }

  const registerResponse = await fetch('https://payments.yoco.com/api/webhooks', {
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

  const registerData = await registerResponse.json()

  return NextResponse.json({
    deleteResults,
    registerStatus: registerResponse.status,
    registerResponse: registerData,
  })
}
