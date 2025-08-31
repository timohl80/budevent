import { EventLite } from '@/lib/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EventsService } from '@/lib/events-service';
import { SMHIWeatherService, WeatherData } from '@/lib/weather-service';
import ShareButton from './ShareButton';

interface EventCardProps {
  event: EventLite;
}

export default function EventCard({ event }: EventCardProps) {
  const { data: session } = useSession();
  const isOwner = (session?.user as { id: string })?.id === event.userId;
  
  // Use base64 directly for better compatibility
  const [imageSrc, setImageSrc] = useState<string>('');
  const [rsvpStatus, setRsvpStatus] = useState<'going' | 'maybe' | 'not_going' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  
  useEffect(() => {
    // Set image source if available
    if (event.imageUrl) {
      setImageSrc(event.imageUrl);
    } else {
      setImageSrc('');
    }
  }, [event.imageUrl, event.id]);
  
  // Check if user has already RSVP'd
  useEffect(() => {
    if (session?.user) {
      checkUserRSVPStatus();
    }
  }, [session?.user, event.id]);

  // Fetch weather data for the event date
  useEffect(() => {
    if (event.location) {
      fetchWeatherData();
    }
  }, [event.location, event.startsAt]);
  
  const checkUserRSVPStatus = async () => {
    if (!session?.user) return;
    
    try {
      const userRsvp = await EventsService.getUserRSVPStatus(event.id, (session.user as { id: string }).id);
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

  const fetchWeatherData = async () => {
    if (!event.location) return;
    
    try {
      setWeatherLoading(true);
      const coords = await SMHIWeatherService.getCoordinatesFromLocation(event.location);
      if (coords) {
        const forecast = await SMHIWeatherService.getForecast(coords);
        const eventDate = new Date(event.startsAt);
        const eventDateString = eventDate.toISOString().split('T')[0];
        
        // Find weather data for the event date
        const eventWeather = forecast.find(weather => weather.date === eventDateString);
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

  const handleQuickRSVP = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      // Use the exact same logic as the dashboard
      const user = session.user;
      const userId = (user as any).id || user.email;
      
      if (!userId) {
        console.error('Could not extract user ID for RSVP');
        alert('Error: Could not identify user. Please try logging out and back in.');
        return;
      }
      
      console.log('🔍 Quick RSVP - User ID:', userId);
      console.log('🔍 Quick RSVP - User email:', user.email);
      console.log('🔍 Quick RSVP - User name:', user.name);
      
      // Call the RSVP API endpoint (server-side) instead of client-side EventsService
      console.log('🔍 Calling RSVP API endpoint...');
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          status: 'going'
        }),
      });
      
      if (!response.ok) {
        throw new Error(`RSVP failed: ${response.statusText}`);
      }
      
      const rsvpResult = await response.json();
      console.log('🔍 RSVP API result:', rsvpResult);
      
      setRsvpStatus('going');
      
      // Refresh the RSVP status
      await checkUserRSVPStatus();
      
      console.log('🔍 Quick RSVP completed successfully');
      console.log('🔍 Email should have been sent to:', user.email);
    } catch (error) {
      console.error('Failed to RSVP to event:', error);
      alert('Failed to RSVP to event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('sv-SE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRSVPStatusDisplay = (status: 'going' | 'maybe' | 'not_going') => {
    const statusConfig = {
      going: { text: '✅ Going', color: 'bg-green-100 text-green-800 border-green-200' },
      maybe: { text: '🤔 Maybe', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      not_going: { text: '❌ Not Going', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    
    const config = statusConfig[status];
    return (
      <div className={`px-2 py-1 text-xs font-medium rounded-full border ${config.color}`}>
        {config.text}
      </div>
    );
  };

  const truncateDescription = (text: string, maxLength: number = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  return (
    <article className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col w-full overflow-hidden">
      {/* Event Image - Clickable */}
      <Link 
        href={`/events/${event.id}`} 
        className="block relative h-48 bg-gray-100 rounded-t-lg overflow-hidden group cursor-pointer"
        title={`Click to view details for ${event.title}`}
      >
                {event.imageUrl && imageSrc && imageSrc.length > 100 && imageSrc.startsWith('data:image/') ? (
          <img
            src={imageSrc}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            onError={(e) => {
              console.error('Image failed to load:', imageSrc);
              setImageSrc('');
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] transition-transform duration-200 group-hover:scale-105 flex items-center justify-center">
            <span className="text-white text-lg font-bold tracking-wide opacity-90 text-center px-4 leading-tight">
              {event.title}
            </span>
          </div>
        )}
        

        
        {/* RSVP Status Badge */}
        {rsvpStatus && (
          <div className="absolute top-3 left-3 z-10">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              rsvpStatus === 'going' 
                ? 'bg-green-100 text-green-800' 
                : rsvpStatus === 'maybe' 
                ? 'bg-yellow-100 text-yellow-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {getRSVPStatusDisplay(rsvpStatus)}
            </span>
          </div>
        )}
        
        {/* Event Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            event.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : event.status === 'cancelled' 
              ? 'bg-red-100 text-red-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {event.status === 'active' ? 'Active' : event.status === 'cancelled' ? 'Cancelled' : 'Completed'}
          </span>
        </div>
        
        {/* Share Button - Top Right */}
        <div className="absolute top-3 right-20 z-10">
          <ShareButton event={event} compact={true} />
        </div>
        

      </Link>
      
      {/* Event Content */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Event Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link href={`/events/${event.id}`} className="hover:text-[#60A5FA] transition-colors">
            {event.title}
          </Link>
        </h3>
        
        {/* Date & Time with Weather */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <time dateTime={event.startsAt} className="truncate">
              {formatDateTime(event.startsAt)}
            </time>
          </div>
          
          {/* Weather Symbol */}
          {weatherData && (
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-lg" title={`${weatherData.description}: ${weatherData.temperature.max}°C, ${weatherData.precipitation.chance}% rain`}>
                {weatherData.weatherIcon}
              </span>
              <span className="text-gray-500">
                {weatherData.temperature.max}°
              </span>
            </div>
          )}
          {weatherLoading && (
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
              <span>Loading weather...</span>
            </div>
          )}
        </div>
        
        {/* Location */}
        {event.location && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(event.location + ', Sweden')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
              title={`Open ${event.location} in Google Maps`}
            >
              {event.location}
            </a>
          </div>
        )}
        
        {/* RSVP Count */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-gray-700 font-medium">
            {event.rsvpCount || 0} {event.rsvpCount === 1 ? 'person' : 'people'} signed up
          </span>
          {event.capacity && (
            <span className="text-gray-500 ml-1">
              • {event.capacity} spots available
            </span>
          )}
        </div>
        
        {/* Event Description Preview */}
        {event.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
            {truncateDescription(event.description)}
          </p>
        )}
        
        {/* External Link - Small text link below description */}
        {event.externalLink && (
          <div className="mb-3">
            <a
              href={event.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-[#F59E0B] hover:text-[#D97706] transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {event.externalLinkTitle || 'External Link'}
            </a>
          </div>
        )}
        
        {/* Quick RSVP Button */}
        {session?.user && !isOwner && event.status === 'active' && !rsvpStatus && (
          <div className="mb-3">
            <button
              onClick={handleQuickRSVP}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing up...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Quick Sign Up
                </>
              )}
            </button>
          </div>
        )}

        {/* View Details Button */}
        <div className="mt-auto pt-3">
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#7C3AED] rounded-md hover:bg-[#6D28D9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Details
          </Link>
          

          
          {/* Edit button for event owner */}
          {isOwner && (
            <Link
              href={`/events/${event.id}/edit`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#6D28D9] bg-[#7C3AED]/10 border border-[#7C3AED]/30 rounded-md hover:bg-[#7C3AED]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7C3AED] transition-colors ml-2"
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
