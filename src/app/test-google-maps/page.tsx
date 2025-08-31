'use client';

import { useState } from 'react';

export default function TestGoogleMaps() {
  const [testAddress, setTestAddress] = useState('Stockholm');
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testGeocoding = async () => {
    if (!testAddress.trim()) {
      setTestResult('Please enter an address to test');
      return;
    }

    setIsLoading(true);
    setTestResult('Testing server-side geocoding...');

    try {
      // Test our server-side geocoding API
      const response = await fetch(`/api/geocode?address=${encodeURIComponent(testAddress)}`);
      const data = await response.json();

      if (data.success) {
        setTestResult(`✅ Server-side geocoding working! Found coordinates for "${testAddress}": ${data.coordinates.lat.toFixed(4)}, ${data.coordinates.lng.toFixed(4)}`);
      } else {
        setTestResult(`❌ Geocoding failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setTestResult(`❌ Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            🗺️ Server-Side Geocoding Test
          </h1>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="testAddress" className="block text-sm font-medium text-gray-700 mb-2">
                Test Address:
              </label>
              <input
                type="text"
                id="testAddress"
                value={testAddress}
                onChange={(e) => setTestAddress(e.target.value)}
                placeholder="Enter address to test (e.g., Stockholm, Vätö, Göteborg)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={testGeocoding}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Testing...' : 'Test Geocoding'}
            </button>

            {testResult && (
              <div className={`p-4 rounded-md ${
                testResult.includes('✅') 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                <p className="text-sm">{testResult}</p>
              </div>
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">📋 What This Test Does:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Tests your server-side geocoding API</li>
              <li>• Verifies Google Maps API key works from server</li>
              <li>• Shows coordinates for any Swedish location</li>
              <li>• No client-side API key restrictions needed</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-medium text-green-900 mb-2">✅ Benefits of Server-Side Approach:</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• <strong>More secure</strong> - API key stays on server</li>
              <li>• <strong>Referrer restrictions work</strong> - Can restrict to budevent.se</li>
              <li>• <strong>Better rate limiting</strong> - You control API usage</li>
              <li>• <strong>No client-side restrictions</strong> - Works in any browser</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-medium text-yellow-900 mb-2">⚠️ If Test Fails:</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Check <code>.env.local</code> has <code>GOOGLE_MAPS_API_KEY</code></li>
              <li>• Ensure Geocoding API is enabled in Google Cloud Console</li>
              <li>• Verify API key has no restrictions or only API restrictions</li>
              <li>• Restart your dev server after adding the key</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
