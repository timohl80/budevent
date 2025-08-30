'use client';

import Link from 'next/link';

export default function PrivacyPageContent() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#111827] to-[#1F2937]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              How we protect your data and maintain your privacy
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
          <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            At BudEvent, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our event management platform. 
            We are committed to protecting your personal data and ensuring transparency in our data practices.
          </p>
          <p className="text-gray-300 leading-relaxed">
            By using BudEvent, you agree to the collection and use of information in accordance with 
            this policy. If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href="mailto:privacy@budevent.se" className="text-blue-400 hover:underline">
              privacy@budevent.se
            </a>.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-white mb-3">Personal Information</h3>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Name and email address when you create an account</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Profile information you choose to provide</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Authentication data when using Google OAuth</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Event preferences and RSVP history</span>
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-white mb-3">Event Information</h3>
          <ul className="text-gray-300 space-y-2 mb-6">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Event details you create (title, description, location, date)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Images you upload for events</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>RSVP responses and attendance data</span>
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-white mb-3">Technical Information</h3>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>IP address and device information</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Usage analytics and platform interactions</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Cookies and similar tracking technologies</span>
            </li>
          </ul>
        </div>

        {/* How We Use Your Information */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We use the information we collect to provide, maintain, and improve our services:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Creating and managing your account</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Processing event creation and RSVPs</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Sending email notifications and confirmations</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Providing customer support and responding to inquiries</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Analyzing platform usage to improve our services</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Ensuring platform security and preventing fraud</span>
            </li>
          </ul>
        </div>

        {/* Information Sharing */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Information Sharing</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties 
            without your consent, except in the following circumstances:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>Service Providers:</strong> We may share data with trusted third-party 
              services that help us operate our platform (e.g., email services, cloud hosting)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>Legal Requirements:</strong> We may disclose information if required by 
              law or to protect our rights and safety</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>Event Information:</strong> Event details you create are visible to 
              other users as intended for event discovery</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>Business Transfers:</strong> In case of merger or acquisition, 
              user information may be transferred as part of the business assets</span>
            </li>
          </ul>
        </div>

        {/* Data Security */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We implement appropriate security measures to protect your personal information:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Encryption of data in transit and at rest</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Regular security audits and vulnerability assessments</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Access controls and authentication requirements</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Secure hosting infrastructure with industry-standard protections</span>
            </li>
          </ul>
        </div>

        {/* Your Rights */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            You have the following rights regarding your personal information:
          </p>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>Access:</strong> Request a copy of your personal data</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>Correction:</strong> Update or correct inaccurate information</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>Deletion:</strong> Request deletion of your personal data</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>Portability:</strong> Receive your data in a portable format</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span><strong>Objection:</strong> Object to certain processing activities</span>
            </li>
          </ul>
        </div>

        {/* Contact & Back */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Questions About Privacy?</h2>
            <p className="text-gray-300 mb-6">
              If you have any questions about this Privacy Policy or our data practices, 
              please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:privacy@budevent.se"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Privacy Team
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
