import { useState, useEffect } from 'react';
import { DailyNote } from '../types/database';
import { useAuth } from '../contexts/AuthContext';

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

  const fetchNotes = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      setShortTermNotes(MOCK_SHORT_TERM_NOTES);
      setLongTermNotes(MOCK_LONG_TERM_NOTES);
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
  }) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newNote: DailyNote = {
        id: Date.now().toString(),
        user_id: user.id,
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags,
        note_date: new Date().toISOString().split('T')[0],
        memory_type: noteData.memoryType,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (noteData.memoryType === 'short-term') {
        MOCK_SHORT_TERM_NOTES.unshift(newNote);
        setShortTermNotes(prev => [newNote, ...prev]);
      } else {
        MOCK_LONG_TERM_NOTES.unshift(newNote);
        setLongTermNotes(prev => [newNote, ...prev]);
      }
      
      return newNote;
    } catch (err) {
      console.error('Error saving note:', err);
      setError(err instanceof Error ? err.message : 'Failed to save note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const moveToLongTerm = async (noteId: string) => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Find the note in short term
      const noteIndex = MOCK_SHORT_TERM_NOTES.findIndex(n => n.id === noteId);
      if (noteIndex === -1) throw new Error('Note not found');

      const note = MOCK_SHORT_TERM_NOTES[noteIndex];
      
      // Create new long term note
      const longTermNote: DailyNote = {
        ...note,
        memory_type: 'long-term',
        updated_at: new Date().toISOString()
      };

      // Remove from short term
      MOCK_SHORT_TERM_NOTES.splice(noteIndex, 1);
      setShortTermNotes(prev => prev.filter(n => n.id !== noteId));

      // Add to long term
      MOCK_LONG_TERM_NOTES.unshift(longTermNote);
      setLongTermNotes(prev => [longTermNote, ...prev]);

      return longTermNote;
    } catch (err) {
      console.error('Error moving note to long term:', err);
      setError(err instanceof Error ? err.message : 'Failed to move note');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNote = async (noteId: string, memoryType: 'short-term' | 'long-term') => {
    if (!user) throw new Error('User not authenticated');

    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (memoryType === 'short-term') {
        const noteIndex = MOCK_SHORT_TERM_NOTES.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
          MOCK_SHORT_TERM_NOTES.splice(noteIndex, 1);
          setShortTermNotes(prev => prev.filter(n => n.id !== noteId));
        }
      } else {
        const noteIndex = MOCK_LONG_TERM_NOTES.findIndex(n => n.id === noteId);
        if (noteIndex !== -1) {
          MOCK_LONG_TERM_NOTES.splice(noteIndex, 1);
          setLongTermNotes(prev => prev.filter(n => n.id !== noteId));
        }
      }
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
      fetchNotes();
    }
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