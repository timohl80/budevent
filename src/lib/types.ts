export interface EventLite {
  id: string;
  title: string;
  startsAt: string; // ISO string
  endsAt?: string; // ISO string for end time
  location?: string;
  description?: string;
  imageUrl?: string;
  capacity?: number;
  isPublic: boolean;
  status: 'active' | 'cancelled' | 'completed';
  rsvpCount?: number;
  commentCount?: number;
  userId: string;
  organizerName?: string;
  organizerEmail?: string;
  externalLink?: string; // URL to external event page
  externalLinkTitle?: string; // Custom title for external link
  createdAt?: string; // ISO string for when the event was created
  updatedAt?: string; // ISO string for when the event was last updated
}

// Type for creating events (without id and userId)
export interface CreateEventData {
  title: string;
  startsAt: string;
  location?: string;
  description?: string;
  imageUrl?: string;
  capacity?: number;
  isPublic: boolean;
  status: 'active' | 'cancelled' | 'completed';
  externalLink?: string; // URL to external event page
  externalLinkTitle?: string; // Custom title for external link
}

export interface EventRSVP {
  id: string;
  eventId: string;
  userId: string;
  status: 'going' | 'maybe' | 'not_going';
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  event?: EventLite; // Optional event data when fetched with joins
}

export interface EventComment {
  id: string;
  eventId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  replies?: EventComment[];
}

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          starts_at: string;
          location: string | null;
          user_id: string;
          image_url: string | null;
          capacity: number | null;
          is_public: boolean;
          status: string;
          external_link: string | null;
          external_link_title: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          starts_at: string;
          location?: string | null;
          user_id: string;
          image_url?: string | null;
          capacity?: number | null;
          is_public?: boolean;
          status?: string;
          external_link?: string | null;
          external_link_title?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          external_link_title?: string | null;
          description?: string | null;
          starts_at?: string;
          location?: string | null;
          user_id?: string;
          image_url?: string | null;
          capacity?: number | null;
          is_public?: boolean;
          status?: string;
          external_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_rsvps: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      event_comments: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
