
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamMetric, RepMetric, MetricsHookResult } from './RealTimeMetrics.types';

// Mock data for development
const mockTeamMetrics: TeamMetric[] = [
  {
    id: '1',
    team_name: 'Sales Team A',
    call_count: 145,
    avg_sentiment: 0.75,
    avg_duration: 12.3,
    conversion_rate: 0.32
  },
  {
    id: '2',
    team_name: 'Sales Team B',
    call_count: 98,
    avg_sentiment: 0.82,
    avg_duration: 14.7,
    conversion_rate: 0.28
  }
];

const mockRepMetrics: RepMetric[] = [
  {
    id: '1',
    rep_name: 'John Doe',
    call_count: 42,
    avg_sentiment: 0.68,
    avg_duration: 10.5,
    conversion_rate: 0.25
  },
  {
    id: '2',
    rep_name: 'Jane Smith',
    call_count: 37,
    avg_sentiment: 0.91,
    avg_duration: 15.2,
    conversion_rate: 0.42
  }
];

// Team metrics hook
export const useTeamMetrics = (): MetricsHookResult<TeamMetric> => {
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from database
      let data;
      try {
        const { data: dbData, error: dbError } = await supabase
          .from('team_metrics_summary')
          .select('*');

        if (dbError) throw dbError;
        data = dbData;
      } catch (dbError) {
        console.warn('Error fetching team metrics from database, using mock data', dbError);
        // Fall back to mock data
        data = mockTeamMetrics;
      }

      // Transform data if needed
      const formattedMetrics: TeamMetric[] = data.map((item: any) => ({
        id: item.id || String(Math.random()),
        team_name: item.team_name || 'Unknown Team',
        call_count: Number(item.call_count || 0),
        avg_sentiment: Number(item.avg_sentiment || 0),
        avg_duration: Number(item.avg_duration || 0),
        conversion_rate: Number(item.conversion_rate || 0)
      }));

      setMetrics(formattedMetrics);
    } catch (err) {
      console.error('Error in useTeamMetrics:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setMetrics(mockTeamMetrics); // Fall back to mock data on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, isLoading, error, refresh: fetchMetrics };
};

// Rep metrics hook
export const useRepMetrics = (): MetricsHookResult<RepMetric> => {
  const [metrics, setMetrics] = useState<RepMetric[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to fetch from database
      let data;
      try {
        const { data: dbData, error: dbError } = await supabase
          .from('rep_metrics_summary')
          .select('*');

        if (dbError) throw dbError;
        data = dbData;
      } catch (dbError) {
        console.warn('Error fetching rep metrics from database, using mock data', dbError);
        // Fall back to mock data
        data = mockRepMetrics;
      }

      // Transform data if needed
      const formattedMetrics: RepMetric[] = data.map((item: any) => ({
        id: item.id || String(Math.random()),
        rep_name: item.rep_name || 'Unknown Rep',
        call_count: Number(item.call_count || 0),
        avg_sentiment: Number(item.avg_sentiment || 0),
        avg_duration: Number(item.avg_duration || 0),
        conversion_rate: Number(item.conversion_rate || 0)
      }));

      setMetrics(formattedMetrics);
    } catch (err) {
      console.error('Error in useRepMetrics:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setMetrics(mockRepMetrics); // Fall back to mock data on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return { metrics, isLoading, error, refresh: fetchMetrics };
};
