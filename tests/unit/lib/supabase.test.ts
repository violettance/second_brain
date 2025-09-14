import { describe, it, expect } from 'bun:test';
import { supabase } from '../../../src/lib/supabase';

describe('Supabase Client', () => {
  describe('client export', () => {
    it('should export supabase client', () => {
      expect(supabase).toBeDefined();
    });

    it('should be null when not configured', () => {
      // In test environment, supabase should be null since env vars are not set
      expect(supabase).toBeNull();
    });
  });

  describe('client type', () => {
    it('should be null or object', () => {
      expect(supabase === null || typeof supabase === 'object').toBe(true);
    });
  });
});
