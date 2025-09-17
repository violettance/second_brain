import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import posthog from 'posthog-js';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

interface User extends Profile {}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isPro: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  success: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const updateUserStatus = (profile: User | null) => {
      setUser(profile);
      if (profile && profile.subscription_plan && profile.subscription_plan !== 'free') {
        setIsPro(true);
      } else {
        setIsPro(false);
      }

      // Identify user in PostHog when available; reset when logged out
      try {
        if (profile) {
          const distinctId = String(profile.id);
          posthog.identify(distinctId, {
            email: profile.email,
            name: profile.name,
            subscription_plan: profile.subscription_plan || 'free',
          });
        } else {
          posthog.reset();
        }
      } catch (_e) {
        // swallow analytics errors; do not block auth flow
      }
    };

    const initializeAuth = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData?.session?.user;

      if (sessionUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single();

        if (profile) updateUserStatus(profile);
      }

      setIsLoading(false);
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }: { data: User | null }) => {
            if (profile) updateUserStatus(profile);
          });
      } else {
        updateUserStatus(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await supabase.auth.signInWithPassword({ email, password });
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    setSuccess(null);

    // Step 1: Check if the user already exists using the custom RPC
    const { data, error } = await supabase.rpc('check_user_exists', { email_input: email });
    if (error) {
      setError('An error occurred while checking user existence.');
      return;
    }
    if (data) {
      setError('A user with this email is already registered.');
      return;
    }

    // Step 2: If user does not exist, proceed with signUp
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // Step 3: If signUp is successful, show confirmation message
    setSuccess('Confirmation email sent. Please check your inbox.');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsPro(false);
    try { posthog.reset(); } catch (_e) {}
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isPro, login, register, logout, error, success }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};