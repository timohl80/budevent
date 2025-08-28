'use client';

import { useState } from 'react';
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
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

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
          setSuccess('Registration successful! Your account is pending admin approval. You will receive an email when your account is approved.');
          // Don't redirect immediately - let user read the message
          setTimeout(() => {
            router.push('/welcome');
          }, 5000);
        } else {
          setSuccess('Account created successfully! Redirecting to login...');
          setTimeout(() => {
            router.push('/welcome');
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

  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
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
              <input
                {...register('password')}
                type="password"
                id="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
                placeholder="Create a password"
              />
              
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
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
                placeholder="Confirm your password"
              />
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
                href="/login"
                className="text-[#A29BFE] hover:text-[#8B7FD8] font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
}
