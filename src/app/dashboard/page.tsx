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
      const userCreatedEvents = allEvents.filter(event => {
        // Filter out events with no userId assigned
        if (!event.userId) {
          console.warn('Found event with no userId:', event);
          return false;
        }
        return event.userId === userId;
      });
      setUserEvents(userCreatedEvents);
      console.log('User created events:', userCreatedEvents.length);
      
      // Log RSVP counts for debugging
      userCreatedEvents.forEach(event => {
        console.log(`Event "${event.title}" - RSVPs: ${event.rsvpCount}, Comments: ${event.commentCount}`);
        console.log(`Event "${event.title}" - Image URL: ${event.imageUrl || 'NO IMAGE'}`);
        console.log(`Event "${event.title}" - Image URL type: ${typeof event.imageUrl}`);
        console.log(`Event "${event.title}" - Image URL length: ${event.imageUrl?.length || 0}`);
        if (event.imageUrl) {
          console.log(`Event "${event.title}" - Image URL starts with: ${event.imageUrl.substring(0, 20)}...`);
          console.log(`Event "${event.title}" - Image URL is valid URL: ${event.imageUrl.startsWith('http')}`);
        }
        console.log(`Event "${event.title}" - Full event data:`, event);
      });
      
      // Fetch user's RSVPs
      try {
        const userRSVPs = await EventsService.getUserRSVPs(userId);
        setUserRSVPs(userRSVPs);
        console.log('User RSVPs fetched:', userRSVPs.length);
      } catch (error) {
        console.error('Failed to fetch user RSVPs:', error);
        setUserRSVPs([]);
      }
      
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
      const user = session.user;
      const userId = (user as any).id || user.email;
      
      if (!userId) {
        console.error('Could not extract user ID for RSVP update');
        return;
      }
      
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
      const user = session.user;
      const userId = (user as any).id || user.email;
      
      if (!userId) {
        console.error('Could not extract user ID for RSVP cancel');
        return;
      }
      
      await EventsService.rsvpToEvent(eventId, userId, 'not_going');
      
      // Refresh the data
      await loadUserData();
    } catch (error) {
      console.error('Failed to cancel RSVP:', error);
    }
  }, [session?.user, loadUserData]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
              router.push('/auth');
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
          
          {/* Debug Links - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 flex justify-center space-x-4">
              <a
                href="/test-database"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
              >
                Test Database
              </a>
              <a
                href="/test-connection"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200"
              >
                Test Connection
              </a>
            </div>
          )}
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
          onTabChange={setActiveTab}
        />
      </div>
    </main>
  );
}
