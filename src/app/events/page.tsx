'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import { EventLite } from '@/lib/types';
import { EventsService } from '@/lib/events-service';

export default function EventsPage() {
  const [events, setEvents] = useState<EventLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const fetchedEvents = await EventsService.getEvents();
        setEvents(fetchedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <main className="space-y-6 py-6">
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-[#2D3436]">
              Events
            </h1>
            <Link
              href="/events/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors"
            >
              Create event
            </Link>
          </div>
        </section>
        
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A29BFE] mx-auto"></div>
          <p className="mt-4 text-[#2D3436] opacity-80">Loading events...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="space-y-6 py-6">
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-[#2D3436]">
              Events
            </h1>
            <Link
              href="/events/new"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors"
            >
              Create event
            </Link>
          </div>
        </section>
        
        <div className="text-center py-12 space-y-4">
          <div className="text-red-500">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-lg font-medium text-red-600 mb-2">Error loading events</p>
            <p className="text-red-500">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  return (
    <main className="space-y-6 py-6">
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-[#2D3436]">
            Events
          </h1>
          <Link
            href="/events/new"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors"
          >
            Create event
          </Link>
        </div>
      </section>

      <section>
        {sortedEvents.length > 0 ? (
          <div className="grid gap-4 sm:gap-6">
            {sortedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="text-[#2D3436] opacity-60">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium text-[#2D3436] mb-2">No events yet</p>
              <p className="text-[#2D3436] opacity-80">Be the first to create an event and bring people together!</p>
            </div>
            <Link
              href="/events/new"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors"
            >
              Create event
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
