'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EventsService } from '@/lib/events-service';
import { useSession } from 'next-auth/react';
import { SimpleStorageService } from '@/lib/simple-storage-service';
import ImageUpload from '@/components/ImageUpload';
import EnhancedWeatherForecast from '@/components/EnhancedWeatherForecast';
import UserInvitationSelector from '@/components/UserInvitationSelector';

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
    externalLink: '',
    externalLinkTitle: '',
    eventDate: '', // Added for date input
    eventTime: '', // Added for time input
    eventHour: '', // Added for hour input
    eventMinute: '', // Added for minute input
  });
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');
  const [tempEventId, setTempEventId] = useState<string>('');
  const [showWeatherForecast, setShowWeatherForecast] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [invitationMessage, setInvitationMessage] = useState<string>('');
  
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
              router.push('/auth');
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

    // Combine date and time to form the ISO string
    const date = formData.eventDate;
    const time = `${formData.eventHour}:${formData.eventMinute}:00.000Z`; // Ensure seconds are 00
    
    console.log('Combined date and time:', time);
    
    // Format external link URL if provided
    const formatExternalLink = (url: string) => {
      console.log('Formatting URL:', url);
      if (!url) return undefined;
      // If URL doesn't start with http:// or https://, add https://
      if (!url.match(/^https?:\/\//)) {
        const formattedUrl = `https://${url}`;
        console.log('Added https://, result:', formattedUrl);
        return formattedUrl;
      }
      console.log('URL already has protocol, keeping as:', url);
      return url;
    };
    
    console.log('Original externalLink:', formData.externalLink);
    const formattedExternalLink = formatExternalLink(formData.externalLink);
    console.log('Formatted externalLink:', formattedExternalLink);
    
    try {
          // Add the new event to Supabase
    const newEvent = await EventsService.createEvent({
      title: formData.title,
      description: formData.description,
      startsAt: `${date}T${time}`, // Combine date and time
      location: formData.location,
      externalLink: formattedExternalLink || undefined,
      externalLinkTitle: formData.externalLinkTitle || undefined,
      imageUrl: uploadedImageUrl || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      isPublic: formData.isPublic,
      status: 'active' as const,
    }, (session.user as any).id);
      
      console.log('Event created successfully');

      // Send invitations if users are selected
      if (selectedUserIds.length > 0) {
        try {
          const inviteResponse = await fetch('/api/events/invite', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventId: newEvent.id,
              invitedUserIds: selectedUserIds,
              message: invitationMessage || undefined,
            }),
          });

          if (inviteResponse.ok) {
            const inviteResult = await inviteResponse.json();
            // Show success message to user
            alert(`✅ Event created and invitations sent to ${inviteResult.emailResults.successful} users!`);
          } else {
            const errorResult = await inviteResponse.json();
            console.error('Failed to send invitations:', errorResult);
            // Show warning but don't fail the event creation
            alert(`⚠️ Event created successfully, but some invitations failed to send. Check console for details.`);
          }
        } catch (inviteError) {
          console.error('Error sending invitations:', inviteError);
          // Show warning but don't fail the event creation
          alert(`⚠️ Event created successfully, but invitations failed to send. Check console for details.`);
        }
      }
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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

              {/* Date and Time - Mobile-First Design */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Start Date & Time * (Swedish Time)
                </label>
                
                {/* Date Input */}
                <div className="space-y-2">
                  <label htmlFor="eventDate" className="block text-sm font-medium text-gray-600">
                    📅 Date
                  </label>
                  <input
                    type="date"
                    id="eventDate"
                    name="eventDate"
                    required
                    value={formData.eventDate || ''}
                    onChange={handleDateChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm text-base"
                  />
                </div>
                
                {/* Time Inputs - Side by Side on larger screens */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-600">
                    🕐 Time (24-hour format)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Hour Input */}
                    <div className="space-y-1">
                      <label htmlFor="eventHour" className="block text-xs font-medium text-gray-500">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm text-center text-lg font-medium"
                        placeholder="14"
                      />
                    </div>
                    
                    {/* Minute Input */}
                    <div className="space-y-1">
                      <label htmlFor="eventMinute" className="block text-xs font-medium text-gray-500">
                        Minute (00-59)
                      </label>
                      <input
                        type="number"
                        id="eventMinute"
                        name="eventMinute"
                        min="0"
                        max="59"
                        required
                        value={formData.eventMinute || ''}
                        onChange={handleMinuteChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm text-center text-lg font-medium"
                        placeholder="30"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Time Preview - Enhanced Design */}
                {formData.eventHour && formData.eventMinute && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-2xl font-bold text-blue-700">
                        {formData.eventHour.padStart(2, '0')}:{formData.eventMinute.padStart(2, '0')}
                      </span>
                      <span className="text-sm text-blue-600 font-medium bg-white px-2 py-1 rounded-full">
                        Swedish Time
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Selected Date Display */}
                {formData.eventDate && (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
                      </svg>
                      <div className="text-center">
                        <span className="text-lg font-semibold text-green-700 block">
                          {(() => {
                            try {
                              const date = new Date(formData.eventDate);
                              return date.toLocaleDateString('sv-SE', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            } catch (e) {
                              // Fallback for Safari
                              const date = new Date(formData.eventDate);
                              const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                              const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                              return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
                            }
                          })()}
                        </span>
                        <span className="text-sm text-green-600 font-medium">Date Selected ✓</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Weather Forecast */}
              <div className="space-y-3">
                {/* Weather Forecast Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {formData.eventDate && (
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                        Date Selected ✓
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWeatherForecast(!showWeatherForecast)}
                    className="flex items-center space-x-1 text-sm text-[#60A5FA] hover:text-[#4B8E8] transition-colors"
                  >
                    <span>{showWeatherForecast ? 'Hide' : 'Show'}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform ${showWeatherForecast ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Weather Forecast Content */}
                {showWeatherForecast && (
                  <EnhancedWeatherForecast 
                    initialLocation={formData.location}
                    onDateSelect={(date) => {
                      setFormData(prev => ({ ...prev, eventDate: date }));
                    }}
                    onLocationSelect={(location, coordinates) => {
                      setFormData(prev => ({ ...prev, location }));
                      console.log('Selected location coordinates:', coordinates);
                    }}
                  />
                )}

                {/* Location Summary (when weather is hidden) */}
                {!showWeatherForecast && formData.location && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-700">
                          Location: {formData.location}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowWeatherForecast(true)}
                        className="text-xs text-[#60A5FA] hover:text-[#4B8E8] underline"
                      >
                        Change location
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* External Link Title */}
              <div className="space-y-3">
                <label htmlFor="externalLinkTitle" className="block text-sm font-semibold text-gray-700">
                  External Link Title
                </label>
                <input
                  type="text"
                  id="externalLinkTitle"
                  name="externalLinkTitle"
                  value={formData.externalLinkTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="e.g., Buy Tickets, Join Facebook Event, Register Here"
                />
                <p className="text-sm text-gray-500">Optional: Custom title for the external link button</p>
              </div>

              {/* External Link */}
              <div className="space-y-3">
                <label htmlFor="externalLink" className="block text-sm font-semibold text-gray-700">
                  External Event Link
                </label>
                <input
                  type="text"
                  id="externalLink"
                  name="externalLink"
                  value={formData.externalLink}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#60A5FA] focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="www.example.com/event-page"
                />
                <p className="text-sm text-gray-500">Optional: Link to external event page (Eventbrite, Meetup, etc.) - https:// will be added automatically</p>
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
                    <span className="text-gray-700 font-medium">Private Event (Only I can see)</span>
                  </label>
                </div>
              </div>

              {/* User Invitations */}
              <UserInvitationSelector
                selectedUserIds={selectedUserIds}
                onSelectionChange={setSelectedUserIds}
                onMessageChange={setInvitationMessage}
                invitationMessage={invitationMessage}
              />

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
