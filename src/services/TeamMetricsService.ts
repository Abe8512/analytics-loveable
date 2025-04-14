
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TeamPerformanceMetric } from '@/types/teamTypes';
import { teamService } from './TeamService';

/**
 * Fetches team performance metrics with optional filtering
 */
export const useTeamPerformanceMetrics = (
  repId?: string | null,
  dateRange?: { from: Date, to: Date } | null
) => {
  const [metrics, setMetrics] = useState<TeamPerformanceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setIsLoading(true);
      
      try {
        // In a real application, you would fetch this from the database
        // Here we're creating mock data based on team members
        const teamMembers = await teamService.getTeamMembers();
        
        // Create mock metrics for each team member
        const mockMetrics: TeamPerformanceMetric[] = teamMembers.map(member => ({
          rep_id: member.id,
          rep_name: member.name,
          call_volume: Math.floor(Math.random() * 100) + 20,
          avg_call_duration: Math.floor(Math.random() * 500) + 120,
          sentiment_score: parseFloat((Math.random() * 0.4 + 0.6).toFixed(2)),
          success_rate: parseFloat((Math.random() * 40 + 60).toFixed(2)),
          avg_talk_ratio: parseFloat((Math.random() * 30 + 40).toFixed(2)),
          objection_handling_score: parseFloat((Math.random() * 30 + 70).toFixed(2)),
          positive_language_score: parseFloat((Math.random() * 20 + 80).toFixed(2)),
          top_keywords: ['product', 'pricing', 'features', 'competitors'].sort(() => Math.random() - 0.5).slice(0, 3),
          last_call_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        // Filter by repId if provided
        const filteredMetrics = repId 
          ? mockMetrics.filter(m => m.rep_id === repId)
          : mockMetrics;
        
        setMetrics(filteredMetrics);
        setError(null);
      } catch (err) {
        console.error("Error fetching team performance metrics:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch team metrics'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetrics();
  }, [repId, dateRange]);
  
  return { metrics, isLoading, error };
};

/**
 * Fetches aggregated team metrics 
 */
export const useAggregatedTeamMetrics = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API or database call
        // Mock aggregated metrics
        const mockData = {
          totalCallVolume: 1254,
          avgSuccessRate: 78.5,
          avgSentimentScore: 0.82,
          topPerformer: {
            name: 'Sarah Johnson',
            id: 'demo-1',
            metric: 'success_rate',
            value: 92
          },
          conversionTrend: [
            { month: 'Jan', rate: 65 },
            { month: 'Feb', rate: 68 },
            { month: 'Mar', rate: 72 },
            { month: 'Apr', rate: 75 },
            { month: 'May', rate: 79 },
            { month: 'Jun', rate: 78 }
          ]
        };
        
        setData(mockData);
        setError(null);
      } catch (err) {
        console.error("Error fetching aggregated team metrics:", err);
        setError(err instanceof Error ? err : new Error('Failed to fetch aggregated metrics'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return { data, isLoading, error };
};
