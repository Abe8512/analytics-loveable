
import { useState, useEffect } from 'react';
import { realTimeMetricsService } from '@/services/RealTimeMetricsService';
import { TeamPerformance } from '@/types/teamTypes';
import { TeamMetric, RepMetric } from '@/services/RealTimeMetrics.types';

/**
 * Hook to access team metrics data
 */
export const useTeamMetrics = () => {
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        // Fallback implementation since team_performance table might not exist
        const demoTeamData: TeamMetric[] = [
          {
            team_id: '1',
            team_name: 'Sales Team',
            call_count: 145,
            avg_sentiment: 0.72,
            avg_duration: 320
          },
          {
            team_id: '2',
            team_name: 'Support Team',
            call_count: 98,
            avg_sentiment: 0.68,
            avg_duration: 450
          }
        ];
        setMetrics(demoTeamData);
      } catch (err) {
        console.error('Error fetching team metrics:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading team metrics'));
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  return { metrics, isLoading, error };
};

/**
 * Hook to access individual rep metrics data
 */
export const useRepMetrics = () => {
  const [metrics, setMetrics] = useState<RepMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setIsLoading(true);
        // Fallback demo data since the API might not be ready
        const demoRepData: RepMetric[] = [
          {
            rep_id: '1',
            rep_name: 'John Smith',
            call_count: 45,
            avg_sentiment: 0.75,
            conversion_rate: 0.32
          },
          {
            rep_id: '2',
            rep_name: 'Sarah Johnson',
            call_count: 62,
            avg_sentiment: 0.82,
            conversion_rate: 0.41
          },
          {
            rep_id: '3',
            rep_name: 'Michael Chen',
            call_count: 38,
            avg_sentiment: 0.69,
            conversion_rate: 0.28
          }
        ];
        setMetrics(demoRepData);
      } catch (err) {
        console.error('Error fetching rep metrics:', err);
        setError(err instanceof Error ? err : new Error('Unknown error loading rep metrics'));
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  return { metrics, isLoading, error };
};
