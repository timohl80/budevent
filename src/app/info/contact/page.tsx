'use client';

import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F2937] via-[#374151] to-[#1F2937]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            📞 Contact Us
          </h1>
          <p className="text-xl text-gray-300">
            We're here to help! (And maybe share a joke or two)
          </p>
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#374151] rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">Response Time</h3>
            <p className="text-gray-300">Usually faster than a caffeinated squirrel</p>
          </div>
          <div className="bg-[#374151] rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">Success Rate</h3>
            <p className="text-gray-300">99.9% (0.1% lost in the void)</p>
          </div>
          <div className="bg-[#374151] rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">😄</div>
            <h3 className="text-lg font-semibold text-white mb-2">Happiness Level</h3>
            <p className="text-gray-300">Off the charts! 📈</p>
          </div>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Email */}
          <div className="bg-[#374151] rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">📧</div>
              <h3 className="text-xl font-semibold text-white">Email Us</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Drop us a line! We read every email (even the ones with 47 exclamation marks).
            </p>
            <a 
              href="mailto:hello@budevent.com" 
              className="inline-flex items-center px-4 py-2 bg-[#60A5FA] text-white rounded-lg hover:bg-[#4B89E8] transition-colors"
            >
              <span className="mr-2">✉️</span>
              hello@budevent.com
            </a>
          </div>

          {/* Social Media */}
          <div className="bg-[#374151] rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">📱</div>
              <h3 className="text-xl font-semibold text-white">Social Media</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Follow us for updates, memes, and the occasional dad joke.
            </p>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1A91DA] transition-colors">
                Twitter
              </button>
              <button className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors">
                Facebook
              </button>
            </div>
          </div>
        </div>

        {/* Fun FAQ */}
        <div className="bg-[#374151] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">🤔 Frequently Asked Questions</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium">Q: Can I create an event for my cat's birthday?</h4>
              <p className="text-gray-300">A: Absolutely! We love cat parties. Just make sure to include "Bring treats" in the description.</p>
            </div>
            <div>
              <h4 className="text-white font-medium">Q: What if I accidentally invite my ex to an event?</h4>
              <p className="text-gray-300">A: Oops! 😅 You can always cancel the invitation. We won't judge.</p>
            </div>
            <div>
              <h4 className="text-white font-medium">Q: Can I use BudEvent to plan a surprise party?</h4>
              <p className="text-gray-300">A: Yes! Just make sure to set it to "Private" so the birthday person doesn't see it.</p>
            </div>
          </div>
        </div>

        {/* Fun Message */}
        <div className="text-center bg-gradient-to-r from-[#60A5FA] to-[#A29BFE] rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-2">💬 A Message from Our Team</h3>
          <p className="text-white">
            "We built BudEvent because we believe that the best memories are made with friends. 
            Whether you're planning a casual coffee meetup or an epic adventure, we're here to make it happen. 
            And if you ever need help, just remember: we're only one email away from making your day better! 
            (We also accept cookies as payment for tech support 🍪)"
          </p>
        </div>

        {/* Back Button */}
        <div className="text-center mt-8">
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
