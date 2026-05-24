import Link from 'next/link'

export default function AboutPage() {
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
              <Link href="/login" className="text-gray-700 hover:text-primary">Login</Link>
              <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-green-600">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-b from-green-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About BaseGigs</h1>
          <p className="text-xl text-gray-600">Built for South Africa. Built for real people.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
          <p className="text-gray-600 leading-relaxed">BaseGigs was built out of a simple observation — South Africa is full of talented, hardworking people who struggle to find short-term work, and clients who struggle to find reliable help fast. Whether it&apos;s a granny needing her lawn mowed, a family needing a mover, or a couple needing a photographer for their wedding, the process of finding the right person has always been word-of-mouth, unreliable, and often unsafe.</p>
          <p className="text-gray-600 leading-relaxed mt-4">We built BaseGigs to change that — a platform where finding and hiring local talent is simple, fast, and protected by a proper contract.</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">To connect South Africans with the skills and opportunities they need — locally, fairly, and securely. We believe that a student in Soweto with a skill deserves the same access to clients as anyone else. And we believe that every client deserves peace of mind when hiring someone new.</p>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Makes Us Different</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">🇿🇦</div>
              <h3 className="font-bold text-gray-900 mb-2">Built for SA</h3>
              <p className="text-gray-600 text-sm">Designed specifically for the South African gig economy — local categories, local pricing, local context.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-bold text-gray-900 mb-2">Secure Contracts</h3>
              <p className="text-gray-600 text-sm">Every hire comes with a digital contract. Both parties are protected before work begins.</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-bold text-gray-900 mb-2">Fast & Simple</h3>
              <p className="text-gray-600 text-sm">Post a gig, find talent, chat, sign, done. No complicated process. No unnecessary steps.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join BaseGigs today — free to sign up, free to browse.</p>
          <Link href="/signup" className="px-8 py-3 bg-white text-primary rounded-lg text-lg font-semibold hover:bg-gray-100">
            Create Your Account
          </Link>
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
                <li><Link href="/about" className="hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
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
