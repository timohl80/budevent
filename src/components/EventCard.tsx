import { EventLite } from '@/lib/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EventsService } from '@/lib/events-service';

interface EventCardProps {
  event: EventLite;
}

export default function EventCard({ event }: EventCardProps) {
  const { data: session } = useSession();
  const isOwner = (session?.user as any)?.id === event.userId;
  

  
  // Use base64 directly for better compatibility
  const [imageSrc, setImageSrc] = useState<string>('');
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'maybe' | 'not_going' | null>(null);
  const [isRsvping, setIsRsvping] = useState(false);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false);
  const [showRsvpList, setShowRsvpList] = useState(false);
  
  useEffect(() => {
    // Use the base64 directly instead of converting to blob URL
    setImageSrc(event.imageUrl || '');
  }, [event.imageUrl]);
  
  // Check if user has already RSVP'd and load RSVPs
  useEffect(() => {
    if (session?.user) {
      // Check if the current user has already RSVP'd to this event
      checkUserRSVPStatus();
    }
    
    // Load RSVPs for this event
    loadEventRSVPs();
  }, [session?.user, event.id]);
  

  
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const checkUserRSVPStatus = async () => {
    if (!session?.user) return;
    
    try {
      const userRsvp = await EventsService.getUserRSVPStatus(event.id, (session.user as any).id);
      if (userRsvp) {
        setRsvpStatus(userRsvp.status);
      } else {
        setRsvpStatus(null);
      }
    } catch (error) {
      console.error('Failed to check user RSVP status:', error);
      setRsvpStatus(null);
    }
  };

  const loadEventRSVPs = async () => {
    try {
      setIsLoadingRsvps(true);
      const eventRsvps = await EventsService.getEventRSVPs(event.id);
      setRsvps(eventRsvps);
    } catch (error) {
      console.error('Failed to load RSVPs:', error);
    } finally {
      setIsLoadingRsvps(false);
    }
  };

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!session?.user) return;
    
    setIsRsvping(true);
    try {
      await EventsService.rsvpToEvent(event.id, (session.user as any).id, status);
      setRsvpStatus(status);
      
      // Send confirmation email if user is going or maybe
      if (status === 'going' || status === 'maybe') {
        try {
          const eventDate = new Date(event.startsAt);
          const emailData = {
            eventName: event.title,
            eventDate: eventDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            eventTime: eventDate.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }),
            eventLocation: event.location || undefined,
            eventDescription: event.description || undefined,
            userName: (session.user as any).name || (session.user as any).email || 'User',
            userEmail: (session.user as any).email || '',
            eventId: event.id
          };
          
          // Send email via API route
          const response = await fetch('/api/send-rsvp-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
          });
          
          if (response.ok) {
            console.log('Confirmation email sent successfully');
          } else {
            console.error('Failed to send confirmation email');
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the RSVP if email fails
        }
      }
      
      // Reload RSVPs to show the updated list
      await loadEventRSVPs();
    } catch (error) {
      console.error('Failed to RSVP:', error);
      // You could show a toast notification here
    } finally {
      setIsRsvping(false);
    }
  };

  const getRSVPButtonText = () => {
    if (isRsvping) return 'Signing up...';
    if (rsvpStatus === 'going') return 'Signed Up ✓';
    if (rsvpStatus === 'maybe') return 'Maybe ✓';
    if (rsvpStatus === 'not_going') return 'Not Going';
    return 'Sign up';
  };

  const getRSVPButtonIcon = () => {
    if (isRsvping) return (
      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
    if (rsvpStatus === 'going') return (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
    if (rsvpStatus === 'maybe') return (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    if (rsvpStatus === 'not_going') return (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    );
    return (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    );
  };

  const getRSVPButtonColor = () => {
    if (rsvpStatus === 'going') return 'bg-green-600 hover:bg-green-700';
    if (rsvpStatus === 'maybe') return 'bg-yellow-600 hover:bg-yellow-700';
    if (rsvpStatus === 'not_going') return 'bg-gray-600 hover:bg-gray-700';
    return 'bg-[#55EFC4] hover:bg-[#4DD4B0]';
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow min-h-[450px] flex flex-col">
      {/* Event Image */}
      <div className="mb-4 -mx-4 -mt-4">
        {event.imageUrl ? (
          <div className="relative">

            {imageSrc ? (
              <img 
                src={imageSrc} 
                alt={`${event.title} event image`}
                className="w-full h-48 object-cover rounded-t-lg transition-opacity duration-300"
                onError={(e) => {
                  // Hide image if it fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : null}
            {/* Image overlay with event title on hover - TEMPORARILY DISABLED FOR TESTING */}
            {/* <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-t-lg flex items-end pointer-events-none z-10">
              <div className="p-4 w-full pointer-events-auto">
                <h4 className="text-white font-semibold text-lg opacity-0 hover:opacity-100 transition-opacity duration-300 drop-shadow-lg">
                  {event.title}
                </h4>
              </div>
            </div> */}
          </div>
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-[#A29BFE] to-[#55EFC4] rounded-t-lg flex items-center justify-center">
            <div className="text-center text-white">
              <svg className="w-16 h-16 mx-auto mb-2 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium opacity-80">No Image</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-3 flex-grow">
        {/* Event Header with Status */}
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {event.title}
          </h3>
          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <time dateTime={event.startsAt}>
            {formatDateTime(event.startsAt)}
          </time>
        </div>
        
        {event.location && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.location}</span>
          </div>
        )}
        
        {event.description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {truncateDescription(event.description)}
          </p>
        )}

        {/* Event Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
          {event.capacity && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{event.rsvpCount || 0} / {event.capacity}</span>
            </div>
          )}
          
          {event.commentCount !== undefined && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{event.commentCount}</span>
            </div>
          )}
        </div>

        {/* RSVP Section */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {rsvps.length} {rsvps.length === 1 ? 'person' : 'people'} signed up
              </span>
            </div>
            
            {rsvps.length > 0 && (
              <button
                onClick={() => setShowRsvpList(!showRsvpList)}
                className="text-sm font-medium text-[#A29BFE] hover:text-[#8B7AE6] transition-colors px-2 py-1 rounded-md hover:bg-[#A29BFE] hover:bg-opacity-10"
              >
                {showRsvpList ? 'Hide' : 'Show'} list
              </button>
            )}
          </div>
          
          {/* RSVP List */}
          {showRsvpList && rsvps.length > 0 && (
            <div className="mt-3 space-y-2">
              {isLoadingRsvps ? (
                <div className="text-sm text-gray-500 text-center py-2">Loading RSVPs...</div>
              ) : (
                rsvps.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                      <span className="font-medium text-gray-900 truncate">
                        {rsvp.users?.name || rsvp.users?.email || 'Unknown User'}
                      </span>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      rsvp.status === 'going' ? 'bg-green-100 text-green-800 border border-green-200' :
                      rsvp.status === 'maybe' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}>
                      {rsvp.status === 'going' ? 'Going' : 
                       rsvp.status === 'maybe' ? 'Maybe' : 'Not Going'}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
          
          {rsvps.length === 0 && !isLoadingRsvps && (
            <div className="mt-2 text-sm text-gray-500 text-center py-3 bg-gray-50 rounded-lg border border-gray-100">
              <svg className="w-4 h-4 mx-auto mb-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              No one has signed up yet
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-gray-100 space-y-3">
          {/* RSVP Button - Full Width */}
          <button 
            onClick={() => handleRSVP('going')}
            disabled={isRsvping}
            className={`w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getRSVPButtonColor()}`}
          >
            {getRSVPButtonIcon()}
            {getRSVPButtonText()}
          </button>
          
          {/* Edit button for event owner - Full Width */}
          {isOwner && (
            <Link
              href={`/events/${event.id}/edit`}
              className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-[#6B46C1] bg-[#A29BFE] bg-opacity-15 border border-[#A29BFE] border-opacity-30 rounded-lg hover:bg-opacity-25 hover:border-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-all"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Event
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
