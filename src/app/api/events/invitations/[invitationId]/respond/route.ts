import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { invitationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await request.json();
    
    if (!status || !['accepted', 'declined'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be "accepted" or "declined"' 
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

    // Update the invitation status
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('event_invitations')
      .update({
        status,
        responded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', params.invitationId)
      .eq('invited_user_id', currentUserId)
      .eq('status', 'pending') // Only allow responding to pending invitations
      .select()
      .single();

    if (updateError || !updatedInvitation) {
      return NextResponse.json({ 
        error: 'Invitation not found or already responded to' 
      }, { status: 404 });
    }

    // If accepted, automatically create an RSVP
    if (status === 'accepted') {
      try {
        const { error: rsvpError } = await supabase
          .from('event_rsvps')
          .upsert({
            event_id: updatedInvitation.event_id,
            user_id: currentUserId,
            status: 'going',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'event_id,user_id'
          });

        if (rsvpError) {
          console.error('Error creating RSVP:', rsvpError);
          // Don't fail the invitation response, just log the error
        }
      } catch (rsvpError) {
        console.error('Exception creating RSVP:', rsvpError);
        // Don't fail the invitation response, just log the error
      }
    }

    return NextResponse.json({ 
      success: true,
      message: `Invitation ${status} successfully`,
      invitation: updatedInvitation
    });

  } catch (error) {
    console.error('Error in invitation response API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
