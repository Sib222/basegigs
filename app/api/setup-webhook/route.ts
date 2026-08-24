import { NextResponse } from 'next/server'

export async function GET() {
  const secretKey = process.env.YOCO_SECRET_KEY || ''

  const response = await fetch('https://payments.yoco.com/api/webhooks', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secretKey}`,
    },
  })

  const data = await response.json()

  return NextResponse.json({
    status: response.status,
    existingWebhooks: data,
  })
}
