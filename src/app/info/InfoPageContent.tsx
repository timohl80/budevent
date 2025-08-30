'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ChatInterface from '@/components/ChatInterface';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function InfoPageContent() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your BudEvent AI assistant. I can help you with information about our company, policies, features, and how to use the platform. What would you like to know?",
      timestamp: new Date()
    }
  ]);

  const handleNewMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#111827] to-[#1F2937]">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              BudEvent Info Center
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get instant answers about BudEvent, our policies, and how to use the platform. 
              Chat with our AI assistant or explore our information pages.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Information Pages Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <h2 className="text-2xl font-semibold text-white mb-6">
                📚 Information Pages
              </h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-2">About BudEvent</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Learn about our mission, vision, and the team behind BudEvent.
                  </p>
                  <Link 
                    href="/info/about"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read More →
                  </Link>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-2">Privacy Policy</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    How we protect your data and maintain your privacy.
                  </p>
                  <Link 
                    href="/info/privacy"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read More →
                  </Link>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-2">Terms of Service</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Our terms and conditions for using the platform.
                  </p>
                  <Link 
                    href="/info/terms"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read More →
                  </Link>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-2">Event Guidelines</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Best practices and rules for creating and managing events.
                  </p>
                  <Link 
                    href="/info/guidelines"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read More →
                  </Link>
                </div>

                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-2">FAQ</h3>
                  <p className="text-gray-300 text-sm mb-3">
                    Frequently asked questions and quick answers.
                  </p>
                  <Link 
                    href="/info/faq"
                    className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface Section */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  🤖 AI Assistant
                </h2>
                <p className="text-gray-300">
                  Ask me anything about BudEvent! I can help with policies, features, and guide you to the right information.
                </p>
              </div>
              
              <ChatInterface 
                messages={messages}
                onNewMessage={handleNewMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
