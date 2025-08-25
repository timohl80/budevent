import { NextRequest, NextResponse } from 'next/server';
import { EmailService, EventEmailData } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // Debug: Check if API key is available
    console.log('RESEND_API_KEY available:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
    
    const emailData: EventEmailData = await request.json();
    console.log('Received email data:', emailData);

    // Validate required fields
    if (!emailData.userEmail || !emailData.eventName) {
      console.log('Missing required fields:', { userEmail: !!emailData.userEmail, eventName: !!emailData.eventName });
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required email data' 
      }, { status: 400 });
    }

    const success = await EmailService.sendRSVPConfirmation(emailData);
    console.log('Email service result:', success);

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'RSVP confirmation email sent successfully!' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send RSVP confirmation email' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Send RSVP email error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error sending RSVP confirmation email', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
