import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing different limits to check for RLS policies...');
    
    // Test different limits to see if there's an RLS policy
    const limits = [5, 10, 15, 20, 25, 30];
    const results: any[] = [];
    
    for (const limit of limits) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: true })
        .range(0, limit - 1);
      
      if (error) {
        console.error(`Error with limit ${limit}:`, error);
        results.push({ limit, count: 0, error: error.message });
      } else {
        console.log(`Limit ${limit}: got ${data?.length || 0} events`);
        results.push({ 
          limit, 
          count: data?.length || 0, 
          error: null,
          firstEvent: data?.[0]?.title,
          lastEvent: data?.[data.length - 1]?.title
        });
      }
    }

    console.log('🔍 RLS test results:', results);

    return NextResponse.json({
      success: true,
      message: 'RLS policy test results',
      results,
      timestamp: new Date().toISOString(),
      note: 'Tests different limits to check for RLS policies'
    });
  } catch (error) {
    console.error('RLS test error:', error);
    return NextResponse.json({
      success: false,
      message: 'RLS test error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
