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

  // Redirect unauthenticated users to welcome page
  useEffect(() => {
    if (status === 'loading') return; // Still loading, wait
    
    if (status === 'unauthenticated') {
      router.push('/welcome');
      return;
    }
  }, [status, router]);

  // Fetch events effect
  useEffect(() => {
    async function fetchRecentEvents() {
      try {
        // Only fetch the 3 most recent events
        const allEvents = await EventsService.getEvents();
        const sortedEvents = allEvents
          .sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime())
          .slice(0, 3);
        
        setRecentEvents(sortedEvents);
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
  }, [status]);

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
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-[#F3F4F6] mb-2">
            Upcoming Events
          </h2>
          <p className="text-[#9CA3AF]">
            Check out what&apos;s happening soon
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
            <p className="text-[#9CA3AF]">No upcoming events yet.</p>
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
