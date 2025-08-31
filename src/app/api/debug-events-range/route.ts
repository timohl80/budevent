import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing range query like EventsService.getEvents()...');
    
    // Test the exact same query that EventsService.getEvents() uses
    const limit = 20;
    const offset = 0;
    
    console.log(`🔍 Testing with limit: ${limit}, offset: ${offset}`);
    console.log(`🔍 Range: ${offset} to ${offset + limit - 1}`);
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('starts_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Range query error:', error);
      return NextResponse.json({
        success: false,
        message: 'Range query error',
        error: error.message
      }, { status: 500 });
    }

    console.log('🔍 Range query result:', {
      requestedLimit: limit,
      requestedOffset: offset,
      requestedRange: `${offset} to ${offset + limit - 1}`,
      actualCount: data?.length || 0,
      firstEvent: data?.[0]?.title,
      lastEvent: data?.[data.length - 1]?.title
    });

    return NextResponse.json({
      success: true,
      message: 'Range query test result',
      requestedLimit: limit,
      requestedOffset: offset,
      requestedRange: `${offset} to ${offset + limit - 1}`,
      actualCount: data?.length || 0,
      firstEvent: data?.[0]?.title,
      lastEvent: data?.[data.length - 1]?.title,
      allEventTitles: data?.map(e => e.title) || [],
      timestamp: new Date().toISOString(),
      note: 'Tests the exact range query used by EventsService.getEvents()'
    });
  } catch (error) {
    console.error('Range query error:', error);
    return NextResponse.json({
      success: false,
      message: 'Range query error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
