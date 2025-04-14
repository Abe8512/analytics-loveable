
import { supabase } from '@/integrations/supabase/client';
import { TeamPerformanceMetric, TeamPerformance } from '@/types/teamTypes';

// Service to fetch and process team metrics
export class TeamMetricsService {
  /**
   * Get performance metrics for all team members
   */
  static async getTeamPerformanceMetrics(): Promise<TeamPerformanceMetric[]> {
    try {
      // First try to get metrics from the database
      const { data, error } = await supabase
        .from('rep_metrics_summary')
        .select('*')
        .order('call_volume', { ascending: false });

      if (error) {
        console.error('Error fetching team metrics:', error);
        // If there's an error, return demo data
        return this.getDemoTeamMetrics();
      }

      if (data && data.length > 0) {
        // Transform the database response to match TeamPerformanceMetric
        return data.map(item => ({
          id: item.id,
          name: item.rep_name,
          value: item.sentiment_score * 100,
          change: Math.random() * 20 - 10, // Random change for demo
          trend: Math.random() > 0.5 ? 'up' : 'down',
          performance: item.sentiment_score > 0.7 ? 'good' : item.sentiment_score > 0.4 ? 'average' : 'poor'
        }));
      } else {
        // If no data, return demo data
        return this.getDemoTeamMetrics();
      }
    } catch (error) {
      console.error('Error in getTeamPerformanceMetrics:', error);
      return this.getDemoTeamMetrics();
    }
  }

  /**
   * Get detailed performance data for charts and tables
   */
  static async getTeamPerformanceData(): Promise<TeamPerformance[]> {
    try {
      // First try to get data from the database
      const { data, error } = await supabase
        .from('rep_metrics_summary')
        .select('*')
        .order('call_volume', { ascending: false });

      if (error) {
        console.error('Error fetching team performance data:', error);
        // If there's an error, return demo data
        return this.getDemoTeamPerformanceData();
      }

      if (data && data.length > 0) {
        // Transform the database response to match TeamPerformance
        return data.map(item => ({
          id: item.id,
          name: item.rep_name,
          rep_id: item.rep_id,
          calls: item.call_volume,
          successRate: Math.round(item.success_rate * 100),
          avgSentiment: item.sentiment_score,
          conversionRate: item.success_rate
        }));
      } else {
        // If no data, return demo data
        return this.getDemoTeamPerformanceData();
      }
    } catch (error) {
      console.error('Error in getTeamPerformanceData:', error);
      return this.getDemoTeamPerformanceData();
    }
  }

  /**
   * Get demo metrics data for UI development
   */
  private static getDemoTeamMetrics(): TeamPerformanceMetric[] {
    return [
      {
        id: '1',
        name: 'John Smith',
        value: 85,
        change: 5.2,
        trend: 'up',
        performance: 'good'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        value: 72,
        change: -2.1,
        trend: 'down',
        performance: 'average'
      },
      {
        id: '3',
        name: 'Michael Brown',
        value: 91,
        change: 8.7,
        trend: 'up',
        performance: 'good'
      },
      {
        id: '4',
        name: 'Emily Davis',
        value: 64,
        change: 1.3,
        trend: 'up',
        performance: 'average'
      }
    ];
  }

  /**
   * Get demo performance data for charts and tables
   */
  private static getDemoTeamPerformanceData(): TeamPerformance[] {
    return [
      {
        id: '1',
        name: 'John Smith',
        rep_id: 'rep-1',
        calls: 45,
        successRate: 78,
        avgSentiment: 0.85,
        conversionRate: 0.32
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        rep_id: 'rep-2',
        calls: 38,
        successRate: 65,
        avgSentiment: 0.72,
        conversionRate: 0.29
      },
      {
        id: '3',
        name: 'Michael Brown',
        rep_id: 'rep-3',
        calls: 52,
        successRate: 82,
        avgSentiment: 0.91,
        conversionRate: 0.41
      },
      {
        id: '4',
        name: 'Emily Davis',
        rep_id: 'rep-4',
        calls: 31,
        successRate: 59,
        avgSentiment: 0.64,
        conversionRate: 0.25
      }
    ];
  }
}
