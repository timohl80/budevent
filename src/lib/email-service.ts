import { Resend } from 'resend';

// This will only be used on the server side
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EventEmailData {
  eventName: string;
  eventDate: string;
  eventTime: string;
  eventLocation?: string;
  eventDescription?: string;
  userName: string;
  userEmail: string;
  eventId: string;
}

export class EmailService {
  /**
   * Send RSVP confirmation email to user
   */
  static async sendRSVPConfirmation(data: EventEmailData): Promise<boolean> {
    if (!resend) {
      console.error('Resend client not initialized - missing API key');
      return false;
    }

    try {
      const { data: result, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [data.userEmail],
        subject: `You're signed up for ${data.eventName}! 🎉`,
        html: this.generateRSVPEmailHTML(data),
      });

      if (error) {
        console.error('Error sending RSVP confirmation email:', error);
        return false;
      }

      console.log('RSVP confirmation email sent successfully:', result?.id);
      return true;
    } catch (error) {
      console.error('Failed to send RSVP confirmation email:', error);
      return false;
    }
  }

  /**
   * Generate beautiful HTML email for RSVP confirmation
   */
  private static generateRSVPEmailHTML(data: EventEmailData): string {
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
            background: linear-gradient(135deg, #A29BFE 0%, #8B7FD8 100%);
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
            border-left: 4px solid #A29BFE;
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
          .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          .footer a {
            color: #A29BFE;
            text-decoration: none;
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
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/events" class="cta-button">
              View All Events
            </a>
            
            <p style="margin-top: 25px; font-size: 14px; color: #6c757d;">
              If you have any questions, please don't hesitate to reach out to the event organizer.
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent from <strong>BudEvent</strong></p>
            <p>© 2024 BudEvent. All rights reserved.</p>
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
      const { data, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
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
