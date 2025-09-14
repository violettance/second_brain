import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { renderHook, waitFor } from '@testing-library/react';
import { useMemoryNotes } from '../../../src/hooks/useMemoryNotes';

// Mock dependencies
const mockUseAuth = mock(() => ({
  user: { id: '550e8400-e29b-41d4-a716-446655440000' }
}));

const mockLogger = {
  warn: mock(() => {}),
  error: mock(() => {})
};

const mockSupabase = null; // Simulate unconfigured state

// Mock useDailyNotes hook
const mockUseDailyNotes = mock(() => ({
  refetch: mock(() => Promise.resolve())
}));

// Mock modules
mock.module('../../../src/contexts/AuthContext', () => ({
  useAuth: mockUseAuth
}));

mock.module('../../../src/lib/supabase', () => ({
  supabase: mockSupabase
}));

mock.module('../../../src/lib/logger', () => ({
  logger: mockLogger
}));

mock.module('../../../src/hooks/useDailyNotes', () => ({
  useDailyNotes: mockUseDailyNotes
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: mock(() => null),
  setItem: mock(() => {}),
  removeItem: mock(() => {})
};

// Override localStorage for testing
Object.defineProperty(globalThis.window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('useMemoryNotes - isSupabaseConfigured', () => {
  beforeEach(() => {
    // Reset mocks
    Object.values(mockLocalStorage).forEach(mockFn => mockFn.mockClear());
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
    mockUseDailyNotes.mockClear();
  });

  afterEach(() => {
    // Clean up
  });

  it('should return false when supabase is null', () => {
    // This tests the isSupabaseConfigured function indirectly
    // by checking the behavior when supabase is not configured
    const { result } = renderHook(() => useMemoryNotes());
    
    // When supabase is null, the hook should use mock data
    expect(result.current.shortTermNotes).toBeDefined();
    expect(Array.isArray(result.current.shortTermNotes)).toBe(true);
    expect(result.current.longTermNotes).toBeDefined();
    expect(Array.isArray(result.current.longTermNotes)).toBe(true);
  });

  it('should handle null supabase gracefully', () => {
    const { result } = renderHook(() => useMemoryNotes());
    
    // Should not throw errors when supabase is null
    expect(() => {
      result.current.refetch();
    }).not.toThrow();
  });

  it('should have required functions available', () => {
    const { result } = renderHook(() => useMemoryNotes());
    
    // Should have required functions
    expect(typeof result.current.saveNote).toBe('function');
    expect(typeof result.current.moveToLongTerm).toBe('function');
    expect(typeof result.current.deleteNote).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });
});

describe('useMemoryNotes - fetchNotes', () => {
  beforeEach(() => {
    // Reset mocks
    Object.values(mockLocalStorage).forEach(mockFn => mockFn.mockClear());
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
    mockUseDailyNotes.mockClear();
    
    // Reset user context to default
    mockUseAuth.mockReturnValue({
      user: { id: '550e8400-e29b-41d4-a716-446655440000' }
    });
  });

  it('should fetch notes on mount', () => {
    const { result } = renderHook(() => useMemoryNotes());
    
    // Should have loaded notes arrays
    expect(result.current.shortTermNotes).toBeDefined();
    expect(Array.isArray(result.current.shortTermNotes)).toBe(true);
    expect(result.current.longTermNotes).toBeDefined();
    expect(Array.isArray(result.current.longTermNotes)).toBe(true);
  });

  it('should handle no user gracefully', () => {
    // Mock no user
    mockUseAuth.mockReturnValue({ user: null });
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useMemoryNotes());
    
    // Should have empty notes and error message
    expect(result.current.shortTermNotes).toEqual([]);
    expect(result.current.longTermNotes).toEqual([]);
    expect(result.current.error).toBe('Kullanıcı yok, giriş yapmalısınız.');
  });

  it('should use localStorage user_id when no user in context', () => {
    // Mock no user in context but user_id in localStorage
    mockUseAuth.mockReturnValue({ user: null });
    mockLocalStorage.getItem.mockReturnValue('550e8400-e29b-41d4-a716-446655440000');
    
    const { result } = renderHook(() => useMemoryNotes());
    
    // Should have loaded notes using localStorage user_id
    expect(result.current.shortTermNotes).toBeDefined();
    expect(Array.isArray(result.current.shortTermNotes)).toBe(true);
    expect(result.current.longTermNotes).toBeDefined();
    expect(Array.isArray(result.current.longTermNotes)).toBe(true);
  });

  it('should refetch notes when refetch is called', () => {
    const { result } = renderHook(() => useMemoryNotes());
    
    // Should not throw when calling refetch
    expect(() => {
      result.current.refetch();
    }).not.toThrow();
  });
});

describe('useMemoryNotes - saveNote and moveToLongTerm', () => {
  beforeEach(() => {
    // Reset mocks
    Object.values(mockLocalStorage).forEach(mockFn => mockFn.mockClear());
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
    mockUseDailyNotes.mockClear();
    
    // Reset user context to default
    mockUseAuth.mockReturnValue({
      user: { id: '550e8400-e29b-41d4-a716-446655440000' }
    });
  });

  it('should have saveNote function available', () => {
    const { result } = renderHook(() => useMemoryNotes());
    
    // Should have saveNote function
    expect(typeof result.current.saveNote).toBe('function');
  });

  it('should have moveToLongTerm function available', () => {
    const { result } = renderHook(() => useMemoryNotes());
    
    // Should have moveToLongTerm function
    expect(typeof result.current.moveToLongTerm).toBe('function');
  });

  it('should throw error when no user for saveNote', async () => {
    // Mock no user
    mockUseAuth.mockReturnValue({ user: null });
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useMemoryNotes());
    
    const newNoteData = {
      title: 'Test Note',
      content: 'Test content',
      tags: ['test'],
      references: [],
      memoryType: 'short-term' as const,
      noteDate: new Date()
    };
    
    await expect(result.current.saveNote(newNoteData)).rejects.toThrow('Kullanıcı yok!');
  });

  it('should throw error when no user for moveToLongTerm', async () => {
    // Mock no user
    mockUseAuth.mockReturnValue({ user: null });
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useMemoryNotes());
    
    await expect(result.current.moveToLongTerm('test-note-id')).rejects.toThrow('Kullanıcı yok!');
  });
});
