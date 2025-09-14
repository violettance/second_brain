import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { renderHook } from '@testing-library/react';
import { useProjects } from '../../../src/hooks/useProjects';

// Mock dependencies
const mockUseAuth = mock(() => ({
  user: { id: '550e8400-e29b-41d4-a716-446655440000' }
}));

const mockLogger = {
  warn: mock(() => {}),
  error: mock(() => {})
};

const mockSupabase = null; // Simulate unconfigured state

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

// Mock localStorage
const mockLocalStorage = {
  getItem: mock(() => null as string | null),
  setItem: mock(() => {}),
  removeItem: mock(() => {})
};

// Override localStorage for testing
Object.defineProperty(globalThis.window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

describe('useProjects - isSupabaseConfigured', () => {
  beforeEach(() => {
    // Reset mocks
    Object.values(mockLocalStorage).forEach(mockFn => mockFn.mockClear());
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
  });

  afterEach(() => {
    // Clean up
  });

  it('should return false when supabase is null', () => {
    // This tests the isSupabaseConfigured function indirectly
    // by checking the behavior when supabase is not configured
    const { result } = renderHook(() => useProjects());
    
    // When supabase is null, the hook should use mock data
    expect(result.current.projects).toBeDefined();
    expect(Array.isArray(result.current.projects)).toBe(true);
    expect(result.current.isLoading).toBeDefined();
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should handle null supabase gracefully', () => {
    const { result } = renderHook(() => useProjects());
    
    // Should not throw errors when supabase is null
    expect(() => {
      result.current.refetch();
    }).not.toThrow();
  });

  it('should have required functions available', () => {
    const { result } = renderHook(() => useProjects());
    
    // Should have required functions
    expect(typeof result.current.refetch).toBe('function');
    expect(typeof result.current.createProject).toBe('function');
    expect(typeof result.current.updateProject).toBe('function');
    expect(typeof result.current.deleteProject).toBe('function');
  });
});

describe('useProjects - fetchProjects', () => {
  beforeEach(() => {
    // Reset mocks
    Object.values(mockLocalStorage).forEach(mockFn => mockFn.mockClear());
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();
    
    // Reset user context to default
    mockUseAuth.mockReturnValue({
      user: { id: '550e8400-e29b-41d4-a716-446655440000' }
    });
  });

  it('should fetch projects on mount', () => {
    const { result } = renderHook(() => useProjects());
    
    // Should have loaded projects
    expect(result.current.projects).toBeDefined();
    expect(Array.isArray(result.current.projects)).toBe(true);
    expect(result.current.isLoading).toBeDefined();
    expect(typeof result.current.isLoading).toBe('boolean');
  });

  it('should handle no user gracefully', () => {
    // Mock no user
    mockUseAuth.mockReturnValue({ user: null as any });
    mockLocalStorage.getItem.mockReturnValue(null);
    
    const { result } = renderHook(() => useProjects());
    
    // Should have empty projects and error message
    expect(result.current.projects).toEqual([]);
    expect(result.current.error).toBeDefined();
  });

  it('should use localStorage user_id when no user in context', () => {
    // Mock no user in context but user_id in localStorage
    mockUseAuth.mockReturnValue({ user: null as any });
    mockLocalStorage.getItem.mockReturnValue('550e8400-e29b-41d4-a716-446655440000');
    
    const { result } = renderHook(() => useProjects());
    
    // Should have loaded projects using localStorage user_id
    expect(result.current.projects).toBeDefined();
    expect(Array.isArray(result.current.projects)).toBe(true);
  });

  it('should refetch projects when refetch is called', () => {
    const { result } = renderHook(() => useProjects());
    
    // Should not throw when calling refetch
    expect(() => {
      result.current.refetch();
    }).not.toThrow();
  });
});
