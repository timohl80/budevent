'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApprovalPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-12 px-4">
      {/* Persistent Approval Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xl">⏳</span>
              <div>
                <p className="font-semibold">Account Pending Approval</p>
                <p className="text-sm text-blue-100">Please wait for admin approval before signing in</p>
              </div>
            </div>
            <div className="text-sm text-blue-100">
              Time waiting: {formatTime(timeElapsed)}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Account Pending Approval
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for signing up! Your account is currently under review.
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl text-white">⏳</span>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              What happens next?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">1</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Admin Review</h3>
              <p className="text-gray-600 text-sm">
                An administrator will review your account information
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">2</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Email Notification</h3>
              <p className="text-gray-600 text-sm">
                You'll receive an email when your account is approved
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">3</span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Start Using</h3>
              <p className="text-gray-600 text-sm">
                Sign in and start creating and joining events
              </p>
            </div>
          </div>

          {/* User Info */}
          {email && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-2">Account Details</h3>
              <div className="space-y-2 text-sm">
                {name && <p><span className="font-medium">Name:</span> {name}</p>}
                <p><span className="font-medium">Email:</span> {email}</p>
                <p><span className="font-medium">Status:</span> <span className="text-orange-600 font-medium">Pending Approval</span></p>
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Please do not try to sign in until you receive approval</li>
                    <li>Check your email regularly for the approval notification</li>
                    <li>If you don't receive approval within 24 hours, contact support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Check Approval Status
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Refresh Page
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Having trouble? Contact support at{' '}
            <a href="mailto:support@budevent.se" className="text-blue-600 hover:underline">
              support@budevent.se
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
