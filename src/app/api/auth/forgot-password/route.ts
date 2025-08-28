import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limit';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting by IP address
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimit = checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000); // 3 attempts per 15 minutes
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many password reset attempts. Please try again later.',
          resetTime: rateLimit.resetTime 
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not (security best practice)
      return NextResponse.json(
        { message: 'If an account with that email exists, a password reset link has been sent.' },
        { status: 200 }
      );
    }

    // Generate reset token (simple timestamp-based for now)
    const resetToken = Buffer.from(`${user.id}:${Date.now()}:${Math.random()}`).toString('base64');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    // Store reset token in database
    const { error: tokenError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expiry: resetTokenExpiry.toISOString(),
      })
      .eq('id', user.id);

    if (tokenError) {
      console.error('Error storing reset token:', tokenError);
      return NextResponse.json(
        { error: 'Failed to process password reset request' },
        { status: 500 }
      );
    }

    // Create reset link
    const resetLink = `${process.env.NEXTAUTH_URL || 'https://budevent.se'}/reset-password?token=${encodeURIComponent(resetToken)}`;

    // TODO: Send email with reset link
    // For now, just log it (you can implement email sending later)
    console.log('Password reset link for', email, ':', resetLink);

    return NextResponse.json(
      { 
        message: 'If an account with that email exists, a password reset link has been sent.',
        // Remove this in production - just for development
        resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
