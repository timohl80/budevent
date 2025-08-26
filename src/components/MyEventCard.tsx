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
      {event.imageUrl && (
        <div className="aspect-video bg-gray-200 overflow-hidden relative">
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
      )}

      {/* Event Content */}
      <div className="p-6">
        {/* Event Title and Status */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            <Link href={`/events/${event.id}`} className="hover:text-[#A29BFE] transition-colors">
              {event.title}
            </Link>
          </h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)} ml-2 flex-shrink-0`}>
            {getStatusIcon(event.status)} {event.status}
          </span>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateTime(event.startsAt)}
          </div>
          
          {event.location && (
            <div className="flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </div>
          )}

          {event.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Event Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 pt-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {event.rsvpCount || 0} RSVPs
            </div>
            
            {event.capacity && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {event.rsvpCount || 0}/{event.capacity} spots
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/events/${event.id}/edit`}
              className="px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors text-center"
            >
              Edit Event
            </Link>
            
            <Link
              href={`/events/${event.id}`}
              className="px-3 py-2 text-xs font-medium text-[#A29BFE] bg-[#A29BFE]/10 rounded-md hover:bg-[#A29BFE]/20 transition-colors text-center"
            >
              View Event
            </Link>
          </div>

          <button
            onClick={handleDeleteEvent}
            disabled={isLoading}
            className="w-full px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Deleting...' : 'Delete Event'}
          </button>
        </div>

        {/* Share Button */}
        <div className="mt-3">
          <ShareButton event={event} />
        </div>

        {/* View Event Button */}
        <div className="mt-3">
          <Link
            href={`/events/${event.id}`}
            className="w-full inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-[#A29BFE] bg-[#A29BFE]/10 rounded-md hover:bg-[#A29BFE]/20 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Event Details
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link
              href={`/events/${event.id}#rsvps`}
              className="flex-1 text-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              View RSVPs
            </Link>
            
            <Link
              href={`/events/${event.id}#comments`}
              className="flex-1 text-center px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
            >
              View Comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
