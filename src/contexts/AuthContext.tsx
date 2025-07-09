import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

interface User extends Profile {
  // Extending Profile with any additional user properties if needed
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if we have a supabase client
    if (!supabase) {
      console.warn('Supabase client not initialized');
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      console.log('[AUTH] getSession yanıtı:', session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('[AUTH] onAuthStateChange:', { event, session });
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    console.log('[PROFILE] Profil çekiliyor:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[PROFILE] Hata:', error);
        return;
      }

      console.log('[PROFILE] Profil bulundu:', data);
      setUser(data);
    } catch (error) {
      console.error('[PROFILE] Exception:', error);
    }
  };

  const login = async (email: string, password: string) => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      throw new Error('Supabase client not initialized. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }

    setIsLoading(true);
    console.log('[LOGIN] Başladı:', { email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('[LOGIN] Supabase yanıtı:', { data, error });

      if (error) {
        console.error('[LOGIN] Hata:', error);
        throw error;
      }
      // User profile will be fetched via the auth state change listener
    } catch (error: any) {
      console.error('[LOGIN] Exception:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
      console.log('[LOGIN] Bitti');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }

    setIsLoading(true);
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) {
        throw error;
      }

      // We're assuming a trigger handles profile creation.
      // And the success message will be shown in the form.
      // The onAuthStateChange listener will handle setting the user.
      alert('Registration successful! Please check your email to confirm your account.');

    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (!supabase) {
      return;
    }

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};