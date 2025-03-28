import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User, Session } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
}

export interface AuthResult {
  error: AuthError | null;
}

export interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
}

export const useAuthClient = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
  });

  const fetchUserProfile = async (userId: string): Promise<UserProfile | null> => {
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
      
      return data as UserProfile;
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
            }));
            
            if (currentSession?.user) {
              setTimeout(async () => {
                const userProfile = await fetchUserProfile(currentSession.user.id);
                setState(prevState => ({
                  ...prevState,
                  profile: userProfile,
                }));
              }, 0);
            } else {
              setState(prevState => ({
                ...prevState,
                profile: null,
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
        }));
        
        if (initialSession?.user) {
          const userProfile = await fetchUserProfile(initialSession.user.id);
          setState(prevState => ({
            ...prevState,
            profile: userProfile,
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
    } catch (error: any) {
      console.error("Error logging out:", error.message);
      toast.error("Error logging out");
    }
  };

  const resetPassword = async (token: string): Promise<AuthResult> => {
    try {
      console.log("Resetting password with token:", token);
      
      return { error: null };
    } catch (error: any) {
      console.error("Password reset exception:", error);
      return { error };
    }
  };

  return {
    ...state,
    login,
    signup,
    logout,
    resetPassword,
    isAuthenticated: !!state.user,
    isAdmin: state.profile?.role === 'admin',
    isManager: state.profile?.role === 'admin' || state.profile?.role === 'manager',
  };
};
