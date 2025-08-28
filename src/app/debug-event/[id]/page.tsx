'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EventsService } from '@/lib/events-service';
import { EventLite } from '@/lib/types';

export default function DebugEventPage() {
  const params = useParams();
  const [event, setEvent] = useState<EventLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const eventId = params.id as string;

  useEffect(() => {
    async function debugEvent() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Debug: Starting event fetch for ID:', eventId);
        
        // Test 1: Try to get all events first
        console.log('Debug: Fetching all events...');
        const allEvents = await EventsService.getEvents(100, 0);
        console.log('Debug: All events fetched:', allEvents.length);
        
        // Test 2: Check if our event ID exists in the list
        const eventExists = allEvents.find(e => e.id === eventId);
        console.log('Debug: Event found in all events:', !!eventExists);
        
        if (eventExists) {
          console.log('Debug: Event details from all events:', eventExists);
        }
        
        // Test 3: Try to get event by ID
        console.log('Debug: Trying getEventById...');
        const singleEvent = await EventsService.getEventById(eventId);
        console.log('Debug: getEventById result:', singleEvent);
        
        if (singleEvent) {
          setEvent(singleEvent);
        } else {
          setError(`Event not found with ID: ${eventId}`);
        }
        
        // Collect debug info
        setDebugInfo({
          eventId,
          totalEvents: allEvents.length,
          eventExistsInList: !!eventExists,
          eventFromGetById: !!singleEvent,
          allEventIds: allEvents.map(e => e.id).slice(0, 10), // First 10 IDs
          matchingEvent: eventExists || null
        });
        
      } catch (err) {
        console.error('Debug: Error during debug:', err);
        setError(`Debug error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }

    if (eventId) {
      debugEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Debugging event...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Event Debug Page</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        {event && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Found</h2>
            <div className="space-y-2">
              <p><strong>ID:</strong> {event.id}</p>
              <p><strong>Title:</strong> {event.title}</p>
              <p><strong>User ID:</strong> {event.userId}</p>
              <p><strong>Status:</strong> {event.status}</p>
              <p><strong>Starts At:</strong> {event.startsAt}</p>
            </div>
          </div>
        )}
        
        <div className="mt-6">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
