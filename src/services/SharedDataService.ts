
import { TeamMember } from "./TeamService";
import { dispatchEvent } from "@/services/events";

interface ManagedUser {
  id: string;
  name?: string;
  email?: string;
}

// Session storage key for managed users
const MANAGED_USERS_KEY = 'managedUsers';

// Get managed users from session storage or fallback
export const getManagedUsers = (): ManagedUser[] => {
  try {
    const storedData = sessionStorage.getItem(MANAGED_USERS_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Error retrieving managed users from session storage:', error);
  }
  
  // Return empty array if no stored data
  return [];
};

// Store managed users in session storage
export const storeManagedUsers = (users: ManagedUser[]): void => {
  try {
    sessionStorage.setItem(MANAGED_USERS_KEY, JSON.stringify(users));
    dispatchEvent("MANAGED_USERS_UPDATED", { users });
  } catch (error) {
    console.error('Error storing managed users in session storage:', error);
  }
};

// Add a single managed user
export const addManagedUser = (user: ManagedUser): void => {
  const currentUsers = getManagedUsers();
  
  // Check if user already exists
  if (!currentUsers.some(u => u.id === user.id)) {
    const updatedUsers = [...currentUsers, user];
    storeManagedUsers(updatedUsers);
  }
};

// Remove a managed user
export const removeManagedUser = (userId: string): void => {
  const currentUsers = getManagedUsers();
  const updatedUsers = currentUsers.filter(user => user.id !== userId);
  storeManagedUsers(updatedUsers);
};

// Sync managed users with team members from TeamService
export const syncManagedUsersWithTeamMembers = (teamMembers: TeamMember[]): void => {
  if (!teamMembers || teamMembers.length === 0) {
    return;
  }
  
  const managedUsers: ManagedUser[] = teamMembers.map(member => ({
    id: member.id,
    name: member.name,
    email: member.email
  }));
  
  storeManagedUsers(managedUsers);
  console.log(`Synced ${managedUsers.length} team members to managed users`);
};

// Get a team member name from ID
export const getTeamMemberName = (id: string): string => {
  const managedUsers = getManagedUsers();
  const user = managedUsers.find(u => u.id === id);
  
  if (user && user.name) {
    return user.name;
  }
  
  // Fall back to direct storage lookup if needed
  try {
    const storedData = localStorage.getItem('teamMembers');
    if (storedData) {
      const teamMembers = JSON.parse(storedData);
      const member = teamMembers.find((m: TeamMember) => m.id === id || m.user_id === id);
      if (member) {
        return member.name;
      }
    }
  } catch (error) {
    console.error('Error looking up team member name:', error);
  }
  
  return id.startsWith('demo-') ? `Demo User ${id.replace('demo-', '')}` : `User ${id.substring(0, 5)}`;
};
