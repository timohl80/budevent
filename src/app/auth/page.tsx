'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';

function WelcomeContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthError = searchParams?.get('error');
  const callbackUrl = searchParams?.get('callbackUrl');
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/');
    }
  }, [status, session, router]);

  // Log OAuth errors for debugging
  useEffect(() => {
    if (oauthError) {
      console.error('OAuth Error:', oauthError);
      console.error('Callback URL:', callbackUrl);
      console.error('Full search params:', Object.fromEntries(searchParams.entries()));
    }
  }, [oauthError, callbackUrl, searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Registration failed');
      } else {
        if (result.requiresApproval) {
          setSuccess('Registration successful! Your account is pending admin approval. You will receive an email when your account is approved.');
          // Switch to login mode after successful registration
          setTimeout(() => {
            setIsLoginMode(true);
            setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            setSuccess('');
          }, 3000);
        } else {
          setSuccess('Account created successfully! You can now log in.');
          setIsLoginMode(true);
          setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setSuccess('');
  };

  // Show loading spinner while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  // Don't render the form if user is authenticated (they'll be redirected)
  if (status === 'authenticated') {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  // Show OAuth error if present
  if (oauthError) {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold text-red-500 mb-4">Authentication Error</h1>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
              <p className="text-red-300 text-lg font-medium mb-2">OAuth Error: {oauthError}</p>
              {callbackUrl && (
                <p className="text-red-400 text-sm mb-4">Callback URL: {callbackUrl}</p>
              )}
              <p className="text-red-400 text-sm">
                This error occurred during Google Sign-In. Check the browser console for more details.
              </p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/auth'}
                className="w-full py-3 px-4 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] transition-colors"
              >
                Try Again
              </button>
              <Link
                href="/auth"
                className="w-full inline-block py-3 px-4 text-[#9CA3AF] hover:text-white transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the welcome page for unauthenticated users
  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-6 sm:p-8">
      <div className="max-w-lg w-full">
        {/* Logo and Welcome */}
        <div className="text-center mb-10">
          <div className="text-7xl mb-6">🎉</div>
          <h1 className="text-5xl font-bold text-[#F3F4F6] mb-4">
            Welcome to BudEvent
          </h1>
          <p className="text-[#9CA3AF] text-xl leading-relaxed">
            Stay connected with your crew. Create, share, and join events with friends – so you never miss a chance to hang out.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1F2937] rounded-2xl shadow-2xl p-10 border border-[#374151]">
          {/* Mode Toggle */}
          <div className="flex mb-8 bg-[#374151] rounded-lg p-1">
            <button
              onClick={() => setIsLoginMode(true)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                isLoginMode
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLoginMode(false)}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                !isLoginMode
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}

                  {/* Google Sign-In Button */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              console.log('=== GOOGLE SIGN-IN DEBUG ===');
              console.log('Google Sign-In button clicked');
              console.log('Attempting to sign in with Google...');
              console.log('Current URL:', window.location.href);
              console.log('Callback URL:', '/');
              
              // Try to sign in and catch any errors
              try {
                signIn('google', { callbackUrl: '/' });
              } catch (error) {
                console.error('Error starting Google Sign-In:', error);
              }
              
              console.log('=== END DEBUG ===');
            }}
              className="w-full py-3 px-4 bg-white text-gray-800 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-all flex items-center justify-center space-x-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
            
            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#111827] text-[#9CA3AF]">Or continue with email</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
            {/* Name field (only for registration) */}
            {!isLoginMode && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#F3F4F6] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required={!isLoginMode}
                  className="w-full px-4 py-3 border border-[#374151] bg-[#111827] text-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors placeholder-[#6B7280]"
                  placeholder="Enter your full name"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#F3F4F6] mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-[#374151] bg-[#111827] text-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors placeholder-[#6B7280]"
                placeholder="Enter your email"
              />
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#F3F4F6] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-[#374151] bg-[#111827] text-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors placeholder-[#6B7280]"
                  placeholder={isLoginMode ? "Enter your password" : "Create a password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.96 9.96 0 011.563-2.037L5.1 10.9l2.775 2.775a3 3 0 002.12.875H17.25" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.825 19.825A10.05 10.05 0 0012 20c4.478 0 8.268-2.943 9.543-7a9.96 9.96 0 00-1.563-2.037L18.9 13.1l-2.775 2.775a3 3 0 01-2.12.875H5.25" />
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
              
              {/* Password Requirements (only for registration) */}
              {!isLoginMode && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-400 mb-2">Password must contain:</p>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <span className={`w-3 h-3 mr-2 rounded-full flex items-center justify-center ${
                        formData.password.length >= 8 
                          ? 'bg-green-500' 
                          : 'bg-gray-500'
                      }`}>
                        {formData.password.length >= 8 ? '✓' : '○'}
                      </span>
                      <span className={formData.password.length >= 8 ? 'text-green-400' : 'text-gray-400'}>
                        At least 8 characters
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className={`w-3 h-3 mr-2 rounded-full flex items-center justify-center ${
                        /[A-Z]/.test(formData.password)
                          ? 'bg-green-500' 
                          : 'bg-gray-500'
                      }`}>
                        {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                      </span>
                      <span className={/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                        One uppercase letter (A-Z)
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className={`w-3 h-3 mr-2 rounded-full flex items-center justify-center ${
                        /[a-z]/.test(formData.password)
                          ? 'bg-green-500' 
                          : 'bg-gray-500'
                      }`}>
                        {/[a-z]/.test(formData.password) ? '✓' : '○'}
                      </span>
                      <span className={/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                        One lowercase letter (a-z)
                      </span>
                    </div>
                    
                    <div className="flex items-center text-xs">
                      <span className={`w-3 h-3 mr-2 rounded-full flex items-center justify-center ${
                        /\d/.test(formData.password)
                          ? 'bg-green-500' 
                          : 'bg-gray-500'
                      }`}>
                        {/\d/.test(formData.password) ? '✓' : '○'}
                      </span>
                      <span className={/\d/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                        One number (0-9)
                      </span>
                    </div>
                  </div>
                  
                  {/* Example Password */}
                  <div className="mt-3 pt-2 border-t border-gray-600">
                    <p className="text-xs text-gray-400 mb-1">💡 Example: <span className="font-mono text-gray-300">Password123</span></p>
                    <p className="text-xs text-gray-500">This meets all requirements: 11 chars, uppercase P, lowercase assword, numbers 123</p>
                  </div>
                </div>
              )}
              
              {/* Forgot Password link (only in login mode) */}
              {isLoginMode && (
                <div className="mt-2 text-right">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#60A5FA] hover:text-[#4B89E8] transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
            </div>

            {/* Confirm Password field (only for registration) */}
            {!isLoginMode && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#F3F4F6] mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!isLoginMode}
                    className="w-full px-4 py-3 border border-[#374151] bg-[#111827] text-[#F3F4F6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:border-[#7C3AED] transition-colors placeholder-[#6B7280]"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.96 9.96 0 011.563-2.037L5.1 10.9l2.775 2.775a3 3 0 002.12.875H17.25" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.825 19.825A10.05 10.05 0 0012 20c4.478 0 8.268-2.943 9.543-7a9.96 9.96 0 00-1.563-2.037L18.9 13.1l-2.775 2.775a3 3 0 01-2.12.875H5.25" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Confirm Password Hint */}
                <p className="mt-1 text-xs text-gray-500 flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Type the same password again to confirm
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#7C3AED] to-[#F59E0B] text-white font-medium rounded-lg hover:from-[#6D28D9] hover:to-[#D97706] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLoginMode ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLoginMode ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#9CA3AF]">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-[#DB2777] hover:text-[#BE185D] font-medium transition-colors"
              >
                {isLoginMode ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-[#9CA3AF] text-sm">
            Join thousands of users creating amazing events
          </p>
        </div>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
