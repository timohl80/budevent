import { NextResponse } from 'next/server';
import { EmailService } from '@/lib/email-service';

export async function POST() {
  try {
    // Debug: Show what email address is being used
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
    
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

    const success = await EmailService.sendRSVPConfirmation(testEmailData);
    
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
    console.error('Failed to send test email:', error);
    return NextResponse.json(
      { error: 'Failed to send test email' },
      { status: 500 }
    );
  }
}
