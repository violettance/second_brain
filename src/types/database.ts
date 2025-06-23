export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      short_term_notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          tags: string[];
          note_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string;
          tags?: string[];
          note_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          tags?: string[];
          note_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      long_term_notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          tags: string[];
          note_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string;
          tags?: string[];
          note_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          tags?: string[];
          note_date?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export interface DailyNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags: string[];
  note_date: string;
  memory_type: 'short-term' | 'long-term';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}