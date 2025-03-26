
// SharedDataService.ts - Central service for sharing data between components
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define data filter interfaces
export interface DataFilters {
  dateRange?: { from: Date; to: Date };
  repIds?: string[];
  sentimentRange?: { min: number; max: number };
  keywords?: string[];
  customerId?: string;
}

export interface TeamMetricsData {
  totalCalls: number;
  avgSentiment: number;
  avgTalkRatio: {
    agent: number;
    customer: number;
  };
  topKeywords: string[];
  performanceScore: number;
  conversionRate: number;
}

export interface RepMetricsData {
  id: string;
  name: string;
  callVolume: number;
  successRate: number;
  sentiment: number;
  insights: string[];
}

// Team metrics hook
export const useSharedTeamMetrics = (filters?: DataFilters) => {
  const [metrics, setMetrics] = useState<TeamMetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTeamMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from Supabase first
        const { data, error } = await supabase
          .from('call_metrics_summary')
          .select('*')
          .order('report_date', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Error fetching team metrics:", error);
          // Fall back to demo data
          setMetrics(getTeamMetrics());
        } else if (data) {
          // Map DB data to our interface
          setMetrics({
            totalCalls: data.total_calls || 0,
            avgSentiment: data.avg_sentiment || 0.5,
            avgTalkRatio: {
              agent: data.agent_talk_ratio || 50,
              customer: data.customer_talk_ratio || 50
            },
            topKeywords: data.top_keywords || ['pricing', 'features', 'support', 'implementation', 'integration'],
            performanceScore: data.performance_score || 72,
            conversionRate: data.conversion_rate || 45
          });
        } else {
          // No data, use demo data
          setMetrics(getTeamMetrics());
        }
      } catch (err) {
        console.error("Failed to fetch team metrics:", err);
        setError(err);
        // Fall back to demo data
        setMetrics(getTeamMetrics());
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMetrics();
  }, [filters, user]);

  return { metrics, isLoading, error };
};

// Rep metrics hook
export const useSharedRepMetrics = (filters?: DataFilters) => {
  const [metrics, setMetrics] = useState<RepMetricsData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRepMetrics = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from('rep_metrics_summary')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error("Error fetching rep metrics:", error);
          // Fall back to demo data
          setMetrics(getRepMetrics());
        } else if (data && data.length > 0) {
          // Map DB data to our interface
          const mappedData = data.map(item => ({
            id: item.rep_id,
            name: item.rep_name || 'Unknown Rep',
            callVolume: item.call_volume || 0,
            successRate: item.success_rate || 0,
            sentiment: item.sentiment_score || 0.5,
            insights: item.insights || ["No insights available"]
          }));
          setMetrics(mappedData);
        } else {
          // No data, use demo data
          setMetrics(getRepMetrics());
        }
      } catch (err) {
        console.error("Failed to fetch rep metrics:", err);
        setError(err);
        // Fall back to demo data
        setMetrics(getRepMetrics());
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepMetrics();
  }, [filters, user]);

  return { metrics, isLoading, error };
};

// Fetch team member data - returns Promise to be compatible with async operations
export const getTeamMembers = async (): Promise<{ id: string, name: string, email: string, role: string }[]> => {
  try {
    // First try to fetch from the database
    const { data, error } = await supabase
      .from('team_members')
      .select('*');
    
    if (error) {
      console.error("Error fetching team members from database:", error);
      // Fall back to local storage if table doesn't exist
      return getStoredTeamMembers();
    }
    
    if (data && data.length > 0) {
      return data.map(member => ({
        id: member.member_id,
        name: member.name,
        email: member.email,
        role: member.role
      }));
    }
    
    // If no data in database, check local storage
    return getStoredTeamMembers();
  } catch (error) {
    console.error("Error fetching team members:", error);
    return getStoredTeamMembers();
  }
};

// Fetch team members from local storage
const getStoredTeamMembers = (): { id: string, name: string, email: string, role: string }[] => {
  try {
    const storedData = localStorage.getItem('team_members');
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error("Error parsing stored team members:", error);
  }
  
  // Return demo data if nothing in local storage
  return [
    { id: "1", name: "Alex Johnson", email: "alex@example.com", role: "sales" },
    { id: "2", name: "Maria Garcia", email: "maria@example.com", role: "sales" },
    { id: "3", name: "David Kim", email: "david@example.com", role: "sales" },
    { id: "4", name: "Sarah Williams", email: "sarah@example.com", role: "sales" },
    { id: "5", name: "James Taylor", email: "james@example.com", role: "sales" }
  ];
};

// Sync function for getting managed users
export const getManagedUsers = (): { id: string, name: string, email?: string, role?: string }[] => {
  // Try to get from session storage first
  try {
    const cachedData = sessionStorage.getItem('managed_users');
    if (cachedData) {
      return JSON.parse(cachedData);
    }
  } catch (error) {
    console.error("Error parsing cached managed users:", error);
  }
  
  // Return the same data as getTeamMembers for now
  // In a real implementation, we'd fetch this from the database based on the current user's permissions
  const teamMembers = getStoredTeamMembers();
  
  // Update session storage
  try {
    sessionStorage.setItem('managed_users', JSON.stringify(teamMembers));
  } catch (error) {
    console.error("Error storing managed users in session:", error);
  }
  
  return teamMembers;
};

export const getTeamMetrics = (): TeamMetricsData => {
  return {
    totalCalls: 128,
    avgSentiment: 0.72,
    avgTalkRatio: { agent: 55, customer: 45 },
    topKeywords: ['pricing', 'features', 'support', 'implementation', 'integration'],
    performanceScore: 72,
    conversionRate: 45
  };
};

export const getRepMetrics = (): RepMetricsData[] => {
  return [
    {
      id: "1",
      name: "Alex Johnson",
      callVolume: 145,
      successRate: 72,
      sentiment: 0.85,
      insights: ["Excellent rapport building", "Good at overcoming objections"]
    },
    {
      id: "2",
      name: "Maria Garcia",
      callVolume: 128,
      successRate: 68,
      sentiment: 0.79,
      insights: ["Strong product knowledge", "Could improve closing"]
    },
    {
      id: "3",
      name: "David Kim",
      callVolume: 103,
      successRate: 62,
      sentiment: 0.72,
      insights: ["Good discovery questions", "Needs work on follow-up"]
    }
  ];
};

// Create a hook to provide team metrics data with filter options
export const useTeamMetricsData = (filters?: DataFilters) => {
  return useSharedTeamMetrics(filters);
};

