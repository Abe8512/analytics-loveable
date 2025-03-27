
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMetric, RepMetric, MetricsHookResult } from './RealTimeMetrics.types';
import { useEventListener } from '@/services/events/hooks';
import { EventType } from '@/services/events/types';

// Helper to check if table exists
const isTableMissing = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
    
    return error?.message.includes(`relation "${tableName}" does not exist`) || false;
  } catch (error) {
    console.error(`Error checking if ${tableName} table exists:`, error);
    return true; // Assume missing if we can't check
  }
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
        // Fetch from database if table exists
        const { data, error: fetchError } = await supabase
          .from('team_metrics_summary')
          .select('*');
        
        if (fetchError) {
          throw new Error(`Failed to fetch team metrics: ${fetchError.message}`);
        }
        
        if (data && data.length > 0) {
          setMetrics(data);
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
  useEventListener('call-updated' as EventType, () => {
    fetchMetrics();
  });

  useEventListener('team-member-added' as EventType, () => {
    fetchMetrics();
  });

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
        
        if (data && data.length > 0) {
          setMetrics(data);
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
  useEventListener('call-updated' as EventType, () => {
    fetchMetrics();
  });

  useEventListener('team-member-added' as EventType, () => {
    fetchMetrics();
  });

  return { metrics, isLoading, error, refresh: fetchMetrics };
};
