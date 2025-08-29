import { EventLite } from '@/lib/types';
import { useState } from 'react';
import Link from 'next/link';
import ShareButton from './ShareButton';
import { EventsService } from '@/lib/events-service';

interface MyEventCardProps {
  event: EventLite;
  onRefresh: () => void;
}

export default function MyEventCard({ event, onRefresh }: MyEventCardProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🟢';
      case 'cancelled': return '🔴';
      case 'completed': return '⚫';
      default: return '⚪';
    }
  };

  const handleDeleteEvent = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting delete process for event:', event.id, event.title);
      
      // Actually delete the event
      await EventsService.deleteEvent(event.id);
      console.log('Event deleted successfully:', event.id);
      
      // Show success message
      alert('Event deleted successfully!');
      
      // Refresh the events list
      onRefresh();
    } catch (error) {
      console.error('Failed to delete event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to delete event: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isEventPast = new Date(event.startsAt) < new Date();
  const isEventToday = new Date(event.startsAt).toDateString() === new Date().toDateString();

  // Debug logging for image URL
  console.log(`MyEventCard render - Event: ${event.title}, Image URL: ${event.imageUrl || 'undefined'}`);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Event Image - Clickable */}
      <Link 
        href={`/events/${event.id}`} 
        className="block cursor-pointer"
        title={`Click to view details for ${event.title}`}
      >
        {event.imageUrl ? (
          <div className="h-48 bg-gray-200 overflow-hidden relative group">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            {isEventPast && (
              <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs font-medium z-10">
                Past Event
              </div>
            )}
            {isEventToday && !isEventPast && (
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium z-10">
                Today!
              </div>
            )}
            
            {/* Share Button - Top Right */}
            <div className="absolute top-2 right-20 z-10">
              <ShareButton event={event} compact={true} />
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#7C3AED] to-[#6D28D9] flex items-center justify-center">
            <span className="text-white text-lg font-bold tracking-wide opacity-90 text-center px-4 leading-tight">
              {event.title}
            </span>
          </div>
        )}
      </Link>

      {/* Event Content */}
      <div className="p-6 bg-gradient-to-b from-white to-gray-50">
        {/* Event Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">
            {event.title}
          </h3>
          <div className="flex flex-col items-end space-y-2">
            {/* Owner Warning */}
            {!event.userId && (
              <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
                ⚠️ No Owner
              </div>
            )}
            {/* Event Status */}
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
              event.status === 'active' 
                ? 'bg-green-100 text-green-800 border-green-300' 
                : event.status === 'cancelled' 
                ? 'bg-red-100 text-red-800 border-red-300' 
                : 'bg-gray-100 text-gray-800 border-gray-300'
            }`}>
              {event.status === 'active' ? '🟢 Active' : event.status === 'cancelled' ? '🔴 Cancelled' : '⚫ Completed'}
            </span>
          </div>
        </div>
        
        {/* Date & Time */}
        <div className="flex items-center text-gray-700 mb-3">
          <svg className="w-4 h-4 mr-2 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{formatDateTime(event.startsAt)}</span>
        </div>
        
        {/* Location */}
        {event.location && (
          <div className="flex items-center text-gray-700 mb-3">
            <svg className="w-4 h-4 mr-2 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{event.location}</span>
          </div>
        )}
        
        {/* Description */}
        {event.description && (
          <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        )}
        
        {/* Event Stats */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {event.rsvpCount || 0} RSVPs
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-[#60A5FA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {event.commentCount || 0} Comments
            </span>
          </div>
          
          {/* Event Status Indicators */}
          <div className="flex items-center space-x-2">
            {isEventPast && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                Past Event
              </span>
            )}
            {isEventToday && !isEventPast && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                Today!
              </span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Link
            href={`/events/${event.id}`}
            className="flex-1 py-2 px-3 bg-[#60A5FA] text-white rounded-lg text-sm font-medium hover:bg-[#4B89E8] transition-colors text-center"
          >
            View Event Details
          </Link>
          
          {/* External Link Button */}
          {event.externalLink && (
            <a
              href={event.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2 px-3 bg-[#F59E0B] text-white border border-[#F59E0B] rounded-lg text-sm font-medium hover:bg-[#D97706] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
          
          <Link
            href={`/events/${event.id}/edit`}
            className="py-2 px-3 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Edit Event
          </Link>
          
          {/* Debug Button - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <Link
              href={`/debug-event/${event.id}`}
              className="py-2 px-3 bg-purple-100 text-purple-700 border border-purple-300 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
            >
              Debug
            </Link>
          )}
          
          <button
            onClick={handleDeleteEvent}
            disabled={isLoading}
            className="py-2 px-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
        

      </div>
    </div>
  );
}
