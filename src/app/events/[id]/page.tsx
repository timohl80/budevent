'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { EventLite } from '@/lib/types';
import { EventsService } from '@/lib/events-service';
import ShareButton from '@/components/ShareButton';
import Link from 'next/link';
import { SMHIWeatherService, WeatherData } from '@/lib/weather-service';

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
  const [error, setError] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  // Refetch weather data when event changes
  useEffect(() => {
    if (event && event.location) {
      fetchWeatherData(event.location, event.startsAt);
    }
  }, [event?.location, event?.startsAt]);

  const fetchWeatherData = async (location: string, eventDate: string) => {
    try {
      setWeatherLoading(true);
      const coordinates = await SMHIWeatherService.getCoordinatesFromLocation(location);
      
      if (coordinates) {
        const forecast = await SMHIWeatherService.getForecast(coordinates);
        const eventDateObj = new Date(eventDate);
        const eventDateString = eventDateObj.toISOString().split('T')[0];
        
        // Find weather data for the event date
        const eventWeather = forecast.find(day => day.date === eventDateString);
        if (eventWeather) {
          setWeatherData(eventWeather);
        }
      }
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      console.log('Loading event with ID:', eventId);
      console.log('Session user:', session?.user);
      
      // For now, we'll get all events and find the specific one
      // Later you can create a getEventById method
      console.log('Calling EventsService.getEvents...');
      const allEvents = await EventsService.getEvents(100, 0);
      console.log('Events loaded successfully:', allEvents.length);
      
      const foundEvent = allEvents.find(e => e.id === eventId);
      console.log('Found event:', foundEvent ? 'YES' : 'NO');
      
      if (foundEvent) {
        console.log('Setting event in state:', foundEvent.title);
        setEvent(foundEvent);
        if (session?.user) {
          console.log('Checking user RSVP status...');
          checkUserRSVPStatus(foundEvent.id);
        }
        console.log('Loading event RSVPs...');
        loadEventRSVPs(foundEvent.id);
        
        // Load weather data for the event
        if (foundEvent.location) {
          fetchWeatherData(foundEvent.location, foundEvent.startsAt);
        }
      } else {
        console.error('Event not found, redirecting to events page');
        setError('Event not found');
        router.push('/events');
      }
    } catch (error) {
      console.error('Failed to load event:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Set error state instead of redirecting immediately
      setError('Failed to load event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checkUserRSVPStatus = async (eventId: string) => {
    if (!session?.user) return;
    
    try {
      console.log('Checking RSVP status for user:', {
        userId: (session.user as any).id,
        userEmail: (session.user as any).email,
        provider: (session.user as any).provider
      });
      
      let userRsvp = null;
      try {
        // First try with the user ID from session
        userRsvp = await EventsService.getUserRSVPStatus(eventId, (session.user as any).id);
      } catch (error) {
        console.log('Failed to get RSVP with user ID, trying with email for Google users');
        // For Google users, if the user ID fails, we might need to find the user by email
        if ((session.user as any).provider === 'google' && (session.user as any).email) {
          // This is a fallback - we'd need to implement getUserRSVPStatusByEmail
          console.log('Google user ID lookup failed, would need email-based lookup');
        }
      }
      
      if (userRsvp) {
        setRsvpStatus(userRsvp.status as 'going' | 'maybe' | 'not_going');
        console.log('User RSVP status found:', userRsvp.status);
      } else {
        setRsvpStatus(null);
        console.log('No existing RSVP found for user');
      }
    } catch (error) {
      console.error('Failed to check user RSVP status:', error);
      // For Google users, this might be a user ID mismatch issue
      if ((session.user as any).provider === 'google') {
        console.log('Google user RSVP check failed - this might be a user ID issue');
      }
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
    console.log('RSVP button clicked:', status);
    console.log('Session user:', session?.user);
    console.log('Event:', event);
    
    if (!session?.user) {
      console.error('No session user');
      return;
    }
    
    if (!event) {
      console.error('No event loaded');
      return;
    }
    
    setIsRsvping(true);
    try {
      console.log('Calling EventsService.rsvpToEvent with:', {
        eventId: event.id,
        userId: (session.user as any).id,
        status: status
      });
      
      // Try to RSVP with the current user ID
      try {
        await EventsService.rsvpToEvent(event.id, (session.user as any).id, status);
        setRsvpStatus(status);
        console.log('RSVP successful, status updated to:', status);
      } catch (rsvpError) {
        console.error('RSVP failed with user ID:', rsvpError);
        
        // For Google users, if the user ID fails, we might need to find the user by email
        if ((session.user as any).provider === 'google' && (session.user as any).email) {
          console.log('Google user RSVP failed, this might be a user ID mismatch issue');
          throw new Error('Google user authentication issue. Please try logging out and back in.');
        }
        
        throw rsvpError;
      }
      
      // Send confirmation email if user is going or maybe
      if (status === 'going' || status === 'maybe') {
        try {
          const eventDate = new Date(event.startsAt);
          // Calculate end time (default to 2 hours after start if not specified)
          const endTime = event.endsAt ? new Date(event.endsAt) : new Date(eventDate.getTime() + 2 * 60 * 60 * 1000);
          
          // Debug: Log session user data
          console.log('Session user data for email:', {
            name: (session.user as any).name,
            email: (session.user as any).email,
            provider: (session.user as any).provider,
            id: (session.user as any).id,
            fullUser: session.user
          });
          
          // Check if user email is available
          if (!(session.user as any).email) {
            console.error('No user email found in session! Cannot send confirmation email.');
            alert('⚠️ RSVP confirmed but no email found. Please check your account settings.');
            return;
          }
          
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
          
          // Debug: Log email data being sent
          console.log('Email data being sent:', emailData);
          
          // Send email via API route
          const response = await fetch('/api/send-rsvp-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('Confirmation email sent successfully:', result);
            // Show success message to user
            alert('✅ RSVP confirmed! Check your email for calendar details.');
          } else {
            const errorResult = await response.json();
            console.error('Failed to send confirmation email:', errorResult);
            // Show error to user but don't fail the RSVP
            alert('⚠️ RSVP confirmed but email failed. Check console for details.');
          }
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError);
          // Don't fail the RSVP if email fails
        }
      }
      
      await loadEventRSVPs(event.id);
    } catch (error) {
      console.error('Failed to RSVP:', error);
      alert('❌ Failed to RSVP. Please try again. Check console for details.');
    } finally {
      setIsRsvping(false);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Event</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                loadEvent();
              }}
              className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#7C3AED] rounded-lg hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-colors"
            >
              Try Again
            </button>
            <br />
            <Link
              href="/events"
              className="inline-flex items-center px-6 py-3 text-base font-medium text-[#7C3AED] bg-white border border-[#7C3AED] rounded-lg hover:bg-[#7C3AED] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-colors"
            >
              Back to Events
            </Link>
          </div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/events"
            className="inline-flex items-center text-[#7C3AED] hover:text-[#6D28D9] transition-colors text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div className="flex-1 mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
                
                {/* Date and Time - Stacked on mobile */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                        <span className="font-medium">{formatDateTime(event.startsAt)}</span>
                      </div>
                    </div>
                    
                    {/* Weather Icon */}
                    {weatherData && (
                      <div className="flex items-center space-x-2 text-sm">
                        <span className="text-2xl" title={`${weatherData.description}: ${weatherData.temperature.max}°C, ${weatherData.precipitation.chance}% rain`}>
                          {weatherData.weatherIcon}
                        </span>
                        <span className="text-gray-500 font-medium">
                          {weatherData.temperature.max}°
                        </span>
                      </div>
                    )}
                    {weatherLoading && (
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <div className="animate-spin rounded-full h-4 w-4 border-b border-gray-400"></div>
                        <span>Loading weather...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Location - Stacked on mobile */}
                {event.location && (
                  <div className="mb-3">
                    <div className="flex items-start text-gray-600">
                      <svg className="w-5 h-5 mr-3 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="flex-1">
                        <a
                          href={`https://www.google.com/maps/search/${encodeURIComponent(event.location + ', Sweden')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                          title={`Open ${event.location} in Google Maps`}
                        >
                          {event.location}
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Share Button */}
              <div className="sm:ml-4">
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

            {/* External Link - Small text link below description */}
            {event.externalLink && (
              <div className="mb-6">
                <a
                  href={event.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-[#F59E0B] hover:text-[#D97706] transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {event.externalLinkTitle || 'External Link'}
                </a>
                <p className="text-sm text-gray-500 mt-2">This will open in a new tab</p>
              </div>
            )}

            {/* Event Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-3 sm:space-y-0 text-sm text-gray-600 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{rsvps.length} {rsvps.length === 1 ? 'person' : 'people'} signed up</span>
              </div>
              
              {event.capacity && (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>{rsvps.length}/{event.capacity} spots</span>
                </div>
              )}
            </div>

            {/* RSVP Section */}
            <div className="border-t border-[#7C3AED]/20 pt-6">
              {session ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">RSVP to Event</h3>
                  
                  {/* RSVP Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                    href="/auth"
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
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#7C3AED] hover:to-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B5CF6] transition-all rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
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
                          RSVP'd {(() => {
                            try {
                              // Use created_at (snake_case) from database, fallback to createdAt
                              const dateString = rsvp.created_at || rsvp.createdAt;
                              
                              if (!dateString) {
                                return 'Recently';
                              }
                              
                              const date = new Date(dateString);
                              if (isNaN(date.getTime())) {
                                return 'Recently';
                              }
                              return date.toLocaleDateString('sv-SE', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                            } catch (error) {
                              return 'Recently';
                            }
                          })()}
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
