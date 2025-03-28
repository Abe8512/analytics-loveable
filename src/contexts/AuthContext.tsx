
import React, { createContext, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthClient, UserProfile, AuthResult } from "@/hooks/useAuthClient";
import { User, Session } from "@supabase/supabase-js";
import { teamService } from "@/services/TeamService";

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
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string, name: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
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
  resetPassword: async () => ({ error: null }),
  getManagedUsers: () => [],
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const [managedUsers, setManagedUsers] = React.useState<any[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<any | null>(null);

  // Fetch managed users when authenticated
  React.useEffect(() => {
    const fetchManagedUsers = async () => {
      if (!authClient.isAuthenticated) return;
      
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
  }, [authClient.isAuthenticated, selectedUser]);

  // Enhanced logout with navigation
  const handleLogout = async (): Promise<void> => {
    await authClient.logout();
    setSelectedUser(null);
    navigate("/auth");
  };

  const getManagedUsers = () => {
    return managedUsers;
  };

  const contextValue: AuthContextProps = {
    ...authClient,
    managedUsers,
    selectedUser,
    setSelectedUser,
    logout: handleLogout,
    getManagedUsers,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
