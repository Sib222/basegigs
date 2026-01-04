import Link from 'next/link'

export default function PricingPage() {
return (
<div className="min-h-screen bg-gray-50">
<nav className="bg-white shadow-sm">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<Link href="/" className="flex items-center">
<span className="text-2xl font-bold text-primary">B</span>
<span className="ml-2 text-xl font-semibold">BaseGigs</span>
</Link>
<div className="flex items-center space-x-4">
<Link href="/browse-gigs" className="text-gray-700 hover:text-primary">Browse Gigs</Link>
<Link href="/find-talent" className="text-gray-700 hover:text-primary">Find Talent</Link>
<Link href="/how-it-works" className="text-gray-700 hover:text-primary">How It Works</Link>
<Link href="/login" className="text-gray-700 hover:text-primary">Login</Link>
<Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600">Sign Up</Link>
</div>
</div>
</div>
</nav>

<div className="bg-gradient-to-b from-green-50 to-white py-16">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
<h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
<h2 className="text-xl text-gray-600 mb-8">
Unlock the Full Power of BaseGigs
</h2>
<p className="text-lg text-gray-600 max-w-3xl mx-auto">
Start with a single gig or go unlimited with our corporate plans. No hidden fees, no commitments.
</p>
</div>
</div>

<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
<div className="bg-white rounded-lg shadow-lg p-8 mb-12">
<h3 className="text-2xl font-bold text-center mb-4">Post a Single Gig</h3>
<p className="text-center text-gray-600 mb-8">Pay per gig, unlock full access</p>

<div className="text-center mb-8">
<div className="text-5xl font-bold text-primary mb-2">R14.99</div>
<div className="text-gray-600">per gig</div>
</div>

<ul className="space-y-4 mb-8 max-w-md mx-auto">
<li className="flex items-start">
<span className="text-primary mr-2">✓</span>
<span>Post your gig to all seekers in South Africa</span>
</li>
<li className="flex items-start">
<span className="text-primary mr-2">✓</span>
<span>Unlock full profile viewing for all seekers</span>
</li>
<li className="flex items-start">
<span className="text-primary mr-2">✓</span>
<span>Direct messaging and contact access</span>
</li>
<li className="flex items-start">
<span className="text-primary mr-2">✓</span>
<span>Built-in chat and contract generation</span>
</li>
<li className="flex items-start">
<span className="text-primary mr-2">✓</span>
<span>Receive up to 10 applications per gig</span>
</li>
</ul>

<div className="text-center">
<Link href="/signup" className="inline-block px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-green-600">
Get Started
</Link>
</div>
</div>

<div className="mb-12">
<h3 className="text-3xl font-bold text-center mb-4">Boost Your Gig</h3>
<p className="text-center text-gray-600 mb-8">Get more visibility and attract top talent faster with our boost options</p>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-white rounded-lg shadow p-6">
<h4 className="text-xl font-bold mb-2">Quick Boost</h4>
<p className="text-sm text-gray-600 mb-4">Perfect for urgent gigs</p>
<div className="text-3xl font-bold text-primary mb-4">R9.99<span className="text-lg text-gray-600">/ 24 hours</span></div>
<ul className="space-y-2 mb-6 text-sm">
<li className="flex items-start"><span className="text-primary mr-2">•</span> Featured in search results</li>
<li className="flex items-start"><span className="text-primary mr-2">•</span> Priority notifications to seekers</li>
<li className="flex items-start"><span className="text-primary mr-2">•</span> Highlighted listing</li>
</ul>
<button className="w-full px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-green-50 font-semibold">
Coming Soon
</button>
</div>

<div className="bg-white rounded-lg shadow p-6 border-2 border-primary">
<div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">POPULAR</div>
<h4 className="text-xl font-bold mb-2">Standard Boost</h4>
<p className="text-sm text-gray-600 mb-4">Great visibility boost</p>
<div className="text-3xl font-bold text-primary mb-4">R19.99<span className="text-lg text-gray-600">/ 3 days</span></div>
<ul className="space-y-2 mb-6 text-sm">
<li className="flex items-start"><span className="text-primary mr-2">•</span> Featured in search results</li>
<li className="flex items-start"><span className="text-primary mr-2">•</span> Priority notifications to seekers</li>
<li className="flex items-start"><span className="text-primary mr-2">•</span> Highlighted listing</li>
</ul>
<button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600 font-semibold">
Coming Soon
</button>
</div>

<div className="bg-white rounded-lg shadow p-6">
<h4 className="text-xl font-bold mb-2">Extended Boost</h4>
<p className="text-sm text-gray-600 mb-4">Maximum exposure</p>
<div className="text-3xl font-bold text-primary mb-4">R34.99<span className="text-lg text-gray-600">/ 7 days</span></div>
<ul className="space-y-2 mb-6 text-sm">
<li className="flex items-start"><span className="text-primary mr-2">•</span> Featured in search results</li>
<li className="flex items-start"><span className="text-primary mr-2">•</span> Priority notifications to seekers</li>
<li className="flex items-start"><span className="text-primary mr-2">•</span> Highlighted listing</li>
</ul>
<button className="w-full px-4 py-2 border-2 border-primary text-primary rounded-lg hover:bg-green-50 font-semibold">
Coming Soon
</button>
</div>
</div>
</div>

<div>
<h3 className="text-3xl font-bold text-center mb-4">Corporate Plans</h3>
<p className="text-center text-gray-600 mb-8">For businesses that need regular access to talent. Unlimited potential, predictable costs.</p>

<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<div className="bg-white rounded-lg shadow p-8">
<h4 className="text-2xl font-bold mb-2">Starter</h4>
<p className="text-gray-600 mb-4">Small businesses & startups</p>
<div className="text-4xl font-bold text-primary mb-6">R299<span className="text-lg text-gray-600">/month</span></div>
<ul className="space-y-3 mb-8">
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Post up to 5 gigs/month</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Contact 10 seekers/month</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Basic analytics</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Email support</li>
</ul>
<button className="w-full px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-green-50 font-semibold">
Coming Soon
</button>
</div>

<div className="bg-white rounded-lg shadow-lg p-8 border-2 border-primary transform scale-105">
<div className="bg-primary text-white text-sm font-bold px-4 py-1 rounded-full inline-block mb-4">MOST POPULAR</div>
<h4 className="text-2xl font-bold mb-2">Plus</h4>
<p className="text-gray-600 mb-4">Growing businesses</p>
<div className="text-4xl font-bold text-primary mb-6">R549<span className="text-lg text-gray-600">/month</span></div>
<ul className="space-y-3 mb-8">
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Post up to 15 gigs/month</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Contact 30 seekers/month</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Advanced analytics</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Priority support</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Featured gigs</li>
</ul>
<button className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-600 font-semibold">
Coming Soon
</button>
</div>

<div className="bg-white rounded-lg shadow p-8">
<h4 className="text-2xl font-bold mb-2">Pro</h4>
<p className="text-gray-600 mb-4">Enterprises & agencies</p>
<div className="text-4xl font-bold text-primary mb-6">R999<span className="text-lg text-gray-600">/month</span></div>
<ul className="space-y-3 mb-8">
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Unlimited gig postings</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Unlimited contacts</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Full analytics suite</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Dedicated account manager</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> Custom branding</li>
<li className="flex items-start"><span className="text-primary mr-2">✓</span> API access</li>
</ul>
<button className="w-full px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-green-50 font-semibold">
Coming Soon
</button>
</div>
</div>
</div>

<div className="bg-green-50 rounded-lg p-8 mt-12 text-center">
<h3 className="text-2xl font-bold mb-4">💚 100% Free for Gig Seekers</h3>
<p className="text-lg text-gray-700 mb-6">
Browse unlimited gigs, apply with one click, chat with clients, and sign contracts at absolutely no cost.
</p>
<Link href="/signup" className="inline-block px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-green-600">
Sign Up as Gig Seeker
</Link>
</div>

<div className="bg-blue-50 rounded-lg p-8 mt-8">
<h3 className="text-xl font-bold mb-2">Questions? We&apos;ve Got Answers</h3>
<p className="text-gray-700">
Our pricing is simple and transparent. Pay only for what you use, with no hidden fees or long-term commitments required.
</p>
<div className="mt-4 flex space-x-4">
<Link href="/how-it-works" className="text-primary hover:underline font-semibold">How It Works</Link>
<Link href="/" className="text-primary hover:underline font-semibold">Contact Support</Link>
</div>
</div>
</div>

<footer className="bg-gray-900 text-gray-300 py-12">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
<div>
<div className="flex items-center mb-4">
<span className="text-2xl font-bold text-primary">B</span>
<span className="ml-2 text-xl font-semibold text-white">BaseGigs</span>
</div>
<p className="text-sm">Connecting clients with talented gig seekers for short-term opportunities.</p>
</div>
<div>
<h4 className="font-semibold text-white mb-4">Platform</h4>
<ul className="space-y-2 text-sm">
<li><Link href="/browse-gigs" className="hover:text-primary">Browse Gigs</Link></li>
<li><Link href="/find-talent" className="hover:text-primary">Find Talent</Link></li>
<li><Link href="/how-it-works" className="hover:text-primary">How It Works</Link></li>
</ul>
</div>
<div>
<h4 className="font-semibold text-white mb-4">Company</h4>
<ul className="space-y-2 text-sm">
<li><Link href="/" className="hover:text-primary">About Us</Link></li>
<li><Link href="/" className="hover:text-primary">Contact</Link></li>
</ul>
</div>
<div>
<h4 className="font-semibold text-white mb-4">Legal</h4>
<ul className="space-y-2 text-sm">
<li><Link href="/" className="hover:text-primary">Privacy Policy</Link></li>
<li><Link href="/" className="hover:text-primary">Terms of Service</Link></li>
</ul>
</div>
</div>
<div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
© 2025 BaseGigs. All rights reserved.
</div>
</div>
</footer>
</div>
)
}
