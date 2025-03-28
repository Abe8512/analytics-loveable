
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthClient, UserProfile, AuthResult } from "@/hooks/useAuthClient";
import { User, Session } from "@supabase/supabase-js";
import { teamService } from "@/services/TeamService";
import { toast } from "sonner";
import { EventsService } from "@/services/EventsService";

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
  refreshManagedUsers: () => Promise<void>;
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
  refreshManagedUsers: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);

  // Function to refresh managed users
  const refreshManagedUsers = async () => {
    if (!authClient.isAuthenticated || isRefreshingUsers) return;
    
    setIsRefreshingUsers(true);
    try {
      const fetchedUsers = await teamService.getTeamMembers();
      setManagedUsers(fetchedUsers);
      
      if (fetchedUsers.length > 0 && !selectedUser) {
        setSelectedUser(fetchedUsers[0]);
      }
      
      // Dispatch an event to notify other components that users have been refreshed
      EventsService.dispatch('MANAGED_USERS_UPDATED', fetchedUsers);
      
      return fetchedUsers;
    } catch (err) {
      console.error("Error refreshing managed users:", err);
      toast.error("Failed to refresh team members");
    } finally {
      setIsRefreshingUsers(false);
    }
  };

  // Initial fetch of managed users when authenticated
  useEffect(() => {
    if (authClient.isAuthenticated && !isRefreshingUsers) {
      refreshManagedUsers();
    }
  }, [authClient.isAuthenticated]);

  // Listen for team member events
  useEffect(() => {
    const handleTeamMemberAdded = () => {
      refreshManagedUsers();
    };
    
    const handleTeamMemberRemoved = () => {
      refreshManagedUsers();
    };
    
    EventsService.subscribe('TEAM_MEMBER_ADDED', handleTeamMemberAdded);
    EventsService.subscribe('TEAM_MEMBER_REMOVED', handleTeamMemberRemoved);
    
    return () => {
      EventsService.unsubscribe('TEAM_MEMBER_ADDED', handleTeamMemberAdded);
      EventsService.unsubscribe('TEAM_MEMBER_REMOVED', handleTeamMemberRemoved);
    };
  }, []);

  // Enhanced logout with navigation and cleanup
  const handleLogout = async (): Promise<void> => {
    try {
      await authClient.logout();
      setSelectedUser(null);
      setManagedUsers([]);
      navigate("/auth");
      toast.success("You have been successfully logged out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error during logout");
    }
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
    refreshManagedUsers,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
