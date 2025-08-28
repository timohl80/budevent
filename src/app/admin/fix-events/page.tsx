'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { EventsService } from '@/lib/events-service';
import { EventLite } from '@/lib/types';

export default function FixEventsPage() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<EventLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<'delete' | 'cancel' | 'none'>('none');

  useEffect(() => {
    async function loadEvents() {
      try {
        setLoading(true);
        const allEvents = await EventsService.getEvents(1000, 0);
        const eventsWithNullUserId = allEvents.filter(event => !event.userId);
        setEvents(eventsWithNullUserId);
      } catch (error) {
        console.error('Error loading events:', error);
        setMessage('Failed to load events');
      } finally {
        setLoading(false);
      }
    }

    if (status === 'authenticated') {
      loadEvents();
    }
  }, [status]);

  const fixEvent = async (eventId: string, action: 'delete' | 'cancel') => {
    try {
      setFixing(true);
      
      if (action === 'delete') {
        await EventsService.deleteEvent(eventId);
        setMessage(`Event ${eventId} deleted successfully`);
      } else if (action === 'cancel') {
        await EventsService.updateEvent(eventId, { status: 'cancelled' });
        setMessage(`Event ${eventId} marked as cancelled`);
      }
      
      // Reload events
      const allEvents = await EventsService.getEvents(1000, 0);
      const eventsWithNullUserId = allEvents.filter(event => !event.userId);
      setEvents(eventsWithNullUserId);
      
    } catch (error) {
      console.error('Error fixing event:', error);
      setMessage(`Failed to fix event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFixing(false);
    }
  };

  const selectAllEvents = () => {
    setSelectedEvents(new Set(events.map(event => event.id)));
  };

  const clearSelection = () => {
    setSelectedEvents(new Set());
  };

  const toggleEventSelection = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const performBulkAction = async () => {
    if (bulkAction === 'none' || selectedEvents.size === 0) {
      return;
    }

    setFixing(true);
    setMessage('Performing bulk action...');

    try {
      for (const eventId of selectedEvents) {
        if (bulkAction === 'delete') {
          await EventsService.deleteEvent(eventId);
        } else if (bulkAction === 'cancel') {
          await EventsService.updateEvent(eventId, { status: 'cancelled' });
        }
      }
      setMessage(`Bulk ${bulkAction} completed for ${selectedEvents.size} events.`);
      setSelectedEvents(new Set()); // Clear selection after bulk action
      const allEvents = await EventsService.getEvents(1000, 0);
      const eventsWithNullUserId = allEvents.filter(event => !event.userId);
      setEvents(eventsWithNullUserId);
    } catch (error) {
      console.error('Error performing bulk action:', error);
      setMessage(`Bulk ${bulkAction} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setFixing(false);
    }
  };

  // Check if user is admin
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || (session?.user as any)?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Fix Events with No Owner</h1>
          <p className="text-gray-600">
            This page shows events that have no user_id assigned, which prevents users from editing them.
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* Bulk Cleanup Section */}
        {events.length > 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Bulk Cleanup Tools</h3>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={selectAllEvents}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Clear Selection
                </button>
                <span className="text-sm text-yellow-700">
                  {selectedEvents.size} of {events.length} selected
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value as 'delete' | 'cancel' | 'none')}
                  className="px-3 py-1 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="none">Choose Action</option>
                  <option value="delete">Delete Selected</option>
                  <option value="cancel">Mark as Cancelled</option>
                </select>
                <button
                  onClick={performBulkAction}
                  disabled={selectedEvents.size === 0 || bulkAction === 'none' || fixing}
                  className="px-4 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fixing ? 'Processing...' : 'Execute'}
                </button>
              </div>
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              💡 Tip: Use this to quickly clean up test events. Events with no owner, test titles, or numeric titles are safe to delete.
            </p>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
            <p className="text-gray-500">No events with null userId found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Events with No Owner ({events.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 flex items-start space-x-3">
                      {/* Checkbox for bulk selection */}
                      <input
                        type="checkbox"
                        checked={selectedEvents.has(event.id)}
                        onChange={() => toggleEventSelection(event.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                          {/* Test event indicators */}
                          {!event.userId && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ⚠️ No Owner
                            </span>
                          )}
                          {event.title.toLowerCase().includes('test') && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              🧪 Test Event
                            </span>
                          )}
                          {/^\d+$/.test(event.title) && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              🔢 Numeric Title
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-500 space-y-1">
                          <p><strong>ID:</strong> {event.id}</p>
                          <p><strong>Description:</strong> {event.description || 'No description'}</p>
                          <p><strong>Location:</strong> {event.location || 'No location'}</p>
                          <p><strong>Starts:</strong> {new Date(event.startsAt).toLocaleString()}</p>
                          <p><strong>Status:</strong> {event.status}</p>
                          <p><strong>User ID:</strong> {event.userId || 'NULL (No Owner)'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex space-x-2">
                      <button
                        onClick={() => fixEvent(event.id, 'cancel')}
                        disabled={fixing}
                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50"
                      >
                        Mark Cancelled
                      </button>
                      <button
                        onClick={() => fixEvent(event.id, 'delete')}
                        disabled={fixing}
                        className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50"
                      >
                        Delete Event
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <a
            href="/admin"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Back to Admin
          </a>
        </div>
      </div>
    </div>
  );
}
