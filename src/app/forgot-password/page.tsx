'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        // In development, show the reset link
        if (result.resetLink) {
          setMessage(`${result.message} (Dev mode: ${result.resetLink})`);
        }
      } else {
        setError(result.error || 'Failed to process request');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6 sm:p-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-6">🔐</div>
          <h1 className="text-4xl font-bold text-[#F3F4F6] mb-4">
            Forgot Password?
          </h1>
          <p className="text-[#9CA3AF] text-lg leading-relaxed">
            No worries! Enter your email and we'll send you a password reset link.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1F2937] rounded-2xl shadow-2xl p-10 border border-[#374151]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#F3F4F6] mb-2">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-[#374151] bg-[#111827] text-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] transition-colors placeholder-[#6B7280]"
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] text-white font-medium rounded-lg hover:from-[#4B89E8] hover:to-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60A5FA] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending Reset Link...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {/* Messages */}
          {message && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm">{message}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <Link
              href="/auth"
              className="block text-[#60A5FA] hover:text-[#4B89E8] text-sm transition-colors"
            >
              Back to Sign In
            </Link>
            <Link
              href="/register"
              className="block text-[#9CA3AF] hover:text-[#F3F4F6] text-sm transition-colors"
            >
              Don't have an account? Sign up
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#9CA3AF] text-sm">
            Remember your password?{' '}
            <Link href="/auth" className="text-[#60A5FA] hover:text-[#4B89E8] transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
