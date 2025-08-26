import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
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

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update user to approved status
    const { error } = await supabase
      .from('users')
      .update({
        is_approved: true,
        approved_at: new Date().toISOString(),
        approved_by: session.user.id,
        role: 'USER'
      })
      .eq('id', userId);

    if (error) {
      console.error('Error approving user:', error);
      return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 });
    }

    // Send approval email to the user
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();

      if (userData) {
        // You can implement email sending here
        console.log(`User ${userData.email} has been approved`);
      }
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the approval if email fails
    }

    return NextResponse.json({ success: true, message: 'User approved successfully' });
  } catch (error) {
    console.error('Error in approve-user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
