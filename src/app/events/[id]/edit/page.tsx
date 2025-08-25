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

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
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
      <main className="space-y-6 py-6">
        <div className="text-center py-12">
          <div className="text-red-500">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-lg font-medium text-red-600 mb-2">Error</p>
            <p className="text-red-500">{error || 'Event not found'}</p>
          </div>
          <Link
            href="/events"
            className="inline-flex items-center px-6 py-3 mt-4 text-base font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors"
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
      // Convert local datetime to ISO string
      const isoDateTime = new Date(formData.startsAt).toISOString();
      
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
      });

      // Redirect back to events page
      router.push('/events');
    } catch (error) {
      console.error('Error updating event:', error);
      setError('Failed to update event. Please try again.');
      setSaving(false);
    }
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
    <main className="space-y-6 py-6">
      <section className="space-y-4">
        <div className="flex items-center gap-4">
          <Link
            href="/events"
            className="inline-flex items-center text-[#A29BFE] hover:text-[#8B7FD8] transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to events
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-[#2D3436]">
          Edit Event
        </h1>
        <p className="text-[#2D3436] opacity-80">
          Update your event details and settings.
        </p>
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

      <section>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-[#2D3436]">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
              placeholder="Enter event title"
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
            <label htmlFor="startsAt" className="block text-sm font-medium text-[#2D3436]">
              Start Date & Time *
            </label>
            <input
              type="datetime-local"
              id="startsAt"
              name="startsAt"
              required
              value={formData.startsAt}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:ring-offset-2 focus:border-transparent transition-colors"
            />
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

          <div className="flex gap-4 pt-4">
            <Link
              href="/events"
              className="px-6 py-3 text-base font-medium text-[#2D3436] bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 text-base font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
