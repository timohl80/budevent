'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import { EventLite } from '@/lib/types';
import { EventsService } from '@/lib/events-service';


export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [recentEvents, setRecentEvents] = useState<EventLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'newly-added'>('upcoming');

  // Handle tab change with loading state
  const handleTabChange = (newTab: 'upcoming' | 'newly-added') => {
    setActiveTab(newTab);
    setLoading(true); // Show loading when switching tabs
  };

  // Redirect unauthenticated users to welcome page
  useEffect(() => {
    if (status === 'loading') return; // Still loading, wait
    
    if (status === 'unauthenticated') {
              router.push('/auth');
      return;
    }
  }, [status, router]);

  // Fetch events effect
  useEffect(() => {
    async function fetchRecentEvents() {
      try {
        // Fetch all events
        const allEvents = await EventsService.getEvents();
        
        let eventsToShow: EventLite[] = [];
        
        if (activeTab === 'upcoming') {
          // Filter for upcoming events (events that haven't started yet)
          const now = new Date();
          const upcomingEvents = allEvents.filter(event => {
            const eventDate = new Date(event.startsAt);
            return eventDate > now;
          });
          
          // Sort by start date (earliest first) and take the first 3
          eventsToShow = upcomingEvents
            .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
            .slice(0, 3);
          
          console.log('All events fetched:', allEvents.length);
          console.log('Upcoming events:', upcomingEvents.length);
          console.log('Events to display:', eventsToShow.map(e => ({ title: e.title, startsAt: e.startsAt })));
        } else {
          // Show newly added events (most recently added to the list)
          // Since we don't have createdAt in EventLite, we'll use the order they appear in the database
          // This will show the most recently fetched events
          eventsToShow = allEvents.slice(0, 3);
          
          console.log('All events fetched:', allEvents.length);
          console.log('Newly added events:', eventsToShow.length);
          console.log('Events to display:', eventsToShow.map(e => ({ title: e.title, startsAt: e.startsAt })));
        }
        
        setRecentEvents(eventsToShow);
      } catch (error) {
        console.error('Error fetching recent events:', error);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch events if user is authenticated
    if (status === 'authenticated') {
      fetchRecentEvents();
    }
  }, [status, activeTab]);

  // Don't render anything while checking auth or redirecting
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#111827] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }



  return (
    <main className="space-y-12 py-12 bg-[#111827] min-h-screen">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-[#F3F4F6]">
          Welcome to BudEvent 👋
        </h1>
        <p className="text-lg text-[#9CA3AF] max-w-3xl mx-auto">
          Stay connected with your crew. Create, share, and join events with friends – so you never miss a chance to hang out.
        </p>
      </div>
      


      {/* Recent Events Section */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        {/* Event Type Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-[#1F2937] rounded-lg p-1 shadow-sm border border-[#374151]">
            <button
              onClick={() => handleTabChange('upcoming')}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'upcoming'
                  ? 'bg-[#3B82F6] text-white shadow-sm transform scale-105'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#374151] hover:scale-102'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => handleTabChange('newly-added')}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'newly-added'
                  ? 'bg-[#3B82F6] text-white shadow-sm transform scale-105'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-[#374151] hover:scale-102'
              }`}
            >
              Newly Added
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#F3F4F6] mb-2">
            {activeTab === 'upcoming' ? 'Upcoming Events' : 'Newly Added Events'}
          </h2>
          <p className="text-[#9CA3AF]">
            {activeTab === 'upcoming' 
              ? 'Check out what\'s happening soon'
              : 'Discover the latest events added to BudEvent'
            }
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto"></div>
            <p className="mt-2 text-[#9CA3AF]">Loading events...</p>
          </div>
        ) : recentEvents.length > 0 ? (
          <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {recentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#9CA3AF]">
              {activeTab === 'upcoming' 
                ? 'No upcoming events yet. Check back later for new events!'
                : 'No events have been added yet. Be the first to create an event!'
              }
            </p>
          </div>
        )}
        
        {/* View All Events Button */}
        {recentEvents.length > 0 && (
          <div className="text-center mt-8">
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#3B82F6] to-[#DB2777] rounded-lg hover:from-[#DB2777] hover:to-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] transition-colors"
            >
              View All Events
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
