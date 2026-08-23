import { NextResponse } from 'next/server'

// ONE-TIME USE ONLY. Visit this URL once in your browser after deploying,
// copy the secret it shows you into Vercel, then DELETE this file.
export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://basegigs.vercel.app'

  const response = await fetch('https://payments.yoco.com/api/webhooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
    },
    body: JSON.stringify({
      name: 'basegigs-payment-webhook',
      url: `${siteUrl}/api/yoco-webhook`,
    }),
  })

  const data = await response.json()

  return NextResponse.json({
    status: response.status,
    yocoResponse: data,
    reminder: 'Copy the secret value from yocoResponse above into Vercel as YOCO_WEBHOOK_SECRET. Then DELETE this file (app/api/setup-webhook/route.ts) from GitHub and redeploy — it should not stay in the app.',
  })
}
