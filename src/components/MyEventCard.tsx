import { EventLite } from '@/lib/types';
import { useState } from 'react';
import Link from 'next/link';
import ShareButton from './ShareButton';

interface MyEventCardProps {
  event: EventLite;
  onRefresh: () => void;
}

export default function MyEventCard({ event, onRefresh }: MyEventCardProps) {
  const [isLoading, setIsLoading] = useState(false);

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
      // TODO: Implement delete event functionality
      // await EventsService.deleteEvent(event.id);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isEventPast = new Date(event.startsAt) < new Date();
  const isEventToday = new Date(event.startsAt).toDateString() === new Date().toDateString();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Event Image */}
      {event.imageUrl ? (
        <div className="h-48 bg-gray-200 overflow-hidden relative">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          {isEventPast && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs font-medium">
              Past Event
            </div>
          )}
          {isEventToday && !isEventPast && (
            <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
              Today!
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center relative">
          <img
            src="/BudEvent-pin.svg"
            alt="BudEvent"
            className="w-40 h-40 opacity-80"
          />
          {isEventPast && (
            <div className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-md text-xs font-medium">
              Past Event
            </div>
          )}
          {isEventToday && !isEventPast && (
            <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded-md text-xs font-medium">
              Today!
            </div>
          )}
        </div>
      )}

      {/* Event Content */}
      <div className="p-6 bg-gradient-to-b from-white to-gray-50">
        {/* Event Title and Status */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">
            {event.title}
          </h3>
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
          <Link
            href={`/events/${event.id}/edit`}
            className="py-2 px-3 bg-white text-gray-700 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Edit Event
          </Link>
          <button
            onClick={handleDeleteEvent}
            disabled={isLoading}
            className="py-2 px-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
        
        {/* Share Button */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <ShareButton event={event} />
        </div>
      </div>
    </div>
  );
}
