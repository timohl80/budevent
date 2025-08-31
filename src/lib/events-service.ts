import { supabase } from './supabase';
import { EventLite, Database, CreateEventData } from './types';
import { EmailService } from './email-service';

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
    // Check if user_id is null and log a warning
    if (!row.user_id) {
      console.warn('Event has no user_id assigned:', {
        eventId: row.id,
        title: row.title,
        user_id: row.user_id
      });
    }
    
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
      userId: row.user_id || '', // Convert null to empty string to prevent issues
      externalLink: row.external_link || undefined,
      externalLinkTitle: row.external_link_title || undefined,
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
      external_link_title: event.externalLinkTitle || null,
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
      
      // Get RSVP counts for all events
      const eventsWithCounts = await Promise.all(
        data.map(async (event) => {
          const rsvpCount = await this.getEventRSVPCount(event.id);
          const commentCount = await this.getEventCommentCount(event.id);
          
          return {
            ...this.mapRowToEvent(event),
            rsvpCount,
            commentCount,
          };
        })
      );
      
      return eventsWithCounts;
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

  // Get RSVP count for a specific event
  static async getEventRSVPCount(eventId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('event_rsvps')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId);

      if (error) {
        console.error('Error counting RSVPs:', error);
        return 0;
      }

      return count || 0;
    } catch (err) {
      console.error('Exception during RSVP count:', err);
      return 0;
    }
  }

  // Get RSVP counts by status for a specific event
  static async getEventRSVPCountsByStatus(eventId: string): Promise<{
    going: number;
    maybe: number;
    not_going: number;
    total: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select('status')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error counting RSVPs by status:', error);
        return { going: 0, maybe: 0, not_going: 0, total: 0 };
      }

      const counts = {
        going: 0,
        maybe: 0,
        not_going: 0,
        total: 0
      };

      data?.forEach(rsvp => {
        counts[rsvp.status as keyof typeof counts]++;
        counts.total++;
      });

      return counts;
    } catch (err) {
      console.error('Exception during RSVP status count:', err);
      return { going: 0, maybe: 0, not_going: 0, total: 0 };
    }
  }

  // Get comment count for a specific event
  static async getEventCommentCount(eventId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('event_comments')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
        .is('parent_id', null); // Only count top-level comments

      if (error) {
        console.error('Error counting comments:', error);
        return 0;
      }
      
      return count || 0;
    } catch (err) {
      console.error('Exception during comment count:', err);
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
      if (filters.searchQuery && filters.searchQuery.trim().length > 0) {
        const searchTerm = filters.searchQuery.toLowerCase().trim();
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
        case 'date':
        default: // 'date' - earliest first
          query = query.order('starts_at', { ascending: true });
          break;
      }

      console.log('Executing query with filters:', { searchQuery: filters.searchQuery, sortBy: filters.sortBy });
      const { data, error } = await query;

      if (error) {
        console.error('Supabase error fetching filtered events:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Database error: ${error.message || 'Failed to fetch filtered events'}`);
      }

      if (!data) {
        console.log('No data returned from filtered query');
        return [];
      }

      console.log(`Successfully fetched ${data.length} filtered events from database`);
      
      // Get RSVP counts for all events
      const eventsWithCounts = await Promise.all(
        data.map(async (event) => {
          try {
            const rsvpCount = await this.getEventRSVPCount(event.id);
            const commentCount = await this.getEventCommentCount(event.id);
            
            return {
              ...this.mapRowToEvent(event),
              rsvpCount,
              commentCount,
            };
          } catch (countError) {
            console.error(`Error getting counts for event ${event.id}:`, countError);
            // Return event with default counts on error
            return {
              ...this.mapRowToEvent(event),
              rsvpCount: 0,
              commentCount: 0,
            };
          }
        })
      );
      
      console.log(`Successfully processed ${eventsWithCounts.length} events with counts`);
      return eventsWithCounts;
    } catch (err) {
      console.error('Exception during filtered events fetch:', err);
      if (err instanceof Error) {
        throw new Error(`Filtered events fetch failed: ${err.message}`);
      } else {
        throw new Error('Unknown error during filtered events fetch');
      }
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
  static async updateEvent(id: string, updates: Partial<Omit<EventLite, 'id'>>, userToken?: string): Promise<EventLite> {
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

    console.log('Updating event with data:', { id, updateData, hasUserToken: !!userToken });

    // Create a Supabase client with the user's token if provided
    let supabaseClient = supabase;
    if (userToken) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: {
            Authorization: `Bearer ${userToken}`
          }
        }
      });
    }

    const { data, error } = await supabaseClient
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Provide more specific error messages based on error codes
      if (error.code === '42501') {
        throw new Error('Permission denied - check RLS policies or user authentication');
      } else if (error.code === '23503') {
        throw new Error('Cannot update event - check foreign key constraints');
      } else if (error.code === '42P01') {
        throw new Error('Table does not exist - check database setup');
      } else if (error.code === '23502') {
        throw new Error('Required field missing - check your input data');
      }
      
      throw new Error(`Failed to update event: ${error.message || 'Unknown database error'}`);
    }

    console.log('Event updated successfully:', data);
    return this.mapRowToEvent(data);
  }

  // Delete an event
  static async deleteEvent(id: string): Promise<void> {
    console.log('Attempting to delete event:', id);
    
    try {
      // First, verify the event exists
      const { data: existingEvent, error: fetchError } = await supabase
        .from('events')
        .select('id, title')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching event for deletion:', fetchError);
        throw new Error(`Event not found: ${fetchError.message}`);
      }

      if (!existingEvent) {
        throw new Error('Event not found');
      }

      console.log('Found event to delete:', existingEvent.title);

      // Delete the event
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('Error deleting event:', deleteError);
        console.error('Delete error details:', {
          code: deleteError.code,
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint
        });
        
        // Provide more specific error messages based on error codes
        if (deleteError.code === '42501') {
          throw new Error('Permission denied - check RLS policies or user authentication');
        } else if (deleteError.code === '23503') {
          throw new Error('Cannot delete event - it has associated RSVPs or comments');
        } else if (deleteError.code === '42P01') {
          throw new Error('Table does not exist - check database setup');
        }
        
        throw new Error(`Failed to delete event: ${deleteError.message || 'Unknown error'}`);
      }

      console.log('Event deleted successfully:', id);
      
      // Verify deletion by trying to fetch the event again
      const { data: verifyEvent, error: verifyError } = await supabase
        .from('events')
        .select('id')
        .eq('id', id)
        .single();

      if (verifyEvent) {
        console.warn('Event still exists after deletion attempt:', id);
        throw new Error('Event deletion failed - event still exists');
      }

      if (verifyError && verifyError.code === 'PGRST116') {
        // PGRST116 means no rows returned, which is expected after deletion
        console.log('Event deletion verified successfully');
      } else if (verifyError) {
        console.warn('Unexpected error during deletion verification:', verifyError);
      }

    } catch (err) {
      console.error('Exception during event deletion:', err);
      throw err;
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
        
        // Send confirmation email for new RSVPs
        try {
          console.log('Attempting to send RSVP confirmation email for user:', userId);
          await this.sendRSVPEmail(eventId, userId, status);
        } catch (emailError) {
          console.error('Failed to send RSVP confirmation email:', emailError);
          // Don't fail the RSVP if email fails
        }
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

  // Send RSVP confirmation email
  private static async sendRSVPEmail(eventId: string, userId: string, status: 'going' | 'maybe' | 'not_going'): Promise<void> {
    try {
      // Get event details
      const { data: event } = await supabase
        .from('events')
        .select('title, description, starts_at, location, user_id')
        .eq('id', eventId)
        .single();

      if (!event) {
        console.error('Event not found for email:', eventId);
        return;
      }

      // Get user details
      console.log('Looking up user details for ID:', userId);
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error looking up user:', userError);
        return;
      }

      if (!user) {
        console.error('User not found for email:', userId);
        return;
      }
      
      console.log('User found for email:', { name: user.name, email: user.email });

      // Get organizer details
      let organizerName = 'Event Organizer';
      let organizerEmail = 'noreply@budevent.se';
      
      if (event.user_id) {
        const { data: organizer } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', event.user_id)
          .single();
        
        if (organizer) {
          organizerName = organizer.name || 'Event Organizer';
          organizerEmail = organizer.email || 'noreply@budevent.se';
        }
      }

      // Format event date and time
      const eventDate = new Date(event.starts_at);
      const formattedDate = eventDate.toLocaleDateString('sv-SE', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = eventDate.toLocaleTimeString('sv-SE', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });

      // Prepare email data
      const emailData = {
        eventName: event.title,
        eventDate: formattedDate,
        eventTime: formattedTime,
        eventLocation: event.location || undefined,
        eventDescription: event.description || undefined,
        userName: user.name || 'User',
        userEmail: user.email,
        eventId: eventId,
        eventStartISO: event.starts_at,
        organizerName,
        organizerEmail
      };

      // Send email
      const emailSent = await EmailService.sendRSVPConfirmation(emailData);
      if (emailSent) {
        console.log('RSVP confirmation email sent successfully');
      } else {
        console.error('Failed to send RSVP confirmation email');
      }
    } catch (error) {
      console.error('Error in sendRSVPEmail:', error);
    }
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

  // Get a single event by ID
  static async getEventById(id: string): Promise<EventLite | null> {
    try {
      console.log('getEventById called with ID:', id);
      console.log('Supabase client available:', !!supabase);
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      console.log('Supabase response:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          // No event found
          console.log('No event found with ID:', id);
          return null;
        }
        console.error('Error fetching event by ID:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error('Failed to fetch event');
      }

      if (!data) {
        console.log('No data returned from Supabase');
        return null;
      }

      console.log('Raw event data from database:', data);
      
      // Get RSVP and comment counts
      const rsvpCount = await this.getEventRSVPCount(data.id);
      const commentCount = await this.getEventCommentCount(data.id);
      
      const mappedEvent = {
        ...this.mapRowToEvent(data),
        rsvpCount,
        commentCount,
      };
      
      console.log('Mapped event with counts:', mappedEvent);
      
      return mappedEvent;
    } catch (err) {
      console.error('Exception during event fetch by ID:', err);
      throw err;
    }
  }

  // Get all RSVPs for a specific user
  static async getUserRSVPs(userId: string): Promise<Array<{
    id: string;
    eventId: string;
    userId: string;
    status: 'going' | 'maybe' | 'not_going';
    createdAt: string;
    event?: EventLite;
  }>> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          event:event_id(
            id,
            title,
            description,
            starts_at,
            location,
            image_url,
            capacity,
            is_public,
            status,
            user_id,
            external_link
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user RSVPs:', error);
        throw new Error('Failed to fetch user RSVPs');
      }

      console.log('Raw RSVP data from database:', data);

      // Transform the data to match EventRSVP interface
      const transformedRSVPs = (data || []).map(rsvp => ({
        id: rsvp.id,
        eventId: rsvp.event_id,
        userId: rsvp.user_id,
        status: rsvp.status as 'going' | 'maybe' | 'not_going',
        createdAt: rsvp.created_at,
        event: rsvp.event ? {
          id: rsvp.event.id,
          title: rsvp.event.title,
          description: rsvp.event.description,
          startsAt: rsvp.event.starts_at,
          location: rsvp.event.location,
          imageUrl: rsvp.event.image_url,
          capacity: rsvp.event.capacity,
          isPublic: rsvp.event.is_public,
          status: rsvp.event.status as 'active' | 'cancelled' | 'completed',
          rsvpCount: 0,
          commentCount: 0,
          userId: rsvp.event.user_id || '',
          externalLink: rsvp.event.external_link || undefined
        } : undefined
      }));

      console.log('Transformed RSVPs:', transformedRSVPs);
      return transformedRSVPs;
    } catch (err) {
      console.error('Exception during user RSVPs fetch:', err);
      throw err;
    }
  }
}
