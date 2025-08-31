import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EventEmailData } from '@/lib/email-service';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      RESEND_API_KEY_LENGTH: process.env.RESEND_API_KEY?.length || 0,
      RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
      NODE_ENV: process.env.NODE_ENV,
    };

    // Test RSVP email with sample data
    const testEmailData: EventEmailData = {
      eventName: 'Debug Test Event',
      eventDate: 'Today',
      eventTime: '1:58 AM – 3:58 AM',
      eventLocation: 'Debug Location',
      eventDescription: 'This is a test event for debugging email functionality',
      userName: 'Test User',
      userEmail: 'timohl@hotmail.com', // Use your email for testing
      eventId: 'debug-event-123',
      eventStartISO: new Date().toISOString(),
      organizerName: 'Test Organizer',
      organizerEmail: 'noreply@budevent.se'
    };

    console.log('Testing RSVP email with data:', testEmailData);
    console.log('Environment check:', envCheck);

    const success = await EmailService.sendRSVPConfirmation(testEmailData);

    return NextResponse.json({
      success: true,
      message: 'Debug email test completed',
      emailSent: success,
      environment: envCheck,
      testData: testEmailData
    });
  } catch (error) {
    console.error('Debug email error:', error);
    return NextResponse.json({
      success: false,
      message: 'Debug email test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: {
        RESEND_API_KEY: !!process.env.RESEND_API_KEY,
        RESEND_API_KEY_LENGTH: process.env.RESEND_API_KEY?.length || 0,
        RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
        NODE_ENV: process.env.NODE_ENV,
      }
    }, { status: 500 });
  }
}
