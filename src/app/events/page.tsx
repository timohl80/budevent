'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EventCard from '@/components/EventCard';
import SearchAndFilter, { SearchFilters } from '@/components/SearchAndFilter';
import { EventLite } from '@/lib/types';
import { EventsService } from '@/lib/events-service';

export default function EventsPage() {
  const [events, setEvents] = useState<EventLite[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const allEvents = await EventsService.getEvents();
        setEvents(allEvents);
        setFilteredEvents(allEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const handleFiltersChange = async (filters: SearchFilters) => {
    // Prevent unnecessary API calls if no meaningful filters are applied
    const hasActiveFilters = filters.searchQuery || filters.category || filters.dateRange || filters.location || filters.sortBy !== 'date';
    
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
    <main className="space-y-8 py-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#2D3436]">
          All Events
        </h1>
        <p className="text-lg text-[#2D3436] max-w-2xl mx-auto opacity-80">
          Discover and join amazing events. Use the search and filters below to find exactly what you&apos;re looking for.
        </p>
      </div>
      
      {/* Create Event Button */}
      <div className="text-center">
        <Link
          href="/events/new"
          className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Event
        </Link>
      </div>
      
      {/* Search and Filter Section */}
      <section className="max-w-6xl mx-auto px-4">
        <SearchAndFilter onFiltersChange={handleFiltersChange} />
        
        {/* Events Display */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A29BFE] mx-auto"></div>
            <p className="mt-2 text-[#2D3436] opacity-70">Loading events...</p>
          </div>
        ) : searchLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A29BFE] mx-auto"></div>
            <p className="mt-2 text-[#2D3436] opacity-70">Searching events...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          <>
            <div className="mb-6 text-center">
              <p className="text-lg text-[#2D3436] opacity-70">
                Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-[#2D3436] mb-2">No events found</h3>
            <p className="text-[#2D3436] opacity-70 mb-4">
              No events match your current search criteria.
            </p>
            <p className="text-[#2D3436] opacity-50 text-sm">
              Try adjusting your search terms or filters to find more events.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
