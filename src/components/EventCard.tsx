import { EventLite } from '@/lib/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EventsService } from '@/lib/events-service';
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

  const handleQuickRSVP = async () => {
    if (!session?.user) return;
    
    setIsLoading(true);
    try {
      await EventsService.rsvpToEvent(event.id, (session.user as { id: string }).id, 'going');
      setRsvpStatus('going');
      // Refresh the RSVP status
      await checkUserRSVPStatus();
    } catch (error) {
      console.error('Failed to RSVP to event:', error);
      // You could add a toast notification here
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
        

      </Link>
      
      {/* Event Content */}
      <div className="p-4 flex-grow flex flex-col">
        {/* Event Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          <Link href={`/events/${event.id}`} className="hover:text-[#60A5FA] transition-colors">
            {event.title}
          </Link>
        </h3>
        
        {/* Date & Time */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <time dateTime={event.startsAt} className="truncate">
            {formatDateTime(event.startsAt)}
          </time>
        </div>
        
        {/* Location */}
        {event.location && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{event.location}</span>
          </div>
        )}
        
        {/* Event Description Preview */}
        {event.description && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">
            {truncateDescription(event.description)}
          </p>
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
          
          {/* External Link Button */}
          {event.externalLink && (
            <a
              href={event.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-md hover:bg-[#F59E0B]/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F59E0B] transition-colors ml-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              External Link
            </a>
          )}
          
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
        
        {/* Share Button */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <ShareButton event={event} />
        </div>
      </div>
    </article>
  );
}
