'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showApprovalDetails, setShowApprovalDetails] = useState(true);
  const router = useRouter();

  // Check for persistent approval message on component mount
  useEffect(() => {
    const savedApproval = localStorage.getItem('budevent_pending_approval');
    if (savedApproval) {
      try {
        const approvalData = JSON.parse(savedApproval);
        setSuccess(approvalData.message);
      } catch (e) {
        localStorage.removeItem('budevent_pending_approval');
      }
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null); // Clear any previous success message

    console.log('Form data being submitted:', data);
    console.log('Password length:', data.password.length);
    console.log('Password meets requirements:', /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password));

    try {
      const requestBody = {
        name: data.name,
        email: data.email,
        password: data.password,
      };
      
      console.log('Request body:', requestBody);
      console.log('Submitting to:', '/api/auth/register');

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const result = await response.json();
      console.log('Response body:', result);

      if (!response.ok) {
        console.error('Registration failed:', result);
        setError(result.error || 'Registration failed');
      } else {
        console.log('Registration successful:', result);
        if (result.requiresApproval) {
          // Redirect to the dedicated success page
          router.push(`/registration-success?email=${encodeURIComponent(data.email)}&name=${encodeURIComponent(data.name)}`);
          return; // Exit early since we're redirecting
        } else {
          setSuccess('Account created successfully! Redirecting to login...');
          setTimeout(() => {
            router.push('/auth');
          }, 2000);
        }
      }
    } catch (error) {
      console.error('Exception during registration:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setError(null);
    setSuccess(null);
    setIsLoading(false);
    // Reset form fields using react-hook-form
    reset();
  };

  const dismissApprovalMessage = () => {
    setSuccess(null);
    setIsLoading(false);
    // Clear from localStorage so it doesn't reappear on refresh
    localStorage.removeItem('budevent_pending_approval');
  };

  const isPendingApproval = success && success.includes('pending admin approval');

  return (
    <main className={`min-h-screen bg-gradient-to-br from-[#F8F9FA] to-[#E9ECEF] py-12 px-4 ${success && success.includes('pending admin approval') ? 'pt-20' : ''}`}>
      {/* Persistent Approval Banner */}
      {success && success.includes('pending admin approval') && (
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
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-blue-100 hover:text-white transition-colors"
                title="Scroll to top for more details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
              <button
                onClick={dismissApprovalMessage}
                className="text-blue-100 hover:text-white transition-colors ml-3"
                title="Dismiss approval message"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#2D3436]">
            Create your account
          </h1>
          <p className="mt-2 text-[#2D3436] opacity-80">
            Join BudEvent and start creating amazing events!
          </p>
        </div>

        {/* Google Sign-In Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full py-3 px-4 bg-white text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60A5FA] transition-all flex items-center justify-center space-x-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
          
          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#2D3436] mb-2">
                Full name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-red-600 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2D3436] mb-2">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-1 text-red-600 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2D3436] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Password Toggle Hint */}
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Click the eye icon to show/hide your password
              </p>
              
              {/* Password Requirements */}
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-700 mb-2">Password must contain:</p>
                <div className="space-y-1">
                  <div className="flex items-center text-xs">
                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
                      (watch('password')?.length || 0) >= 8 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {watch('password') && (watch('password')?.length || 0) >= 8 ? '✓' : '○'}
                    </span>
                    <span className={watch('password') && (watch('password')?.length || 0) >= 8 ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
                      watch('password') && /[A-Z]/.test(watch('password') || '')
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {watch('password') && /[A-Z]/.test(watch('password') || '') ? '✓' : '○'}
                    </span>
                    <span className={watch('password') && /[A-Z]/.test(watch('password') || '') ? 'text-green-600' : 'text-gray-500'}>
                      One uppercase letter (A-Z)
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
                      watch('password') && /[a-z]/.test(watch('password') || '')
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {watch('password') && /[a-z]/.test(watch('password') || '') ? '✓' : '○'}
                    </span>
                    <span className={watch('password') && /[a-z]/.test(watch('password') || '') ? 'text-green-600' : 'text-gray-500'}>
                      One lowercase letter (a-z)
                    </span>
                  </div>
                  
                  <div className="flex items-center text-xs">
                    <span className={`w-4 h-4 mr-2 rounded-full flex items-center justify-center ${
                      watch('password') && /\d/.test(watch('password') || '')
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {watch('password') && /\d/.test(watch('password') || '') ? '✓' : '○'}
                    </span>
                    <span className={watch('password') && /\d/.test(watch('password') || '') ? 'text-green-600' : 'text-gray-500'}>
                      One number (0-9)
                    </span>
                  </div>
                </div>
                
                {/* Example Password */}
                <div className="mt-3 pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">💡 Example: <span className="font-mono text-gray-700">Password123</span></p>
                  <p className="text-xs text-gray-400">This meets all requirements: 11 chars, uppercase P, lowercase assword, numbers 123</p>
                </div>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-600 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#2D3436] mb-2">
                Confirm password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Type the same password again to confirm
              </p>
              {errors.confirmPassword && (
                <p className="mt-1 text-red-600 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-[#A29BFE] hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>

          <div className="text-center">
            <p className="text-[#2D3436] opacity-80">
              Already have an account?{' '}
              <Link
                href="/auth"
                className="text-[#A29BFE] hover:text-[#8B7FD8] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    🎉 Registration Successful!
                  </h3>
                  <p className="text-green-700 mb-4">
                    {success}
                  </p>
                  
                  {success.includes('pending admin approval') && (
                    <div className="bg-white p-4 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-semibold text-gray-800 flex items-center">
                          ⏳ <span className="ml-2">What happens next?</span>
                        </h4>
                        <button
                          onClick={() => setShowApprovalDetails(!showApprovalDetails)}
                          className="text-gray-500 hover:text-gray-700 transition-colors"
                          title={showApprovalDetails ? "Hide details" : "Show details"}
                        >
                          {showApprovalDetails ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </button>
                      </div>
                      
                      {showApprovalDetails && (
                        <>
                          <div className="mb-4">
                            <div className="space-y-2 text-sm text-gray-700">
                              <div className="flex items-start">
                                <span className="text-blue-500 mr-2">1.</span>
                                <span>Our admin team will review your registration (usually within 24 hours)</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-blue-500 mr-2">2.</span>
                                <span>You'll receive an approval email when your account is ready</span>
                              </div>
                              <div className="flex items-start">
                                <span className="text-blue-500 mr-2">3.</span>
                                <span>Then you can sign in and start using BudEvent!</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <div className="flex items-start">
                              <span className="text-yellow-600 mr-2">💡</span>
                              <div className="text-sm text-yellow-800">
                                <p className="font-medium">Important:</p>
                                <p>You cannot sign in until your account is approved by an admin.</p>
                                <p className="mt-1">Please wait for the approval email before attempting to sign in.</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          onClick={() => router.push('/auth')}
                          className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                        >
                          📧 Check for Approval Email
                        </button>
                        <button
                          onClick={resetForm}
                          className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shadow-sm"
                        >
                          ➕ Register Another Account
                        </button>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-600 text-center">
                          💌 <strong>Don't forget to check your email!</strong> The approval email will be sent to: <span className="font-mono text-gray-700">{watch('email')}</span>
                        </p>
                      </div>
                      
                      <div className="mt-4 text-center">
                        <button
                          onClick={dismissApprovalMessage}
                          className="text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                          Dismiss this message
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
