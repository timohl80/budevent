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
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#60A5FA] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </main>
    );
  }

  // Show access denied if not authenticated
  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Please sign in to create events.</p>
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
              Create New Event
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Share your event with the community and bring people together. Create something amazing!
            </p>
          </div>
        </section>

              {/* Form Section */}
        <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] px-8 py-6">
            <h2 className="text-xl font-semibold text-white">Event Details</h2>
            <p className="text-blue-100 mt-1">Fill in the information below to create your event</p>
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

              {/* Description */}
              <div className="space-y-3">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm resize-none"
                  placeholder="Describe what attendees can expect from your event..."
                />
              </div>

              {/* Date & Time */}
              <div className="space-y-3">
                <label htmlFor="startsAt" className="block text-sm font-semibold text-gray-700">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  id="startsAt"
                  name="startsAt"
                  required
                  value={formData.startsAt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm"
                />
              </div>

              {/* Location */}
              <div className="space-y-3">
                <label htmlFor="location" className="block text-sm font-semibold text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="Where will your event take place?"
                />
              </div>

              {/* Event Image */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Event Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <ImageUpload
                    onImageUploaded={setUploadedImageUrl}
                    onImageRemoved={() => setUploadedImageUrl('')}
                    currentImageUrl={uploadedImageUrl}
                    eventId={tempEventId}
                  />
                </div>
                <p className="text-sm text-gray-500">Upload an image for your event (PNG, JPG, GIF up to 5MB)</p>
              </div>

              {/* Capacity */}
              <div className="space-y-3">
                <label htmlFor="capacity" className="block text-sm font-semibold text-gray-700">
                  Event Capacity
                </label>
                <input
                  type="number"
                  id="capacity"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="50"
                />
                <p className="text-sm text-gray-500">Optional: Maximum number of attendees</p>
              </div>

              {/* Event Visibility */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Event Visibility
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isPublic"
                      value="true"
                      checked={formData.isPublic === true}
                      onChange={handleRadioChange}
                      className="mr-3 text-[#60A5FA] focus:ring-[#60A5FA] w-4 h-4"
                    />
                    <span className="text-gray-700 font-medium">Public Event</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isPublic"
                      value="false"
                      checked={formData.isPublic === false}
                      onChange={handleRadioChange}
                      className="mr-3 text-[#60A5FA] focus:ring-[#60A5FA] w-4 h-4"
                    />
                    <span className="text-gray-700 font-medium">Private Event</span>
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
                  disabled={isSubmitting}
                  className="px-8 py-3 text-base font-medium text-white bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] rounded-xl hover:from-[#4B89E8] hover:to-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#60A5FA] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Event...
                    </div>
                  ) : (
                    'Create Event'
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
