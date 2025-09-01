'use client';

import Link from 'next/link';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F2937] via-[#374151] to-[#1F2937]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            🆘 Help Center
          </h1>
          <p className="text-xl text-gray-300">
            Your guide to becoming a BudEvent master! 🧙‍♂️
          </p>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#374151] rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">🎉</div>
              <h3 className="text-xl font-semibold text-white">Creating Events</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Ready to be the life of the party? Here's how to create amazing events!
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• Click "Create Event" (it's the pretty button)</li>
              <li>• Fill in the details (title, date, location)</li>
              <li>• Add a description (be creative!)</li>
              <li>• Invite your friends</li>
              <li>• Hit "Create" and watch the magic happen!</li>
            </ul>
          </div>

          <div className="bg-[#374151] rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">👥</div>
              <h3 className="text-xl font-semibold text-white">RSVP & Invitations</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Getting people to show up is an art form. Here's how to master it!
            </p>
            <ul className="text-gray-300 space-y-2">
              <li>• RSVP to events you want to attend</li>
              <li>• Invite friends when creating events</li>
              <li>• Share events on social media</li>
              <li>• Send reminders (politely, of course)</li>
              <li>• Bring snacks to increase attendance</li>
            </ul>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="bg-[#374151] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">🔧 Troubleshooting</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-[#60A5FA] pl-4">
              <h4 className="text-white font-medium">Problem: "I can't see my event"</h4>
              <p className="text-gray-300">Solution: Check if it's set to "Private" or if the date has passed. Also, make sure you're logged in!</p>
            </div>
            <div className="border-l-4 border-[#A29BFE] pl-4">
              <h4 className="text-white font-medium">Problem: "My friends didn't get the invitation"</h4>
              <p className="text-gray-300">Solution: Check their spam folder, or try sending them the event link directly. Technology can be tricky!</p>
            </div>
            <div className="border-l-4 border-[#F59E0B] pl-4">
              <h4 className="text-white font-medium">Problem: "The weather shows wrong"</h4>
              <p className="text-gray-300">Solution: Weather is unpredictable! We do our best, but Mother Nature has her own plans.</p>
            </div>
            <div className="border-l-4 border-[#EF4444] pl-4">
              <h4 className="text-white font-medium">Problem: "I accidentally invited my ex"</h4>
              <p className="text-gray-300">Solution: Oops! 😅 You can cancel the invitation or create a new event. We've all been there!</p>
            </div>
          </div>
        </div>

        {/* Fun Tips */}
        <div className="bg-gradient-to-r from-[#60A5FA] to-[#A29BFE] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">💡 Pro Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-2">🎯 Event Success Tips</h4>
              <ul className="text-white space-y-1 text-sm">
                <li>• Create events 1-2 weeks in advance</li>
                <li>• Add clear location details</li>
                <li>• Include what to bring</li>
                <li>• Set a reasonable capacity</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">🤝 Social Tips</h4>
              <ul className="text-white space-y-1 text-sm">
                <li>• Be inclusive in your invitations</li>
                <li>• Respond to RSVPs promptly</li>
                <li>• Share photos after events</li>
                <li>• Thank people for coming</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#374151] rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-white mb-2">Events Created</h3>
            <p className="text-2xl font-bold text-[#60A5FA]">1,337</p>
            <p className="text-gray-300 text-sm">And counting!</p>
          </div>
          <div className="bg-[#374151] rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h3 className="text-lg font-semibold text-white mb-2">Happy Attendees</h3>
            <p className="text-2xl font-bold text-[#A29BFE]">5,420</p>
            <p className="text-gray-300 text-sm">Smiles guaranteed</p>
          </div>
          <div className="bg-[#374151] rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">☕</div>
            <h3 className="text-lg font-semibold text-white mb-2">Cups of Coffee</h3>
            <p className="text-2xl font-bold text-[#F59E0B]">∞</p>
            <p className="text-gray-300 text-sm">Fueling the team</p>
          </div>
        </div>

        {/* Emergency Help */}
        <div className="bg-[#EF4444] rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <div className="text-3xl mr-3">🚨</div>
            <h3 className="text-xl font-semibold text-white">Emergency Help</h3>
          </div>
          <p className="text-white mb-4">
            If you're having a real emergency (like your event is in 5 minutes and no one showed up), 
            don't panic! Here's what to do:
          </p>
          <ol className="text-white space-y-2">
            <li>1. Take a deep breath (seriously, it helps)</li>
            <li>2. Check if you're at the right location</li>
            <li>3. Send a quick message to your attendees</li>
            <li>4. If all else fails, enjoy some solo time</li>
            <li>5. Remember: there's always next time!</li>
          </ol>
        </div>

        {/* Back Button */}
        <div className="text-center">
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-[#7C3AED] text-white rounded-lg hover:bg-[#6D28D9] transition-colors"
          >
            <span className="mr-2">🏠</span>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
