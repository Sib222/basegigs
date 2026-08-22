'use client'

import Link from 'next/link'

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-sage flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <img src="/logo.png" alt="BaseGigs Logo" className="h-12 w-auto mx-auto mb-6" />
        <div className="text-4xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-secondary mb-2">Payment not completed</h1>
        <p className="text-gray-600 mb-6">
          Your payment was cancelled or didn&apos;t go through. No charge was made — you can try again anytime.
        </p>
        <Link
          href="/pricing"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-semibold transition-colors"
        >
          Back to Pricing
        </Link>
      </div>
    </div>
  )
}
