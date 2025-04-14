
import { useState, useEffect } from 'react';
import { TeamMetric, RepMetric } from './RealTimeMetrics.types';
import { EventsService } from './EventsService';
import { EventType } from './events/types';

// Hook to get team metrics
export const useTeamMetrics = () => {
  const [metrics, setMetrics] = useState<TeamMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeamMetrics = async () => {
      setIsLoading(true);
      try {
        // This would normally be a real API call
        // For now, generate mock data
        const mockData: TeamMetric[] = [
          {
            team_name: 'Sales Team Alpha',
            team_id: 'team-1',
            call_count: 145,
            avg_sentiment: 0.78,
            conversion_rate: 0.32
          },
          {
            team_name: 'Sales Team Beta',
            team_id: 'team-2',
            call_count: 98,
            avg_sentiment: 0.65,
            conversion_rate: 0.27
          },
          {
            team_name: 'Sales Team Gamma',
            team_id: 'team-3',
            call_count: 112,
            avg_sentiment: 0.82,
            conversion_rate: 0.41
          }
        ];
        
        setMetrics(mockData);
      } catch (err) {
        console.error('Error fetching team metrics:', err);
        setError(err instanceof Error ? err : new Error('Failed to load team metrics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamMetrics();

    // Listen for metrics updates
    const unsubscribe = EventsService.addEventListener('TEAM_METRICS_UPDATED' as EventType, (data) => {
      if (data && data.metrics) {
        setMetrics(data.metrics);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { metrics, isLoading, error };
};

// Hook to get rep metrics
export const useRepMetrics = (repId?: string) => {
  const [metrics, setMetrics] = useState<RepMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRepMetrics = async () => {
      setIsLoading(true);
      try {
        // This would normally be a real API call
        // For now, generate mock data
        const mockData: RepMetric[] = [
          {
            rep_name: 'John Smith',
            rep_id: 'rep-1',
            call_count: 45,
            avg_sentiment: 0.78,
            conversion_rate: 0.32
          },
          {
            rep_name: 'Sarah Johnson',
            rep_id: 'rep-2',
            call_count: 38,
            avg_sentiment: 0.65,
            conversion_rate: 0.27
          },
          {
            rep_name: 'Michael Brown',
            rep_id: 'rep-3',
            call_count: 52,
            avg_sentiment: 0.82,
            conversion_rate: 0.41
          }
        ];
        
        // If repId is provided, filter the data
        if (repId) {
          setMetrics(mockData.filter(rep => rep.rep_id === repId));
        } else {
          setMetrics(mockData);
        }
      } catch (err) {
        console.error('Error fetching rep metrics:', err);
        setError(err instanceof Error ? err : new Error('Failed to load rep metrics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchRepMetrics();

    // Listen for metrics updates
    const unsubscribe = EventsService.addEventListener('TEAM_METRICS_UPDATED' as EventType, (data) => {
      if (data && data.metrics) {
        if (repId) {
          setMetrics(data.metrics.filter((rep: RepMetric) => rep.rep_id === repId));
        } else {
          setMetrics(data.metrics);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [repId]);

  return { metrics, isLoading, error };
};
