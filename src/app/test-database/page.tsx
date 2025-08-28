'use client';

import { useState } from 'react';
import { EventsService } from '@/lib/events-service';

export default function TestDatabasePage() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test 1: Basic connection
      console.log('Testing basic connection...');
      const connectionTest = await EventsService.testConnection();
      results.connection = connectionTest;
      console.log('Connection test result:', connectionTest);

      // Test 2: Get events count
      console.log('Testing events count...');
      const eventsCount = await EventsService.getEventsCount();
      results.eventsCount = eventsCount;
      console.log('Events count:', eventsCount);

      // Test 3: Get first few events
      console.log('Testing events fetch...');
      const events = await EventsService.getEvents(5, 0);
      results.events = events;
      results.eventsLength = events.length;
      console.log('First 5 events:', events);

      // Test 4: Check event structure
      if (events.length > 0) {
        const firstEvent = events[0];
        results.firstEventStructure = {
          id: firstEvent.id,
          title: firstEvent.title,
          userId: firstEvent.userId,
          hasUserId: !!firstEvent.userId,
          allFields: Object.keys(firstEvent)
        };
        console.log('First event structure:', results.firstEventStructure);
      }

      // Test 5: Try to get a specific event by ID
      if (events.length > 0) {
        console.log('Testing getEventById...');
        const firstEventId = events[0].id;
        const singleEvent = await EventsService.getEventById(firstEventId);
        results.getEventById = {
          success: !!singleEvent,
          eventId: firstEventId,
          result: singleEvent
        };
        console.log('getEventById result:', results.getEventById);
      }

    } catch (error) {
      console.error('Test error:', error);
      results.error = error instanceof Error ? error.message : 'Unknown error';
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Test Page</h1>
        
        <div className="mb-6">
          <button
            onClick={runTests}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running Tests...' : 'Run Database Tests'}
          </button>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6">
          <a
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
