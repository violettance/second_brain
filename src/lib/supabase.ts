import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if both URL and key are available
let supabaseClient: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    // Validate URL format
    new URL(supabaseUrl);
    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    logger.error('Failed to create Supabase client', { error: error.message });
  }
} else {
  logger.warn('Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = supabaseClient;