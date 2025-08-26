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

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = (session?.user as { id: string })?.id;
      
      // Load events created by the user (with pagination to prevent timeouts)
      const events = await EventsService.getEvents(50, 0); // Limit to 50 events
      const userCreatedEvents = events.filter(event => event.userId === userId);
      setUserEvents(userCreatedEvents);
      
      // Load user's RSVPs to other events (with pagination)
      const allEvents = await EventsService.getEvents(50, 0); // Limit to 50 events
      const userRSVPData: EventRSVP[] = [];
      
      for (const event of allEvents) {
        if (event.userId !== userId) { // Only events not created by user
          try {
            const rsvp = await EventsService.getUserRSVPStatus(event.id, userId);
            if (rsvp) {
              userRSVPData.push({
                id: rsvp.id,
                eventId: rsvp.event_id,
                userId: rsvp.user_id,
                status: rsvp.status as 'going' | 'maybe' | 'not_going',
                createdAt: rsvp.created_at,
                event: event
              } as EventRSVP);
            }
          } catch (error) {
            console.error(`Failed to get RSVP status for event ${event.id}:`, error);
            }
          }
        }
      
      setUserRSVPs(userRSVPData);
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A29BFE]"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A29BFE]"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A29BFE]"></div>
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
