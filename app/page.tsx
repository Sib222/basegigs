import Link from 'next/link'

export default function Home() {
return (
<div className="min-h-screen">
{/* Navigation */}
<nav className="bg-white shadow-sm">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="flex justify-between items-center h-16">
<div className="flex items-center">
<span className="text-2xl font-bold text-primary">B</span>
<span className="ml-2 text-xl font-semibold">BaseGigs</span>
</div>
<div className="hidden md:flex space-x-8">
<Link href="/browse-gigs" className="text-gray-700 hover:text-primary">Browse Gigs</Link>
<Link href="/find-talent" className="text-gray-700 hover:text-primary">Find Talent</Link>
<Link href="/pricing" className="text-gray-700 hover:text-primary">Pricing</Link>
<Link href="/how-it-works" className="text-gray-700 hover:text-primary">How It Works</Link>
</div>
<div className="flex space-x-4">
<Link href="/login" className="px-4 py-2 text-gray-700 hover:text-primary">Login</Link>
<Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600">Sign Up</Link>
</div>
</div>
</div>
</nav>

{/* Hero Section */}
<section className="bg-gradient-to-b from-green-50 to-white py-20">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
<div className="inline-block bg-green-100 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
Now accepting new members
</div>
<h1 className="text-5xl font-bold text-gray-900 mb-6">
The Professional Gig Marketplace
</h1>
<p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
Connect with skilled professionals for short-term gigs. Post opportunities, find talent, and manage contracts—all in one platform.
</p>
<div className="flex justify-center space-x-4">
<Link href="/signup" className="px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-green-600">
Get Started Free
</Link>
<Link href="/how-it-works" className="px-8 py-3 bg-white text-primary border-2 border-primary rounded-lg text-lg font-semibold hover:bg-green-50">
See How It Works
</Link>
</div>
</div>
</section>

{/* Stats Section */}
<section className="py-16 bg-white">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
<div>
<div className="text-4xl font-bold text-primary mb-2">10K+</div>
<div className="text-gray-600">Active Gig Seekers</div>
</div>
<div>
<div className="text-4xl font-bold text-primary mb-2">5K+</div>
<div className="text-gray-600">Gigs Posted</div>
</div>
<div>
<div className="text-4xl font-bold text-primary mb-2">R2M+</div>
<div className="text-gray-600">Paid to Seekers</div>
</div>
</div>
</div>
</section>

{/* Three-Step Value */}
<section className="py-20 bg-gray-50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
<div className="text-center">
<div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
<h3 className="text-xl font-bold mb-3">Find Talent</h3>
<p className="text-gray-600">Browse verified gig seekers with detailed profiles and portfolios.</p>
</div>
<div className="text-center">
<div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
<h3 className="text-xl font-bold mb-3">Post Gigs</h3>
<p className="text-gray-600">Create detailed gig listings with AI-powered descriptions.</p>
</div>
<div className="text-center">
<div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
<h3 className="text-xl font-bold mb-3">Secure Contracts</h3>
<p className="text-gray-600">AI-generated contracts with digital signatures and email delivery.</p>
</div>
</div>
</div>
</section>

{/* Features Section */}
<section className="py-20 bg-white">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
<p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
A complete platform for connecting clients with gig seekers, from discovery to contract completion.
</p>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
<div className="p-6 border border-gray-200 rounded-lg">
<h3 className="text-xl font-bold mb-3">Smart Matching</h3>
<p className="text-gray-600">Advanced filters to find the perfect gig seeker based on skills, location, experience, and availability.</p>
</div>
<div className="p-6 border border-gray-200 rounded-lg">
<h3 className="text-xl font-bold mb-3">AI-Powered Listings</h3>
<p className="text-gray-600">Generate comprehensive gig descriptions, required skills, and budget suggestions with one click.</p>
</div>
<div className="p-6 border border-gray-200 rounded-lg">
<h3 className="text-xl font-bold mb-3">Built-in Chat</h3>
<p className="text-gray-600">Communicate directly with clients or seekers through our secure messaging system.</p>
</div>
<div className="p-6 border border-gray-200 rounded-lg">
<h3 className="text-xl font-bold mb-3">Contract Generation</h3>
<p className="text-gray-600">AI reads your chat history and generates legally-sound contracts automatically.</p>
</div>
<div className="p-6 border border-gray-200 rounded-lg">
<h3 className="text-xl font-bold mb-3">Instant Applications</h3>
<p className="text-gray-600">One-click applications using your profile data. No forms to fill out every time.</p>
</div>
<div className="p-6 border border-gray-200 rounded-lg">
<h3 className="text-xl font-bold mb-3">Secure Payments</h3>
<p className="text-gray-600">Protected transactions with clear terms defined in your contract before work begins.</p>
</div>
</div>
</div>
</section>

{/* Categories Section */}
<section className="py-20 bg-gray-50">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<h2 className="text-3xl font-bold text-center mb-4">Every Type of Gig</h2>
<p className="text-center text-gray-600 mb-12">
From creative work to construction, we cover all categories of short-term opportunities.
</p>
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
{[
'Creative', 'Performance', 'Event Planning', 'Hospitality', 'Courier & Delivery',
'Teaching & Coaching', 'Technical & Digital', 'Marketing & Business', 'Domestic & Household',
'Health & Wellness', 'Beauty & Personal Services', 'Photography & Media', 'Entertainment',
'Construction & Repair', 'Other'
].map((category) => (
<div key={category} className="bg-white p-4 rounded-lg text-center hover:shadow-md transition-shadow cursor-pointer">
<div className="font-semibold text-gray-800">{category}</div>
<div className="text-sm text-gray-500 mt-1">7+ gigs</div>
</div>
))}
</div>
</div>
</section>

{/* Final CTA */}
<section className="py-20 bg-primary text-white">
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
<h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
<p className="text-xl mb-8">
Join thousands of clients and gig seekers already using BaseGigs to connect and collaborate.
</p>
<div className="flex justify-center space-x-4">
<Link href="/signup" className="px-8 py-3 bg-white text-primary rounded-lg text-lg font-semibold hover:bg-gray-100">
Create Free Account
</Link>
<Link href="/browse-gigs" className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700">
Browse Open Gigs
</Link>
</div>
</div>
</section>

{/* Footer */}
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
<li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
<li><Link href="/how-it-works" className="hover:text-primary">How It Works</Link></li>
</ul>
</div>
<div>
<h4 className="font-semibold text-white mb-4">Company</h4>
<ul className="space-y-2 text-sm">
<li><Link href="/about" className="hover:text-primary">About Us</Link></li>
<li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
<li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
</ul>
</div>
<div>
<h4 className="font-semibold text-white mb-4">Legal</h4>
<ul className="space-y-2 text-sm">
<li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
<li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
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
