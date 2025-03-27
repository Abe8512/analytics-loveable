import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { getManagedUsers } from "@/services/SharedDataService";

interface AuthContextProps {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  managedUsers: any[];
  selectedUser: any | null;
  setSelectedUser: (user: any | null) => void;
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
    const fetchManagedUsers = () => {
      const users = getManagedUsers();
      setManagedUsers(users);
      if (users && users.length > 0) {
        setSelectedUser(users[0]);
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

  const value: AuthContextProps = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
    managedUsers,
    selectedUser,
    setSelectedUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
