
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsData {
  totalCalls: string;
  avgDuration: string;
  conversionRate: string;
  sentimentScore: string;
  positiveCallsPercent: number;
  negativeCallsPercent: number;
  neutralCallsPercent: number;
}

export class AnalyticsService {
  static async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      // Try to get data from Supabase
      const { data, error } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching analytics data:', error);
        // Return mock data if there's an error
        return this.getMockAnalyticsData();
      }

      if (data) {
        // Format the data
        const totalCalls = data.total_calls?.toString() || '0';
        const avgDurationSeconds = data.avg_duration || 0;
        const minutes = Math.floor(avgDurationSeconds / 60);
        const seconds = Math.floor(avgDurationSeconds % 60);
        const avgDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const totalSentiment = data.positive_sentiment_count + data.neutral_sentiment_count + data.negative_sentiment_count;
        const positiveCallsPercent = totalSentiment > 0 
          ? (data.positive_sentiment_count / totalSentiment) * 100
          : 33;
        const negativeCallsPercent = totalSentiment > 0 
          ? (data.negative_sentiment_count / totalSentiment) * 100
          : 33;
        const neutralCallsPercent = totalSentiment > 0 
          ? (data.neutral_sentiment_count / totalSentiment) * 100
          : 34;
        
        return {
          totalCalls,
          avgDuration,
          conversionRate: `${Math.round(data.conversion_rate || 0)}%`,
          sentimentScore: `${Math.round((data.avg_sentiment || 0.5) * 100)}/100`,
          positiveCallsPercent,
          negativeCallsPercent,
          neutralCallsPercent
        };
      }

      // Return mock data if no data is found
      return this.getMockAnalyticsData();
    } catch (error) {
      console.error('Error in getAnalyticsData:', error);
      return this.getMockAnalyticsData();
    }
  }

  static getMockAnalyticsData(): AnalyticsData {
    return {
      totalCalls: '324',
      avgDuration: '4:32',
      conversionRate: '48%',
      sentimentScore: '72/100',
      positiveCallsPercent: 55,
      negativeCallsPercent: 20,
      neutralCallsPercent: 25
    };
  }
}
