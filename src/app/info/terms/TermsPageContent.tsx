'use client';

import Link from 'next/link';

export default function TermsPageContent() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#111827] to-[#1F2937]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our terms and conditions for using the BudEvent platform
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            These Terms of Service ("Terms") govern your use of the BudEvent platform and services. 
            By accessing or using BudEvent, you agree to be bound by these Terms. If you disagree 
            with any part of these terms, you may not access our service.
          </p>
          <p className="text-gray-300 leading-relaxed">
            BudEvent is operated by BudEvent AB, a company registered in Sweden. These Terms 
            constitute a legally binding agreement between you and BudEvent.
          </p>
        </div>

        {/* Service Description */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Service Description</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            BudEvent is an event management platform that allows users to:
          </p>
          <ul className="text-gray-300 space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Create and manage events</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Discover and RSVP to events</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Upload and share event images</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Manage event attendance and communications</span>
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed">
            We reserve the right to modify, suspend, or discontinue any part of our service 
            at any time with reasonable notice.
          </p>
        </div>

        {/* User Accounts */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">User Accounts</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            To use certain features of BudEvent, you must create an account. You agree to:
          </p>
          <ul className="text-gray-300 space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Provide accurate and complete information</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Maintain the security of your account credentials</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Accept responsibility for all activities under your account</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Notify us immediately of any unauthorized use</span>
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed">
            New user accounts require admin approval before full access is granted. 
            We reserve the right to refuse service or terminate accounts at our discretion.
          </p>
        </div>

        {/* User Conduct */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">User Conduct</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            You agree not to use BudEvent to:
          </p>
          <ul className="text-gray-300 space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Violate any applicable laws or regulations</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Create events that promote hate speech, violence, or illegal activities</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Upload inappropriate, offensive, or copyrighted content</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Spam or send unsolicited communications</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Attempt to gain unauthorized access to our systems</span>
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed">
            Violation of these terms may result in account suspension or termination.
          </p>
        </div>

        {/* Content and Intellectual Property */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Content and Intellectual Property</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            <strong>Your Content:</strong> You retain ownership of content you create and share on BudEvent. 
            By posting content, you grant us a license to use, display, and distribute it as necessary 
            to provide our services.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            <strong>Our Platform:</strong> BudEvent, including its design, code, and branding, is protected 
            by intellectual property laws. You may not copy, modify, or distribute our platform without 
            explicit permission.
          </p>
          <p className="text-gray-300 leading-relaxed">
            <strong>Third-Party Content:</strong> We respect intellectual property rights and expect 
            users to do the same. If you believe your content has been used inappropriately, 
            please contact us immediately.
          </p>
        </div>

        {/* Privacy and Data */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Privacy and Data</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            Your privacy is important to us. Our collection and use of personal information 
            is governed by our Privacy Policy, which is incorporated into these Terms by reference.
          </p>
          <p className="text-gray-300 leading-relaxed">
            By using BudEvent, you consent to our collection and use of your information 
            as described in our Privacy Policy. We implement appropriate security measures 
            to protect your data, but no method of transmission over the internet is 100% secure.
          </p>
        </div>

        {/* Limitation of Liability */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            To the maximum extent permitted by law, BudEvent shall not be liable for any indirect, 
            incidental, special, consequential, or punitive damages, including but not limited to:
          </p>
          <ul className="text-gray-300 space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Loss of profits, data, or business opportunities</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Service interruptions or technical issues</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Content posted by other users</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Events organized through our platform</span>
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed">
            Our total liability shall not exceed the amount you paid for our services in the 
            twelve months preceding the claim.
          </p>
        </div>

        {/* Termination */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Termination</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            You may terminate your account at any time by contacting us or using the account 
            deletion feature in your settings.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            We may terminate or suspend your account immediately, without prior notice, for conduct 
            that we believe violates these Terms or is harmful to other users or our platform.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Upon termination, your right to use BudEvent ceases immediately. We may delete your 
            account and associated data, though some information may be retained as required by law.
          </p>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We reserve the right to modify these Terms at any time. We will notify users of 
            significant changes through our platform or via email.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Your continued use of BudEvent after changes become effective constitutes acceptance 
            of the new Terms. If you disagree with the changes, you must stop using our service.
          </p>
        </div>

        {/* Contact & Back */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Questions About Terms?</h2>
            <p className="text-gray-300 mb-6">
              If you have any questions about these Terms of Service, please contact our legal team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:legal@budevent.se"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Legal Team
              </a>
              <Link
                href="/info"
                className="inline-flex items-center px-6 py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors border border-white/30"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Info Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
