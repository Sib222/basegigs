import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-sage">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center">
              <img src="/logo.png" alt="BaseGigs Logo" className="h-9 w-auto" />
              <span className="ml-2 text-xl font-semibold text-secondary">BaseGigs</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/browse-gigs" className="text-gray-700 hover:text-primary transition-colors">Browse Gigs</Link>
              <Link href="/find-talent" className="text-gray-700 hover:text-primary transition-colors">Find Talent</Link>
              <Link href="/login" className="text-gray-700 hover:text-primary transition-colors">Login</Link>
              <Link href="/signup" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-b from-primary-light to-sage py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-secondary mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600">We&apos;re a small team and we actually read every message.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-secondary mb-2">Get in Touch</h2>
            <p className="text-gray-600">Whether you have a question, a problem, or just want to share feedback — reach out. We respond within 24–48 hours.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-4 bg-sage rounded-lg p-4">
              <div className="text-2xl">📧</div>
              <div>
                <h3 className="font-semibold text-secondary">Email</h3>
                <p className="text-gray-600">support@basegigs.co.za</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-sage rounded-lg p-4">
              <div className="text-2xl">🇿🇦</div>
              <div>
                <h3 className="font-semibold text-secondary">Based In</h3>
                <p className="text-gray-600">South Africa</p>
              </div>
            </div>
            <div className="flex items-start space-x-4 bg-sage rounded-lg p-4">
              <div className="text-2xl">⏱️</div>
              <div>
                <h3 className="font-semibold text-secondary">Response Time</h3>
                <p className="text-gray-600">Within 24–48 hours on weekdays</p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-secondary mb-2">Common Questions</h3>
            <p className="text-gray-600 text-sm">Before reaching out, check our <Link href="/how-it-works" className="text-primary hover:underline">How It Works</Link> page — most questions about the platform are answered there.</p>
          </div>
        </div>
      </div>

      <footer className="bg-secondary text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <img src="/logo.png" alt="BaseGigs Logo" className="h-8 w-auto" />
                <span className="ml-2 text-xl font-semibold text-white">BaseGigs</span>
              </div>
              <p className="text-sm">Connecting clients with talented gig seekers for short-term opportunities.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/browse-gigs" className="hover:text-primary transition-colors">Browse Gigs</Link></li>
                <li><Link href="/find-talent" className="hover:text-primary transition-colors">Find Talent</Link></li>
                <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm">
            © 2025 BaseGigs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
