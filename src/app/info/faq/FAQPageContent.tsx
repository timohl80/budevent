'use client';

import { useState } from 'react';
import Link from 'next/link';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export default function FAQPageContent() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const faqData: FAQItem[] = [
    // Account & Registration
    {
      id: 'account-1',
      question: 'How do I create an account on BudEvent?',
      answer: 'You can create an account by clicking "Sign In" in the navigation and then selecting "Create Account" or by visiting the registration page. You can also sign up using your Google account for a faster process.',
      category: 'account'
    },
    {
      id: 'account-2',
      question: 'Why do I need admin approval to access the platform?',
      answer: 'We require admin approval for new accounts to ensure the quality and safety of our community. This helps prevent spam and inappropriate content while maintaining a positive environment for all users.',
      category: 'account'
    },
    {
      id: 'account-3',
      question: 'How long does account approval take?',
      answer: 'Account approval typically takes 1-2 business days. You\'ll receive an email notification once your account is approved. If you haven\'t heard back within 3 days, please contact our support team.',
      category: 'account'
    },
    {
      id: 'account-4',
      question: 'Can I use my Google account to sign in?',
      answer: 'Yes! BudEvent supports Google OAuth authentication. You can sign in with your Google account, and we\'ll automatically create a BudEvent account linked to your Google profile.',
      category: 'account'
    },

    // Events
    {
      id: 'events-1',
      question: 'How do I create an event?',
      answer: 'To create an event, sign in to your account and click "Create Event" from your dashboard. Fill in the event details including title, description, date, time, location, and capacity. You can also upload an image to make your event more attractive.',
      category: 'events'
    },
    {
      id: 'events-2',
      question: 'Can I edit an event after creating it?',
      answer: 'Yes, you can edit your events at any time. Go to your dashboard, find the event you want to edit, and click the edit button. You can modify all details including title, description, date, time, and location.',
      category: 'events'
    },
    {
      id: 'events-3',
      question: 'How do I RSVP to an event?',
      answer: 'To RSVP to an event, simply click on the event card to view details, then click the "RSVP" button. You can choose from options like "Going", "Maybe", or "Not Going". You\'ll receive email confirmation of your RSVP.',
      category: 'events'
    },
    {
      id: 'events-4',
      question: 'Can I cancel my RSVP?',
      answer: 'Yes, you can change or cancel your RSVP at any time before the event. Go to the event page and click on your current RSVP status to change it. You can also manage all your RSVPs from your dashboard.',
      category: 'events'
    },
    {
      id: 'events-5',
      question: 'What happens if an event is cancelled?',
      answer: 'If an event is cancelled, all attendees will receive an email notification. The event will be marked as cancelled on the platform, and you won\'t be charged any fees (if applicable).',
      category: 'events'
    },

    // Platform Features
    {
      id: 'features-1',
      question: 'How do I search for events?',
      answer: 'Use the search bar on the events page to find events by keyword, title, or description. You can also filter events by date, location, or category. The search results update in real-time as you type.',
      category: 'features'
    },
    {
      id: 'features-2',
      question: 'Can I share events with others?',
      answer: 'Yes! Every event has a share button that allows you to share the event link via email, social media, or messaging apps. You can also copy the direct link to share with friends and family.',
      category: 'features'
    },
    {
      id: 'features-3',
      question: 'How do I upload images for my events?',
      answer: 'When creating or editing an event, you\'ll see an image upload section. Click "Choose File" to select an image from your device. We recommend using high-quality images in JPG or PNG format, ideally 1200x800 pixels or larger.',
      category: 'features'
    },
    {
      id: 'features-4',
      question: 'Is there a mobile app for BudEvent?',
      answer: 'Currently, BudEvent is a web-based platform that works great on all devices including mobile phones and tablets. We\'re working on native mobile apps for iOS and Android, which will be available soon.',
      category: 'features'
    },

    // Privacy & Security
    {
      id: 'privacy-1',
      question: 'Is my personal information safe?',
      answer: 'Yes, we take your privacy seriously. We use industry-standard encryption and security measures to protect your data. We never sell your personal information to third parties. For more details, please read our Privacy Policy.',
      category: 'privacy'
    },
    {
      id: 'privacy-2',
      question: 'Who can see my event information?',
      answer: 'Event information you create is visible to all users on the platform, as this is necessary for event discovery. However, your personal contact information and account details are kept private and only visible to you.',
      category: 'privacy'
    },
    {
      id: 'privacy-3',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account at any time from your account settings. Please note that deleting your account will permanently remove all your data, including events you\'ve created and RSVPs you\'ve made.',
      category: 'privacy'
    },

    // Technical Support
    {
      id: 'support-1',
      question: 'What browsers are supported?',
      answer: 'BudEvent works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version of your browser for the best experience. The platform is also fully responsive and works on mobile devices.',
      category: 'support'
    },
    {
      id: 'support-2',
      question: 'I forgot my password. How do I reset it?',
      answer: 'Click "Forgot Password" on the sign-in page and enter your email address. We\'ll send you a password reset link. If you signed up with Google, you can reset your password through your Google account settings.',
      category: 'support'
    },
    {
      id: 'support-3',
      question: 'How do I contact customer support?',
      answer: 'You can contact our support team by emailing support@budevent.se or using the contact form on our website. We typically respond within 24 hours during business days.',
      category: 'support'
    },
    {
      id: 'support-4',
      question: 'Are there any fees for using BudEvent?',
      answer: 'Currently, BudEvent is free to use for all users. We may introduce premium features in the future, but basic event creation and RSVP functionality will remain free.',
      category: 'support'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', count: faqData.length },
    { id: 'account', name: 'Account & Registration', count: faqData.filter(f => f.category === 'account').length },
    { id: 'events', name: 'Events', count: faqData.filter(f => f.category === 'events').length },
    { id: 'features', name: 'Platform Features', count: faqData.filter(f => f.category === 'features').length },
    { id: 'privacy', name: 'Privacy & Security', count: faqData.filter(f => f.category === 'privacy').length },
    { id: 'support', name: 'Technical Support', count: faqData.filter(f => f.category === 'support').length }
  ];

  const filteredFAQs = activeCategory === 'all' 
    ? faqData 
    : faqData.filter(faq => faq.category === activeCategory);

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#111827] to-[#1F2937]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Find quick answers to common questions about BudEvent
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/20'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white pr-4">
                  {faq.question}
                </h3>
                <div className="flex-shrink-0">
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      openItems.has(faq.id) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
              
              {openItems.has(faq.id) && (
                <div className="px-6 pb-4 border-t border-white/10">
                  <p className="text-gray-300 leading-relaxed pt-4">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              No questions found in this category.
            </div>
            <button
              onClick={() => setActiveCategory('all')}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              View all questions
            </button>
          </div>
        )}

        {/* Still Have Questions */}
        <div className="mt-16 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-gray-300 mb-6">
              Can't find the answer you're looking for? Our support team is here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@budevent.se"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Support
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

