'use client';

import Link from "next/link";
import { useState, useEffect } from 'react';
import EventCard from '@/components/EventCard';
import { EventLite } from '@/lib/types';
import { EventsService } from '@/lib/events-service';


export default function Home() {
  const [recentEvents, setRecentEvents] = useState<EventLite[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchRecentEvents();
  }, []);



  return (
    <main className="space-y-8 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#2D3436]">
          Welcome to BudEvent 👋
        </h1>
        <p className="text-lg text-[#2D3436] max-w-2xl mx-auto opacity-80">
          Discover and join amazing events in your area. From concerts and workshops to meetups and conferences, find your next adventure with BudEvent.
        </p>
      </div>
      


      {/* Recent Events Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-[#2D3436] mb-2">
            Upcoming Events
          </h2>
          <p className="text-[#2D3436] opacity-70">
            Check out what&apos;s happening soon
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A29BFE] mx-auto"></div>
            <p className="mt-2 text-[#2D3436] opacity-70">Loading events...</p>
          </div>
        ) : recentEvents.length > 0 ? (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {recentEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[#2D3436] opacity-70">No upcoming events yet.</p>
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link
            href="/events"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#A29BFE] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors"
          >
            View all events
          </Link>
        </div>
      </section>
    </main>
  );
}
