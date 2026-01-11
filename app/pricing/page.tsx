'use client'

import { useState } from 'react'

export default function PricingPage() {
const [openFaq, setOpenFaq] = useState<number | null>(null)

const plans = [
{
name: 'Pay-Per-Gig',
price: 'R100',
period: 'per gig',
description: 'Perfect for occasional hiring',
features: [
'Post 1 gig for 30 days',
'Unlimited applications',
'Chat with applicants',
'Contract generation',
'Basic support'
],
cta: 'Post a Gig',
href: '/post-gig',
popular: false
},
{
name: 'Starter',
price: 'R300',
period: 'per month',
description: 'Great for growing businesses',
features: [
'Post up to 5 gigs/month',
'Unlimited applications',
'Chat with applicants',
'Contract generation',
'Standard support',
'Basic analytics'
],
cta: 'Get Started',
href: '/signup',
popular: true
},
{
name: 'Professional',
price: 'R700',
period: 'per month',
description: 'For frequent hirers',
features: [
'Unlimited gig posts',
'Featured listings',
'Priority support',
'Advanced analytics',
'Chat with applicants',
'Contract generation',
'Everything in Starter'
],
cta: 'Go Pro',
href: '/signup',
popular: false
}
]

const faqs = [
{
q: 'Is there a fee for gig seekers?',
a: 'No! BaseGigs is 100% free for gig seekers. Browse, apply, chat, and sign contracts at no cost.'
},
{
q: 'How long does a gig posting stay active?',
a: 'Each gig post stays active for 30 days. For Pay-Per-Gig, you pay R100 per post. With subscriptions, you can post multiple gigs that each stay active for 30 days.'
},
{
q: 'Can I cancel my subscription anytime?',
a: 'Yes, you can cancel your subscription at any time. You\'ll continue to have access until the end of your billing period.'
},
{
q: 'What happens if I exceed 5 gigs on the Starter plan?',
a: 'You can either wait until next month, upgrade to Professional for unlimited posts, or pay R100 per additional gig post.'
},
{
q: 'Do you take a commission on contracts?',
a: 'No! We don\'t take any commission from your contracts. You only pay for posting gigs - everything else is free.'
},
{
q: 'What payment methods do you accept?',
a: 'We accept all major credit/debit cards, EFT, and SnapScan. All payments are processed securely.'
}
]

return (
<div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
{/* Glassmorphism Background Elements */}
<div className="absolute top-20 left-10 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
<div className="absolute top-40 right-20 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
<div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

{/* Navigation */}
<nav className="backdrop-blur-md bg-white/30 border-b border-white/20 sticky top-0 z-50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<a href="/" className="flex items-center">
<span className="text-2xl font-bold text-green-600">B</span>
<span className="ml-2 text-xl font-semibold text-gray-800">BaseGigs</span>
</a>
<div className="flex items-center space-x-4">
<a href="/login" className="text-gray-700 hover:text-green-600 font-medium">Login</a>
<a href="/signup" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Sign Up</a>
</div>
</div>
</div>
</nav>

<div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
{/* Header */}
<div className="text-center mb-16">
<h1 className="text-5xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
<p className="text-xl text-gray-600 max-w-2xl mx-auto">Choose the plan that fits your hiring needs. No hidden fees, cancel anytime.</p>
<div className="mt-6 inline-flex items-center backdrop-blur-md bg-green-100/50 rounded-full px-6 py-3 border border-green-200/50">
<span className="text-green-800 font-semibold">✨ 100% Free for Gig Seekers</span>
</div>
</div>

{/* Pricing Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
{plans.map((plan, idx) => (
<div
key={idx}
className={`relative backdrop-blur-lg bg-white/40 rounded-2xl p-8 border transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
plan.popular
? 'border-green-400/50 shadow-xl ring-2 ring-green-400/50'
: 'border-white/30 shadow-lg'
}`}
>
{plan.popular && (
<div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
<span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
Most Popular
</span>
</div>
)}

<div className="text-center mb-6">
<h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
<p className="text-gray-600 text-sm mb-4">{plan.description}</p>
<div className="flex items-baseline justify-center mb-2">
<span className="text-5xl font-bold text-green-600">{plan.price}</span>
<span className="text-gray-600 ml-2">/{plan.period}</span>
</div>
</div>

<ul className="space-y-3 mb-8">
{plan.features.map((feature, i) => (
<li key={i} className="flex items-start">
<svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
</svg>
<span className="text-gray-700">{feature}</span>
</li>
))}
</ul>

<a
href={plan.href}
className={`block w-full py-3 px-6 rounded-xl font-semibold transition-all text-center ${
plan.popular
? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
: 'bg-white/60 text-green-700 hover:bg-white/80 border border-green-200'
}`}
>
{plan.cta}
</a>
</div>
))}
</div>

{/* FAQ Section */}
<div className="max-w-3xl mx-auto backdrop-blur-lg bg-white/40 rounded-2xl p-8 border border-white/30 shadow-xl">
<h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Pricing FAQ</h2>
<div className="space-y-4">
{faqs.map((faq, idx) => (
<div
key={idx}
className="backdrop-blur-sm bg-white/50 rounded-xl border border-white/40 overflow-hidden transition-all"
>
<button
onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-white/30 transition-colors"
>
<span className="font-semibold text-gray-900">{faq.q}</span>
<svg
className={`w-5 h-5 text-green-600 transition-transform ${
openFaq === idx ? 'rotate-180' : ''
}`}
fill="none"
stroke="currentColor"
viewBox="0 0 24 24"
>
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
</svg>
</button>
{openFaq === idx && (
<div className="px-6 pb-4">
<p className="text-gray-700">{faq.a}</p>
</div>
)}
</div>
))}
</div>
</div>

{/* CTA Section */}
<div className="mt-20 text-center backdrop-blur-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl p-12 border border-green-200/50">
<h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to find your perfect gig worker?</h2>
<p className="text-gray-700 mb-8 max-w-2xl mx-auto">Join hundreds of South African businesses hiring talented gig seekers on BaseGigs.</p>
<div className="flex gap-4 justify-center flex-wrap">
<a href="/signup" className="px-8 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-lg">
Get Started Now
</a>
<a href="/find-talent" className="px-8 py-4 bg-white/60 text-green-700 rounded-xl font-semibold hover:bg-white/80 border border-green-200">
Browse Talent
</a>
</div>
</div>
</div>

<style jsx>{`
@keyframes blob {
0% { transform: translate(0px, 0px) scale(1); }
33% { transform: translate(30px, -50px) scale(1.1); }
66% { transform: translate(-20px, 20px) scale(0.9); }
100% { transform: translate(0px, 0px) scale(1); }
}
.animate-blob {
animation: blob 7s infinite;
}
.animation-delay-2000 {
animation-delay: 2s;
}
.animation-delay-4000 {
animation-delay: 4s;
}
`}</style>
</div>
)
}
