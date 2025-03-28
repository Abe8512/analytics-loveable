import { useState, useEffect } from 'react';
import { TeamMember } from "./TeamService";
import { dispatchEvent } from "@/services/events";
import { supabase } from "@/integrations/supabase/client";
import { useEventsStore, addEventListener } from './events/store';
import { EventType } from "./events/types";

// Define TeamMetricsData type that was missing
export interface TeamMetricsData {
  totalCalls?: number;
  avgSentiment?: number;
  avgTalkRatio?: {
    agent: number;
    customer: number;
  };
  topKeywords?: string[];
  performanceScore?: number;
}

// Session storage key for managed users
const MANAGED_USERS_KEY = 'managedUsers';

interface ManagedUser {
  id: string;
  name?: string;
  email?: string;
}

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

// useSharedTeamMetrics hook
export const useSharedTeamMetrics = (filters?: any) => {
  const [metrics, setMetrics] = useState<TeamMetricsData>({
    totalCalls: 0,
    avgSentiment: 0.68,
    avgTalkRatio: {
      agent: 55,
      customer: 45
    },
    topKeywords: ['pricing', 'features', 'support'],
    performanceScore: 82
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Function to fetch metrics data
    const fetchMetrics = async () => {
      setIsLoading(true);
      try {
        // Attempt to fetch from Supabase
        const { data, error } = await supabase
          .from('call_metrics_summary')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          // Map database data to our TeamMetricsData interface
          setMetrics({
            totalCalls: data[0].total_calls || 0,
            avgSentiment: data[0].avg_sentiment || 0.68,
            avgTalkRatio: {
              agent: data[0].agent_talk_ratio || 55,
              customer: data[0].customer_talk_ratio || 45
            },
            topKeywords: data[0].top_keywords || ['pricing', 'features', 'support'],
            performanceScore: data[0].performance_score || 82
          });
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching team metrics:", err);
        setError(err as Error);
        // Keep using the default metrics on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetrics();

    // Set up listeners for data updates
    const unsubscribe = addEventListener("TEAM_DATA_UPDATED" as EventType, fetchMetrics);

    return () => {
      unsubscribe();
    };
  }, [filters]);

  return { metrics, isLoading, error };
};

// useTeamMetricsData hook (for PerformanceMetrics page)
export const useTeamMetricsData = (filters?: any) => {
  return useSharedTeamMetrics(filters);
};
