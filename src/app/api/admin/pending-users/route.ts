import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you'll need to implement this check)
    // For now, let's check if the user email is in a list of admin emails
    const adminEmails = ['admin@budevent.com', 'timohl@hotmail.com'];
    if (!adminEmails.includes(session.user.email || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch users whose accounts are pending approval
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, created_at, is_approved, approval_notes')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
