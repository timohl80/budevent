'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { EventLite } from '@/lib/types';
import { EventsService } from '@/lib/events-service';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'maybe' | 'not_going' | null>(null);
  const [isRsvping, setIsRsvping] = useState(false);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [isLoadingRsvps, setIsLoadingRsvps] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      // For now, we'll get all events and find the specific one
      // Later you can create a getEventById method
      const allEvents = await EventsService.getEvents(100, 0);
      const foundEvent = allEvents.find(e => e.id === eventId);
      
      if (foundEvent) {
        setEvent(foundEvent);
        if (session?.user) {
          checkUserRSVPStatus(foundEvent.id);
        }
        loadEventRSVPs(foundEvent.id);
      } else {
        router.push('/events');
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const checkUserRSVPStatus = async (eventId: string) => {
    if (!session?.user) return;
    
    try {
      const userRsvp = await EventsService.getUserRSVPStatus(eventId, (session.user as any).id);
      if (userRsvp) {
        setRsvpStatus(userRsvp.status as 'going' | 'maybe' | 'not_going');
      } else {
        setRsvpStatus(null);
      }
    } catch (error) {
      console.error('Failed to check user RSVP status:', error);
      setRsvpStatus(null);
    }
  };

  const loadEventRSVPs = async (eventId: string) => {
    try {
      setIsLoadingRsvps(true);
      const eventRsvps = await EventsService.getEventRSVPs(eventId);
      setRsvps(eventRsvps);
    } catch (error) {
      console.error('Failed to load RSVPs:', error);
    } finally {
      setIsLoadingRsvps(false);
    }
  };

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!session?.user || !event) return;
    
    setIsRsvping(true);
    try {
      await EventsService.rsvpToEvent(event.id, (session.user as any).id, status);
      setRsvpStatus(status);
      
      // Send confirmation email if user is going or maybe
      if (status === 'going' || status === 'maybe') {
        try {
          const eventDate = new Date(event.startsAt);
          // Calculate end time (default to 2 hours after start if not specified)
          const endTime = event.endsAt ? new Date(event.endsAt) : new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
          
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
            eventId: event.id,
            eventStartISO: event.startsAt,
            eventEndISO: endTime.toISOString(),
            organizerName: event.organizerName || 'Event Organizer',
            organizerEmail: event.organizerEmail || 'noreply@budevent.com'
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
            // Show success message to user
            alert('✅ RSVP confirmed! Check your email for calendar details.');
          } else {
            console.error('Failed to send confirmation email');
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the RSVP if email fails
        }
      }
      
      await loadEventRSVPs(event.id);
    } catch (error) {
      console.error('Failed to RSVP:', error);
    } finally {
      setIsRsvping(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  const getRSVPButtonColor = (status: string) => {
    switch (status) {
      case 'going':
        return 'bg-[#60A5FA] hover:bg-[#4B89E8] focus:ring-[#60A5FA]';
      case 'maybe':
        return 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500';
      case 'not_going':
        return 'bg-red-500 hover:bg-red-600 focus:ring-red-500';
      default:
        return 'bg-[#60A5FA] hover:bg-[#4B89E8] focus:ring-[#60A5FA]';
    }
  };

  const getRSVPButtonText = () => {
    if (rsvpStatus === 'going') return '✅ Going';
    if (rsvpStatus === 'maybe') return '🤔 Maybe';
    return 'RSVP to Event';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A29BFE] mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h1>
          <p className="text-gray-600 mb-6">The event you're looking for doesn't exist.</p>
          <Link
            href="/events"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-colors"
          >
            Browse All Events
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = (session?.user as any)?.id === event.userId;

  return (
    <main className="min-h-screen bg-[#F3F4F6] py-8" style={{
      background: 'linear-gradient(135deg, #F8F7FF 0%, #FEF3C7 50%, #F8F7FF 100%)'
    }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/events"
            className="inline-flex items-center text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-[#7C3AED]/30 overflow-hidden mb-6">
          {/* Event Image */}
          <div className="relative w-full h-64 md:h-80 bg-gray-100 rounded-lg overflow-hidden mb-6">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
                <span className="text-white text-xl font-bold tracking-wide opacity-90 text-center px-4 leading-tight">
                  {event.title}
                </span>
              </div>
            )}
            
            {/* Event Status Badge */}
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                event.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : event.status === 'cancelled' 
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {event.status === 'active' ? 'Active' : event.status === 'cancelled' ? 'Cancelled' : 'Completed'}
              </span>
            </div>
          </div>

          {/* Event Content */}
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDateTime(event.startsAt)}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Share Button */}
              <div className="ml-4">
                <ShareButton event={event} />
              </div>
            </div>

            {/* Event Description */}
            {event.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">About This Event</h2>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* External Link */}
            {event.externalLink && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">External Event Page</h2>
                <a
                  href={event.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg hover:bg-[#F59E0B]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F59E0B] transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Visit External Event Page
                </a>
                <p className="text-sm text-gray-500 mt-2">This will open in a new tab</p>
              </div>
            )}

            {/* Event Stats */}
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {rsvps.length} {rsvps.length === 1 ? 'person' : 'people'} signed up
              </div>
              
              {event.capacity && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {rsvps.length}/{event.capacity} spots
                </div>
              )}
            </div>

            {/* RSVP Section */}
            <div className="border-t border-[#7C3AED]/20 pt-6">
              {session ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">RSVP to Event</h3>
                  
                  {/* RSVP Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleRSVP('going')}
                      disabled={isRsvping}
                      className={`px-4 py-3 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                        rsvpStatus === 'going'
                          ? 'bg-[#7C3AED] text-white focus:ring-[#7C3AED] shadow-lg'
                          : 'bg-[#7C3AED]/10 text-[#7C3AED] hover:bg-[#7C3AED]/20 focus:ring-[#7C3AED] border border-[#7C3AED]/30'
                      }`}
                    >
                      ✅ Going
                    </button>
                    
                    <button
                      onClick={() => handleRSVP('maybe')}
                      disabled={isRsvping}
                      className={`px-4 py-3 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                        rsvpStatus === 'maybe'
                          ? 'bg-[#F59E0B] text-white focus:ring-[#F59E0B] shadow-lg'
                          : 'bg-[#F59E0B]/10 text-[#F59E0B] hover:bg-[#F59E0B]/20 focus:ring-[#F59E0B] border border-[#F59E0B]/30'
                      }`}
                    >
                      🤔 Maybe
                    </button>
                    
                    <button
                      onClick={() => handleRSVP('not_going')}
                      disabled={isRsvping}
                      className={`px-4 py-3 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                        rsvpStatus === 'not_going'
                          ? 'bg-red-600 text-white focus:ring-red-500 shadow-lg'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-500 border border-red-300'
                      }`}
                    >
                      ❌ Not Going
                    </button>
                  </div>

                  {/* Current RSVP Status */}
                  {rsvpStatus && (
                    <div className="text-sm text-gray-600">
                      Your current RSVP: <span className="font-medium capitalize">{rsvpStatus}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Sign in to RSVP to this event</p>
                  <Link
                    href="/welcome"
                    className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>

            {/* Edit Button for Event Owner */}
            {isOwner && (
              <div className="border-t border-[#7C3AED]/20 pt-6">
                <Link
                  href={`/events/${event.id}/edit`}
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-[#6D28D9] bg-[#7C3AED] bg-opacity-15 border border-[#7C3AED] border-opacity-30 rounded-lg hover:bg-opacity-25 hover:border-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Event
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* RSVP List */}
        {rsvps.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-xl border border-[#7C3AED]/30 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Who's Going</h2>
            <div className="space-y-3">
              {isLoadingRsvps ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7C3AED] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading RSVPs...</p>
                </div>
              ) : (
                rsvps.map((rsvp) => (
                  <div key={rsvp.id} className="flex items-center justify-between p-3 bg-[#7C3AED]/5 rounded-lg border border-[#7C3AED]/20">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#7C3AED] rounded-full flex items-center justify-center text-white font-medium text-sm">
                        {(rsvp.users?.name || rsvp.users?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {rsvp.users?.name || rsvp.users?.email || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">
                          RSVP'd {new Date(rsvp.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      rsvp.status === 'going' ? 'bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30' :
                      rsvp.status === 'maybe' ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {rsvp.status === 'going' ? 'Going' : 
                       rsvp.status === 'maybe' ? 'Maybe' : 'Not Going'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
