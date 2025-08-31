import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Only show non-sensitive environment variable information
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      RESEND_API_KEY: !!process.env.RESEND_API_KEY, // Just show if it exists
      RESEND_API_KEY_LENGTH: process.env.RESEND_API_KEY?.length || 0,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      GOOGLE_OAUTH: !!process.env.GOOGLE_CLIENT_ID,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      environment: envInfo,
      timestamp: new Date().toISOString(),
      note: 'This endpoint shows environment variable status without exposing sensitive values'
    });
  } catch (error) {
    console.error('Environment debug error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking environment variables',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
