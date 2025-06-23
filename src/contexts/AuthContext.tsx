import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

// Demo user with fixed UUID
const DEMO_USER: User = {
  id: '550e8400-e29b-41d4-a716-446655440000', // Fixed UUID for demo
  name: 'Knowledge Seeker',
  email: 'demo@secondbrain.com',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); // Start with no user to show landing
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser(DEMO_USER);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate registration delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUser({
        ...DEMO_USER,
        name: name,
        email: email
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
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