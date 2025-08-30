import { EventRSVP, EventLite } from '@/lib/types';
import { useState } from 'react';
import Link from 'next/link';
import ShareButton from './ShareButton';

interface RSVPEventCardProps {
  event: EventLite;
  rsvp: EventRSVP & { event?: EventLite };
  onUpdate: (eventId: string, status: 'going' | 'maybe' | 'not_going') => void;
  onCancel: (eventId: string) => void;
}

export default function RSVPEventCard({ event, rsvp, onUpdate, onCancel }: RSVPEventCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(rsvp.status);

  // Debug logging for event data
  console.log(`RSVPEventCard render - Event: ${event.title}, Image URL: ${event.imageUrl || 'undefined'}`);
  console.log(`RSVPEventCard render - Full event data:`, event);
  console.log(`RSVPEventCard render - RSVP data:`, rsvp);

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

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const handleStatusUpdate = async (newStatus: 'going' | 'maybe' | 'not_going') => {
    if (newStatus === selectedStatus) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(event.id, newStatus);
      setSelectedStatus(newStatus);
    } catch (error) {
      console.error('Failed to update RSVP status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your RSVP for this event?')) {
      return;
    }
    
    try {
      await onCancel(event.id);
    } catch (error) {
      console.error('Failed to cancel RSVP:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going': return 'bg-green-100 text-green-800 border-green-200';
      case 'maybe': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not_going': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
            
            {/* Share Button - Top Right */}
            <div className="absolute top-2 right-2 z-10">
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
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(rsvp.status)}`}>
            {getStatusIcon(rsvp.status)} {rsvp.status === 'going' ? 'going' : rsvp.status === 'maybe' ? 'maybe' : 'not going'}
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
        
        {/* External Link - Small text link below description */}
        {event.externalLink && (
          <div className="mb-4">
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
        
        {/* RSVP'd on */}
        <div className="text-sm text-gray-500 mb-4 pb-3 border-b border-gray-200">
          RSVP'd on {formatDate(rsvp.createdAt)}
        </div>
        
        {/* RSVP Actions */}
        <div className="space-y-3">
          {/* Status Selection */}
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusUpdate('going')}
              disabled={isUpdating}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'going'
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              Going
            </button>
            <button
              onClick={() => handleStatusUpdate('maybe')}
              disabled={isUpdating}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'maybe'
                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
              }`}
            >
              Maybe
            </button>
            <button
              onClick={() => handleStatusUpdate('not_going')}
              disabled={isUpdating}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                selectedStatus === 'not_going'
                  ? 'bg-red-100 text-red-800 border-2 border-red-300'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-red-300 hover:bg-red-50'
              }`}
            >
              Not Going
            </button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              disabled={isUpdating}
              className="flex-1 py-2 px-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
            >
              Cancel RSVP
            </button>
            <Link
              href={`/events/${event.id}`}
              className="py-2 px-4 bg-[#60A5FA] text-white rounded-lg text-sm font-medium hover:bg-[#4B89E8] transition-colors"
            >
              View Event Details
            </Link>
            

          </div>
        </div>
      </div>
    </div>
  );
}
