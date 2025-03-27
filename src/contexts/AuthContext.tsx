
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { teamService } from "@/services/TeamService";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isManager: boolean;
  managedUsers: any[];
  selectedUser: any | null;
  setSelectedUser: (user: any | null) => void;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  getManagedUsers: () => any[];
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  isAdmin: false,
  isManager: false,
  managedUsers: [],
  selectedUser: null,
  setSelectedUser: () => {},
  login: async () => ({ error: null }),
  signup: async () => ({ error: null }),
  logout: async () => {},
  getManagedUsers: () => [],
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  
  // Determine roles from the profile instead of app_metadata
  const isAdmin = profile?.role === 'admin';
  const isManager = profile?.role === 'admin' || profile?.role === 'manager';

  // Fetch user profile from profiles table
  const fetchUserProfile = async (userId: string) => {
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
        // First set up auth state listener to avoid missing events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user || null);
            
            if (currentSession?.user) {
              // Fetch profile in a non-blocking way
              setTimeout(async () => {
                const userProfile = await fetchUserProfile(currentSession.user.id);
                setProfile(userProfile);
              }, 0);
            } else {
              setProfile(null);
            }
          }
        );
        
        // Then check for existing session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        setSession(initialSession);
        setUser(initialSession?.user || null);
        
        if (initialSession?.user) {
          const userProfile = await fetchUserProfile(initialSession.user.id);
          setProfile(userProfile);
        }
        
        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error setting up auth:", error);
        setIsLoading(false);
      }
    };
    
    setupAuth();
  }, []);

  useEffect(() => {
    const fetchManagedUsers = async () => {
      if (!isAuthenticated) return;
      
      try {
        const fetchedUsers = await teamService.getTeamMembers();
        setManagedUsers(fetchedUsers);
        
        if (fetchedUsers.length > 0 && !selectedUser) {
          setSelectedUser(fetchedUsers[0]);
        }
      } catch (err) {
        console.error("Error fetching managed users:", err);
      }
    };

    fetchManagedUsers();
  }, [isAuthenticated, selectedUser]);

  const login = async (email: string, password: string) => {
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

  const signup = async (email: string, password: string, name: string) => {
    try {
      // Split name into first and last name for profile
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setSelectedUser(null);
      navigate("/login");
      toast.success("Logged out successfully");
    } catch (error: any) {
      console.error("Error logging out:", error.message);
      toast.error("Error logging out");
    }
  };

  const getManagedUsers = () => {
    return managedUsers;
  };

  const value: AuthContextProps = {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated,
    isAdmin,
    isManager,
    managedUsers,
    selectedUser,
    setSelectedUser,
    login,
    signup,
    logout,
    getManagedUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
