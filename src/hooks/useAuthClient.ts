import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  profile: any | null;
  managedUsers: any[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: Error }>;
  signup: (email: string, password: string, data?: any) => Promise<{ success: boolean; error?: Error }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: Error }>;
  updateProfile: (data: any) => Promise<{ success: boolean; error?: Error }>;
  getManagedUsers: () => Promise<any[]>;
}

export const useAuthClient = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking session:', error);
        setError(error instanceof Error ? error : new Error('Failed to check session'));
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user || null);
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setManagedUsers([]);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        setIsAdmin(data?.role === 'admin');
        setIsManager(data?.role === 'manager' || data?.role === 'admin');

        // Fetch managed users if admin or manager
        if (data?.role === 'admin' || data?.role === 'manager') {
          await getManagedUsers();
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [user]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Login failed') 
      };
    }
  };

  // Signup function
  const signup = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Signup failed') 
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Reset password failed') 
      };
    }
  };

  // Update profile function
  const updateProfile = async (data: any) => {
    if (!user) {
      return { 
        success: false, 
        error: new Error('No authenticated user') 
      };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local profile state
      setProfile(prev => ({ ...prev, ...data }));
      
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Update profile failed') 
      };
    }
  };

  // Get managed users function
  const getManagedUsers = async (): Promise<any[]> => {
    try {
      // First try to get from session storage (faster)
      const localUsers = sharedDataService.getManagedUsers();
      if (localUsers && localUsers.length > 0) {
        return localUsers;
      }

      // If not available in storage, try to get from database if table exists
      try {
        // Check if table exists first to avoid unnecessary errors
        const { count, error: countError } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true });
        
        if (countError || count === 0) {
          // Fallback to demo data if necessary
          return getDemoManagedUsers();
        }
        
        // Get actual data if table exists
        const { data, error } = await supabase
          .from('team_members')
          .select('*');
        
        if (error || !data || data.length === 0) {
          return getDemoManagedUsers();
        }
        
        // Store for future use
        sharedDataService.setManagedUsers(data);
        return data;
      } catch (error) {
        // Handle specific database errors
        console.error('Error fetching managed users from database', error);
        return getDemoManagedUsers();
      }
    } catch (error) {
      console.error('Error in getManagedUsers:', error);
      return getDemoManagedUsers();
    }
  };

  return {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,
    isAdmin,
    isManager,
    profile,
    managedUsers,
    login,
    signup,
    logout,
    resetPassword,
    updateProfile,
    getManagedUsers,
  };
};
