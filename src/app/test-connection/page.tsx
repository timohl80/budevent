'use client';

import { useState } from 'react';
import { EventsService } from '@/lib/events-service';
import { supabase } from '@/lib/supabase';

export default function TestConnection() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      // Test 1: Basic Supabase client
      addResult('Testing Supabase client...');
      addResult(`Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
      addResult(`Supabase Key length: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0}`);
      
      // Test 2: Direct table access
      addResult('Testing direct table access...');
      const { data: tableData, error: tableError } = await supabase
        .from('events')
        .select('*')
        .limit(1);
      
      if (tableError) {
        addResult(`❌ Table access error: ${tableError.message}`);
        addResult(`Error code: ${tableError.code}`);
        addResult(`Error details: ${JSON.stringify(tableError.details)}`);
      } else {
        addResult(`✅ Table access successful`);
        addResult(`Data type: ${typeof tableData}`);
        addResult(`Data length: ${tableData?.length || 0}`);
      }
      
      // Test 3: EventsService connection test
      addResult('Testing EventsService connection...');
      const isConnected = await EventsService.testConnection();
      addResult(isConnected ? '✅ EventsService connection successful' : '❌ EventsService connection failed');
      
      // Test 4: Get events
      if (isConnected) {
        addResult('Testing getEvents...');
        try {
          const events = await EventsService.getEvents();
          addResult(`✅ getEvents successful: ${events.length} events`);
        } catch (error) {
          addResult(`❌ getEvents failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
    } catch (error) {
      addResult(`❌ Test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Connection Test</h1>
      
      <button
        onClick={runTests}
        disabled={isTesting}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-6"
      >
        {isTesting ? 'Running Tests...' : 'Run Connection Tests'}
      </button>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Test Results:</h2>
        {testResults.length === 0 ? (
          <p className="text-gray-500">Click "Run Connection Tests" to start debugging</p>
        ) : (
          <div className="space-y-2">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono bg-white p-2 rounded border">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
