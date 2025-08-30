import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          hasKey: false,
          keyLength: 0
        },
        { status: 500 }
      );
    }

    // Test a simple OpenAI API call
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { 
          error: 'OpenAI API test failed',
          status: response.status,
          details: errorData,
          hasKey: true,
          keyLength: openaiApiKey.length
        },
        { status: 500 }
      );
    }

    const models = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'OpenAI API key is working',
      hasKey: true,
      keyLength: openaiApiKey.length,
      availableModels: models.data?.slice(0, 5)?.map((m: any) => m.id) || []
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'OpenAI API test failed with exception',
        details: error instanceof Error ? error.message : 'Unknown error',
        hasKey: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY?.length || 0
      },
      { status: 500 }
    );
  }
}
