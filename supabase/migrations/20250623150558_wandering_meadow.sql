/*
  # Complete Database Schema for Second Brain Knowledge Management System

  1. New Tables
    - `profiles` - User profiles with subscription plans
    - `short_term_notes` - Temporary notes (30-day lifecycle)
    - `long_term_notes` - Permanent knowledge base
    - `projects` - Knowledge domains and project management
    - `tasks` - Project tasks with status tracking
    - `subtasks` - Task breakdown structure
    - `tags` - Centralized tag management with usage tracking
    - `note_connections` - Semantic relationships between notes
    - `analytics_data` - User analytics and insights
    - `user_settings` - Personalized user preferences
    - `knowledge_graph_nodes` - Graph visualization nodes
    - `knowledge_graph_edges` - Graph visualization connections

  2. Security
    - Enable RLS on all tables
    - User-specific policies for data isolation
    - Secure foreign key relationships

  3. Performance
    - Strategic indexes for fast queries
    - GIN indexes for array operations
    - Composite indexes for complex queries

  4. Automation
    - Auto-update timestamps
    - Tag usage count tracking
    - Short-term note archiving
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Enable profile creation for service role" ON profiles;
  
  DROP POLICY IF EXISTS "Users can read own short term notes" ON short_term_notes;
  DROP POLICY IF EXISTS "Users can insert own short term notes" ON short_term_notes;
  DROP POLICY IF EXISTS "Users can update own short term notes" ON short_term_notes;
  DROP POLICY IF EXISTS "Users can delete own short term notes" ON short_term_notes;
  DROP POLICY IF EXISTS "Users can manage own short term notes" ON short_term_notes;
  
  DROP POLICY IF EXISTS "Users can read own long term notes" ON long_term_notes;
  DROP POLICY IF EXISTS "Users can insert own long term notes" ON long_term_notes;
  DROP POLICY IF EXISTS "Users can update own long term notes" ON long_term_notes;
  DROP POLICY IF EXISTS "Users can delete own long term notes" ON long_term_notes;
  DROP POLICY IF EXISTS "Users can manage own long term notes" ON long_term_notes;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  avatar_url text,
  subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add subscription_plan column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan text DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'enterprise'));
  END IF;
END $$;

-- Short term notes (temporary, auto-archive after 30 days)
CREATE TABLE IF NOT EXISTS short_term_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  tags text[] DEFAULT '{}',
  note_date date DEFAULT CURRENT_DATE,
  archived_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add archived_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'short_term_notes' AND column_name = 'archived_at'
  ) THEN
    ALTER TABLE short_term_notes ADD COLUMN archived_at timestamptz;
  END IF;
END $$;

-- Long term notes (permanent knowledge base)
CREATE TABLE IF NOT EXISTS long_term_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  tags text[] DEFAULT '{}',
  note_date date DEFAULT CURRENT_DATE,
  importance_score integer DEFAULT 1 CHECK (importance_score BETWEEN 1 AND 10),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add importance_score column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'long_term_notes' AND column_name = 'importance_score'
  ) THEN
    ALTER TABLE long_term_notes ADD COLUMN importance_score integer DEFAULT 1 CHECK (importance_score BETWEEN 1 AND 10);
  END IF;
END $$;

-- Projects (knowledge domains)
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'in_progress', 'completed', 'on_hold', 'archived')),
  color text DEFAULT '#C2B5FC',
  progress integer DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to projects if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'description'
  ) THEN
    ALTER TABLE projects ADD COLUMN description text DEFAULT '';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'color'
  ) THEN
    ALTER TABLE projects ADD COLUMN color text DEFAULT '#C2B5FC';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'progress'
  ) THEN
    ALTER TABLE projects ADD COLUMN progress integer DEFAULT 0 CHECK (progress BETWEEN 0 AND 100);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'due_date'
  ) THEN
    ALTER TABLE projects ADD COLUMN due_date date;
  END IF;
END $$;

-- Tasks (project tasks with subtasks)
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  tags text[] DEFAULT '{}',
  start_date date,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Subtasks
CREATE TABLE IF NOT EXISTS subtasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  name text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tags (centralized tag management)
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text DEFAULT '#C2B5FC',
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name)
);

-- Note connections (relationships between notes)
CREATE TABLE IF NOT EXISTS note_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_note_id uuid,
  to_note_id uuid,
  from_note_type text CHECK (from_note_type IN ('short_term', 'long_term')),
  to_note_type text CHECK (to_note_type IN ('short_term', 'long_term')),
  connection_type text DEFAULT 'semantic' CHECK (connection_type IN ('semantic', 'temporal', 'categorical', 'causal')),
  strength decimal(3,2) DEFAULT 0.5 CHECK (strength BETWEEN 0 AND 1),
  created_at timestamptz DEFAULT now(),
  UNIQUE(from_note_id, to_note_id, from_note_type, to_note_type)
);

-- Analytics data
CREATE TABLE IF NOT EXISTS analytics_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  metric_name text NOT NULL,
  metric_value jsonb NOT NULL,
  date_recorded date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, metric_name, date_recorded)
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, setting_key)
);

-- Knowledge graph nodes
CREATE TABLE IF NOT EXISTS knowledge_graph_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  node_id text NOT NULL,
  label text NOT NULL,
  node_type text CHECK (node_type IN ('note', 'tag', 'concept', 'project')),
  size integer DEFAULT 10,
  color text DEFAULT '#C2B5FC',
  position_x decimal(5,2),
  position_y decimal(5,2),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, node_id)
);

-- Knowledge graph edges
CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  from_node_id text NOT NULL,
  to_node_id text NOT NULL,
  edge_type text DEFAULT 'semantic' CHECK (edge_type IN ('semantic', 'temporal', 'categorical')),
  strength decimal(3,2) DEFAULT 0.5 CHECK (strength BETWEEN 0 AND 1),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, from_node_id, to_node_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE short_term_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE long_term_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_graph_edges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- Short term notes policies
CREATE POLICY "short_term_notes_all_own" ON short_term_notes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Long term notes policies
CREATE POLICY "long_term_notes_all_own" ON long_term_notes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "projects_all_own" ON projects
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tasks policies
CREATE POLICY "tasks_all_own" ON tasks
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subtasks policies
CREATE POLICY "subtasks_all_own" ON subtasks
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks 
      WHERE tasks.id = subtasks.task_id 
      AND tasks.user_id = auth.uid()
    )
  );

-- Tags policies
CREATE POLICY "tags_all_own" ON tags
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Note connections policies
CREATE POLICY "note_connections_all_own" ON note_connections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Analytics data policies
CREATE POLICY "analytics_data_all_own" ON analytics_data
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User settings policies
CREATE POLICY "user_settings_all_own" ON user_settings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Knowledge graph nodes policies
CREATE POLICY "knowledge_graph_nodes_all_own" ON knowledge_graph_nodes
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Knowledge graph edges policies
CREATE POLICY "knowledge_graph_edges_all_own" ON knowledge_graph_edges
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS short_term_notes_user_id_idx ON short_term_notes(user_id);
CREATE INDEX IF NOT EXISTS short_term_notes_created_at_idx ON short_term_notes(created_at);
CREATE INDEX IF NOT EXISTS short_term_notes_note_date_idx ON short_term_notes(note_date);
CREATE INDEX IF NOT EXISTS short_term_notes_tags_idx ON short_term_notes USING GIN(tags);

CREATE INDEX IF NOT EXISTS long_term_notes_user_id_idx ON long_term_notes(user_id);
CREATE INDEX IF NOT EXISTS long_term_notes_created_at_idx ON long_term_notes(created_at);
CREATE INDEX IF NOT EXISTS long_term_notes_note_date_idx ON long_term_notes(note_date);
CREATE INDEX IF NOT EXISTS long_term_notes_tags_idx ON long_term_notes USING GIN(tags);

-- Only create importance index if column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'long_term_notes' AND column_name = 'importance_score'
  ) THEN
    CREATE INDEX IF NOT EXISTS long_term_notes_importance_idx ON long_term_notes(importance_score);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON projects(status);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects(created_at);

CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);
CREATE INDEX IF NOT EXISTS tasks_due_date_idx ON tasks(due_date);

CREATE INDEX IF NOT EXISTS subtasks_task_id_idx ON subtasks(task_id);

CREATE INDEX IF NOT EXISTS tags_user_id_idx ON tags(user_id);
CREATE INDEX IF NOT EXISTS tags_usage_count_idx ON tags(usage_count);

CREATE INDEX IF NOT EXISTS note_connections_user_id_idx ON note_connections(user_id);
CREATE INDEX IF NOT EXISTS note_connections_from_note_idx ON note_connections(from_note_id, from_note_type);
CREATE INDEX IF NOT EXISTS note_connections_to_note_idx ON note_connections(to_note_id, to_note_type);

CREATE INDEX IF NOT EXISTS analytics_data_user_id_idx ON analytics_data(user_id);
CREATE INDEX IF NOT EXISTS analytics_data_date_idx ON analytics_data(date_recorded);
CREATE INDEX IF NOT EXISTS analytics_data_metric_idx ON analytics_data(metric_name);

CREATE INDEX IF NOT EXISTS user_settings_user_id_idx ON user_settings(user_id);

CREATE INDEX IF NOT EXISTS knowledge_graph_nodes_user_id_idx ON knowledge_graph_nodes(user_id);
CREATE INDEX IF NOT EXISTS knowledge_graph_edges_user_id_idx ON knowledge_graph_edges(user_id);

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers to avoid conflicts
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS short_term_notes_updated_at ON short_term_notes;
DROP TRIGGER IF EXISTS long_term_notes_updated_at ON long_term_notes;
DROP TRIGGER IF EXISTS projects_updated_at ON projects;
DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS subtasks_updated_at ON subtasks;
DROP TRIGGER IF EXISTS tags_updated_at ON tags;
DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS knowledge_graph_nodes_updated_at ON knowledge_graph_nodes;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER short_term_notes_updated_at
  BEFORE UPDATE ON short_term_notes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER long_term_notes_updated_at
  BEFORE UPDATE ON long_term_notes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER subtasks_updated_at
  BEFORE UPDATE ON subtasks
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER tags_updated_at
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER knowledge_graph_nodes_updated_at
  BEFORE UPDATE ON knowledge_graph_nodes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to auto-archive old short-term notes
CREATE OR REPLACE FUNCTION archive_old_short_term_notes()
RETURNS void AS $$
BEGIN
  UPDATE short_term_notes 
  SET archived_at = now()
  WHERE created_at < (now() - INTERVAL '30 days')
    AND archived_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update tag usage counts
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Update usage counts for tags in short_term_notes and long_term_notes
  WITH tag_counts AS (
    SELECT unnest(tags) as tag_name, COUNT(*) as usage_count
    FROM (
      SELECT tags FROM short_term_notes WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
      UNION ALL
      SELECT tags FROM long_term_notes WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    ) combined_notes
    GROUP BY unnest(tags)
  )
  UPDATE tags 
  SET usage_count = COALESCE(tag_counts.usage_count, 0)
  FROM tag_counts
  WHERE tags.name = tag_counts.tag_name 
    AND tags.user_id = COALESCE(NEW.user_id, OLD.user_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Drop existing tag usage triggers to avoid conflicts
DROP TRIGGER IF EXISTS update_tag_usage_on_short_term_notes ON short_term_notes;
DROP TRIGGER IF EXISTS update_tag_usage_on_long_term_notes ON long_term_notes;

-- Triggers for tag usage count updates
CREATE TRIGGER update_tag_usage_on_short_term_notes
  AFTER INSERT OR UPDATE OR DELETE ON short_term_notes
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();

CREATE TRIGGER update_tag_usage_on_long_term_notes
  AFTER INSERT OR UPDATE OR DELETE ON long_term_notes
  FOR EACH ROW EXECUTE FUNCTION update_tag_usage_count();