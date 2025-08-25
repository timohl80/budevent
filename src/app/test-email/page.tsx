'use client';

import { useState } from 'react';

export default function TestEmailPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const testEmail = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        message: 'Failed to test email service: ' + (error instanceof Error ? error.message : 'Unknown error')
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Email Service</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">How to Test</h2>
              <p className="text-blue-800">
                This page tests the email notification system. Click the button below to send a test RSVP confirmation email.
                Make sure you have:
              </p>
              <ul className="list-disc list-inside mt-2 text-blue-800 space-y-1">
                <li>Added your Resend API key to <code className="bg-blue-100 px-1 rounded">.env.local</code></li>
                <li>Updated the test email address in <code className="bg-blue-100 px-1 rounded">/api/test-email/route.ts</code></li>
                <li>Verified your domain with Resend (or use a verified domain)</li>
              </ul>
            </div>

            <button
              onClick={testEmail}
              disabled={isLoading}
              className="w-full bg-[#A29BFE] hover:bg-[#8B7FD8] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {isLoading ? 'Sending Test Email...' : 'Send Test Email'}
            </button>

            {result && (
              <div className={`rounded-lg p-4 ${
                result.success 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <h3 className="font-semibold mb-2">
                  {result.success ? '✅ Success!' : '❌ Error'}
                </h3>
                <p>{result.message}</p>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Next Steps</h2>
              <p className="text-gray-700 mb-3">
                Once the test email works, the system will automatically send confirmation emails when users RSVP to events.
              </p>
              <p className="text-gray-700">
                You can now go back to your events and test the RSVP functionality to see the email notifications in action!
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
