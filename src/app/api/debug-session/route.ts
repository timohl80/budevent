import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'No active session found',
        authenticated: false
      });
    }

    // Get user details from database
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let userDetails = null;
    if (session.user?.id) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, name, is_approved, role')
        .eq('id', session.user.id)
        .single();
      
      if (!error && user) {
        userDetails = user;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Session debug information',
      authenticated: true,
      session: {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          // Don't log sensitive data
        }
      },
      databaseUser: userDetails ? {
        id: userDetails.id,
        email: userDetails.email,
        name: userDetails.name,
        is_approved: userDetails.is_approved,
        role: userDetails.role
      } : null,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        RESEND_API_KEY: !!process.env.RESEND_API_KEY
      }
    });
  } catch (error) {
    console.error('Session debug error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking session',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
