'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { EventsService } from '@/lib/events-service';
import { EventLite } from '@/lib/types';
import { SimpleStorageService } from '@/lib/simple-storage-service';
import ImageUpload from '@/components/ImageUpload';

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [event, setEvent] = useState<EventLite | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startsAt: '',
    location: '',
    imageUrl: '',
    capacity: '',
    isPublic: true,
    status: 'active' as 'active' | 'cancelled' | 'completed',
    externalLink: '',
    eventDate: '',
    eventTime: '',
    eventHour: '',
    eventMinute: '',
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const eventId = params.id as string;

  useEffect(() => {
    async function fetchEvent() {
      try {
        setLoading(true);
        const events = await EventsService.getEvents();
        const currentEvent = events.find(e => e.id === eventId);
        
        if (!currentEvent) {
          setError('Event not found');
          return;
        }

        // Check if user owns this event
        if (currentEvent.userId !== (session?.user as any)?.id) {
          setError('You can only edit your own events');
          return;
        }

        setEvent(currentEvent);
        setFormData({
          title: currentEvent.title,
          description: currentEvent.description || '',
          startsAt: new Date(currentEvent.startsAt).toISOString().slice(0, 16),
          location: currentEvent.location || '',
          imageUrl: currentEvent.imageUrl || '',
          capacity: currentEvent.capacity?.toString() || '',
          isPublic: currentEvent.isPublic,
          status: currentEvent.status,
          externalLink: currentEvent.externalLink || '',
          eventDate: new Date(currentEvent.startsAt).toISOString().slice(0, 10),
          eventTime: new Date(currentEvent.startsAt).toISOString().slice(11, 16),
          eventHour: new Date(currentEvent.startsAt).getHours().toString(),
          eventMinute: new Date(currentEvent.startsAt).getMinutes().toString(),
        });
        setUploadedImageUrl(currentEvent.imageUrl || '');
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event');
      } finally {
        setLoading(false);
      }
    }

    if (session && eventId) {
      fetchEvent();
    }
  }, [session, eventId]);

  // Redirect to welcome page if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/welcome');
    }
  }, [status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <main className="space-y-6 py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A29BFE] mx-auto"></div>
          <p className="mt-4 text-[#2D3436] opacity-80">Loading...</p>
        </div>
      </main>
    );
  }

  // Show access denied if not authenticated
  if (!session) {
    return (
      <main className="space-y-6 py-6">
        <div className="text-center py-12">
          <p className="text-[#2D3436] opacity-80">Access denied. Please sign in to edit events.</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="space-y-6 py-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A29BFE] mx-auto"></div>
          <p className="mt-4 text-[#2D3436] opacity-80">Loading event...</p>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
          <Link
            href="/events"
            className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-[#60A5FA] rounded-lg hover:bg-[#4B89E8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60A5FA] transition-colors"
          >
            Back to Events
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Convert local datetime to ISO string while preserving local time
      // This prevents timezone conversion issues
      const localDateTime = new Date(formData.eventDate + 'T' + formData.eventHour + ':' + formData.eventMinute);
      
      // Create a new date object that preserves the local time
      // by manually constructing the ISO string without timezone conversion
      const year = localDateTime.getFullYear();
      const month = String(localDateTime.getMonth() + 1).padStart(2, '0');
      const day = String(localDateTime.getDate()).padStart(2, '0');
      const hours = String(localDateTime.getHours()).padStart(2, '0');
      const minutes = String(localDateTime.getMinutes()).padStart(2, '0');
      const seconds = String(localDateTime.getSeconds()).padStart(2, '0');
      
      // Create ISO string in local time (no timezone conversion)
      const isoDateTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
      
      console.log('Local datetime input:', formData.eventDate + 'T' + formData.eventHour + ':' + formData.eventMinute);
      console.log('Local datetime object:', localDateTime);
      console.log('Converted datetime (preserved local time):', isoDateTime);
      
      // Update the event
      await EventsService.updateEvent(eventId, {
        title: formData.title,
        description: formData.description,
        startsAt: isoDateTime,
        location: formData.location,
        imageUrl: uploadedImageUrl || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        isPublic: formData.isPublic,
        status: formData.status,
        externalLink: formData.externalLink,
      });

      // Redirect back to events page
      router.push('/events');
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event. Please try again.');
      setSaving(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      eventDate: value
    }));
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      eventHour: value
    }));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      eventMinute: value
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === 'true'
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header Section */}
        <section className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/events"
              className="inline-flex items-center text-[#60A5FA] hover:text-[#4B89E8] transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Events
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Edit Event
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Update your event details and make changes as needed.
            </p>
          </div>
        </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

        {/* Form Section */}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] px-8 py-6">
            <h2 className="text-xl font-semibold text-white">Event Details</h2>
            <p className="text-blue-100 mt-1">Update the information below to modify your event</p>
          </div>
          
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Event Title */}
              <div className="space-y-3">
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700">
                  Event Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="Enter a catchy event title..."
                />
              </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-[#2D3436]">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors resize-none"
              placeholder="Describe your event..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#2D3436]">
              Start Date & Time * (Swedish Time)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Date Input */}
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-[#2D3436] mb-2">
                  Date
                </label>
                <input
                  type="date"
                  id="eventDate"
                  name="eventDate"
                  required
                  value={formData.eventDate || ''}
                  onChange={handleDateChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
                />
              </div>
              
              {/* Time Input */}
              <div>
                <label htmlFor="eventTime" className="block text-sm font-medium text-[#2D3436] mb-2">
                  Time (24-hour)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {/* Hour Selector */}
                  <select
                    id="eventHour"
                    name="eventHour"
                    required
                    value={formData.eventHour || ''}
                    onChange={handleHourChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
                  >
                    <option value="">Hour</option>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={String(i).padStart(2, '0')}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  
                  {/* Minute Selector */}
                  <select
                    id="eventMinute"
                    name="eventMinute"
                    required
                    value={formData.eventMinute || ''}
                    onChange={handleMinuteChange}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
                  >
                    <option value="">Min</option>
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={String(i).padStart(2, '0')}>
                        {String(i).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-[#2D3436] opacity-70 mt-1">Select hour (00-23) and minute (00-59)</p>
              </div>
            </div>
            <p className="text-sm text-[#2D3436] opacity-70">All times are in Swedish time (CET/CEST) - 24-hour format</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="block text-sm font-medium text-[#2D3436]">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
              placeholder="Enter event location"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#2D3436]">
              Event Image
            </label>
            <ImageUpload
              onImageUploaded={setUploadedImageUrl}
              onImageRemoved={() => setUploadedImageUrl('')}
              currentImageUrl={uploadedImageUrl}
              eventId={eventId}
            />
            <p className="text-sm text-[#2D3436] opacity-70">Upload an image for your event (PNG, JPG, GIF up to 5MB)</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="capacity" className="block text-sm font-medium text-[#2D3436]">
              Event Capacity
            </label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              min="1"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
              placeholder="50"
            />
            <p className="text-sm text-[#2D3436] opacity-70">Optional: Maximum number of attendees</p>
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium text-[#2D3436]">
              Event Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
            >
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="externalLink" className="block text-sm font-medium text-[#2D3436]">
              External Link
            </label>
            <input
              type="url"
              id="externalLink"
              name="externalLink"
              value={formData.externalLink}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
              placeholder="https://example.com"
            />
            <p className="text-sm text-[#2D3436] opacity-70">Optional: Add an external link for more information</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#2D3436]">
              Event Visibility
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPublic"
                  value="true"
                  checked={formData.isPublic === true}
                  onChange={handleRadioChange}
                  className="mr-2 text-[#A29BFE] focus:ring-[#A29BFE]"
                />
                <span className="text-[#2D3436]">Public Event</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="isPublic"
                  value="false"
                  checked={formData.isPublic === false}
                  onChange={handleRadioChange}
                  className="mr-2 text-[#A29BFE] focus:ring-[#A29BFE]"
                />
                <span className="text-[#2D3436]">Private Event</span>
              </label>
            </div>
          </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <Link
                  href="/events"
                  className="px-8 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 flex-1 text-center"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] rounded-xl hover:from-[#4B89E8] hover:to-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60A5FA] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {saving ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Saving Changes...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
