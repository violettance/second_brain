export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      analytics_data: {
        Row: {
          created_at: string | null
          date_recorded: string | null
          id: string
          metric_name: string
          metric_value: Json
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metric_name: string
          metric_value: Json
          user_id: string
        }
        Update: {
          created_at?: string | null
          date_recorded?: string | null
          id?: string
          metric_name?: string
          metric_value?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_data_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_tags: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          tag_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_tags_tag_id_fkey"
            columns: ["tag_id"]
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entity_tags_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      long_term_notes: {
        Row: {
          content: string
          created_at: string | null
          generated_mermaid: string | null
          id: string
          importance_score: number | null
          note_date: string | null
          references: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string | null
          generated_mermaid?: string | null
          id?: string
          importance_score?: number | null
          note_date?: string | null
          references?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          generated_mermaid?: string | null
          id?: string
          importance_score?: number | null
          note_date?: string | null
          references?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      note_connections: {
        Row: {
          connection_type: string | null
          created_at: string | null
          from_note_id: string | null
          from_note_type: string | null
          id: string
          strength: number | null
          to_note_id: string | null
          to_note_type: string | null
          user_id: string
        }
        Insert: {
          connection_type?: string | null
          created_at?: string | null
          from_note_id?: string | null
          from_note_type?: string | null
          id?: string
          strength?: number | null
          to_note_id?: string | null
          to_note_type?: string | null
          user_id: string
        }
        Update: {
          connection_type?: string | null
          created_at?: string | null
          from_note_id?: string | null
          from_note_type?: string | null
          id?: string
          strength?: number | null
          to_note_id?: string | null
          to_note_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "note_connections_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          subscription_plan: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id: string
          name: string
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          subscription_plan?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          progress: number | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          progress?: number | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          progress?: number | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      short_term_notes: {
        Row: {
          archived_at: string | null
          content: string
          created_at: string | null
          generated_mermaid: string | null
          id: string
          note_date: string | null
          references: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          content?: string
          created_at?: string | null
          generated_mermaid?: string | null
          id?: string
          note_date?: string | null
          references?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archived_at?: string | null
          content?: string
          created_at?: string | null
          generated_mermaid?: string | null
          id?: string
          note_date?: string | null
          references?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          name: string
          task_id: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          name: string
          task_id: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          name?: string
          task_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          usage_count: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          usage_count?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          usage_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      task_relationships: {
        Row: {
          created_at: string
          id: string
          relationship_type: string
          source_task_id: string
          target_task_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          relationship_type?: string
          source_task_id: string
          target_task_id: string
        }
        Update: {
          created_at?: string
          id?: string
          relationship_type?: string
          source_task_id?: string
          target_task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_relationships_source_task_id_fkey"
            columns: ["source_task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_relationships_target_task_id_fkey"
            columns: ["target_task_id"]
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          column_index: number
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          name: string
          position_index: number
          priority: string | null
          project_id: string
          start_date: string | null
          status: string | null
          tags: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          column_index?: number
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name: string
          position_index?: number
          priority?: string | null
          project_id: string
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          column_index?: number
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          name?: string
          position_index?: number
          priority?: string | null
          project_id?: string
          start_date?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      archive_old_short_term_notes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      check_user_exists: {
        Args: {
          email_input: string
        }
        Returns: boolean
      }
      get_archive_rate: {
        Args: {
          p_user_id: string
        }
        Returns: {
          archived_count: number
          created_count: number
          date: string
        }[]
      }
      get_daily_note_counts: {
        Args: {
          p_start_date?: string
          p_user_id: string
        }
        Returns: {
          creation_date: string
          total_notes: number
        }[]
      }
      get_hourly_note_creation: {
        Args: {
          p_user_id: string
        }
        Returns: {
          hour: number
          note_count: number
        }[]
      }
      get_knowledge_graph: {
        Args: {
          user_id_param: string
        }
        Returns: Json
      }
      get_knowledge_graph_v2: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_knowledge_graph_v3: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_knowledge_growth: {
        Args: {
          p_user_id: string
        }
        Returns: {
          cumulative_notes: number
          date: string
        }[]
      }
      get_user_stats_v3: {
        Args: Record<PropertyKey, never>
        Returns: {
          active_topics: number
          connections: number
          growth_rate: number
          knowledge_score: number
          total_notes: number
        }[]
      }
      get_weekly_note_creation: {
        Args: {
          p_user_id: string
        }
        Returns: {
          day_of_week: number
          note_count: number
        }[]
      }
      refresh_analytics_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export interface Reference {
  id: string;
  type: 'book' | 'article' | 'website' | 'video' | 'personal' | 'other';
  raw_input: string;
  formatted: string;
  author?: string;
  title?: string;
  year?: string;
  publisher?: string;
  url?: string;
  created_at: string;
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
  references?: Reference[];
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  subscription_plan: string;
}