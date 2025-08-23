export interface EventLite {
  id: string;
  title: string;
  startsAt: string; // ISO string
  location?: string;
  description?: string;
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
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          starts_at: string;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          starts_at?: string;
          location?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
