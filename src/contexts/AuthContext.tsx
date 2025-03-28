
/**
 * Authentication Context
 * 
 * Provides authentication state and functions throughout the application.
 * Manages user sessions, profiles, and authorization levels (admin/manager).
 * Also handles team member management for managers.
 * 
 * @module contexts/AuthContext
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthClient, UserProfile, AuthResult } from "@/hooks/useAuthClient";
import { User, Session } from "@supabase/supabase-js";
import { teamService } from "@/services/TeamService";
import { toast } from "sonner";
import { EventsService } from "@/services/EventsService";

/**
 * Authentication Context Props Interface
 * Defines the shape of the authentication context data and methods
 */
interface AuthContextProps {
  /** Current authenticated user object */
  user: User | null;
  /** Current session object */
  session: Session | null;
  /** User profile with additional details */
  profile: UserProfile | null;
  /** Loading state for authentication operations */
  isLoading: boolean;
  /** Whether user is currently authenticated */
  isAuthenticated: boolean;
  /** Whether user has admin privileges */
  isAdmin: boolean;
  /** Whether user has manager privileges */
  isManager: boolean;
  /** List of users managed by the current user (if manager) */
  managedUsers: any[];
  /** Currently selected user for filtered views */
  selectedUser: any | null;
  /** Function to set the selected user */
  setSelectedUser: (user: any | null) => void;
  /** Function to authenticate a user with email/password */
  login: (email: string, password: string) => Promise<AuthResult>;
  /** Function to create a new user account */
  signup: (email: string, password: string, name: string) => Promise<AuthResult>;
  /** Function to log the current user out */
  logout: () => Promise<void>;
  /** Function to send a password reset email */
  resetPassword: (email: string) => Promise<AuthResult>;
  /** Function to get users managed by the current user */
  getManagedUsers: () => any[];
  /** Function to refresh the list of managed users */
  refreshManagedUsers: () => Promise<void>;
}

// Create the context with default values
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

/**
 * Custom hook to use the auth context
 * @returns {AuthContextProps} The auth context
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Authentication Provider Component
 * 
 * Wraps the application to provide authentication context
 * Manages auth state and provides auth-related functions
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const authClient = useAuthClient();
  const navigate = useNavigate();
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);

  /**
   * Refreshes the list of managed users from the team service
   * Dispatches an event to notify other components when users are refreshed
   */
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
      EventsService.dispatchEvent('MANAGED_USERS_UPDATED', fetchedUsers);
      
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
    
    const teamMemberAddedUnsubscribe = EventsService.addEventListener('TEAM_MEMBER_ADDED', handleTeamMemberAdded);
    const teamMemberRemovedUnsubscribe = EventsService.addEventListener('TEAM_MEMBER_REMOVED', handleTeamMemberRemoved);
    
    return () => {
      teamMemberAddedUnsubscribe();
      teamMemberRemovedUnsubscribe();
    };
  }, []);

  /**
   * Enhanced logout with navigation and cleanup
   * Clears selected user, managed users, and navigates to auth page
   */
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

  /**
   * Gets the current list of managed users
   * @returns {any[]} Array of managed users
   */
  const getManagedUsers = () => {
    return managedUsers;
  };

  // Combine all values and functions into the context value
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
