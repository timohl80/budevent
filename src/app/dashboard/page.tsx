'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { EventLite, EventRSVP } from '@/lib/types';
import { EventsService } from '@/lib/events-service';
import RSVPDashboard from '@/components/RSVPDashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userEvents, setUserEvents] = useState<EventLite[]>([]);
  const [userRSVPs, setUserRSVPs] = useState<EventRSVP[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-events' | 'my-rsvps'>('my-rsvps');
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const userId = (session?.user as { id: string })?.id;
      console.log('Loading user data for user:', userId);
      
      // Fetch events with pagination to prevent timeouts
      const allEvents = await EventsService.getEvents(100, 0); // Limit to 100 events
      console.log('Fetched events:', allEvents.length);
      
      // Filter events created by the user
      const userCreatedEvents = allEvents.filter(event => event.userId === userId);
      setUserEvents(userCreatedEvents);
      console.log('User created events:', userCreatedEvents.length);
      
      // For now, set empty RSVPs to prevent errors
      // We'll implement proper RSVP fetching later
      setUserRSVPs([]);
      console.log('User RSVPs set to empty for now');
      
    } catch (error) {
      console.error('Failed to load user data:', error);
      setError(`Failed to load your events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [status, session?.user]);

  useEffect(() => {
    if (session?.user) {
      loadUserData();
    }
  }, [session?.user, loadUserData]);

  const handleRSVPUpdate = useCallback(async (eventId: string, newStatus: 'going' | 'maybe' | 'not_going') => {
    if (!session?.user) return;
    
    try {
      const userId = (session.user as { id: string }).id;
      await EventsService.rsvpToEvent(eventId, userId, newStatus);
      
      // Refresh the data
      await loadUserData();
    } catch (error) {
      console.error('Failed to update RSVP:', error);
    }
  }, [session?.user, loadUserData]);

  const handleRSVPCancel = useCallback(async (eventId: string) => {
    if (!session?.user) return;
    
    try {
      const userId = (session.user as { id: string }).id;
      await EventsService.rsvpToEvent(eventId, userId, 'not_going');
      
      // Refresh the data
      loadUserData();
    } catch (error) {
      console.error('Failed to cancel RSVP:', error);
    }
  }, [session?.user, loadUserData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/welcome');
    }
  }, [status, router]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60A5FA]"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60A5FA]"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#60A5FA]"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#2D3436] mb-4">
            My Dashboard
          </h1>
          <p className="text-lg text-[#2D3436] opacity-80 max-w-2xl mx-auto">
            Manage your events and RSVPs in one place
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('my-rsvps')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'my-rsvps'
                  ? 'bg-[#A29BFE] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              My RSVPs ({userRSVPs.length})
            </button>
            <button
              onClick={() => setActiveTab('my-events')}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === 'my-events'
                  ? 'bg-[#A29BFE] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              My Events ({userEvents.length})
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        <RSVPDashboard
          activeTab={activeTab}
          userEvents={userEvents}
          userRSVPs={userRSVPs}
          onRSVPUpdate={handleRSVPUpdate}
          onRSVPCancel={handleRSVPCancel}
          onRefresh={loadUserData}
        />
      </div>
    </main>
  );
}
