'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import SearchAndFilter, { SearchFilters } from '@/components/SearchAndFilter';
import { EventLite } from '@/lib/types';
import { EventsService } from '@/lib/events-service';

export default function EventsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<EventLite[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

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
    async function fetchEvents() {
      try {
        setLoading(true);
        console.log('Fetching events from database...');
        const allEvents = await EventsService.getEvents();
        console.log(`Successfully fetched ${allEvents.length} events`);
        setEvents(allEvents);
        setFilteredEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Set empty arrays on error to show proper error state
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch events if user is authenticated
    if (status === 'authenticated') {
      fetchEvents();
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

  const handleFiltersChange = async (filters: SearchFilters) => {
    // Prevent unnecessary API calls if no meaningful filters are applied
    const hasActiveFilters = filters.searchQuery || filters.sortBy !== 'date';
    
    if (!hasActiveFilters) {
      // No filters, show all events immediately
      setFilteredEvents(events);
      return;
    }
    
    setSearchLoading(true);
    try {
      const filtered = await EventsService.getEventsWithFilters(filters);
      setFilteredEvents(filtered);
    } catch (error) {
      console.error('Error applying filters:', error);
      // On error, fall back to showing all events
      setFilteredEvents(events);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <main className="space-y-12 py-12 bg-[#111827] min-h-screen">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-[#F3F4F6]">
          All Events
        </h1>
        <p className="text-lg text-[#9CA3AF] max-w-3xl mx-auto">
          Discover and join amazing events. Use the search and filters below to find exactly what you&apos;re looking for.
        </p>
      </div>
      
      {/* Create Event Button */}
      <div className="text-center">
        <Link
          href="/events/new"
          className="inline-flex items-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-[#3B82F6] to-[#DB2777] rounded-lg hover:from-[#DB2777] hover:to-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] transition-colors shadow-lg"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Event
        </Link>
      </div>
      
      {/* Search and Filter Section */}
      <section className="w-full px-2 sm:px-4 lg:px-6">
        <SearchAndFilter onFiltersChange={handleFiltersChange} />
        
        {/* Events Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto"></div>
            <p className="mt-2 text-[#9CA3AF]">Loading events...</p>
          </div>
        ) : searchLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto"></div>
            <p className="mt-2 text-[#9CA3AF]">Searching events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className="mb-8 text-center">
              <p className="text-lg text-[#9CA3AF]">
                Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-xl font-semibold text-[#F3F4F6] mb-3">No events found</h3>
            <p className="text-[#9CA3AF] mb-6">
              {events.length === 0 
                ? "There are no events in the database yet. Be the first to create an event!"
                : "No events match your current search criteria."
              }
            </p>
            <p className="text-[#6B7280] text-sm">
              {events.length === 0 
                ? "Create your first event to get started!"
                : "Try adjusting your search terms or filters to find more events."
              }
            </p>
            {events.length === 0 && (
              <div className="mt-8">
                <Link
                  href="/events/new"
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#3B82F6] to-[#DB2777] rounded-lg hover:from-[#DB2777] hover:to-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3B82F6] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Your First Event
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
