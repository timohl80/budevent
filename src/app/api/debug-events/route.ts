import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get all events with basic info
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title, starts_at, created_at, updated_at, status, is_public')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({
        success: false,
        message: 'Error fetching events from database',
        error: error.message
      }, { status: 500 });
    }

    // Get total count
    const { count: totalCount, error: countError } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting events:', countError);
    }

    return NextResponse.json({
      success: true,
      message: 'Events debug information',
      totalEvents: totalCount || 0,
      recentEvents: events || [],
      timestamp: new Date().toISOString(),
      note: 'Shows the 10 most recently created events'
    });
  } catch (error) {
    console.error('Events debug error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking events',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
