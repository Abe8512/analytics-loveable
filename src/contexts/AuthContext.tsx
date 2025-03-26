
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: any | null;
  isManager: boolean;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  session: any | null;
  
  // Added missing properties needed by components
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
  getManagedUsers: () => Array<{id: string, name: string, email?: string, role?: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // For demo purposes, we'll consider any user an admin/manager
  // In a real app, this would be based on user roles in the database
  const isManager = !!user;
  const isAdmin = !!user;
  
  // Add isAuthenticated property
  const isAuthenticated = !!user;
  
  // Add isLoading alias for consistent naming across components
  const isLoading = loading;

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Add alias methods to match component expectations
  const login = signIn;
  const logout = signOut;
  
  // Add signup method
  const signup = async (email: string, password: string, name: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      return { error };
    } catch (error) {
      return { error };
    }
  };
  
  // Add method to get managed users (for demo, we'll return a mock list)
  const getManagedUsers = () => {
    // This is a mock function that would be replaced with real data in a production app
    return [
      { id: "1", name: "Alex Johnson", email: "alex@example.com", role: "sales" },
      { id: "2", name: "Maria Garcia", email: "maria@example.com", role: "sales" },
      { id: "3", name: "David Kim", email: "david@example.com", role: "sales" },
      { id: "4", name: "Sarah Williams", email: "sarah@example.com", role: "sales" },
      { id: "5", name: "James Taylor", email: "james@example.com", role: "sales" }
    ];
  };

  const value = {
    user,
    session,
    isManager,
    isAdmin,
    loading,
    signIn,
    signOut,
    
    // Added properties
    isAuthenticated,
    isLoading,
    login,
    logout,
    signup,
    getManagedUsers
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
