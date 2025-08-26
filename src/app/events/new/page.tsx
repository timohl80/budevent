'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EventsService } from '@/lib/events-service';
import { useSession } from 'next-auth/react';
import { SimpleStorageService } from '@/lib/simple-storage-service';
import ImageUpload from '@/components/ImageUpload';

export default function CreateEventPage() {
  return <CreateEventForm />;
}

function CreateEventForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startsAt: '',
    location: '',
    imageUrl: '',
    capacity: '',
    isPublic: true,
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [tempEventId, setTempEventId] = useState<string>('');
  
  // Generate a temporary event ID when component mounts
  useEffect(() => {
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('Generated temp event ID:', tempId);
    setTempEventId(tempId);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          <p className="text-[#2D3436] opacity-80">Access denied. Please sign in to create events.</p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log('Form submission started');
    console.log('Session data:', session);
    console.log('User ID:', (session?.user as any)?.id);
    console.log('Form data:', formData);

    // Convert local datetime to ISO string
    const isoDateTime = new Date(formData.startsAt).toISOString();
    console.log('Converted datetime:', isoDateTime);
    
    try {
          // Add the new event to Supabase
    const newEvent = await EventsService.createEvent({
      title: formData.title,
      description: formData.description,
      startsAt: isoDateTime,
      location: formData.location,
      imageUrl: uploadedImageUrl || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      isPublic: formData.isPublic,
      status: 'active' as const,
    }, (session.user as any).id);
      
      console.log('Event created successfully');
    } catch (error) {
      console.error('Error in form submission:', error);
      setIsSubmitting(false);
      return; // Don't redirect on error
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirect to home page to show the new event
    router.push('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          Create New Event
        </h1>
        <p className="text-[#2D3436] opacity-80">
          Share your event with the community and bring people together.
        </p>
      </section>

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors resize-none"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
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
              eventId={tempEventId}
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
              disabled={isSubmitting}
              className="px-6 py-3 text-base font-medium text-white bg-[#A29BFE] rounded-lg hover:bg-[#8B7FD8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A29BFE] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
