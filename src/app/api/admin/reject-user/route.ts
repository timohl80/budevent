import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { EmailService } from '@/lib/email-service';

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

    const { userId, reason } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Update user with rejection details
    const { error } = await supabase
      .from('users')
      .update({
        is_approved: false,
        approval_notes: reason || 'Registration rejected',
        approved_at: null,
        approved_by: null
      })
      .eq('id', userId);

    if (error) {
      console.error('Error rejecting user:', error);
      return NextResponse.json({ error: 'Failed to reject user' }, { status: 500 });
    }

    // Send rejection email to the user
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();

      if (userData) {
        console.log(`User ${userData.email} has been rejected, sending notification email...`);
        
        // Send rejection email
        const emailSent = await EmailService.sendRejectionNotification(
          userData.email, 
          userData.name,
          reason
        );
        
        if (emailSent) {
          console.log(`Rejection email sent successfully to ${userData.email}`);
        } else {
          console.error(`Failed to send rejection email to ${userData.email}`);
        }
      }
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the rejection if email fails
    }

    return NextResponse.json({ success: true, message: 'User rejected successfully' });
  } catch (error) {
    console.error('Error in reject-user API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
