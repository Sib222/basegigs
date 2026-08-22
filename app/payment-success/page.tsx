'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const PLAN_LABELS: Record<string, string> = {
  pay_per_gig: 'Pay-Per-Gig',
  starter: 'Starter',
  professional: 'Professional',
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref')
  const [status, setStatus] = useState<'checking' | 'completed' | 'timeout'>('checking')
  const [planKey, setPlanKey] = useState<string | null>(null)

  useEffect(() => {
    if (!ref) {
      setStatus('timeout')
      return
    }

    let attempts = 0
    const maxAttempts = 15
    let cancelled = false

    const poll = async () => {
      attempts++
      try {
        const res = await fetch(`/api/checkout-status?ref=${ref}`)
        const data = await res.json()
        if (cancelled) return

        if (data.status === 'completed') {
          setPlanKey(data.plan_key)
          setStatus('completed')
          return
        }
      } catch (err) {
        console.error('Error checking payment status:', err)
      }

      if (attempts >= maxAttempts) {
        setStatus('timeout')
        return
      }

      setTimeout(poll, 1500)
    }

    poll()

    return () => {
      cancelled = true
    }
  }, [ref])

  return (
    <div className="min-h-screen bg-sage flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <img src="/logo.png" alt="BaseGigs Logo" className="h-12 w-auto mx-auto mb-6" />

        {status === 'checking' && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-secondary mb-2">Confirming your payment...</h1>
            <p className="text-gray-600">This usually only takes a few seconds.</p>
          </>
        )}

        {status === 'completed' && (
          <>
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-secondary mb-2">Payment successful!</h1>
            <p className="text-gray-600 mb-6">
              Your {PLAN_LABELS[planKey || ''] || 'plan'} is now active. You can start posting gigs right away.
            </p>
            <Link
              href="/dashboard/client"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === 'timeout' && (
          <>
            <div className="text-4xl mb-4">⌛</div>
            <h1 className="text-2xl font-bold text-secondary mb-2">Still processing...</h1>
            <p className="text-gray-600 mb-6">
              Your payment may still be confirming on our end. Check your dashboard in a minute — if your plan
              still isn&apos;t active after a few minutes, email support@basegigs.co.za.
            </p>
            <Link
              href="/dashboard/client"
              className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold transition-colors"
            >
              Go to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading...</div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  )
}
