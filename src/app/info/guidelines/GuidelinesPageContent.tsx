'use client';

import Link from 'next/link';

export default function GuidelinesPageContent() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#111827] to-[#1F2937]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Event Guidelines
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Best practices and rules for creating and managing events on BudEvent
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
          <h2 className="text-2xl font-bold text-white mb-4">Creating Great Events</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            BudEvent is designed to help you create meaningful, engaging events that bring people together. 
            These guidelines will help you make the most of our platform and ensure a positive experience 
            for all users.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Following these guidelines helps maintain the quality of our community and ensures that 
            events are discoverable, engaging, and valuable for attendees.
          </p>
        </div>

        {/* Event Creation Best Practices */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Event Creation Best Practices</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">🎯 Clear and Descriptive Titles</h3>
              <p className="text-gray-300 mb-2">
                Choose titles that clearly communicate what your event is about:
              </p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>"Stockholm Tech Meetup: AI & Machine Learning"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>"Weekend Hiking Trip: Sörmlandsleden Trail"</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">✗</span>
                  <span>"Cool Event" or "Something Fun"</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">📝 Detailed Descriptions</h3>
              <p className="text-gray-300 mb-2">
                Provide comprehensive information about your event:
              </p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>What attendees can expect to learn or experience</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Who the event is suitable for</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>What to bring or prepare</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Contact information for questions</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">📍 Accurate Location Information</h3>
              <p className="text-gray-300 mb-2">
                Help attendees find your event easily:
              </p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Use specific addresses or landmarks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Include parking information if relevant</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Add public transport directions</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">📅 Appropriate Timing</h3>
              <p className="text-gray-300 mb-2">
                Consider your audience when scheduling:
              </p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Allow enough time for setup and cleanup</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Consider travel time for attendees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">✓</span>
                  <span>Set realistic event durations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Content Guidelines */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Content Guidelines</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">🖼️ Image Guidelines</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Use high-quality, relevant images that represent your event</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Ensure images are appropriate for all audiences</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Respect copyright and only use images you have rights to</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Recommended size: 1200x800 pixels or larger</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">📝 Text Content</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Use clear, professional language</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Check spelling and grammar</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Include relevant keywords for better discoverability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Be honest about what attendees can expect</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Community Standards */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Community Standards</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">✅ What's Allowed</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Professional networking events and meetups</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Educational workshops and training sessions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Social gatherings and community events</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Cultural and artistic events</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Sports and recreational activities</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Business and industry conferences</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">❌ What's Not Allowed</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <span>Events promoting hate speech or discrimination</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <span>Illegal activities or content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <span>Spam or misleading promotional content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <span>Events with inappropriate or offensive content</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-400 mr-2">•</span>
                  <span>Duplicate or repetitive events</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Event Management Tips */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Event Management Tips</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">📧 Communication</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Respond promptly to attendee questions and comments</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Send updates about event changes or cancellations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Use the platform's messaging features effectively</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">📊 Attendance Management</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Set realistic capacity limits</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Monitor RSVP responses and manage waitlists</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Follow up with attendees after the event</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">🔄 Continuous Improvement</h3>
              <ul className="text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Collect feedback from attendees</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Analyze what worked and what could be improved</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2">•</span>
                  <span>Apply lessons learned to future events</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Reporting and Moderation */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Reporting and Moderation</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            We're committed to maintaining a safe and welcoming community. If you encounter an event 
            that violates our guidelines:
          </p>
          <ul className="text-gray-300 space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Use the report function on the event page</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Provide specific details about the violation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-400 mr-2">•</span>
              <span>Contact our support team for urgent issues</span>
            </li>
          </ul>
          <p className="text-gray-300 leading-relaxed">
            We review all reports promptly and take appropriate action to maintain community standards.
          </p>
        </div>

        {/* Contact & Back */}
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Need Help with Event Planning?</h2>
            <p className="text-gray-300 mb-6">
              Our team is here to help you create successful events. Don't hesitate to reach out 
              with questions or for guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:events@budevent.se"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Events Team
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

