import Link from 'next/link'

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: May 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="text-gray-600 leading-relaxed">When you create an account on BaseGigs, we collect basic information including your name, email address, and location. If you create a gig seeker profile, you may also provide skills, experience, and portfolio information. We collect this to help match you with the right clients or opportunities.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-600 leading-relaxed">Your information is used to operate the BaseGigs platform — to display your profile to potential clients, to send you notifications about gig applications, and to generate contracts. We do not sell your personal information to third parties.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Data Storage & Security</h2>
          <p className="text-gray-600 leading-relaxed">Your data is stored securely using industry-standard practices. We use encrypted connections (HTTPS) across the platform. While we take reasonable steps to protect your information, no system is completely secure and we cannot guarantee absolute security.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sharing Your Information</h2>
          <p className="text-gray-600 leading-relaxed">When you apply for a gig or post one, relevant profile information is shared with the other party so they can make an informed decision. This is necessary for the platform to function. We do not share your information with advertisers or unrelated third parties.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Your Rights</h2>
          <p className="text-gray-600 leading-relaxed">You have the right to access, update, or delete your personal information at any time. To request deletion of your account and associated data, contact us at support@basegigs.co.za.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">BaseGigs uses essential cookies to keep you logged in and maintain your session. We do not use tracking or advertising cookies.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Changes to This Policy</h2>
          <p className="text-gray-600 leading-relaxed">We may update this policy from time to time. If we make significant changes, we will notify users via email or a notice on the platform.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Contact</h2>
          <p className="text-gray-600 leading-relaxed">For any privacy-related questions, contact us at <Link href="/contact" className="text-primary hover:underline">support@basegigs.co.za</Link>.</p>
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
