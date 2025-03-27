
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface TeamMetric {
  id: string;
  team_name: string;
  call_count: number;
  avg_sentiment: number;
  avg_duration: number;
  conversion_rate: number;
}

export interface RepMetric {
  id: string;
  rep_name: string;
  call_count: number;
  avg_sentiment: number;
  avg_duration: number;
  conversion_rate: number;
}

// Hook for team metrics
export const useTeamMetrics = () => {
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchTeamMetrics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch metrics from API or database
        const { data, error } = await supabase
          .from('team_metrics')
          .select('*');
        
        if (error) throw error;
        
        // If no data, use mock data
        if (!data || data.length === 0) {
          setMetrics([
            {
              id: '1',
              team_name: 'Sales Team A',
              call_count: 120,
              avg_sentiment: 0.75,
              avg_duration: 340,
              conversion_rate: 0.32
            },
            {
              id: '2',
              team_name: 'Sales Team B',
              call_count: 85,
              avg_sentiment: 0.68,
              avg_duration: 290,
              conversion_rate: 0.28
            }
          ]);
        } else {
          setMetrics(data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching team metrics:', err);
        setError(err as Error);
        
        // Fallback to mock data
        setMetrics([
          {
            id: '1',
            team_name: 'Sales Team A',
            call_count: 120,
            avg_sentiment: 0.75,
            avg_duration: 340,
            conversion_rate: 0.32
          },
          {
            id: '2',
            team_name: 'Sales Team B',
            call_count: 85,
            avg_sentiment: 0.68,
            avg_duration: 290,
            conversion_rate: 0.28
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMetrics();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchTeamMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { metrics, isLoading, error };
};

// Hook for representative metrics
export const useRepMetrics = () => {
  const [metrics, setMetrics] = useState<RepMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchRepMetrics = async () => {
      try {
        setIsLoading(true);
        
        // Fetch metrics from API or database
        const { data, error } = await supabase
          .from('rep_metrics')
          .select('*');
        
        if (error) throw error;
        
        // If no data, use mock data
        if (!data || data.length === 0) {
          setMetrics([
            {
              id: '1',
              rep_name: 'John Doe',
              call_count: 45,
              avg_sentiment: 0.82,
              avg_duration: 310,
              conversion_rate: 0.38
            },
            {
              id: '2',
              rep_name: 'Jane Smith',
              call_count: 38,
              avg_sentiment: 0.79,
              avg_duration: 290,
              conversion_rate: 0.35
            },
            {
              id: '3',
              rep_name: 'Dave Wilson',
              call_count: 42,
              avg_sentiment: 0.74,
              avg_duration: 320,
              conversion_rate: 0.30
            }
          ]);
        } else {
          setMetrics(data);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching rep metrics:', err);
        setError(err as Error);
        
        // Fallback to mock data
        setMetrics([
          {
            id: '1',
            rep_name: 'John Doe',
            call_count: 45,
            avg_sentiment: 0.82,
            avg_duration: 310,
            conversion_rate: 0.38
          },
          {
            id: '2',
            rep_name: 'Jane Smith',
            call_count: 38,
            avg_sentiment: 0.79,
            avg_duration: 290,
            conversion_rate: 0.35
          },
          {
            id: '3',
            rep_name: 'Dave Wilson',
            call_count: 42,
            avg_sentiment: 0.74,
            avg_duration: 320,
            conversion_rate: 0.30
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRepMetrics();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchRepMetrics, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return { metrics, isLoading, error };
};

// Alias for backward compatibility with useRealTimeTeamMetrics
export const useRealTimeTeamMetrics = useTeamMetrics;

export const RealTimeMetricsService = {
  useTeamMetrics,
  useRepMetrics,
  useRealTimeTeamMetrics
};

export default RealTimeMetricsService;
