'use client';

import { useState } from 'react';
import { EventsService } from '@/lib/events-service';

export default function TestDatabasePage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDatabase = async () => {
    setLoading(true);
    try {
      console.log('Testing database connection...');
      
      // Test 1: Basic connection
      const connectionTest = await EventsService.testConnection();
      console.log('Connection test result:', connectionTest);
      
      // Test 2: Get events count
      const eventsCount = await EventsService.getEventsCount();
      console.log('Events count:', eventsCount);
      
      // Test 3: Try to get events (with small limit)
      const events = await EventsService.getEvents(5, 0);
      console.log('Events fetched:', events.length);
      console.log('First event:', events[0]);
      
      setTestResults({
        connectionTest,
        eventsCount,
        eventsFetched: events.length,
        firstEvent: events[0],
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Database test failed:', error);
      setTestResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2D3436] mb-4">
            Database Test Page
          </h1>
          <p className="text-lg text-[#2D3436] opacity-80">
            Test your database connection and see what's happening with events
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <button
            onClick={testDatabase}
            disabled={loading}
            className="w-full px-6 py-3 text-base font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Testing...' : 'Test Database Connection'}
          </button>

          {testResults && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Results:</h3>
              <pre className="text-sm text-gray-700 bg-white p-3 rounded border overflow-x-auto">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">What This Tests:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Database connection to Supabase</li>
              <li>• Total number of events in database</li>
              <li>• Ability to fetch events</li>
              <li>• Any error messages or timeouts</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">Common Issues:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• No events in database (create some first!)</li>
              <li>• Database timeout (run the optimization script)</li>
              <li>• Missing environment variables</li>
              <li>• Database permissions issues</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
