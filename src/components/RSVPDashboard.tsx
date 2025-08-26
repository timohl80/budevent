import { EventLite, EventRSVP } from '@/lib/types';
import RSVPEventCard from './RSVPEventCard';
import MyEventCard from './MyEventCard';

interface RSVPDashboardProps {
  activeTab: 'my-events' | 'my-rsvps';
  userEvents: EventLite[];
  userRSVPs: EventRSVP[];
  onRSVPUpdate: (eventId: string, status: 'going' | 'maybe' | 'not_going') => void;
  onRSVPCancel: (eventId: string) => void;
  onRefresh: () => void;
}

export default function RSVPDashboard({
  activeTab,
  userEvents,
  userRSVPs,
  onRSVPUpdate,
  onRSVPCancel,
  onRefresh
}: RSVPDashboardProps) {
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#A29BFE] hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE]"
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

    return (
      <div className="space-y-8">
        {/* Going */}
        {goingRSVPs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
              Going ({goingRSVPs.length})
            </h2>
            <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {goingRSVPs.map((rsvp) => (
                <RSVPEventCard
                  key={rsvp.id}
                  rsvp={rsvp}
                  onRSVPUpdate={onRSVPUpdate}
                  onRSVPCancel={onRSVPCancel}
                />
              ))}
            </div>
          </div>
        )}

        {/* Maybe */}
        {maybeRSVPs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></span>
              Maybe ({maybeRSVPs.length})
            </h2>
            <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {maybeRSVPs.map((rsvp) => (
                <RSVPEventCard
                  key={rsvp.id}
                  rsvp={rsvp}
                  onRSVPUpdate={onRSVPUpdate}
                  onRSVPCancel={onRSVPCancel}
                />
              ))}
            </div>
          </div>
        )}

        {/* Not Going */}
        {notGoingRSVPs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <span className="w-3 h-3 bg-red-500 rounded-full mr-3"></span>
              Not Going ({notGoingRSVPs.length})
            </h2>
            <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {notGoingRSVPs.map((rsvp) => (
                <RSVPEventCard
                  key={rsvp.id}
                  rsvp={rsvp}
                  onRSVPUpdate={onRSVPUpdate}
                  onRSVPCancel={onRSVPCancel}
                />
              ))}
            </div>
          </div>
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
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#A29BFE] hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE]"
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
      {activeTab === 'my-rsvps' ? renderRSVPsTab() : renderMyEventsTab()}
    </div>
  );
}
