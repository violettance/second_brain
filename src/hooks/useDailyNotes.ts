import { useState, useEffect } from 'react';
import { DailyNote } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// In-memory storage for mock data (shared across all hook instances)
let mockNotesStorage: DailyNote[] = [
  {
    id: '1',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Daily Reflection - Today',
    content: 'Today I learned about the importance of building a second brain. The concept of connecting ideas and creating a knowledge network is fascinating.',
    tags: ['reflection', 'learning', 'knowledge'],
    note_date: (() => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    })(),
    memory_type: 'short-term',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'React Best Practices',
    content: 'Key principles for writing maintainable React code: component composition, proper state management, and effective use of hooks.',
    tags: ['react', 'programming', 'best-practices'],
    note_date: (() => {
      const yesterday = new Date(Date.now() - 86400000);
      return `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    })(),
    memory_type: 'long-term',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Meeting Notes - Team Sync',
    content: 'Discussed project roadmap and upcoming features. Need to focus on user experience improvements.',
    tags: ['meeting', 'team', 'roadmap'],
    note_date: (() => {
      const twoDaysAgo = new Date(Date.now() - 172800000);
      return `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;
    })(),
    memory_type: 'short-term',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
];

// Subscribers for state changes (for reactivity across hook instances)
let subscribers: Array<() => void> = [];

const notifySubscribers = () => {
  subscribers.forEach(callback => callback());
};

export const useDailyNotes = (selectedDate?: Date) => {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if Supabase is properly configured
  const isSupabaseConfigured = () => {
    try {
      return !!(supabase);
    } catch {
      return false;
    }
  };

  const fetchNotes = async (date?: Date) => {
    // For demo purposes, use a fallback user if none exists
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    setIsLoading(true);
    setError(null);

    try {
      // If Supabase isn't configured, use mock data
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, using mock data. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        let filteredNotes = [...mockNotesStorage];
        if (date) {
          // Use local date to avoid timezone issues
          const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          filteredNotes = filteredNotes.filter(note => note.note_date === dateString);
        }
        
        setNotes(filteredNotes);
        return;
      }
      let shortTermNotes = [];
      let longTermNotes = [];
      
      // Build base queries
      let shortTermQuery = supabase
        .from('short_term_notes')
        .select('*')
        .eq('user_id', currentUser.id)
        .is('archived_at', null)
        .order('created_at', { ascending: false });
        
      let longTermQuery = supabase
        .from('long_term_notes')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      // Filter by date if provided
      if (date) {
        // Use local date to avoid timezone issues
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        shortTermQuery = shortTermQuery.eq('note_date', dateString);
        longTermQuery = longTermQuery.eq('note_date', dateString);
      }
      
      // Fetch both types of notes
      const [shortTermResult, longTermResult] = await Promise.all([
        shortTermQuery,
        longTermQuery
      ]);
      
      if (shortTermResult.error) throw shortTermResult.error;
      if (longTermResult.error) throw longTermResult.error;
      
      // Transform short-term notes to include memory_type
      shortTermNotes = (shortTermResult.data || []).map((note: any) => ({
        ...note,
        memory_type: 'short-term' as const
      }));
      
      // Transform long-term notes to include memory_type
      longTermNotes = (longTermResult.data || []).map((note: any) => ({
        ...note,
        memory_type: 'long-term' as const
      }));
      
      // Combine and sort all notes
      const allNotes = [...shortTermNotes, ...longTermNotes].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      setNotes(allNotes);
    } catch (err) {
      console.error('Error fetching notes:', err);
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
    noteDate: Date;
  }) => {
    // For demo purposes, use a fallback user if none exists
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    setIsLoading(true);
    setError(null);

    try {
      // If Supabase isn't configured, simulate saving
      if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const newNote: DailyNote = {
          id: Date.now().toString(),
          user_id: currentUser.id,
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags,
          note_date: (() => {
            const date = noteData.noteDate;
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          })(),
          memory_type: noteData.memoryType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Add to shared mock storage
        mockNotesStorage.unshift(newNote);
        
        // Update local state
        setNotes(prev => [newNote, ...prev]);
        
        // Notify all subscribers of the change
        setTimeout(() => notifySubscribers(), 0);
        
        return newNote;
      }
      
      // This should never be reached when supabase is null
      if (!supabase) {
        throw new Error('Supabase client is not available');
      }
      
      const { title, content, tags, memoryType, noteDate } = noteData;
      // Use local date to avoid timezone issues
      const note_date = `${noteDate.getFullYear()}-${String(noteDate.getMonth() + 1).padStart(2, '0')}-${String(noteDate.getDate()).padStart(2, '0')}`;
      
      let newNote: DailyNote;
      
      if (memoryType === 'short-term') {
        // Insert into short-term notes
        const { data, error } = await supabase
          .from('short_term_notes')
          .insert({
            user_id: currentUser.id,
            title,
            content,
            tags,
            note_date
          })
          .select()
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Failed to create note');
        
        newNote = {
          ...data,
          memory_type: 'short-term'
        };
      } else {
        // Insert into long-term notes
        const { data, error } = await supabase
          .from('long_term_notes')
          .insert({
            user_id: currentUser.id,
            title,
            content,
            tags,
            note_date
          })
          .select()
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Failed to create note');
        
        newNote = {
          ...data,
          memory_type: 'long-term'
        };
      }
      
      // Update local state
      setNotes(prev => [newNote, ...prev]);
      
      // Notify all subscribers of the change
      setTimeout(() => notifySubscribers(), 0);
      
      return newNote;
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err instanceof Error ? err.message : 'Failed to save note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateNote = async (noteId: string, updates: {
    title?: string;
    content?: string;
    tags?: string[];
    memory_type?: 'short-term' | 'long-term';
  }) => {
    // For demo purposes, use a fallback user if none exists
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    setIsLoading(true);
    setError(null);

    try {
      // If Supabase isn't configured, simulate updating
      if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const noteIndex = mockNotesStorage.findIndex(note => note.id === noteId);
        if (noteIndex === -1) throw new Error('Note not found');
        
        const updatedNote: DailyNote = {
          ...mockNotesStorage[noteIndex],
          ...updates,
          updated_at: new Date().toISOString()
        };
        
        // Update shared mock storage
        mockNotesStorage[noteIndex] = updatedNote;
        
        // Update local state
        setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note));
        
        // Notify all subscribers of the change (async to avoid circular dependencies)
        setTimeout(() => notifySubscribers(), 0);
        
        return updatedNote;
      }
      // Find the current note to determine its current memory type
      const currentNote = notes.find(note => note.id === noteId);
      if (!currentNote) {
        throw new Error('Note not found');
      }

      const { memory_type: newMemoryType, ...otherUpdates } = updates;
      
      // If memory type is changing, we need to move the note between tables
      if (newMemoryType && newMemoryType !== currentNote.memory_type) {
        // Delete from current table
        if (currentNote.memory_type === 'short-term') {
          const { error: deleteError } = await supabase
            .from('short_term_notes')
            .delete()
            .eq('id', noteId);
          if (deleteError) throw deleteError;
        } else {
          const { error: deleteError } = await supabase
            .from('long_term_notes')
            .delete()
            .eq('id', noteId);
          if (deleteError) throw deleteError;
        }
        
        // Create in new table
        const noteData = {
          user_id: currentNote.user_id,
          title: updates.title || currentNote.title,
          content: updates.content || currentNote.content,
          tags: updates.tags || currentNote.tags,
          note_date: currentNote.note_date
        };
        
        let newNote: DailyNote;
        
        if (newMemoryType === 'short-term') {
          const { data, error } = await supabase
            .from('short_term_notes')
            .insert(noteData)
            .select()
            .single();
          if (error) throw error;
          if (!data) throw new Error('Failed to move note');
          newNote = { ...data, memory_type: 'short-term' };
        } else {
          const { data, error } = await supabase
            .from('long_term_notes')
            .insert(noteData)
            .select()
            .single();
          if (error) throw error;
          if (!data) throw new Error('Failed to move note');
          newNote = { ...data, memory_type: 'long-term' };
        }
        
        // Update local state
        setNotes(prev => prev.map(note => 
          note.id === noteId ? newNote : note
        ));
        
        return newNote;
      } else {
        // Regular update in the same table
        const tableName = currentNote.memory_type === 'short-term' ? 'short_term_notes' : 'long_term_notes';
        
        const { data, error } = await supabase
          .from(tableName)
          .update(otherUpdates)
          .eq('id', noteId)
          .select()
          .single();
          
        if (error) throw error;
        if (!data) throw new Error('Failed to update note');
        
        const updatedNote = {
          ...data,
          memory_type: currentNote.memory_type
        };
        
        // Update local state
        setNotes(prev => prev.map(note => 
          note.id === noteId ? updatedNote : note
        ));
        
        return updatedNote;
      }
    } catch (err) {
      console.error('Error updating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    // For demo purposes, use a fallback user if none exists
    const currentUser = {
      id: '2994cfab-5a29-422d-81f8-63909b93bf20',
      name: 'Demo User',
      email: 'demo@example.com'
    };

    setIsLoading(true);
    setError(null);

    try {
      // If Supabase isn't configured, simulate deleting
      if (!isSupabaseConfigured()) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Remove from shared mock storage
        mockNotesStorage = mockNotesStorage.filter(note => note.id !== noteId);
        
        // Update local state
        setNotes(prev => prev.filter(note => note.id !== noteId));
        
        // Notify all subscribers of the change (async to avoid circular dependencies)
        setTimeout(() => notifySubscribers(), 0);
        
        return;
      }
      // Find the note to determine which table to delete from
      const noteToDelete = notes.find(note => note.id === noteId);
      if (!noteToDelete) {
        throw new Error('Note not found');
      }

      if (noteToDelete.memory_type === 'short-term') {
        // For short-term notes, use soft delete (archived_at)
        const { error } = await supabase
          .from('short_term_notes')
          .update({ archived_at: new Date().toISOString() })
          .eq('id', noteId);
          
        if (error) throw error;
      } else {
        // For long-term notes, use hard delete
        const { error } = await supabase
          .from('long_term_notes')
          .delete()
          .eq('id', noteId);
          
        if (error) throw error;
      }
      
      // Update local state
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      // Notify all subscribers of the change
      setTimeout(() => notifySubscribers(), 0);
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to changes in mock data
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      const handleChange = () => {
        fetchNotes(selectedDate);
      };
      
      subscribers.push(handleChange);
      
      return () => {
        subscribers = subscribers.filter(sub => sub !== handleChange);
      };
    }
  }, [selectedDate]);

  // Fetch notes when component mounts or dependencies change
  useEffect(() => {
    fetchNotes(selectedDate);
  }, [selectedDate]); // Removed user dependency since we handle null user inside fetchNotes

  return {
    notes,
    isLoading,
    error,
    saveNote,
    updateNote,
    deleteNote,
    refetch: () => fetchNotes(selectedDate)
  };
};