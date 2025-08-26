import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can implement your own admin check logic)
    const adminEmails = ['admin@budevent.com', 'timohl@hotmail.com'];
    if (!adminEmails.includes(session.user.email!)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch pending users from Supabase
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, created_at')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending users:', error);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Transform the data to match our interface
    const pendingUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
    }));

    return NextResponse.json({ users: pendingUsers });
  } catch (error) {
    console.error('Error in pending-users API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
