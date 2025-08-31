import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing raw Supabase query...');
    
    // Test the exact same query that EventsService.getEvents() uses
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('starts_at', { ascending: true })
      .range(0, 19); // Default limit of 20

    if (error) {
      console.error('Raw query error:', error);
      return NextResponse.json({
        success: false,
        message: 'Raw query error',
        error: error.message
      }, { status: 500 });
    }

    console.log('🔍 Raw query result:', {
      count: data?.length || 0,
      firstEvent: data?.[0]?.title,
      lastEvent: data?.[data.length - 1]?.title
    });

    return NextResponse.json({
      success: true,
      message: 'Raw Supabase query result',
      eventsCount: data?.length || 0,
      firstEvent: data?.[0]?.title,
      lastEvent: data?.[data.length - 1]?.title,
      allEventTitles: data?.map(e => e.title) || [],
      timestamp: new Date().toISOString(),
      note: 'Shows raw Supabase query result without EventsService'
    });
  } catch (error) {
    console.error('Raw query error:', error);
    return NextResponse.json({
      success: false,
      message: 'Raw query error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
