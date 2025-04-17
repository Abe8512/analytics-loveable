
import { useState, useEffect } from 'react';
import { AnalyticsService } from '@/services/AnalyticsService';

export const useAnalyticsData = (filters?: any) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const analyticsData = await AnalyticsService.getAnalyticsData();
        setData(analyticsData);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return { data, isLoading, error };
};
