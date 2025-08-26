import { EventRSVP } from '@/lib/types';
import { useState } from 'react';
import Link from 'next/link';
import ShareButton from './ShareButton';

interface RSVPEventCardProps {
  rsvp: EventRSVP & { event?: EventLite };
  onRSVPUpdate: (eventId: string, status: 'going' | 'maybe' | 'not_going') => void;
  onRSVPCancel: (eventId: string) => void;
}

export default function RSVPEventCard({ rsvp, onRSVPUpdate, onRSVPCancel }: RSVPEventCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const event = rsvp.event;

  if (!event) {
    return null;
  }

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
      case 'going': return 'bg-green-100 text-green-800';
      case 'maybe': return 'bg-yellow-100 text-yellow-800';
      case 'not_going': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'going': return '✅';
      case 'maybe': return '🤔';
      case 'not_going': return '❌';
      default: return '❓';
    }
  };

  const handleStatusUpdate = async (newStatus: 'going' | 'maybe' | 'not_going') => {
    setIsUpdating(true);
    try {
      await onRSVPUpdate(event.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    setIsUpdating(true);
    try {
      await onRSVPCancel(event.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Event Image */}
      {event.imageUrl && (
        <div className="aspect-video bg-gray-200 overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
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
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rsvp.status)} ml-2 flex-shrink-0`}>
            {getStatusIcon(rsvp.status)} {rsvp.status}
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
        </div>

        {/* RSVP Actions */}
        <div className="space-y-2">
          <div className="text-xs text-gray-500 mb-3">
            RSVP'd on {new Date(rsvp.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusUpdate('going')}
              disabled={isUpdating || rsvp.status === 'going'}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                rsvp.status === 'going'
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'
              }`}
            >
              Going
            </button>
            
            <button
              onClick={() => handleStatusUpdate('maybe')}
              disabled={isUpdating || rsvp.status === 'maybe'}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                rsvp.status === 'maybe'
                  ? 'bg-yellow-100 text-yellow-700 cursor-not-allowed'
                  : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
              }`}
            >
              Maybe
            </button>
            
            <button
              onClick={() => handleStatusUpdate('not_going')}
              disabled={isUpdating || rsvp.status === 'not_going'}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                rsvp.status === 'not_going'
                  ? 'bg-red-100 text-red-700 cursor-not-allowed'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              Not Going
            </button>
          </div>

          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="w-full px-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel RSVP
          </button>
        </div>

        {/* Share Button */}
        <div className="mt-3">
          <ShareButton event={event} />
        </div>

        {/* View Event Button */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Link
            href={`/events/${event.id}`}
            className="block w-full text-center px-4 py-2 text-sm font-medium text-[#A29BFE] bg-[#A29BFE]/10 rounded-md hover:bg-[#A29BFE]/20 transition-colors"
          >
            View Event Details
          </Link>
        </div>
      </div>
    </div>
  );
}
