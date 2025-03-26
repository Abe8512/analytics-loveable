
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { getManagedUsers as getSharedManagedUsers } from '@/services/SharedDataService';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isManager: boolean;
  isAdmin: boolean;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
  getManagedUsers: () => Array<{id: string, name: string, email?: string, role?: string}>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Initialize auth state and set up listeners
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.email);
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
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Login successful",
          description: `Welcome back, ${data.user.email}!`,
        });
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast({
        title: "Logout successful",
        description: "You have been logged out",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Add alias methods to match component expectations
  const login = signIn;
  const logout = signOut;
  
  // Add signup method
  const signup = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });
      
      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data.user) {
        toast({
          title: "Signup successful",
          description: "Please check your email to confirm your account",
        });
        
        // Try to create a team member entry for this user
        try {
          await supabase.from('team_members').insert([
            {
              user_id: data.user.id,
              member_id: data.user.id,
              name: name,
              email: email,
              role: 'member'
            }
          ]);
        } catch (teamError) {
          console.error('Could not create team member entry:', teamError);
        }
      }
      
      return { error };
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };
  
  // Function to get managed users (first from database, fallback to mock data)
  const getManagedUsers = () => {
    return getSharedManagedUsers();
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
