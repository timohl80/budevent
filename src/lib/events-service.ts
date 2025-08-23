import { supabase } from './supabase';
import { EventLite, Database } from './types';

type EventRow = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];

export class EventsService {
  // Convert database row to EventLite
  private static mapRowToEvent(row: EventRow): EventLite {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      startsAt: row.starts_at,
      location: row.location || undefined,
    };
  }

  // Convert EventLite to database insert format
  private static mapEventToInsert(event: Omit<EventLite, 'id'>): EventInsert {
    return {
      title: event.title,
      description: event.description || null,
      starts_at: event.startsAt,
      location: event.location || null,
    };
  }

  // Get all events
  static async getEvents(): Promise<EventLite[]> {
    console.log('Attempting to fetch events from Supabase...');
    
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: true });

      console.log('Fetch events response:', { data, error });

      if (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to fetch events');
      }

      if (!data) {
        console.log('No data returned from events query');
        return [];
      }

      console.log(`Successfully fetched ${data.length} events`);
      return data.map(this.mapRowToEvent);
    } catch (err) {
      console.error('Exception during events fetch:', err);
      throw err;
    }
  }

  // Create a new event
  static async createEvent(event: Omit<EventLite, 'id'>): Promise<EventLite> {
    const insertData = this.mapEventToInsert(event);
    
    console.log('Attempting to insert event data:', insertData);
    console.log('Supabase client:', !!supabase);
    console.log('Table name: events');

    try {
      const { data, error } = await supabase
        .from('events')
        .insert(insertData)
        .select()
        .single();

      console.log('Raw Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        });
        throw new Error(`Failed to create event: ${error.message || 'Unknown error'}`);
      }

      if (!data) {
        console.error('No data returned from insert');
        throw new Error('No data returned from insert operation');
      }

      console.log('Event created successfully:', data);
      return this.mapRowToEvent(data);
    } catch (err) {
      console.error('Exception during event creation:', err);
      throw err;
    }
  }

  // Update an event
  static async updateEvent(id: string, updates: Partial<Omit<EventLite, 'id'>>): Promise<EventLite> {
    const updateData: Partial<EventInsert> = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description || null;
    if (updates.startsAt !== undefined) updateData.starts_at = updates.startsAt;
    if (updates.location !== undefined) updateData.location = updates.location || null;

    const { data, error } = await supabase
      .from('events')
      .select()
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }

    return this.mapRowToEvent(data);
  }

  // Delete an event
  static async deleteEvent(id: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }
}
