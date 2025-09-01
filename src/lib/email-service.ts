import { Resend } from 'resend';

// This will only be used on the server side
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;



// Generate add-to-calendar links
function generateCalendarLinks(event: {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
}) {
  const startDate = new Date(event.startsAt);
  const endDate = event.endsAt ? new Date(event.endsAt) : new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.location || '');
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  // For Apple Calendar, we'll use Outlook which works better on iOS
  // Outlook has better integration with Apple Calendar and iOS
  const appleCalendarUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${description}&location=${location}`;

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${description}&location=${location}`,
    apple: appleCalendarUrl
  };
}

export interface EventEmailData {
  eventName: string;
  eventDate: string; // Formatted display date
  eventTime: string; // Formatted display time
  eventLocation?: string;
  eventDescription?: string;
  userName: string;
  userEmail: string;
  eventId: string;
  eventStartISO?: string; // ISO string for calendar
  eventEndISO?: string; // ISO string for calendar
  organizerName?: string;
  organizerEmail?: string;
  invitationMessage?: string; // Optional personal message from inviter
}

export class EmailService {
  /**
   * Send RSVP confirmation email to user
   */
  static async sendRSVPConfirmation(data: EventEmailData): Promise<boolean> {
    console.log('EmailService.sendRSVPConfirmation called with data:', data);
    console.log('RESEND_API_KEY available:', !!process.env.RESEND_API_KEY);
    console.log('RESEND_API_KEY length:', process.env.RESEND_API_KEY?.length || 0);
    console.log('RESEND_FROM_EMAIL:', process.env.RESEND_FROM_EMAIL);
    console.log('RESEND_FROM_EMAIL value:', process.env.RESEND_FROM_EMAIL);
    
    // Validate email data
    if (!data.userEmail || !data.userEmail.includes('@')) {
      console.error('Invalid user email:', data.userEmail);
      return false;
    }
    
    if (!resend) {
      console.error('Resend client not initialized - missing API key');
      return false;
    }

    try {
      // Validate that we have a valid ISO date for calendar functionality
      if (!data.eventStartISO || isNaN(new Date(data.eventStartISO).getTime())) {
        console.error('Invalid eventStartISO date:', data.eventStartISO);
        // Continue without calendar functionality rather than failing completely
      }

      // Generate calendar data - use ISO dates for calendar functionality
      const event = {
        title: data.eventName,
        description: data.eventDescription,
        startsAt: data.eventStartISO || new Date().toISOString(), // Fallback to current time if no ISO date
        endsAt: data.eventEndISO || new Date(new Date(data.eventStartISO || new Date()).getTime() + 2 * 60 * 60 * 1000).toISOString(), // Default 2 hours later
        location: data.eventLocation,
        organizerName: data.organizerName,
        organizerEmail: data.organizerEmail
      };

      let calendarLinks: ReturnType<typeof generateCalendarLinks> | undefined = undefined;
      
      try {
        calendarLinks = generateCalendarLinks(event);
      } catch (calendarError) {
        console.error('Error generating calendar content:', calendarError);
        // Continue without calendar functionality
        calendarLinks = undefined;
      }

      const emailData: any = {
        from: 'noreply@budevent.se', // Always use noreply@budevent.se for consistency
        to: [data.userEmail],
        subject: `You're signed up for ${data.eventName}! 🎉`,
        html: this.generateRSVPEmailHTML(data, calendarLinks),
      };

      console.log('🔍 Attempting to send email with data:', {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        hasAttachments: false
      });

      const { data: result, error } = await resend.emails.send(emailData);

      if (error) {
        console.error('🔍 Resend API error:', error);
        console.error('🔍 Error details:', JSON.stringify(error, null, 2));
        return false;
      }

      console.log('🔍 RSVP confirmation email sent successfully:', result?.id);
      return true;
    } catch (error) {
      console.error('🔍 Exception in sendRSVPConfirmation:', error);
      console.error('🔍 Error type:', typeof error);
      console.error('🔍 Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🔍 Full error object:', error);
      return false;
    }
  }

  /**
   * Generate beautiful HTML email for RSVP confirmation
   */
  private static generateRSVPEmailHTML(data: EventEmailData, calendarLinks?: ReturnType<typeof generateCalendarLinks>): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Confirmation - ${data.eventName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2D3436;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .event-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #60A5FA;
          }
          .event-details h2 {
            margin: 0 0 20px 0;
            color: #2D3436;
            font-size: 20px;
            font-weight: 600;
          }
          .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .detail-icon {
            width: 20px;
            height: 20px;
            margin-right: 15px;
            color: #A29BFE;
            flex-shrink: 0;
          }
          .detail-text {
            flex: 1;
            font-size: 16px;
            color: #2D3436;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #A29BFE 0%, #8B7FD8 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 25px 0;
            transition: transform 0.2s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .calendar-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #e9ecef;
          }
          .calendar-section h3 {
            color: #60A5FA;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
          }
          .calendar-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }
          .calendar-button {
            display: inline-block;
            padding: 12px 20px;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background-color 0.3s;
          }
          .calendar-button:hover {
            opacity: 0.9;
          }
          .calendar-button.google { background-color: #4285F4; }
          .calendar-button.outlook { background-color: #0078D4; }
          .calendar-button.apple { background-color: #555555; }
          .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .footer p {
            margin: 0;
            color: #60A5FA;
            font-size: 14px;
            font-weight: 500;
          }
          .footer a {
            color: #60A5FA;
            text-decoration: none;
            font-weight: 500;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            .header, .content, .footer {
              padding: 25px 20px;
            }
            .header h1 {
              font-size: 24px;
            }
            .calendar-buttons {
              flex-direction: column;
              align-items: center;
            }
            .calendar-button {
              width: 100%;
              max-width: 200px;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Signed Up!</h1>
            <p>Your event confirmation is below</p>
          </div>
          
          <div class="content">
            <h2>Hi ${data.userName},</h2>
            <p>Great news! You've successfully signed up for <strong>${data.eventName}</strong>. We're excited to have you join us!</p>
            
            <div class="event-details">
              <h2>Event Details</h2>
              
              <div class="detail-row">
                <div class="detail-icon">📅</div>
                <div class="detail-text">
                  <strong>Date:</strong> ${data.eventDate}
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon">🕒</div>
                <div class="detail-text">
                  <strong>Time:</strong> ${data.eventTime}
                </div>
              </div>
              
              ${data.eventLocation ? `
              <div class="detail-row">
                <div class="detail-icon">📍</div>
                <div class="detail-text">
                  <strong>Location:</strong> ${data.eventLocation}
                </div>
              </div>
              ` : ''}
              
              ${data.eventDescription ? `
              <div class="detail-row">
                <div class="detail-icon">📝</div>
                <div class="detail-text">
                  <strong>Description:</strong> ${data.eventDescription}
                </div>
              </div>
              ` : ''}
            </div>
            
            <p>We'll send you a reminder closer to the event date. If you need to make any changes to your RSVP, you can do so from your event dashboard.</p>
            
            ${calendarLinks ? `
            <div class="calendar-section">
              <h3>📱 Add to Your Calendar</h3>
              
              <div class="calendar-buttons">
                <a href="${calendarLinks.google}" target="_blank" class="calendar-button google">
                  📅 Google Calendar
                </a>
                
                <a href="${calendarLinks.outlook}" target="_blank" class="calendar-button outlook">
                  📅 Outlook
                </a>
                
                <a href="${calendarLinks.apple}" target="_blank" class="calendar-button apple">
                  📅 Apple Calendar
                </a>
              </div>
              
              <div style="background: #F0F9FF; border: 1px solid #60A5FA; border-radius: 8px; padding: 15px; margin: 15px 0; text-align: center;">
                <p style="margin: 0; color: #1E40AF; font-size: 14px;">
                  📱 <strong>Mobile Users:</strong> Tap any calendar button above - it will open your device's default calendar app automatically!
                </p>
              </div>
              
              <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 15px 0;">
                <h4 style="margin: 0 0 10px 0; color: #92400E; font-size: 16px;">🍎 iPhone Users - Calendar Options:</h4>
                <ul style="margin: 0; padding-left: 20px; color: #92400E; font-size: 14px;">
                  <li><strong>Option 1 (Recommended):</strong> Use "Google Calendar" button → Add event → Enable Google Calendar sync in iPhone Settings</li>
                  <li><strong>Option 2:</strong> Use "Apple Calendar" button → Add to Outlook → Manually sync Outlook account in iPhone Settings</li>
                  <li><strong>Option 3:</strong> Copy event details and manually add to iPhone Calendar app</li>
                </ul>
                <p style="margin: 10px 0 0 0; color: #92400E; font-size: 12px;">
                  💡 <strong>Note:</strong> Calendar apps don't automatically sync unless you configure account settings in iPhone Settings → Calendar → Accounts
                </p>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; text-align: center; margin: 0;">
                💡 <strong>Pro Tip:</strong> For automatic sync, add your calendar accounts in iPhone Settings → Calendar → Accounts
              </p>
            </div>
            ` : ''}
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/events" class="cta-button">
              View All Events
            </a>
            
            <p style="margin-top: 25px; font-size: 14px; color: #6c757d;">
              If you have any questions, please don't hesitate to reach out to the event organizer.
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent from <strong>BudEvent</strong></p>
            <p>© 2025 BudEvent. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send approval notification email to user
   */
  static async sendApprovalNotification(userEmail: string, userName: string | null): Promise<boolean> {
    if (!resend) {
      console.error('Resend client not initialized - missing API key');
      return false;
    }

    try {
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'hello@budevent.se',
        to: [userEmail],
        subject: '🎉 Your BudEvent Account Has Been Approved!',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Approved - BudEvent</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #7C3AED 0%, #F59E0B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .cta-button { display: inline-block; background: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Account Approved!</h1>
                <p>Welcome to BudEvent!</p>
              </div>
              
              <div class="content">
                <h2>Hello ${userName || 'there'}!</h2>
                
                <p>Great news! Your BudEvent account has been approved by our admin team. You can now:</p>
                
                <ul>
                  <li>✅ Sign in to your account</li>
                  <li>✅ Create and manage events</li>
                  <li>✅ RSVP to events</li>
                  <li>✅ Connect with other users</li>
                </ul>
                
                <p>Ready to get started? Click the button below to sign in:</p>
                
                <div style="text-align: center;">
                  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3001'}/auth" class="cta-button">
                    Sign In to BudEvent
                  </a>
                </div>
                
                <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                
                <p>Welcome aboard! 🚀</p>
              </div>
              
              <div class="footer">
                <p>This email was sent from <strong>BudEvent</strong></p>
                <p>© 2025 BudEvent. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('Failed to send approval email:', error);
        return false;
      }

      console.log(`Approval email sent successfully to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending approval email:', error);
      return false;
    }
  }

  /**
   * Send rejection notification email to user
   */
  static async sendRejectionNotification(userEmail: string, userName: string | null, reason?: string): Promise<boolean> {
    if (!resend) {
      console.error('Resend client not initialized - missing API key');
      return false;
    }

    try {
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'hello@budevent.se',
        to: [userEmail],
        subject: '📝 BudEvent Account Update',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Update - BudEvent</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #6B7280; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📝 Account Update</h1>
                <p>Important Information About Your Registration</p>
              </div>
              
              <div class="content">
                <h2>Hello ${userName || 'there'}!</h2>
                
                <p>We've reviewed your BudEvent account registration and unfortunately, we're unable to approve it at this time.</p>
                
                ${reason ? `
                <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 8px; padding: 15px; margin: 20px 0;">
                  <strong>Reason:</strong> ${reason}
                </div>
                ` : ''}
                
                <p>This could be due to various reasons such as:</p>
                
                <ul>
                  <li>Incomplete or inaccurate information</li>
                  <li>Policy violations</li>
                  <li>Security concerns</li>
                  <li>Other administrative reasons</li>
                </ul>
                
                <p>If you believe this decision was made in error, or if you'd like to provide additional information, please contact our support team.</p>
                
                <p>Thank you for your interest in BudEvent.</p>
              </div>
              
              <div class="footer">
                <p>This email was sent from <strong>BudEvent</strong></p>
                <p>© 2025 BudEvent. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      });

      if (error) {
        console.error('Failed to send rejection email:', error);
        return false;
      }

      console.log(`Rejection email sent successfully to ${userEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending rejection email:', error);
      return false;
    }
  }

  /**
   * Send password reset email to user
   */
  static async sendPasswordReset(userEmail: string, userName: string | null, resetLink: string): Promise<boolean> {
    if (!resend) {
      console.error('Resend client not initialized - missing API key');
      return false;
    }

    try {
      const { error } = await resend.emails.send({
        from: 'noreply@budevent.se',
        to: [userEmail],
        subject: '🔐 Reset Your BudEvent Password',
        html: this.generatePasswordResetEmailHTML(userName, resetLink),
      });

      if (error) {
        console.error('Failed to send password reset email:', error);
        return false;
      }

      console.log('Password reset email sent successfully to:', userEmail);
      return true;
    } catch (error) {
      console.error('Exception in sendPasswordReset:', error);
      return false;
    }
  }

  /**
   * Generate HTML email for password reset
   */
  private static generatePasswordResetEmailHTML(userName: string | null, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - BudEvent</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2D3436;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
            background: #ffffff;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 25px 0;
            transition: all 0.3s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(96, 165, 250, 0.3);
          }
          .warning-box {
            background: #FEF3C7;
            border: 1px solid #F59E0B;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
          }
          .warning-box h4 {
            margin: 0 0 10px 0;
            color: #92400E;
            font-size: 16px;
          }
          .warning-box p {
            margin: 0;
            color: #92400E;
            font-size: 14px;
          }
          .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .footer p {
            margin: 0;
            color: #60A5FA;
            font-size: 14px;
            font-weight: 500;
          }
          .footer a {
            color: #60A5FA;
            text-decoration: none;
            font-weight: 500;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            .header, .content, .footer {
              padding: 25px 20px;
            }
            .header h1 {
              font-size: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reset Your Password</h1>
            <p>You requested a password reset for your BudEvent account</p>
          </div>
          
          <div class="content">
            <h2>Hi ${userName || 'there'}!</h2>
            
            <p>We received a request to reset the password for your BudEvent account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="cta-button">
                Reset My Password
              </a>
            </div>
            
            <div class="warning-box">
              <h4>⚠️ Important Security Notes:</h4>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400E;">
                <li>This link will expire in <strong>1 hour</strong></li>
                <li>Only use this link on a device you trust</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
            </div>
            
            <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #6B7280; font-size: 14px; background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              ${resetLink}
            </p>
            
            <p style="margin-top: 25px; font-size: 14px; color: #6c757d;">
              If you have any questions or need assistance, please don't hesitate to contact our support team.
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent from <strong>BudEvent</strong></p>
            <p>© 2025 BudEvent. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Send event invitation email to user
   */
  static async sendEventInvitation(data: EventEmailData): Promise<boolean> {
    console.log('EmailService.sendEventInvitation called with data:', data);
    
    // Validate email data
    if (!data.userEmail || !data.userEmail.includes('@')) {
      console.error('Invalid user email:', data.userEmail);
      return false;
    }
    
    if (!resend) {
      console.error('Resend client not initialized - missing API key');
      return false;
    }

    try {
      // Validate that we have a valid ISO date for calendar functionality
      if (!data.eventStartISO || isNaN(new Date(data.eventStartISO).getTime())) {
        console.error('Invalid eventStartISO date:', data.eventStartISO);
        // Continue without calendar functionality rather than failing completely
      }

      // Generate calendar data - use ISO dates for calendar functionality
      const event = {
        title: data.eventName,
        description: data.eventDescription,
        startsAt: data.eventStartISO || new Date().toISOString(), // Fallback to current time if no ISO date
        endsAt: data.eventEndISO || new Date(new Date(data.eventStartISO || new Date()).getTime() + 2 * 60 * 60 * 1000).toISOString(), // Default 2 hours later
        location: data.eventLocation,
        organizerName: data.organizerName,
        organizerEmail: data.organizerEmail
      };

      let calendarLinks: ReturnType<typeof generateCalendarLinks> | undefined = undefined;
      
      try {
        calendarLinks = generateCalendarLinks(event);
      } catch (calendarError) {
        console.error('Error generating calendar content:', calendarError);
        // Continue without calendar functionality
        calendarLinks = undefined;
      }

      const emailData: any = {
        from: 'noreply@budevent.se', // Always use noreply@budevent.se for consistency
        to: [data.userEmail],
        subject: `🎉 You're invited to ${data.eventName}!`,
        html: this.generateInvitationEmailHTML(data, calendarLinks),
      };

      console.log('🔍 Attempting to send invitation email with data:', {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        hasAttachments: false
      });

      const { data: result, error } = await resend.emails.send(emailData);

      if (error) {
        console.error('🔍 Resend API error:', error);
        console.error('🔍 Error details:', JSON.stringify(error, null, 2));
        return false;
      }

      console.log('🔍 Event invitation email sent successfully:', result?.id);
      return true;
    } catch (error) {
      console.error('🔍 Exception in sendEventInvitation:', error);
      console.error('🔍 Error type:', typeof error);
      console.error('🔍 Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('🔍 Full error object:', error);
      return false;
    }
  }

  /**
   * Generate beautiful HTML email for event invitation
   */
  private static generateInvitationEmailHTML(data: EventEmailData, calendarLinks?: ReturnType<typeof generateCalendarLinks>): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Event Invitation - ${data.eventName}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2D3436;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
          }
          .content {
            padding: 40px 30px;
          }
          .event-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            border-left: 4px solid #60A5FA;
          }
          .event-details h2 {
            margin: 0 0 20px 0;
            color: #2D3436;
            font-size: 20px;
            font-weight: 600;
          }
          .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 12px 0;
            border-bottom: 1px solid #e9ecef;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .detail-icon {
            width: 20px;
            height: 20px;
            margin-right: 15px;
            color: #A29BFE;
            flex-shrink: 0;
          }
          .detail-text {
            flex: 1;
            font-size: 16px;
            color: #2D3436;
          }
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 25px 0;
            transition: transform 0.2s ease;
          }
          .cta-button:hover {
            transform: translateY(-2px);
          }
          .invitation-message {
            background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%);
            border: 1px solid #60A5FA;
            border-radius: 8px;
            padding: 20px;
            margin: 25px 0;
            font-style: italic;
            color: #1E40AF;
          }
          .calendar-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #e9ecef;
          }
          .calendar-section h3 {
            color: #60A5FA;
            margin: 0 0 15px 0;
            font-size: 18px;
            font-weight: 600;
          }
          .calendar-buttons {
            display: flex;
            gap: 10px;
            justify-content: center;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }
          .calendar-button {
            display: inline-block;
            padding: 12px 20px;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            transition: background-color 0.3s;
          }
          .calendar-button:hover {
            opacity: 0.9;
          }
          .calendar-button.google { background-color: #4285F4; }
          .calendar-button.outlook { background-color: #0078D4; }
          .calendar-button.apple { background-color: #555555; }
          .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .footer p {
            margin: 0;
            color: #60A5FA;
            font-size: 14px;
            font-weight: 500;
          }
          .footer a {
            color: #60A5FA;
            text-decoration: none;
            font-weight: 500;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
              border-radius: 8px;
            }
            .header, .content, .footer {
              padding: 25px 20px;
            }
            .header h1 {
              font-size: 24px;
            }
            .calendar-buttons {
              flex-direction: column;
              align-items: center;
            }
            .calendar-button {
              width: 100%;
              max-width: 200px;
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're Invited!</h1>
            <p>${data.organizerName || 'Someone'} has invited you to an event</p>
          </div>
          
          <div class="content">
            <h2>Hi ${data.userName},</h2>
            <p>You've been invited to join <strong>${data.eventName}</strong>! We'd love to have you there.</p>
            
            ${data.invitationMessage ? `
            <div class="invitation-message">
              <strong>Personal message from ${data.organizerName || 'the organizer'}:</strong><br>
              "${data.invitationMessage}"
            </div>
            ` : ''}
            
            <div class="event-details">
              <h2>Event Details</h2>
              
              <div class="detail-row">
                <div class="detail-icon">📅</div>
                <div class="detail-text">
                  <strong>Date:</strong> ${data.eventDate}
                </div>
              </div>
              
              <div class="detail-row">
                <div class="detail-icon">🕒</div>
                <div class="detail-text">
                  <strong>Time:</strong> ${data.eventTime}
                </div>
              </div>
              
              ${data.eventLocation ? `
              <div class="detail-row">
                <div class="detail-icon">📍</div>
                <div class="detail-text">
                  <strong>Location:</strong> ${data.eventLocation}
                </div>
              </div>
              ` : ''}
              
              ${data.eventDescription ? `
              <div class="detail-row">
                <div class="detail-icon">📝</div>
                <div class="detail-text">
                  <strong>Description:</strong> ${data.eventDescription}
                </div>
              </div>
              ` : ''}
            </div>
            
            <p>Ready to join us? Click the button below to view the event and RSVP:</p>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3002'}/events/${data.eventId}?invited=true" class="cta-button">
                View Event & RSVP
              </a>
            </div>
            
            ${calendarLinks ? `
            <div class="calendar-section">
              <h3>📱 Add to Your Calendar</h3>
              
              <div class="calendar-buttons">
                <a href="${calendarLinks.google}" target="_blank" class="calendar-button google">
                  📅 Google Calendar
                </a>
                
                <a href="${calendarLinks.outlook}" target="_blank" class="calendar-button outlook">
                  📅 Outlook
                </a>
                
                <a href="${calendarLinks.apple}" target="_blank" class="calendar-button apple">
                  📅 Apple Calendar
                </a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; text-align: center; margin: 0;">
                💡 <strong>Pro Tip:</strong> Add this to your calendar so you don't miss it!
              </p>
            </div>
            ` : ''}
            
            <p style="margin-top: 25px; font-size: 14px; color: #6c757d;">
              If you have any questions about this event, feel free to reach out to ${data.organizerName || 'the organizer'}.
            </p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent from <strong>BudEvent</strong></p>
            <p>© 2025 BudEvent. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Test email service connection
   */
  static async testConnection(): Promise<boolean> {
    if (!resend) {
      console.error('Resend client not initialized - missing API key');
      return false;
    }

    try {
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'hello@budevent.se',
        to: ['test@example.com'],
        subject: 'Test Email',
        html: '<p>This is a test email to verify the email service is working.</p>',
      });

      if (error) {
        console.error('Email service test failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Email service test error:', error);
      return false;
    }
  }
}
