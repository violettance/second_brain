-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for profiles
CREATE POLICY "Users can view and update their own profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);

-- Create short_term_notes table
CREATE TABLE IF NOT EXISTS public.short_term_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Temporarily disable RLS for development with demo auth
-- ALTER TABLE public.short_term_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for short_term_notes (disabled for now)
-- CREATE POLICY "Users can CRUD their own short-term notes" ON public.short_term_notes
--   FOR ALL USING (auth.uid() = user_id);

-- Create long_term_notes table
CREATE TABLE IF NOT EXISTS public.long_term_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  note_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Temporarily disable RLS for development with demo auth  
-- ALTER TABLE public.long_term_notes ENABLE ROW LEVEL SECURITY;

-- Create policy for long_term_notes (disabled for now)
-- CREATE POLICY "Users can CRUD their own long-term notes" ON public.long_term_notes
--   FOR ALL USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_short_term_notes_updated_at
BEFORE UPDATE ON public.short_term_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_long_term_notes_updated_at
BEFORE UPDATE ON public.long_term_notes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS short_term_notes_user_id_idx ON public.short_term_notes (user_id);
CREATE INDEX IF NOT EXISTS short_term_notes_note_date_idx ON public.short_term_notes (note_date);
CREATE INDEX IF NOT EXISTS long_term_notes_user_id_idx ON public.long_term_notes (user_id);
CREATE INDEX IF NOT EXISTS long_term_notes_note_date_idx ON public.long_term_notes (note_date);

-- Insert demo profile for testing (required for foreign key)
INSERT INTO public.profiles (id, name, email, avatar_url)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Knowledge Seeker', 'demo@secondbrain.com', null)
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for testing
INSERT INTO public.short_term_notes (user_id, title, content, tags, note_date)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'Daily Reflection', 'Today I learned about the importance of building a second brain. The concept of connecting ideas and creating a knowledge network is fascinating.', ARRAY['reflection', 'learning', 'knowledge'], CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440000', 'Meeting Notes - Team Sync', 'Discussed project roadmap and upcoming features. Need to focus on user experience improvements.', ARRAY['meeting', 'team', 'roadmap'], CURRENT_DATE - INTERVAL '2 days');

INSERT INTO public.long_term_notes (user_id, title, content, tags, note_date)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440000', 'React Best Practices', 'Key principles for writing maintainable React code: component composition, proper state management, and effective use of hooks.', ARRAY['react', 'programming', 'best-practices'], CURRENT_DATE - INTERVAL '1 day'),
  ('550e8400-e29b-41d4-a716-446655440000', 'Book Summary: Atomic Habits', 'Small changes lead to remarkable results. The four laws of behavior change: make it obvious, make it attractive, make it easy, make it satisfying.', ARRAY['books', 'habits', 'productivity'], CURRENT_DATE),
  ('550e8400-e29b-41d4-a716-446655440000', 'Project Ideas', 'Build a personal knowledge management system with spaced repetition and bi-directional linking.', ARRAY['projects', 'ideas', 'pkm'], CURRENT_DATE - INTERVAL '3 days');
