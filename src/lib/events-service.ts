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
    };
  }

  // Get all events with pagination and timeout handling
  static async getEvents(limit: number = 100, offset: number = 0): Promise<EventLite[]> {
    console.log('Attempting to fetch events from Supabase...');
    console.log('Supabase client:', !!supabase);
    
    try {
      // Add timeout and pagination to prevent long-running queries
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('starts_at', { ascending: true })
        .range(offset, offset + limit - 1)
        .limit(limit);

      console.log('Fetch events response:', { 
        data: data ? `${data.length} events` : 'null', 
        error: error ? { message: error.message, code: error.code, details: error.details } : 'null',
        hasData: !!data,
        dataType: typeof data
      });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Failed to fetch events: ${error.message}`);
      }

      if (!data) {
        console.log('No data returned from events query');
        return [];
      }

      console.log(`Successfully fetched ${data.length} events`);
      
      // Debug: Check the first event's image data
      if (data.length > 0 && data[0].image_url) {
        const firstEvent = data[0];
        console.log('First event image_url length:', firstEvent.image_url?.length);
        console.log('First event image_url preview:', firstEvent.image_url?.substring(0, 100));
        console.log('First event image_url ends with:', firstEvent.image_url?.substring((firstEvent.image_url?.length || 0) - 100));
        console.log('First event image_url type:', typeof firstEvent.image_url);
        console.log('Is base64?', firstEvent.image_url?.startsWith('data:image/'));
        console.log('Is blob URL?', firstEvent.image_url?.startsWith('blob:'));
      }
      
      return data.map(this.mapRowToEvent);
    } catch (err) {
      console.error('Exception during events fetch:', err);
      console.error('Error type:', typeof err);
      console.error('Error constructor:', err?.constructor?.name);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
      }
      throw err;
    }
  }

  // Get total count of events (faster than counting all records)
  static async getEventsCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error getting events count:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('Exception getting events count:', err);
      return 0;
    }
  }

  // Get events with search and filtering
  static async getEventsWithFilters(filters: {
    searchQuery?: string;
    category?: string;
    dateRange?: string;
    location?: string;
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

      // Apply category filter (if you have categories in your events table)
      if (filters.category) {
        // Note: You'll need to add a category field to your events table
        // For now, we'll skip this filter
        console.log('Category filtering not yet implemented - add category field to events table');
      }

      // Apply location filter
      if (filters.location) {
        query = query.ilike('location', `%${filters.location}%`);
      }

      // Apply date range filter
      if (filters.dateRange) {
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (filters.dateRange) {
          case 'Today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            break;
          case 'Tomorrow':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
            break;
          case 'This Week':
            const dayOfWeek = now.getDay();
            const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysToMonday);
            endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case 'This Weekend':
            const daysToSaturday = (6 - now.getDay() + 7) % 7;
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysToSaturday);
            endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);
            break;
          case 'Next Week':
            const nextWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
            const dayOfWeekNext = nextWeekStart.getDay();
            const daysToMondayNext = dayOfWeekNext === 0 ? 6 : dayOfWeekNext - 1;
            startDate = new Date(nextWeekStart.getFullYear(), nextWeekStart.getMonth(), nextWeekStart.getDate() - daysToMondayNext);
            endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            break;
          case 'Next Month':
            startDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0);
            break;
          default:
            startDate = now;
            endDate = new Date(now.getFullYear() + 1, 11, 31); // End of next year
        }

        query = query
          .gte('starts_at', startDate.toISOString())
          .lte('starts_at', endDate.toISOString());
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
        case 'popularity':
          // Note: You'll need to add an RSVP count field or calculate it
          // For now, we'll sort by date
          query = query.order('starts_at', { ascending: true });
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
    try {
      // First, check if RSVP already exists
      const { data: existingRSVP } = await supabase
        .from('event_rsvps')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single();

      if (existingRSVP) {
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
      } else {
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
      }
    } catch (error) {
      console.error('RSVP operation failed:', error);
      throw new Error('Failed to process RSVP');
    }
  }

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

  static async getUserRSVPStatus(eventId: string, userId: string): Promise<{
    id: string;
    event_id: string;
    user_id: string;
    status: string;
    created_at: string;
  } | null> {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error fetching user RSVP status:', error);
      throw new Error('Failed to fetch user RSVP status');
    }

    return data || null;
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
