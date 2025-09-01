import { EventLite, EventRSVP } from '@/lib/types';
import RSVPEventCard from './RSVPEventCard';
import MyEventCard from './MyEventCard';
import { useState } from 'react';

interface RSVPDashboardProps {
  activeTab: 'my-events' | 'my-rsvps';
  userEvents: EventLite[];
  userRSVPs: EventRSVP[];
  onRSVPUpdate: (eventId: string, status: 'going' | 'maybe' | 'not_going') => void;
  onRSVPCancel: (eventId: string) => void;
  onRefresh: () => void;
  onTabChange: (tab: 'my-events' | 'my-rsvps') => void;
}

export default function RSVPDashboard({
  activeTab,
  userEvents,
  userRSVPs,
  onRSVPUpdate,
  onRSVPCancel,
  onRefresh,
  onTabChange
}: RSVPDashboardProps) {
  const [rsvpFilter, setRsvpFilter] = useState<'all' | 'going' | 'maybe' | 'not_going'>('all');

  const renderRSVPsTab = () => {
    if (userRSVPs.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No RSVPs yet</h3>
          <p className="text-gray-500 mb-6">
            You haven't RSVP'd to any events yet. Browse events and join the fun!
          </p>
          <a
            href="/events"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#60A5FA] hover:bg-[#4B89E8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60A5FA]"
          >
            Browse Events
          </a>
        </div>
      );
    }

    // Group RSVPs by status
    const goingRSVPs = userRSVPs.filter(rsvp => rsvp.status === 'going');
    const maybeRSVPs = userRSVPs.filter(rsvp => rsvp.status === 'maybe');
    const notGoingRSVPs = userRSVPs.filter(rsvp => rsvp.status === 'not_going');

    // Filter RSVPs based on selected filter
    const getFilteredRSVPs = () => {
      switch (rsvpFilter) {
        case 'going':
          return goingRSVPs;
        case 'maybe':
          return maybeRSVPs;
        case 'not_going':
          return notGoingRSVPs;
        default:
          return userRSVPs; // 'all'
      }
    };

    const filteredRSVPs = getFilteredRSVPs();

    return (
      <div className="space-y-6">
        {/* RSVP Filter Tabs */}
        <div className="px-4 py-3">
          <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRsvpFilter('all')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  rsvpFilter === 'all'
                    ? 'bg-[#A29BFE] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                All ({userRSVPs.length})
              </button>
              <button
                onClick={() => setRsvpFilter('going')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  rsvpFilter === 'going'
                    ? 'bg-green-500 text-white shadow-sm'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                Going ({goingRSVPs.length})
              </button>
              <button
                onClick={() => setRsvpFilter('maybe')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  rsvpFilter === 'maybe'
                    ? 'bg-yellow-500 text-white shadow-sm'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                Maybe ({maybeRSVPs.length})
              </button>
              <button
                onClick={() => setRsvpFilter('not_going')}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  rsvpFilter === 'not_going'
                    ? 'bg-red-500 text-white shadow-sm'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                Not Going ({notGoingRSVPs.length})
              </button>
            </div>
          </div>
        </div>

        {/* Filtered RSVP Content */}
        {filteredRSVPs.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-18 0 7 7 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">
              {rsvpFilter === 'all' 
                ? 'No RSVPs found. Try browsing events to get started!'
                : `No events with "${rsvpFilter === 'going' ? 'Going' : rsvpFilter === 'maybe' ? 'Maybe' : 'Not Going'}" status.`
              }
            </p>
          </div>
        ) : (
          <>
            {/* Active Filter Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {rsvpFilter === 'all' && 'All Your RSVPs'}
                {rsvpFilter === 'going' && (
                  <span className="flex items-center justify-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    Events You're Going To ({filteredRSVPs.length})
                  </span>
                )}
                {rsvpFilter === 'maybe' && (
                  <span className="flex items-center justify-center">
                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
                    Events You Might Attend ({filteredRSVPs.length})
                  </span>
                )}
                {rsvpFilter === 'not_going' && (
                  <span className="flex items-center justify-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
                    Events You're Not Attending ({filteredRSVPs.length})
                  </span>
                )}
              </h2>
            </div>
            
            <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {filteredRSVPs.map((rsvp) => {
                // If we have event data, use it; otherwise create a minimal event object
                const eventData = rsvp.event || {
                  id: rsvp.eventId,
                  title: 'Event Details Loading...',
                  startsAt: new Date().toISOString(),
                  location: '',
                  description: '',
                  isPublic: true,
                  status: 'active' as const,
                  userId: '',
                  rsvpCount: 0,
                  commentCount: 0,
                  externalLink: undefined
                };
                
                return (
                  <RSVPEventCard
                    key={rsvp.id}
                    event={eventData}
                    rsvp={rsvp}
                    onUpdate={onRSVPUpdate}
                    onCancel={onRSVPCancel}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderMyEventsTab = () => {
    if (userEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No events created yet</h3>
          <p className="text-gray-500 mb-6">
            Create your first event and start building your community!
          </p>
          <a
            href="/events/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#60A5FA] hover:bg-[#4B89E8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60A5FA]"
          >
            Create Event
          </a>
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {userEvents.map((event) => (
          <MyEventCard
            key={event.id}
            event={event}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Events</h2>
                  <button
            onClick={() => onTabChange('my-rsvps')}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#7C3AED] hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-colors`}
          >
            My RSVPs ({userRSVPs.length})
          </button>
      </div>
      {activeTab === 'my-rsvps' ? renderRSVPsTab() : renderMyEventsTab()}
    </div>
  );
}
