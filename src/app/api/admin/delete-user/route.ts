import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: NextRequest) {
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

    // Prevent admin from deleting themselves (we'll use email since session doesn't have id)
    // This is a simplified check - in production you might want to fetch the user's email by userId first
    const { data: userToDelete } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (userToDelete?.email === session.user.email) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Delete user from Supabase
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error in delete-user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
