import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/events-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get the session from the server side
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { eventId, status } = await request.json();
    
    if (!eventId || !status) {
      return NextResponse.json({ error: 'Missing eventId or status' }, { status: 400 });
    }

    // Extract user ID from session
    const user = session.user;
    const userId = (user as any).id || user.email;
    
    if (!userId) {
      return NextResponse.json({ error: 'Could not identify user' }, { status: 400 });
    }

    // Call the EventsService to create the RSVP and send email
    const result = await EventsService.rsvpToEvent(eventId, userId, status);
    
    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error('Error in RSVP API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
