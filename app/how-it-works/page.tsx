import Link from 'next/link'

export default function HowItWorksPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple. Secure. Seamless.</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">How BaseGigs Works</h2>
          <p className="text-xl text-gray-600 mb-8">
            Whether you&apos;re hiring talent or looking for your next gig, BaseGigs makes the process effortless from start to finish.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="px-8 py-3 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-green-600">
              Get Started
            </Link>
            <Link href="/browse-gigs" className="px-8 py-3 bg-white text-primary border-2 border-primary rounded-lg text-lg font-semibold hover:bg-green-50">
              Browse Gigs
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center mb-4">For Clients</h3>
          <p className="text-center text-gray-600 mb-12">Find Talent in 6 Simple Steps</p>

          <div className="space-y-12">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">1</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Create Your Account</h4>
                <p className="text-gray-600">Sign up as a Client in seconds. No lengthy forms—just your name, location, and you&apos;re ready to start posting gigs.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">2</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Post Your Gig</h4>
                <p className="text-gray-600">Describe what you need, set your budget, and create the perfect gig listing with suggested skills and rates.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">3</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Browse & Select Talent</h4>
                <p className="text-gray-600">Review applications from qualified Gig Seekers. Filter by skills, experience, location, and availability to find your perfect match.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">4</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Chat & Negotiate</h4>
                <p className="text-gray-600">Once you accept an applicant, discuss details, agree on terms, and finalize everything in one place.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">5</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Generate Contract</h4>
                <p className="text-gray-600">Create a professional contract. Review, adjust if needed, and both parties sign digitally.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">6</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Get It Done</h4>
                <p className="text-gray-600">Your Gig Seeker completes the work. Contracts are saved to your dashboard, and everyone walks away satisfied.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-2 pt-16">
          <h3 className="text-3xl font-bold text-center mb-4">For Gig Seekers</h3>
          <p className="text-center text-gray-600 mb-12">Land Gigs in 6 Simple Steps</p>

          <div className="space-y-12">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">1</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Build Your Profile</h4>
                <p className="text-gray-600">Showcase your skills, experience, portfolio, and availability. The more complete your profile, the more clients you&apos;ll attract.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">2</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Browse Open Gigs</h4>
                <p className="text-gray-600">Explore gigs across 15+ categories. Filter by type, location, and budget to find opportunities that match your expertise.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">3</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Apply Instantly</h4>
                <p className="text-gray-600">One click to apply—your profile does the talking. No cover letters, no lengthy forms. Just fast, efficient applications.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">4</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Chat with Clients</h4>
                <p className="text-gray-600">When accepted, chat directly with the client. Clarify requirements, negotiate terms, and build professional relationships.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">5</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Sign Your Contract</h4>
                <p className="text-gray-600">Contracts protect both parties. Review the terms, sign digitally, and receive your copy via email.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-16 h-16 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold mr-6">6</div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-2">Complete & Get Paid</h4>
                <p className="text-gray-600">Deliver great work, build your reputation, and grow your gig portfolio. Every completed gig opens doors to more opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose BaseGigs?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h4 className="text-xl font-bold mb-2">Secure Contracts</h4>
              <p className="text-gray-600">Contract generation with digital signatures protects both clients and gig seekers.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">⚡</div>
              <h4 className="text-xl font-bold mb-2">Instant Matching</h4>
              <p className="text-gray-600">Smart filters and one-click applications make finding the right match faster than ever.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">✓</div>
              <h4 className="text-xl font-bold mb-2">Verified Profiles</h4>
              <p className="text-gray-600">Detailed profiles with portfolios, skills, and experience help you make informed decisions.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of clients and gig seekers already using BaseGigs to connect, collaborate, and get things done.</p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="px-8 py-3 bg-white text-primary rounded-lg text-lg font-semibold hover:bg-gray-100">
              Create Account
            </Link>
            <Link href="/browse-gigs" className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700">
              Browse Gigs
            </Link>
          </div>

          {/* New Subscription Info Section */}
          <div className="mt-12 max-w-2xl mx-auto bg-white bg-opacity-20 rounded-lg p-6 border border-white/40">
            <h3 className="text-2xl font-semibold mb-4">Subscription & Payment Info</h3>
            <p className="text-white text-base leading-relaxed">
              BaseGigs does not use automatic recurring payments. To maintain an active subscription, you need to manually renew your plan by making a payment each time your gig post limit is reached or your subscription period ends (typically 30 days).  
            </p>
            <p className="text-white text-base leading-relaxed mt-4">
              If you wish to cancel your subscription, simply stop making payments. Your current subscription will remain active until its expiration, after which no further charges will be applied. There are no automatic deductions or renewals.
            </p>
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
