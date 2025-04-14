
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/types/profile';

export interface AuthError {
  message: string;
}

export interface AuthResult {
  error: AuthError | null;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string, name: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
}

export const useAuthClient = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    isManager: false,
    login: async () => ({ error: null }),
    signup: async () => ({ error: null }),
    logout: async () => {},
    resetPassword: async () => ({ error: null }),
  });

  const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching user profile:", error);
        return null;
      }
      
      return data as Profile;
    } catch (err) {
      console.error("Exception fetching user profile:", err);
      return null;
    }
  };

  useEffect(() => {
    const setupAuth = async () => {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            setState(prevState => ({
              ...prevState,
              session: currentSession,
              user: currentSession?.user || null,
              isAuthenticated: !!currentSession?.user,
            }));
            
            if (currentSession?.user) {
              setTimeout(async () => {
                const userProfile = await fetchUserProfile(currentSession.user.id);
                setState(prevState => ({
                  ...prevState,
                  profile: userProfile,
                  isAdmin: userProfile?.role === 'admin',
                  isManager: userProfile?.role === 'admin' || userProfile?.role === 'manager',
                }));
              }, 0);
            } else {
              setState(prevState => ({
                ...prevState,
                profile: null,
                isAdmin: false,
                isManager: false,
                isAuthenticated: false,
              }));
            }
          }
        );
        
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setState(prevState => ({
          ...prevState,
          session: initialSession,
          user: initialSession?.user || null,
          isLoading: false,
          isAuthenticated: !!initialSession?.user,
        }));
        
        if (initialSession?.user) {
          const userProfile = await fetchUserProfile(initialSession.user.id);
          setState(prevState => ({
            ...prevState,
            profile: userProfile,
            isAdmin: userProfile?.role === 'admin',
            isManager: userProfile?.role === 'admin' || userProfile?.role === 'manager',
          }));
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up auth:", error);
        setState(prevState => ({
          ...prevState,
          isLoading: false,
        }));
      }
    };
    
    setupAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        toast.error("Login failed", { description: error.message });
        return { error };
      }
      
      toast.success("Login successful", { description: "Welcome back!" });
      
      // Update state with the user and session
      setState(prevState => ({
        ...prevState,
        user: data.user,
        session: data.session,
        isAuthenticated: !!data.user,
      }));
      
      return { error: null };
    } catch (error: any) {
      console.error("Login exception:", error);
      toast.error("Login failed", { description: error.message });
      return { error };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<AuthResult> => {
    try {
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            display_name: name,
          },
        },
      });
      
      if (error) {
        console.error("Signup error:", error);
        toast.error("Signup failed", { description: error.message });
        return { error };
      }
      
      toast.success("Signup successful", { 
        description: "Please check your email for verification." 
      });
      return { error: null };
    } catch (error: any) {
      console.error("Signup exception:", error);
      toast.error("Signup failed", { description: error.message });
      return { error };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      
      // Update state after successful logout
      setState(prevState => ({
        ...prevState,
        user: null,
        session: null,
        profile: null,
        isAuthenticated: false,
        isAdmin: false,
        isManager: false,
      }));
    } catch (error: any) {
      console.error("Error logging out:", error.message);
      toast.error("Error logging out");
    }
  };

  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        console.error("Password reset error:", error);
        toast.error("Password reset failed", { description: error.message });
        return { error };
      }
      
      toast.success("Password reset email sent", { 
        description: "Check your email for a password reset link." 
      });
      return { error: null };
    } catch (error: any) {
      console.error("Password reset exception:", error);
      toast.error("Password reset failed", { description: error.message });
      return { error };
    }
  };

  return {
    ...state,
    login,
    signup,
    logout,
    resetPassword,
  };
};
