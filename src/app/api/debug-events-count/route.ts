import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Counting total events in database...');
    
    // Count all events
    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error counting events:', error);
      return NextResponse.json({
        success: false,
        message: 'Error counting events',
        error: error.message
      }, { status: 500 });
    }

    console.log('🔍 Total events in database:', count);

    return NextResponse.json({
      success: true,
      message: 'Event count result',
      totalEvents: count,
      timestamp: new Date().toISOString(),
      note: 'Shows total number of events in the database'
    });
  } catch (error) {
    console.error('Event count error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error counting events',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
