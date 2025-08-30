'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onNewMessage: (message: Message) => void;
}

export default function ChatInterface({ messages, onNewMessage }: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    // Add user message immediately
    onNewMessage(userMessage);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Call OpenAI API
      console.log('Sending request to /api/chat with:', {
        message: userMessage.content,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        }),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API response not ok:', response.status, errorText);
        throw new Error(`Failed to get response from AI: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Received API response:', data);
      
      if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(`API Error: ${data.error}`);
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      onNewMessage(aiMessage);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or check our information pages for the answers you need.",
        timestamp: new Date()
      };

      onNewMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  // Function to render message content with clickable links
  const renderMessageContent = (content: string) => {
    // Split content by lines to handle markdown-style links
    const lines = content.split('\n');
    
    return lines.map((line, index) => {
      // Check if line contains a markdown link pattern: [text](url)
      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      
      if (linkMatch) {
        const linkText = linkMatch[1];
        const linkUrl = linkMatch[2];
        
        // Split the line to replace the markdown link with actual link
        const parts = line.split(linkMatch[0]);
        
        return (
          <div key={index} className="mb-2">
            {parts[0]}
            <Link 
              href={linkUrl}
              className="inline-flex items-center text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              {linkText}
            </Link>
            {parts[1]}
          </div>
        );
      }
      
      // Regular line without links
      return <div key={index} className="mb-2">{line}</div>;
    });
  };

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/20 text-white border border-white/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-medium">
                      👤
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-medium">
                      🤖
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {renderMessageContent(message.content)}
                  </div>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/20 text-white border border-white/20 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-medium">
                  🤖
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-300">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/20 p-4 bg-white/5">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything about BudEvent..."
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
        
        <p className="text-xs text-gray-400 mt-2 text-center">
          Powered by OpenAI • Your conversations are private and secure
        </p>
      </div>
    </div>
  );
}
