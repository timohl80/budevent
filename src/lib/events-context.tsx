'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { EventLite } from './types';

interface EventsContextType {
  events: EventLite[];
  addEvent: (event: Omit<EventLite, 'id'>) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

// Initial hardcoded events
const initialEvents: EventLite[] = [
  {
    id: '1',
    title: 'Tech Meetup: Next.js Best Practices',
    startsAt: '2024-02-15T18:00:00Z',
    location: 'Downtown Conference Center',
    description: 'Join us for an evening of learning about Next.js best practices, performance optimization, and real-world applications. Network with fellow developers and share your experiences.',
  },
  {
    id: '2',
    title: 'Community Garden Workshop',
    startsAt: '2024-02-18T10:00:00Z',
    location: 'Community Garden Park',
    description: 'Learn sustainable gardening techniques, composting methods, and how to grow your own vegetables. Perfect for beginners and experienced gardeners alike.',
  },
  {
    id: '3',
    title: 'Local Music Festival',
    startsAt: '2024-02-20T16:00:00Z',
    location: 'Riverside Amphitheater',
    description: 'A day filled with local bands, food trucks, and community spirit. Bring your family and friends for an unforgettable musical experience.',
  },
  {
    id: '4',
    title: 'Book Club: Science Fiction Edition',
    startsAt: '2024-02-22T19:00:00Z',
    location: 'Central Library',
    description: 'Discuss the latest science fiction novels, share your thoughts on futuristic themes, and discover new authors in this genre.',
  },
];

export function EventsProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<EventLite[]>(initialEvents);

  const addEvent = (eventData: Omit<EventLite, 'id'>) => {
    const newEvent: EventLite = {
      ...eventData,
      id: Date.now().toString(), // Simple ID generation
    };
    setEvents(prev => [...prev, newEvent]);
  };

  return (
    <EventsContext.Provider value={{ events, addEvent }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
}
