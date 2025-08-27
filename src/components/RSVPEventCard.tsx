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
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-lg px-3 py-1.5 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-600">View</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center group">
            <img
              src="/BudEvent-pin.svg"
              alt="BudEvent"
              className="w-40 h-40 opacity-80 transition-transform duration-200 group-hover:scale-105"
            />
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-white bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-lg px-3 py-1.5 shadow-lg border border-gray-200">
                <div className="flex items-center space-x-1.5">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-xs font-medium text-gray-600">View</span>
                </div>
              </div>
            </div>
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
            <ShareButton event={event} />
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
