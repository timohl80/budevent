'use client';

import { useState } from 'react';

export default function TestCalendarPage() {
  const [eventData, setEventData] = useState({
    title: 'Test Event',
    description: 'This is a test event to demonstrate calendar functionality',
    startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Tomorrow
    endsAt: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString().slice(0, 16), // Tomorrow + 2 hours
    location: 'Test Location, City, Country',
    organizerName: 'Test Organizer',
    organizerEmail: 'organizer@test.com'
  });

  const generateICSContent = (event: typeof eventData) => {
    const formatDate = (date: string) => {
      return new Date(date).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDate = formatDate(event.startsAt);
    const endDate = formatDate(event.endsAt);

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
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      `ORGANIZER;CN=${event.organizerName}:mailto:${event.organizerEmail}`,
      `DTSTAMP:${formatDate(new Date().toISOString())}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  };

  const generateCalendarLinks = (event: typeof eventData) => {
    const startDate = new Date(event.startsAt);
    const endDate = new Date(event.endsAt);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const title = encodeURIComponent(event.title);
    const description = encodeURIComponent(event.description);
    const location = encodeURIComponent(event.location);
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${description}&location=${location}`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start}&enddt=${end}&body=${description}&location=${location}`,
      apple: `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ADTSTART:${start}%0ADTEND:${end}%0ASUMMARY:${title}%0ADESCRIPTION:${description}%0ALOCATION:${location}%0AEND:VEVENT%0AEND:VCALENDAR`
    };
  };

  const downloadICS = () => {
    const icsContent = generateICSContent(eventData);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventData.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const calendarLinks = generateCalendarLinks(eventData);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📅 Calendar Booking Test
          </h1>
          <p className="text-lg text-gray-600">
            Test the calendar functionality that will be included in RSVP confirmation emails
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Event Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title
              </label>
              <input
                type="text"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A29BFE]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                value={eventData.location}
                onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A29BFE]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={eventData.startsAt}
                onChange={(e) => setEventData({ ...eventData, startsAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A29BFE]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={eventData.endsAt}
                onChange={(e) => setEventData({ ...eventData, endsAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A29BFE]"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={eventData.description}
              onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A29BFE]"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📱 Add to Calendar
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <a
              href={calendarLinks.google}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] transition-colors"
            >
              📅 Google Calendar
            </a>
            
            <a
              href={calendarLinks.outlook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 bg-[#0078D4] text-white rounded-lg hover:bg-[#106EBE] transition-colors"
            >
              📅 Outlook
            </a>
            
            <a
              href={calendarLinks.apple}
              className="flex items-center justify-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              📅 Apple Calendar
            </a>
          </div>
          
          <div className="text-center">
            <button
              onClick={downloadICS}
              className="px-6 py-3 bg-[#A29BFE] text-white rounded-lg hover:bg-[#8B7FD8] transition-colors"
            >
              📥 Download ICS File
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Generated ICS Content
          </h2>
          
          <div className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm text-gray-800 whitespace-pre-wrap">
              {generateICSContent(eventData)}
            </pre>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            <p>This ICS content will be:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>📧 Attached to RSVP confirmation emails</li>
              <li>🔗 Used to generate calendar links above</li>
              <li>📱 Automatically recognized by email clients</li>
              <li>✅ Compatible with all major calendar apps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
