'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EventsService } from '@/lib/events-service';

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startsAt: '',
    location: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convert local datetime to ISO string
    const isoDateTime = new Date(formData.startsAt).toISOString();
    
    // Add the new event to Supabase
    await EventsService.createEvent({
      title: formData.title,
      description: formData.description,
      startsAt: isoDateTime,
      location: formData.location,
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Redirect back to events page
    router.push('/events');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A29BFE] focus:border-transparent transition-colors"
              placeholder="Enter event location"
            />
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
