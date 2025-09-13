import { useState, useEffect } from 'react';
import { DailyNote } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { cachedFetch, CACHE_KEYS, CACHE_TTL, invalidateCache } from '../lib/cachedFetch';

// Import the shared mock storage and notification system from useDailyNotes
// This ensures synchronization between memory notes and daily notes
import { useDailyNotes } from './useDailyNotes';

// Mock data for demo
const MOCK_SHORT_TERM_NOTES: DailyNote[] = [
  {
    id: '1',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Meeting Notes - Team Sync',
    content: 'Discussed project roadmap and upcoming features. Need to focus on user experience improvements and performance optimization.',
    tags: ['meeting', 'team', 'roadmap'],
    note_date: new Date().toISOString().split('T')[0],
    memory_type: 'short-term',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Quick Idea - App Feature',
    content: 'What if we added a voice recording feature for quick note capture? Could be useful for mobile users.',
    tags: ['idea', 'feature', 'mobile'],
    note_date: new Date().toISOString().split('T')[0],
    memory_type: 'short-term',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Shopping List',
    content: 'Groceries: milk, bread, eggs, coffee, fruits. Also need to buy new headphones.',
    tags: ['shopping', 'personal'],
    note_date: new Date().toISOString().split('T')[0],
    memory_type: 'short-term',
    created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days ago (expires soon!)
    updated_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const MOCK_LONG_TERM_NOTES: DailyNote[] = [
  {
    id: '4',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'React Best Practices',
    content: 'Key principles for writing maintainable React code: component composition, proper state management, effective use of hooks, and performance optimization techniques.',
    tags: ['react', 'programming', 'best-practices', 'javascript'],
    note_date: new Date().toISOString().split('T')[0],
    memory_type: 'long-term',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Knowledge Management Principles',
    content: 'Building a second brain requires: consistent capture, organized structure, regular review, and active connection-making between ideas.',
    tags: ['knowledge-management', 'productivity', 'learning'],
    note_date: new Date().toISOString().split('T')[0],
    memory_type: 'long-term',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '6',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Design System Guidelines',
    content: 'Consistent spacing (8px grid), color palette with semantic meanings, typography hierarchy, and component reusability principles.',
    tags: ['design', 'ui-ux', 'guidelines', 'system'],
    note_date: new Date().toISOString().split('T')[0],
    memory_type: 'long-term',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const useMemoryNotes = () => {
  const [shortTermNotes, setShortTermNotes] = useState<DailyNote[]>([]);
  const [longTermNotes, setLongTermNotes] = useState<DailyNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Get the daily notes hook for shared state management
  const { refetch: refetchDailyNotes } = useDailyNotes();

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    try {
      return !!(supabase);
    } catch {
      return false;
    }
  };

  const fetchNotes = async () => {
    let userId = user?.id;
    if (!userId) {
      userId = localStorage.getItem('user_id') || undefined;
    }
    if (!userId) {
      setShortTermNotes([]);
      setLongTermNotes([]);
      setIsLoading(false);
      setError('Kullanıcı yok, giriş yapmalısınız.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If Supabase isn't configured, use mock data
      if (!isSupabaseConfigured()) {
        logger.warn('Supabase not configured, using mock data. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Mock data for demo
        const mockShortTermNotes: DailyNote[] = MOCK_SHORT_TERM_NOTES.map(note => ({ ...note, user_id: userId }));
        const mockLongTermNotes: DailyNote[] = MOCK_LONG_TERM_NOTES.map(note => ({ ...note, user_id: userId }));

        setShortTermNotes(mockShortTermNotes);
        setLongTermNotes(mockLongTermNotes);
        return;
      }

      // Use cached fetch for memory notes data
      const [shortTermNotes, longTermNotes] = await Promise.all([
        cachedFetch(
          CACHE_KEYS.MEMORY_NOTES(userId, 'short'),
          () => supabase
            .from('short_term_notes')
            .select('*')
            .eq('user_id', userId)
            .is('archived_at', null)
            .order('created_at', { ascending: false })
            .then(r => r.data || []),
          CACHE_TTL.MEDIUM
        ),
        cachedFetch(
          CACHE_KEYS.MEMORY_NOTES(userId, 'long'),
          () => supabase
            .from('long_term_notes')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .then(r => r.data || []),
          CACHE_TTL.MEDIUM
        )
      ]);

      // Transform to include memory_type
      const transformedShortTermNotes = shortTermNotes.map((note: any) => ({
        ...note,
        memory_type: 'short-term' as const
      }));

      const transformedLongTermNotes = longTermNotes.map((note: any) => ({
         ...note,
         memory_type: 'long-term' as const
       }));

      setShortTermNotes(transformedShortTermNotes);
      setLongTermNotes(transformedLongTermNotes);
    } catch (err) {
      logger.error('Error fetching notes', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async (noteData: {
    title: string;
    content: string;
    tags: string[];
    memoryType: 'short-term' | 'long-term';
  }) => {
    if (!user) throw new Error('Kullanıcı yok!');

    setIsLoading(true);
    setError(null);

    try {
      let newNote: DailyNote;

             if (!isSupabaseConfigured()) {
         // Mock data handling - use shared storage from useDailyNotes
         await new Promise(resolve => setTimeout(resolve, 1000));
         
         // Use local date to avoid timezone issues
         const now = new Date();
         const noteDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

         newNote = {
           id: Date.now().toString(),
           user_id: user.id,
           title: noteData.title,
           content: noteData.content,
           tags: noteData.tags,
           note_date: noteDate,
           memory_type: noteData.memoryType,
           created_at: new Date().toISOString(),
           updated_at: new Date().toISOString()
         };

        // Update local state
        if (noteData.memoryType === 'short-term') {
          setShortTermNotes(prev => [newNote, ...prev]);
        } else {
          setLongTermNotes(prev => [newNote, ...prev]);
        }
      } else {
                 // Supabase handling
         // Use local date to avoid timezone issues
         const now = new Date();
         const noteDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
         
         if (noteData.memoryType === 'short-term') {
           const { data, error } = await supabase
             .from('short_term_notes')
             .insert({
               user_id: user.id,
               title: noteData.title,
               content: noteData.content,
               tags: noteData.tags,
               note_date: noteDate
             })
             .select()
             .single();

           if (error) throw error;
           if (!data) throw new Error('Failed to create note');

           newNote = {
             ...data,
             memory_type: 'short-term'
           };

           setShortTermNotes(prev => [newNote, ...prev]);
        } else {
          const { data, error } = await supabase
            .from('long_term_notes')
            .insert({
              user_id: user.id,
              title: noteData.title,
              content: noteData.content,
              tags: noteData.tags,
              note_date: noteDate
            })
            .select()
            .single();

          if (error) throw error;
          if (!data) throw new Error('Failed to create note');

          newNote = {
            ...data,
            memory_type: 'long-term'
          };

          setLongTermNotes(prev => [newNote, ...prev]);
        }
      }
      
      // Invalidate cache for memory notes
      invalidateCache(`memory_short_${user.id}`);
      invalidateCache(`memory_long_${user.id}`);
      invalidateCache(`notes_${user.id}`);
      
      // Refetch notes for both memory and daily views
      await fetchNotes();
      refetchDailyNotes();

      return newNote;
    } catch (err) {
      logger.error('Error saving note', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to save note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const moveToLongTerm = async (noteId: string) => {
    if (!user) throw new Error('Kullanıcı yok!');

    setIsLoading(true);
    setError(null);

    try {
      // Find the note in short term
      const note = shortTermNotes.find(n => n.id === noteId);
      if (!note) throw new Error('Note not found');

      let longTermNote: DailyNote;

      if (!isSupabaseConfigured()) {
        // Mock data handling
        await new Promise(resolve => setTimeout(resolve, 500));

        longTermNote = {
          ...note,
          memory_type: 'long-term',
          updated_at: new Date().toISOString()
        };

        // Update local state
        setShortTermNotes(prev => prev.filter(n => n.id !== noteId));
        setLongTermNotes(prev => [longTermNote, ...prev]);
      } else {
        // Supabase handling - delete from short term and create in long term
        const [deleteResult, insertResult] = await Promise.all([
          supabase
            .from('short_term_notes')
            .delete()
            .eq('id', noteId),
          supabase
            .from('long_term_notes')
            .insert({
              user_id: user.id,
              title: note.title,
              content: note.content,
              tags: note.tags,
              note_date: note.note_date
            })
            .select()
            .single()
        ]);

        if (deleteResult.error) throw deleteResult.error;
        if (insertResult.error) throw insertResult.error;
        if (!insertResult.data) throw new Error('Failed to move note');

        longTermNote = {
          ...insertResult.data,
          memory_type: 'long-term'
        };

        // Update local state
        setShortTermNotes(prev => prev.filter(n => n.id !== noteId));
        setLongTermNotes(prev => [longTermNote, ...prev]);
      }

      // Immediate sync with daily notes
      await refetchDailyNotes();

      return longTermNote;
    } catch (err) {
      logger.error('Error moving note to long term', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to move note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (noteId: string, memoryType: 'short-term' | 'long-term') => {
    if (!user) throw new Error('Kullanıcı yok!');

    setIsLoading(true);
    setError(null);

    try {
      if (!isSupabaseConfigured()) {
        // Mock data handling
        await new Promise(resolve => setTimeout(resolve, 500));

        if (memoryType === 'short-term') {
          setShortTermNotes(prev => prev.filter(n => n.id !== noteId));
        } else {
          setLongTermNotes(prev => prev.filter(n => n.id !== noteId));
        }
      } else {
        // Supabase handling
        if (memoryType === 'short-term') {
          // Soft delete for short-term notes
          const { error } = await supabase
            .from('short_term_notes')
            .update({ archived_at: new Date().toISOString() })
            .eq('id', noteId);

          if (error) throw error;
          setShortTermNotes(prev => prev.filter(n => n.id !== noteId));
        } else {
          // Hard delete for long-term notes
          const { error } = await supabase
            .from('long_term_notes')
            .delete()
            .eq('id', noteId);

          if (error) throw error;
          setLongTermNotes(prev => prev.filter(n => n.id !== noteId));
        }
      }
      
      // Refetch notes to reflect the deletion
      await fetchNotes();
      refetchDailyNotes();
    } catch (err) {
      logger.error('Error deleting note', { error: err.message });
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  return {
    shortTermNotes,
    longTermNotes,
    isLoading,
    error,
    saveNote,
    moveToLongTerm,
    deleteNote,
    refetch: fetchNotes
  };
};