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
          subscription_plan: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          subscription_plan?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          subscription_plan?: string;
        };
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          status: string;
          color: string;
          progress: number;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          status?: string;
          color?: string;
          progress?: number;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          color?: string;
          progress?: number;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          name: string;
          description: string | null;
          status: string;
          priority: string;
          tags: string[] | null;
          start_date: string | null;
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
          column_index: number;
          position_index: number;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          name: string;
          description?: string | null;
          status?: string;
          priority?: string;
          tags?: string[] | null;
          start_date?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          column_index?: number;
          position_index?: number;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          tags?: string[] | null;
          start_date?: string | null;
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
          column_index?: number;
          position_index?: number;
        };
      };
      subtasks: {
        Row: {
          id: string;
          task_id: string;
          name: string;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          name: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string;
          name?: string;
          completed?: boolean;
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
          archived_at: string | null;
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
          archived_at?: string | null;
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
          archived_at?: string | null;
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
          importance_score: number;
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
          importance_score?: number;
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
          importance_score?: number;
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
  archived_at?: string | null;
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