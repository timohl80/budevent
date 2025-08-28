'use client';

import { useState, useEffect, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams?.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('No reset token provided');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) {
      setError('No reset token provided');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/auth');
        }, 3000);
      } else {
        setError(result.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60A5FA]"></div>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6 sm:p-8">
        <div className="max-w-md w-full text-center">
          <div className="text-7xl mb-6">❌</div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Reset Link</h1>
          <p className="text-[#9CA3AF] mb-6">{error}</p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-3 bg-[#60A5FA] text-white rounded-lg hover:bg-[#4B89E8] transition-colors"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6 sm:p-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-6">🔑</div>
          <h1 className="text-4xl font-bold text-[#F3F4F6] mb-4">
            Reset Password
          </h1>
          <p className="text-[#9CA3AF] text-lg leading-relaxed">
            Enter your new password below
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1F2937] rounded-2xl shadow-2xl p-10 border border-[#374151]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#F3F4F6] mb-2">
                New Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-[#374151] bg-[#111827] text-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] transition-colors placeholder-[#6B7280]"
                placeholder="Enter your new password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F3F4F6] mb-2">
                Confirm New Password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 border border-[#374151] bg-[#111827] text-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-[#60A5FA] transition-colors placeholder-[#6B7280]"
                placeholder="Confirm your new password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
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
                  Resetting Password...
                </div>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          {/* Messages */}
          {message && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm">{message}</p>
              <p className="text-green-400 text-xs mt-1">Redirecting to login...</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Links */}
          <div className="mt-6 text-center">
            <Link
              href="/auth"
              className="text-[#60A5FA] hover:text-[#4B89E8] text-sm transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60A5FA]"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
