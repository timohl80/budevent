'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function DebugEmailPage() {
  const { data: session } = useSession();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testEmailService = async () => {
    setLoading(true);
    setTestResult('');
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
      });
      
      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testRSVPEmail = async () => {
    if (!session?.user) {
      setTestResult('Error: No session found. Please log in first.');
      return;
    }

    setLoading(true);
    setTestResult('');
    
    try {
      const emailData = {
        eventName: 'Debug Test Event',
        eventDate: 'Friday, December 25, 2024',
        eventTime: '7:00 PM',
        eventLocation: 'Debug Location',
        eventDescription: 'This is a debug test event.',
        userName: (session.user as any).name || 'Debug User',
        userEmail: (session.user as any).email || 'no-email@test.com',
        eventId: 'debug-event-123',
        eventStartISO: new Date().toISOString(),
        eventEndISO: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        organizerName: 'Debug Organizer',
        organizerEmail: 'debug@budevent.com'
      };

      const response = await fetch('/api/send-rsvp-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      const result = await response.json();
      setTestResult(JSON.stringify(result, null, 2));
    } catch (error) {
      setTestResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Email Service Debug</h1>
          
          {/* Session Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Session Information</h2>
            {session ? (
              <div className="space-y-2">
                <p><strong>Logged in:</strong> Yes</p>
                <p><strong>Provider:</strong> {(session.user as any)?.provider || 'Unknown'}</p>
                <p><strong>Name:</strong> {(session.user as any)?.name || 'Not set'}</p>
                <p><strong>Email:</strong> {(session.user as any)?.email || 'Not set'}</p>
                <p><strong>ID:</strong> {(session.user as any)?.id || 'Not set'}</p>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-gray-600">Not logged in</p>
            )}
          </div>

          {/* Test Buttons */}
          <div className="space-y-4 mb-6">
            <div>
              <button
                onClick={testEmailService}
                disabled={loading}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Email Service (Hardcoded Email)'}
              </button>
              <p className="text-sm text-gray-600 mt-1">
                Tests the email service with a hardcoded email address
              </p>
            </div>
            
            <div>
              <button
                onClick={testRSVPEmail}
                disabled={loading || !session}
                className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test RSVP Email (Your Email)'}
              </button>
              <p className="text-sm text-gray-600 mt-1">
                Tests the RSVP email service with your current session email
              </p>
            </div>
          </div>

          {/* Results */}
          {testResult && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Test Results</h3>
              <pre className="text-sm bg-white p-3 rounded border overflow-auto max-h-96">
                {testResult}
              </pre>
            </div>
          )}

          {/* Environment Check */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Environment Check</h3>
            <p className="text-yellow-700 text-sm">
              Make sure these environment variables are set in your production environment:
            </p>
            <ul className="text-yellow-700 text-sm mt-2 space-y-1">
              <li>• <code>RESEND_API_KEY</code> - Your Resend API key</li>
              <li>• <code>RESEND_FROM_EMAIL</code> - Verified sender email (e.g., hello@budevent.se)</li>
              <li>• <code>NEXTAUTH_SECRET</code> - NextAuth secret for session encryption</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
