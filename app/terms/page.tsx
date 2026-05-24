import Link from 'next/link'

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: May 2025</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">

        <div>
          <p className="text-gray-600 leading-relaxed">Welcome to BaseGigs. By creating an account or using any part of the BaseGigs platform, you agree to be bound by these Terms of Service. Please read them carefully. If you do not agree, do not use the platform.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. What BaseGigs Is</h2>
          <p className="text-gray-600 leading-relaxed">BaseGigs is an online platform that connects clients who need short-term work done with gig seekers who offer their skills and services. We provide the tools to post gigs, find talent, communicate, and generate digital contracts. We are a platform only — we are not an employer, agency, or party to any agreement between a client and a gig seeker.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Eligibility</h2>
          <p className="text-gray-600 leading-relaxed">You must be at least 18 years old to create an account on BaseGigs. By signing up, you confirm that the information you provide is accurate and that you are legally allowed to enter into agreements in South Africa.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Accounts</h2>
          <p className="text-gray-600 leading-relaxed">You are responsible for maintaining the security of your account and for all activity that occurs under it. Do not share your login credentials with anyone. BaseGigs reserves the right to suspend or terminate accounts that violate these terms or that engage in fraudulent, abusive, or harmful behaviour.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Gig Postings</h2>
          <p className="text-gray-600 leading-relaxed">Clients may post gigs on BaseGigs subject to the applicable subscription or payment plan. Gig posts must be accurate, lawful, and in good faith. You may not post gigs for illegal services, discriminatory work, or anything that violates South African law. BaseGigs reserves the right to remove any gig post at its discretion without refund if it violates these terms.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Payments Between Users</h2>
          <p className="text-gray-600 leading-relaxed">All payment for work or services is arranged directly between the client and the gig seeker. BaseGigs does not process, hold, or facilitate payments between users and takes no responsibility for payment disputes, non-payment, or financial loss arising from agreements made between clients and gig seekers. Users are encouraged to agree on payment terms clearly before work begins and to use the contract feature provided on the platform.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Platform Fees</h2>
          <p className="text-gray-600 leading-relaxed">BaseGigs charges clients for the ability to post gigs on the platform according to the pricing plan selected. These fees are paid directly to BaseGigs and are non-refundable once a gig post has been published. Subscription plans do not renew automatically — users must manually renew when their plan expires.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Contracts</h2>
          <p className="text-gray-600 leading-relaxed">BaseGigs provides a contract generation tool as a convenience feature. Contracts generated through the platform are between the client and the gig seeker only. BaseGigs is not a party to any such contract and accepts no liability for disputes, breaches, or outcomes arising from them. Users are advised to review all contract terms carefully before signing.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. User Conduct</h2>
          <p className="text-gray-600 leading-relaxed">You agree not to use BaseGigs to harass, defraud, or harm other users. You agree not to post false information, impersonate another person, or use the platform for any purpose other than its intended use. Violations may result in immediate account suspension without refund.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Limitation of Liability</h2>
          <p className="text-gray-600 leading-relaxed">BaseGigs is provided as-is. We do not guarantee the quality, safety, or suitability of any gig seeker or client on the platform. We are not responsible for any loss, damage, injury, or dispute arising from interactions between users. Our total liability to you for any claim arising from use of the platform shall not exceed the amount you paid to BaseGigs in the 30 days prior to the claim.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">10. Intellectual Property</h2>
          <p className="text-gray-600 leading-relaxed">All content on the BaseGigs platform — including the name, logo, design, and code — is the property of BaseGigs. You may not copy, reproduce, or distribute any part of the platform without written permission. Content you upload to your profile remains yours, but you grant BaseGigs a licence to display it on the platform.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">11. Governing Law</h2>
          <p className="text-gray-600 leading-relaxed">These terms are governed by the laws of the Republic of South Africa. Any disputes arising from these terms or your use of BaseGigs shall be subject to the jurisdiction of South African courts.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">12. Changes to These Terms</h2>
          <p className="text-gray-600 leading-relaxed">We may update these terms from time to time. Continued use of the platform after changes are posted constitutes your acceptance of the updated terms. We will notify users of significant changes via email or a notice on the platform.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contact</h2>
          <p className="text-gray-600 leading-relaxed">For any questions about these terms, contact us at <Link href="/contact" className="text-primary hover:underline">support@basegigs.co.za</Link>.</p>
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
