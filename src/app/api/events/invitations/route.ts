import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }

    const { createClient } = await import('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const currentUserId = (session.user as any).id;

    // Get user's invitations with event details
    const { data: invitations, error } = await supabase
      .from('event_invitations')
      .select(`
        id,
        event_id,
        status,
        invited_at,
        responded_at,
        message,
        events (
          id,
          title,
          description,
          starts_at,
          location,
          image_url,
          capacity,
          is_public,
          status
        ),
        invited_by_user:users!event_invitations_invited_by_user_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('invited_user_id', currentUserId)
      .order('invited_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
    }

    return NextResponse.json({ invitations: invitations || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
