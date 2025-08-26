import { Resend } from 'resend';

// This will only be used on the server side
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Generate ICS file content for calendar events
function generateICSContent(event: {
  title: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  location?: string;
  organizerName?: string;
  organizerEmail?: string;
}) {
  const formatDate = (date: string) => {
    return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startDate = formatDate(event.startsAt);
  const endDate = event.endsAt ? formatDate(event.endsAt) : formatDate(new Date(new Date(event.startsAt).getTime() + 2 * 60 * 60 * 1000).toISOString()); // Default 2 hours if no end time

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BudEvent//Calendar Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@budevent.com`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    event.organizerName ? `ORGANIZER;CN=${event.organizerName}:mailto:${event.organizerEmail || 'noreply@budevent.com'}` : '',
    `DTSTAMP:${formatDate(new Date().toISOString())}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');

  return icsContent;
}

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

  return {
    google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`,
    outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${description}&location=${location}`,
    apple: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${start}%0ADTEND:${end}%0ASUMMARY:${title}%0ADESCRIPTION:${description}%0ALOCATION:${location}%0AEND:VEVENT%0AEND:VCALENDAR`
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
      // Generate calendar data
      const event = {
        title: data.eventName,
        description: data.eventDescription,
        startsAt: data.eventStartISO || data.eventDate,
        endsAt: data.eventEndISO || data.eventDate,
        location: data.eventLocation,
        organizerName: data.organizerName,
        organizerEmail: data.organizerEmail
      };

      const icsContent = generateICSContent(event);
      const calendarLinks = generateCalendarLinks(event);

      const { data: result, error } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: [data.userEmail],
        subject: `You're signed up for ${data.eventName}! 🎉`,
        html: this.generateRSVPEmailHTML(data, calendarLinks),
        attachments: [
          {
            filename: `${data.eventName.replace(/[^a-zA-Z0-9]/g, '_')}.ics`,
            content: Buffer.from(icsContent, 'utf-8').toString('base64'),
            contentType: 'text/calendar'
          }
        ]
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
          .calendar-section {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #e9ecef;
          }
          .calendar-section h3 {
            margin: 0 0 20px 0;
            color: #2D3436;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
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
          .calendar-button.apple { background-color: #000000; }
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
                
                <a href="${calendarLinks.apple}" class="calendar-button apple">
                  📅 Apple Calendar
                </a>
              </div>
              
              <p style="color: #6B7280; font-size: 14px; text-align: center; margin: 0;">
                📥 A calendar file (.ics) is attached to this email for easy import
              </p>
            </div>
            ` : ''}
            
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
      const { error } = await resend.emails.send({
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
