import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if API key is available
    console.log('=== TEST EMAIL DEBUG ===');
    console.log('RESEND_API_KEY available:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
    console.log('RESEND_API_KEY starts with:', process.env.RESEND_API_KEY?.substring(0, 3) || 'N/A');
    
    // Test email data
    const testEmailData = {
      eventName: 'Test Event',
      eventDate: 'Friday, December 25, 2024',
      eventTime: '7:00 PM',
      eventLocation: 'Test Location',
      eventDescription: 'This is a test event to verify the email service is working.',
      userName: 'Test User',
      userEmail: 'timohl@hotmail.com', // Using your verified email for testing
      eventId: 'test-event-123'
    };

    console.log('Sending test email with data:', testEmailData);

    console.log('About to call EmailService.sendRSVPConfirmation...');
    const success = await EmailService.sendRSVPConfirmation(testEmailData);
    console.log('Email service result:', success);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Test email sent successfully! Check your email inbox.' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send test email. Check the console for errors.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error testing email service', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
