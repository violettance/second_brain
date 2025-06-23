import { useState, useEffect } from 'react';
import { DailyNote } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

// Mock data for demo
const MOCK_NOTES: DailyNote[] = [
  {
    id: '1',
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Daily Reflection - Today',
    content: 'Today I learned about the importance of building a second brain. The concept of connecting ideas and creating a knowledge network is fascinating.',
    tags: ['reflection', 'learning', 'knowledge'],
    note_date: new Date().toISOString().split('T')[0],
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
    note_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
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
    note_date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    memory_type: 'short-term',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString()
  }
];

export const useDailyNotes = (selectedDate?: Date) => {
  const [notes, setNotes] = useState<DailyNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchNotes = async (date?: Date) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      let filteredNotes = MOCK_NOTES;

      // Filter by date if provided
      if (date) {
        const dateString = date.toISOString().split('T')[0];
        filteredNotes = MOCK_NOTES.filter(note => note.note_date === dateString);
      }

      setNotes(filteredNotes);
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
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newNote: DailyNote = {
        id: Date.now().toString(), // Simple ID generation for demo
        user_id: user.id,
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags,
        note_date: noteData.noteDate.toISOString().split('T')[0],
        memory_type: noteData.memoryType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to mock data
      MOCK_NOTES.unshift(newNote);
      setNotes(prev => [newNote, ...prev]);
      
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
  }) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update in mock data
      const noteIndex = MOCK_NOTES.findIndex(n => n.id === noteId);
      if (noteIndex !== -1) {
        MOCK_NOTES[noteIndex] = {
          ...MOCK_NOTES[noteIndex],
          ...updates,
          updated_at: new Date().toISOString()
        };
      }

      // Update local state
      setNotes(prev => prev.map(n => 
        n.id === noteId ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
      ));

      return MOCK_NOTES[noteIndex];
    } catch (err) {
      console.error('Error updating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Remove from mock data
      const noteIndex = MOCK_NOTES.findIndex(n => n.id === noteId);
      if (noteIndex !== -1) {
        MOCK_NOTES.splice(noteIndex, 1);
      }

      // Remove from local state
      setNotes(prev => prev.filter(n => n.id !== noteId));
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotes(selectedDate);
    }
  }, [user, selectedDate]);

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