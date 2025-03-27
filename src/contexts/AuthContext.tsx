import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

interface AuthContextProps {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  managedUsers: any[];
  selectedUser: any | null;
  setSelectedUser: (user: any | null) => void;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<{ error: any }>;
  isManager: boolean;
  isAdmin: boolean;
  getManagedUsers: () => any[];
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
  managedUsers: [],
  selectedUser: null,
  setSelectedUser: () => {},
  isAuthenticated: false,
  login: async () => ({ error: null }),
  logout: async () => {},
  signup: async () => ({ error: null }),
  isManager: false,
  isAdmin: false,
  getManagedUsers: () => [],
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  
  const isManager = user?.app_metadata?.role === 'manager' || user?.app_metadata?.role === 'admin';
  const isAdmin = user?.app_metadata?.role === 'admin';

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      setSession(initialSession);

      supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user || null);
      });

      setIsLoading(false);
    };

    loadSession();
  }, []);

  useEffect(() => {
    const fetchManagedUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*');

        if (error || !data || data.length === 0) {
          setManagedUsers([
            { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Sales Rep' },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Sales Rep' },
          ]);
        } else {
          setManagedUsers(data);
        }
        
        if (managedUsers.length > 0 && !selectedUser) {
          setSelectedUser(managedUsers[0]);
        }
      } catch (err) {
        console.error("Error fetching managed users:", err);
        setManagedUsers([
          { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Sales Rep' },
          { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Sales Rep' },
        ]);
      }
    };

    fetchManagedUsers();
  }, []);

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert("Check your email for the magic link.");
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error("Login error:", error);
        return { error };
      }
      return { error: null };
    } catch (error: any) {
      console.error("Login exception:", error);
      return { error };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: any) {
      console.error("Error logging out:", error.message);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
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
        console.error("Signup error:", error);
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error("Signup exception:", error);
      return { error };
    }
  };

  const getManagedUsers = () => {
    return managedUsers;
  };

  const value: AuthContextProps = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    managedUsers,
    selectedUser,
    setSelectedUser,
    isAuthenticated,
    login,
    logout,
    signup,
    isManager,
    isAdmin,
    getManagedUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
