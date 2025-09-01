'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate feedback submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      setRating(0);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F2937] via-[#374151] to-[#1F2937]">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            💬 Feedback
          </h1>
          <p className="text-xl text-gray-300">
            Your opinion matters! (Even if it's about our terrible jokes)
          </p>
        </div>

        {/* Fun Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#374151] rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="text-lg font-semibold text-white mb-2">Average Rating</h3>
            <p className="text-2xl font-bold text-[#F59E0B]">4.8/5</p>
            <p className="text-gray-300 text-sm">We're blushing! 😊</p>
          </div>
          <div className="bg-[#374151] rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">💌</div>
            <h3 className="text-lg font-semibold text-white mb-2">Feedback Received</h3>
            <p className="text-2xl font-bold text-[#60A5FA]">1,234</p>
            <p className="text-gray-300 text-sm">And we read every one!</p>
          </div>
          <div className="bg-[#374151] rounded-lg p-6 text-center">
            <div className="text-3xl mb-2">🚀</div>
            <h3 className="text-lg font-semibold text-white mb-2">Features Added</h3>
            <p className="text-2xl font-bold text-[#A29BFE]">47</p>
            <p className="text-gray-300 text-sm">Based on your suggestions</p>
          </div>
        </div>

        {/* Feedback Form */}
        <div className="bg-[#374151] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Share Your Thoughts</h3>
          
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h4 className="text-xl font-semibold text-white mb-2">Thank You!</h4>
              <p className="text-gray-300">
                Your feedback has been received! We'll read it while sipping coffee and pretending to be productive.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Rating */}
              <div>
                <label className="block text-white font-medium mb-2">
                  How would you rate BudEvent?
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition-colors ${
                        star <= rating ? 'text-[#F59E0B]' : 'text-gray-400'
                      }`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  {rating === 0 && "Click a star to rate"}
                  {rating === 1 && "Ouch! We'll do better 😅"}
                  {rating === 2 && "Not great, but we're learning"}
                  {rating === 3 && "Okay, we can work with this"}
                  {rating === 4 && "Pretty good! We're getting there"}
                  {rating === 5 && "Amazing! You're the best! 🎉"}
                </p>
              </div>

              {/* Feedback Text */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Tell us what you think
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your thoughts, suggestions, or just say hi! We love hearing from you..."
                  className="w-full h-32 px-4 py-3 bg-[#1F2937] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!feedback.trim()}
                className="w-full py-3 px-6 bg-[#60A5FA] text-white rounded-lg hover:bg-[#4B89E8] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Send Feedback 🚀
              </button>
            </form>
          )}
        </div>

        {/* Fun Feedback Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[#374151] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">💡 What We Love to Hear</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• "This feature is amazing!"</li>
              <li>• "I wish you could add..."</li>
              <li>• "The UI is so clean!"</li>
              <li>• "My friends love this app"</li>
              <li>• "This saved my event planning"</li>
              <li>• "Your jokes are terrible but I love them"</li>
            </ul>
          </div>

          <div className="bg-[#374151] rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">🔧 What We Can Fix</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Bug reports (we love fixing these!)</li>
              <li>• Feature requests</li>
              <li>• UI/UX improvements</li>
              <li>• Performance issues</li>
              <li>• Mobile app suggestions</li>
              <li>• Better joke requests</li>
            </ul>
          </div>
        </div>

        {/* Fun Testimonials */}
        <div className="bg-gradient-to-r from-[#60A5FA] to-[#A29BFE] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">🌟 What People Are Saying</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white italic mb-2">
                "BudEvent made planning my birthday party so easy! Everyone showed up and had a blast."
              </p>
              <p className="text-white/80 text-sm">- Sarah M.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white italic mb-2">
                "I love how I can see the weather for my events. No more surprise rain on my picnic!"
              </p>
              <p className="text-white/80 text-sm">- Mike R.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white italic mb-2">
                "The invitation system is perfect. My friends actually respond now!"
              </p>
              <p className="text-white/80 text-sm">- Emma L.</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-white italic mb-2">
                "Best event app ever! The team's sense of humor is a bonus."
              </p>
              <p className="text-white/80 text-sm">- Alex K.</p>
            </div>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="bg-[#374151] rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">🤓 Fun Facts About Our Feedback</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-white font-medium mb-2">📊 Feedback Stats</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• 73% of feedback is positive</li>
                <li>• 15% are feature requests</li>
                <li>• 8% are bug reports</li>
                <li>• 4% are just saying hi</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">⏰ Response Time</h4>
              <ul className="text-gray-300 space-y-1 text-sm">
                <li>• We read feedback within 24 hours</li>
                <li>• Bug fixes: 1-3 days</li>
                <li>• Feature requests: 1-2 weeks</li>
                <li>• Joke requests: Immediate</li>
              </ul>
            </div>
          </div>
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
