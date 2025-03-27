
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMetric, RepMetric, MetricsHookResult, RepMetricDb, TeamMetricDb } from './RealTimeMetrics.types';
import { addEventListener } from '@/services/events/store';
import { EventType } from '@/services/events/types';

// Helper to check if table exists
const isTableMissing = async (tableName: string): Promise<boolean> => {
  try {
    // Use a safer approach that doesn't rely on dynamic table names
    const { data, error } = await supabase
      .rpc('check_table_exists', { table_name: tableName });
    
    // If the function doesn't exist or returns an error, consider the table missing
    if (error) {
      console.error(`Error checking if ${tableName} table exists:`, error);
      return true;
    }
    
    return !data;
  } catch (error) {
    console.error(`Error checking if ${tableName} table exists:`, error);
    return true; // Assume missing if we can't check
  }
};

// Convert database rep metrics to the application model
const convertRepDbMetricsToAppMetrics = (repMetrics: RepMetricDb[]): RepMetric[] => {
  return repMetrics.map(metric => ({
    id: metric.id,
    rep_name: metric.rep_name,
    call_count: metric.call_volume || 0,
    avg_sentiment: metric.sentiment_score || 0.5,
    avg_duration: 300, // Default 5 minutes in seconds
    conversion_rate: metric.success_rate || 0.4,
  }));
};

// Convert database team metrics to the application model
const convertTeamDbMetricsToAppMetrics = (teamMetrics: TeamMetricDb[]): TeamMetric[] => {
  return teamMetrics.map(metric => ({
    id: metric.id,
    team_name: metric.team_name || 'Unknown Team',
    call_count: metric.call_volume || 0,
    avg_sentiment: metric.sentiment_score || 0.5,
    avg_duration: 300, // Default 5 minutes in seconds
    conversion_rate: metric.success_rate || 0.4,
  }));
};

// Generate mock team metrics
const generateMockTeamMetrics = (): TeamMetric[] => {
  return [
    {
      id: "team1",
      team_name: "Sales Team Alpha",
      call_count: 128,
      avg_sentiment: 0.75,
      avg_duration: 325,
      conversion_rate: 0.45
    },
    {
      id: "team2",
      team_name: "Sales Team Beta",
      call_count: 96,
      avg_sentiment: 0.68,
      avg_duration: 298,
      conversion_rate: 0.38
    },
    {
      id: "team3",
      team_name: "Sales Team Gamma",
      call_count: 152,
      avg_sentiment: 0.82,
      avg_duration: 345,
      conversion_rate: 0.52
    }
  ];
};

// Generate mock rep metrics
const generateMockRepMetrics = (): RepMetric[] => {
  return [
    {
      id: "rep1",
      rep_name: "John Doe",
      call_count: 45,
      avg_sentiment: 0.78,
      avg_duration: 310,
      conversion_rate: 0.48
    },
    {
      id: "rep2",
      rep_name: "Jane Smith",
      call_count: 38,
      avg_sentiment: 0.82,
      avg_duration: 295,
      conversion_rate: 0.52
    },
    {
      id: "rep3",
      rep_name: "Dave Wilson",
      call_count: 42,
      avg_sentiment: 0.71,
      avg_duration: 325,
      conversion_rate: 0.40
    }
  ];
};

/**
 * React hook for team metrics
 */
export const useTeamMetrics = (): MetricsHookResult<TeamMetric> => {
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Check if table exists first
      const tableMissing = await isTableMissing('team_metrics_summary');
      
      if (tableMissing) {
        // Use mock data if table doesn't exist
        setMetrics(generateMockTeamMetrics());
        setError(null);
      } else {
        // Fetch from database using a direct query instead of RPC
        const { data, error: fetchError } = await supabase
          .from('team_metrics_summary')
          .select('*');
        
        if (fetchError) {
          throw new Error(`Failed to fetch team metrics: ${fetchError.message}`);
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
          setMetrics(convertTeamDbMetricsToAppMetrics(data as TeamMetricDb[]));
        } else {
          // Use mock data if no records found
          setMetrics(generateMockTeamMetrics());
        }
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching team metrics:', err);
      setError(err as Error);
      
      // Fallback to mock data on error
      setMetrics(generateMockTeamMetrics());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Listen for events that should trigger a refresh
  useEffect(() => {
    const removeCallUpdatedListener = addEventListener('call-updated' as EventType, () => {
      fetchMetrics();
    });

    const removeTeamMemberAddedListener = addEventListener('team-member-added' as EventType, () => {
      fetchMetrics();
    });

    return () => {
      if (removeCallUpdatedListener) removeCallUpdatedListener();
      if (removeTeamMemberAddedListener) removeTeamMemberAddedListener();
    };
  }, [fetchMetrics]);

  return { metrics, isLoading, error, refresh: fetchMetrics };
};

/**
 * React hook for rep metrics
 */
export const useRepMetrics = (): MetricsHookResult<RepMetric> => {
  const [metrics, setMetrics] = useState<RepMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Check if table exists first
      const tableMissing = await isTableMissing('rep_metrics_summary');
      
      if (tableMissing) {
        // Use mock data if table doesn't exist
        setMetrics(generateMockRepMetrics());
        setError(null);
      } else {
        // Fetch from database if table exists
        const { data, error: fetchError } = await supabase
          .from('rep_metrics_summary')
          .select('*');
        
        if (fetchError) {
          throw new Error(`Failed to fetch rep metrics: ${fetchError.message}`);
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
          setMetrics(convertRepDbMetricsToAppMetrics(data as RepMetricDb[]));
        } else {
          // Use mock data if no records found
          setMetrics(generateMockRepMetrics());
        }
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching rep metrics:', err);
      setError(err as Error);
      
      // Fallback to mock data on error
      setMetrics(generateMockRepMetrics());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Listen for events that should trigger a refresh
  useEffect(() => {
    const removeCallUpdatedListener = addEventListener('call-updated' as EventType, () => {
      fetchMetrics();
    });

    const removeTeamMemberAddedListener = addEventListener('team-member-added' as EventType, () => {
      fetchMetrics();
    });

    return () => {
      if (removeCallUpdatedListener) removeCallUpdatedListener();
      if (removeTeamMemberAddedListener) removeTeamMemberAddedListener();
    };
  }, [fetchMetrics]);

  return { metrics, isLoading, error, refresh: fetchMetrics };
};
