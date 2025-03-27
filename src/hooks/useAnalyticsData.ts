
import { useState, useEffect } from 'react';
import { AnalyticsService, AnalyticsData } from '@/services/AnalyticsService';

interface UseAnalyticsDataResult {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useAnalyticsData = (filters?: any): UseAnalyticsDataResult => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const analyticsData = await AnalyticsService.getAnalyticsData();
      setData(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch analytics data'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  return { data, isLoading, error, refetch: fetchData };
};
