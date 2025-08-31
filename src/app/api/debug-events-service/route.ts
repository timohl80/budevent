import { NextRequest, NextResponse } from 'next/server';
import { EventsService } from '@/lib/events-service';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing EventsService.getEvents()...');
    
    // Test the EventsService directly - use default limit to see all events
    const events = await EventsService.getEvents();
    
    console.log('🔍 EventsService.getEvents() result:', {
      count: events.length,
      firstEvent: events[0],
      allEvents: events.map(e => ({
        id: e.id,
        title: e.title,
        createdAt: e.createdAt,
        startsAt: e.startsAt,
        hasCreatedAt: !!e.createdAt
      }))
    });

    return NextResponse.json({
      success: true,
      message: 'EventsService.getEvents() test result',
      eventsCount: events.length,
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        createdAt: e.createdAt,
        startsAt: e.startsAt,
        hasCreatedAt: !!e.createdAt
      })),
      timestamp: new Date().toISOString(),
      note: 'Shows what EventsService.getEvents() returns'
    });
  } catch (error) {
    console.error('EventsService test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error testing EventsService',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
