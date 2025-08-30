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
    externalLinkTitle: '',
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
        console.log('Fetching event with ID:', eventId);
        console.log('Session user:', session?.user);
        
        // Use the more efficient getEventById method
        const currentEvent = await EventsService.getEventById(eventId);
        
        console.log('Fetched event:', currentEvent);
        
        if (!currentEvent) {
          setError(`Event not found. Event ID: ${eventId}`);
          return;
        }

        // Check if user owns this event
        console.log('Event user ID:', currentEvent.userId);
        console.log('Session user ID:', (session?.user as any)?.id);
        
        if (!currentEvent.userId) {
          setError('This event has no owner assigned. Please contact an administrator to fix this issue.');
          return;
        }
        
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
          externalLinkTitle: currentEvent.externalLinkTitle || '',
          eventDate: new Date(currentEvent.startsAt).toISOString().slice(0, 10),
          eventTime: new Date(currentEvent.startsAt).toISOString().slice(11, 16),
          eventHour: new Date(currentEvent.startsAt).getHours().toString(),
          eventMinute: new Date(currentEvent.startsAt).getMinutes().toString(),
        });
        setUploadedImageUrl(currentEvent.imageUrl || '');
      } catch (err) {
        console.error('Error fetching event:', err);
        setError(`Failed to load event: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
              router.push('/auth');
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
      console.log('Form data for datetime:', {
        eventDate: formData.eventDate,
        eventHour: formData.eventHour,
        eventMinute: formData.eventMinute
      });
      
      // Validate the date components
      if (!formData.eventDate || !formData.eventHour || !formData.eventMinute) {
        throw new Error('Date, hour, and minute are required');
      }
      
      // Parse the date components safely
      const year = parseInt(formData.eventDate.split('-')[0]);
      const month = parseInt(formData.eventDate.split('-')[1]) - 1; // Month is 0-indexed
      const day = parseInt(formData.eventDate.split('-')[2]);
      const hours = parseInt(formData.eventHour);
      const minutes = parseInt(formData.eventMinute);
      
      console.log('Parsed date components:', { year, month, day, hours, minutes });
      
      // Validate the parsed values
      if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
        throw new Error('Invalid date or time values');
      }
      
      // Create a proper Date object
      const localDateTime = new Date(year, month, day, hours, minutes, 0, 0);
      
      // Validate the created date
      if (isNaN(localDateTime.getTime())) {
        throw new Error('Invalid date created from components');
      }
      
      // Create ISO string in local time (no timezone conversion)
      const isoDateTime = localDateTime.toISOString().slice(0, 19) + '.000';
      
      console.log('Local datetime input:', formData.eventDate + 'T' + formData.eventHour + ':' + formData.eventMinute);
      console.log('Local datetime object:', localDateTime);
      console.log('Converted datetime (preserved local time):', isoDateTime);
      
      console.log('About to call EventsService.updateEvent with data:', {
        eventId,
        updateData: {
          title: formData.title,
          description: formData.description,
          startsAt: isoDateTime,
          location: formData.location,
          imageUrl: uploadedImageUrl || undefined,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          isPublic: formData.isPublic,
          status: formData.status,
          externalLink: formData.externalLink,
          externalLinkTitle: formData.externalLinkTitle,
        }
      });

      // Create a client-side Supabase client with the user's session
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      
      // Create a new Supabase client for this request
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      
      console.log('Using client-side Supabase client for update');

      // Update the event directly using the client-side client
      const { data: updatedEventData, error: updateError } = await supabaseClient
        .from('events')
        .update({
          title: formData.title,
          description: formData.description,
          starts_at: isoDateTime,
          location: formData.location,
          image_url: uploadedImageUrl || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
          is_public: formData.isPublic,
          status: formData.status,
          external_link: formData.externalLink,
          external_link_title: formData.externalLinkTitle,
        })
        .eq('id', eventId)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(`Database update failed: ${updateError.message}`);
      }

      console.log('Event updated successfully:', updatedEventData);

      console.log('Event updated successfully:', updatedEventData);

      // Redirect back to events page
      router.push('/events');
    } catch (error) {
      console.error('Error updating event:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error?.constructor?.name);
      console.error('Full error object:', JSON.stringify(error, null, 2));
      
      // Provide more detailed error information
      let errorMessage = 'Failed to update event. Please try again.';
      
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack
        });
        
        // Check for specific error types
        if (error.message.includes('Failed to update event')) {
          errorMessage = 'Database update failed. Please check your input and try again.';
        } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
          errorMessage = 'Permission denied. You may not have access to edit this event.';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Event not found. It may have been deleted.';
        } else {
          errorMessage = `Update failed: ${error.message}`;
        }
      } else {
        // Handle non-Error objects
        console.error('Non-Error object caught:', error);
        if (typeof error === 'object' && error !== null) {
          errorMessage = `Update failed: ${JSON.stringify(error)}`;
        }
      }
      
      setError(errorMessage);
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

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      eventHour: value
    }));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#2D3436]">
              Start Date & Time * (Swedish Time)
            </label>
            
            {/* Combined Date & Time Picker */}
            <div className="space-y-4">
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
              
              {/* Time Input - Custom 24-hour Format Picker */}
              <div>
                <label className="block text-sm font-medium text-[#2D3436] mb-2">
                  Time (24-hour format)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Hour Input */}
                  <div>
                    <label htmlFor="eventHour" className="block text-xs font-medium text-[#2D3436] opacity-70 mb-2">
                      Hour (00-23)
                    </label>
                    <input
                      type="number"
                      id="eventHour"
                      name="eventHour"
                      min="0"
                      max="23"
                      required
                      value={formData.eventHour || ''}
                      onChange={handleHourChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-all duration-200 shadow-sm text-center text-lg"
                      placeholder="14"
                    />
                  </div>
                  
                  {/* Minute Input */}
                  <div>
                    <label htmlFor="eventMinute" className="block text-xs font-medium text-[#2D3436] opacity-70 mb-2">
                      Minute (00-59)
                    </label>
                    <input
                      type="number"
                      id="eventMinute"
                      name="eventMinute"
                      min="0"
                      max="23"
                      required
                      value={formData.eventMinute || ''}
                      onChange={handleMinuteChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-all duration-200 shadow-sm text-center text-lg"
                      placeholder="30"
                    />
                  </div>
                </div>
                
                {/* Time Preview */}
                {formData.eventHour && formData.eventMinute && (
                  <div className="mt-3 p-3 bg-[#A29BFE]/10 border border-[#A29BFE]/20 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5 text-[#A29BFE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-lg font-semibold text-[#A29BFE]">
                        {formData.eventHour.padStart(2, '0')}:{formData.eventMinute.padStart(2, '0')}
                      </span>
                      <span className="text-sm text-[#A29BFE]/70">Swedish Time</span>
                    </div>
                  </div>
                )}
                
                <p className="text-sm text-[#2D3436] opacity-70 mt-2">
                  Enter time in 24-hour format (e.g., 14 for 2 PM, 23 for 11 PM)
                </p>
              </div>
            </div>
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
            <label htmlFor="externalLinkTitle" className="block text-sm font-medium text-[#2D3436]">
              External Link Title
            </label>
            <input
              type="text"
              id="externalLinkTitle"
              name="externalLinkTitle"
              value={formData.externalLinkTitle}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
              placeholder="e.g., Buy Tickets, Join Facebook Event, Register Here"
            />
            <p className="text-sm text-[#2D3436] opacity-70">Optional: Custom title for the external link button</p>
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
                <span className="text-[#2D3436]">Private Event (Only I can see)</span>
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
