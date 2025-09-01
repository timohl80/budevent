import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, invitedUserIds, message } = await request.json();
    
    if (!eventId || !invitedUserIds || !Array.isArray(invitedUserIds) || invitedUserIds.length === 0) {
      return NextResponse.json({ 
        error: 'Missing eventId or invitedUserIds' 
      }, { status: 400 });
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

    // Verify the user owns the event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, description, starts_at, location, user_id')
      .eq('id', eventId)
      .eq('user_id', currentUserId)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ 
        error: 'Event not found or you do not have permission to invite users to this event' 
      }, { status: 403 });
    }

    // Get invited users details
    const { data: invitedUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, name')
      .in('id', invitedUserIds)
      .eq('is_approved', true);

    if (usersError || !invitedUsers || invitedUsers.length === 0) {
      return NextResponse.json({ 
        error: 'No valid users found to invite' 
      }, { status: 400 });
    }

    // Create invitations in database
    const invitations = invitedUsers.map(user => ({
      event_id: eventId,
      invited_user_id: user.id,
      invited_by_user_id: currentUserId,
      message: message || null,
      status: 'pending'
    }));

    const { data: createdInvitations, error: insertError } = await supabase
      .from('event_invitations')
      .insert(invitations)
      .select();

    if (insertError) {
      console.error('Error creating invitations:', insertError);
      return NextResponse.json({ 
        error: 'Failed to create invitations' 
      }, { status: 500 });
    }

    // Send invitation emails
    const emailPromises = invitedUsers.map(async (user) => {
      try {
        const eventDate = new Date(event.starts_at);
        const endTime = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // Default 2 hours

        const emailData = {
          eventName: event.title,
          eventDate: eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          eventTime: eventDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          eventLocation: event.location || undefined,
          eventDescription: event.description || undefined,
          userName: user.name || user.email || 'User',
          userEmail: user.email,
          eventId: event.id,
          eventStartISO: event.starts_at,
          eventEndISO: endTime.toISOString(),
          organizerName: (session.user as any).name || (session.user as any).email || 'Event Organizer',
          organizerEmail: (session.user as any).email || 'noreply@budevent.com',
          invitationMessage: message || undefined
        };

        // Send invitation email
        return await EmailService.sendEventInvitation(emailData);
      } catch (error) {
        console.error(`Failed to send invitation email to ${user.email}:`, error);
        return false;
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successfulEmails = emailResults.filter(result => result === true).length;

    return NextResponse.json({ 
      success: true,
      message: `Invitations sent to ${invitedUsers.length} users. ${successfulEmails} emails delivered successfully.`,
      invitations: createdInvitations,
      emailResults: {
        total: invitedUsers.length,
        successful: successfulEmails,
        failed: invitedUsers.length - successfulEmails
      }
    });

  } catch (error) {
    console.error('Error in invite API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
