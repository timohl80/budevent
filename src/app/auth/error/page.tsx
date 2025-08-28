'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  const error = searchParams.get('error');
  const email = searchParams.get('email');
  const name = searchParams.get('name');

  useEffect(() => {
    // Check if this is an approval pending error
    if (error === 'AccessDenied' || 
        (error && error.includes('pending approval')) ||
        (error && error.includes('admin approval'))) {
      
      // If we have email info, redirect to approval pending page
      if (email) {
        setIsRedirecting(true);
        setTimeout(() => {
          router.push(`/approval-pending?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || '')}`);
        }, 1000);
      }
    }
  }, [error, email, name, router]);

  // If redirecting, show loading
  if (isRedirecting) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Redirecting to approval page...</p>
        </div>
      </main>
    );
  }

  // If it's an approval error but we don't have email, show generic message
  if (error === 'AccessDenied' || 
      (error && error.includes('pending approval')) ||
      (error && error.includes('admin approval'))) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl text-white">⏳</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Account Pending Approval
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Your account is currently under review by an administrator. 
              You'll receive an email notification when your account is approved.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">What to do next:</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Check your email for the approval notification</li>
                      <li>Wait for admin approval before trying to sign in again</li>
                      <li>If you don't receive approval within 24 hours, contact support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Link
                href="/auth"
                className="inline-block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Back to Sign In
              </Link>
              <Link
                href="/"
                className="inline-block w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Go to Homepage
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Default error page for other errors
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl text-white">❌</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Authentication Error
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {error === 'Configuration' && 'There is a problem with the server configuration.'}
            {error === 'AccessDenied' && 'You do not have permission to sign in.'}
            {error === 'Verification' && 'The verification token has expired or has already been used.'}
            {!['Configuration', 'AccessDenied', 'Verification'].includes(error || '') && 
              'An unexpected error occurred during authentication.'}
          </p>
          <div className="space-y-3">
            <Link
              href="/auth"
              className="inline-block w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              Try Again
            </Link>
            <Link
              href="/"
              className="inline-block w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
