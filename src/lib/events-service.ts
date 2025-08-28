import { supabase } from './supabase';
import { EventLite, Database, CreateEventData } from './types';

type EventRow = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];

export class EventsService {
  // Test Supabase connection
  static async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Supabase connection...');
      const { error } = await supabase.from('events').select('count').limit(1);
      
      if (error) {
        console.error('Connection test failed:', error);
        return false;
      }
      
      console.log('Connection test successful');
      return true;
    } catch (err) {
      console.error('Connection test error:', err);
      return false;
    }
  }

  // Convert database row to EventLite
  private static mapRowToEvent(row: EventRow): EventLite {
    return {
      id: row.id,
      title: row.title,
      description: row.description || undefined,
      startsAt: row.starts_at,
      location: row.location || undefined,
      imageUrl: row.image_url || undefined,
      capacity: row.capacity || undefined,
      isPublic: row.is_public,
      status: row.status as 'active' | 'cancelled' | 'completed',
      rsvpCount: 0, // Will be computed separately
      commentCount: 0, // Will be computed separately
      userId: row.user_id,
      externalLink: row.external_link || undefined,
    };
  }

  // Convert CreateEventData to database insert format
  private static mapEventToInsert(event: CreateEventData): Omit<EventInsert, 'user_id'> {
    return {
      title: event.title,
      description: event.description || null,
      starts_at: event.startsAt,
      location: event.location || null,
      image_url: event.imageUrl || null,
      capacity: event.capacity || null,
      is_public: event.isPublic ?? true,
      status: event.status || 'active',
      external_link: event.externalLink || null,
    };
  }

  // Get events with pagination and limits to prevent timeouts
  static async getEvents(limit: number = 20, offset: number = 0): Promise<EventLite[]> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching events:', error);
        throw new Error('Failed to fetch events');
      }

      if (!data) {
        return [];
      }

      console.log(`Successfully fetched ${data.length} events (limit: ${limit}, offset: ${offset})`);
      return data.map(this.mapRowToEvent);
    } catch (err) {
      console.error('Exception during events fetch:', err);
      throw err;
    }
  }

  // Get total count of events for pagination
  static async getEventsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error counting events:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('Exception during events count:', err);
      return 0;
    }
  }

  // Get events with search and filtering
  static async getEventsWithFilters(filters: {
    searchQuery?: string;
    sortBy?: string;
  }): Promise<EventLite[]> {
    console.log('Fetching events with filters:', filters);
    
    try {
      let query = supabase
        .from('events')
        .select('*');

      // Apply search filter
      if (filters.searchQuery) {
        const searchTerm = filters.searchQuery.toLowerCase();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'date-desc':
          query = query.order('starts_at', { ascending: false });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'location':
          query = query.order('location', { ascending: true });
          break;
        default: // 'date' - earliest first
          query = query.order('starts_at', { ascending: true });
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching filtered events:', error);
        throw new Error('Failed to fetch filtered events');
      }

      if (!data) {
        return [];
      }

      console.log(`Successfully fetched ${data.length} filtered events`);
      return data.map(this.mapRowToEvent);
    } catch (err) {
      console.error('Exception during filtered events fetch:', err);
      throw err;
    }
  }

  // Create a new event
  static async createEvent(event: CreateEventData, userId: string): Promise<EventLite> {
    // Validate user ID format
    if (!userId || typeof userId !== 'string') {
      throw new Error(`Invalid user ID: ${userId}`);
    }
    
    console.log('User ID validation passed:', { userId, type: typeof userId, length: userId.length });
    
    const insertData = {
      ...this.mapEventToInsert(event),
      user_id: userId
    };
    
    console.log('Attempting to insert event data:', insertData);
    console.log('Supabase client:', !!supabase);
    console.log('Table name: events');
    console.log('User ID being used:', userId);

    // First, let's test the connection and check table structure
    console.log('Testing Supabase connection and table access...');
    try {
      // Test basic table access
      const { data: testData, error: testError } = await supabase
        .from('events')
        .select('id, title, user_id')
        .limit(1);
      
      if (testError) {
        console.error('Table access test failed:', testError);
        throw new Error(`Cannot access events table: ${testError.message}`);
      }
      
      console.log('Table access successful, test query result:', testData);
      
      // Check if user_id column exists by looking at the data structure
      if (testData && testData.length > 0) {
        const firstRow = testData[0];
        console.log('First row structure:', Object.keys(firstRow));
        console.log('User ID column exists:', 'user_id' in firstRow);
      }
    } catch (testErr) {
      console.error('Exception during table access test:', testErr);
      throw testErr;
    }

    try {
          console.log('Attempting to insert event...');
    console.log('Final insert data:', JSON.stringify(insertData, null, 2));
    
    const { data, error } = await supabase
      .from('events')
      .insert(insertData)
      .select()
      .single();

      console.log('Raw Supabase response:', { data, error });
      console.log('Error object type:', typeof error);
      console.log('Error object keys:', error ? Object.keys(error) : 'No error object');
      console.log('Full error object:', error);

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: JSON.stringify(error, null, 2)
        });
        
        // Provide more specific error messages based on error codes
        if (error.code === '42501') {
          throw new Error('Permission denied - check RLS policies or user authentication');
        } else if (error.code === '23505') {
          throw new Error('Duplicate event - this event already exists');
        } else if (error.code === '23502') {
          throw new Error('Missing required field - check all required fields are provided');
        } else if (error.code === '23503') {
          throw new Error('Foreign key constraint failed - check if user exists');
        } else if (error.code === '42P01') {
          throw new Error('Table does not exist - check database setup');
        }
        
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
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl || null;
    if (updates.capacity !== undefined) updateData.capacity = updates.capacity || null;
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.externalLink !== undefined) updateData.external_link = updates.externalLink || null;

    console.log('Updating event with data:', { id, updateData });

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }

    console.log('Event updated successfully:', data);
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

  // RSVP functionality
  static async rsvpToEvent(eventId: string, userId: string, status: 'going' | 'maybe' | 'not_going'): Promise<void> {
    console.log('rsvpToEvent called with:', { eventId, userId, status });
    
    try {
      // First, check if RSVP already exists
      const { data: existingRSVP } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existingRSVP) {
        console.log('Updating existing RSVP:', existingRSVP.id);
        // Update existing RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .update({
            status,
            updated_at: new Date().toISOString()
          })
          .eq('event_id', eventId)
          .eq('user_id', userId);

        if (error) {
          console.error('Error updating existing RSVP:', error);
          throw new Error('Failed to update RSVP');
        }
        console.log('RSVP updated successfully');
      } else {
        console.log('Creating new RSVP for user:', userId);
        // Create new RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .insert({
            event_id: eventId,
            user_id: userId,
            status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating new RSVP:', error);
          throw new Error('Failed to create RSVP');
        }
        console.log('New RSVP created successfully');
      }
    } catch (error) {
      console.error('RSVP operation failed:', error);
      throw new Error('Failed to process RSVP');
    }
  }

  // Get all RSVPs for a specific event
  static async getEventRSVPs(eventId: string): Promise<Array<{
    id: string;
    event_id: string;
    user_id: string;
    status: string;
    created_at: string;
    users?: { id: string; name: string; email: string };
  }>> {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select(`
        *,
        users:user_id(id, name, email)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RSVPs:', error);
      throw new Error('Failed to fetch RSVPs');
    }

    return data || [];
  }

  // Get RSVP status for a specific user and event
  static async getUserRSVPStatus(eventId: string, userId: string): Promise<{
    id: string;
    event_id: string;
    user_id: string;
    status: string;
    created_at: string;
  } | null> {
    console.log('getUserRSVPStatus called with:', { eventId, userId });
    
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No RSVP found
        console.log('No RSVP found for user:', userId);
        return null;
      }
      console.error('Error fetching user RSVP status:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw new Error(`Failed to fetch user RSVP status: ${error.message}`);
    }

    console.log('RSVP status found:', data);
    return data;
  }

  // Comments functionality
  static async addComment(eventId: string, userId: string, content: string, parentId?: string): Promise<void> {
    const { error } = await supabase
      .from('event_comments')
      .insert({
        event_id: eventId,
        user_id: userId,
        content,
        parent_id: parentId || null
      });

    if (error) {
      console.error('Error adding comment:', error);
      throw new Error('Failed to add comment');
    }
  }

  static async getEventComments(eventId: string): Promise<Array<{
    id: string;
    event_id: string;
    user_id: string;
    content: string;
    created_at: string;
    parent_id?: string;
    users?: { id: string; name: string; email: string };
  }>> {
    const { data, error } = await supabase
      .from('event_comments')
      .select(`
        *,
        users:user_id(id, name, email)
      `)
      .eq('event_id', eventId)
      .is('parent_id', null) // Only top-level comments
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      throw new Error('Failed to fetch comments');
    }

    return data || [];
  }

  static async getCommentReplies(commentId: string): Promise<Array<{
    id: string;
    event_id: string;
    user_id: string;
    content: string;
    created_at: string;
    parent_id: string;
    users?: { id: string; name: string; email: string };
  }>> {
    const { data, error } = await supabase
      .from('event_comments')
      .select(`
        *,
        users:user_id(id, name, email)
      `)
      .eq('parent_id', commentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comment replies:', error);
      throw new Error('Failed to fetch comment replies');
    }

    return data || [];
  }
}
