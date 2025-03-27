
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  totalCalls: string;
  avgDuration: number;
  conversionRate: string;
  sentimentScore: string;
  positiveCallsPercent: number;
  neutralCallsPercent: number;
  negativeCallsPercent: number;
  talkRatioAgent: number;
  talkRatioCustomer: number;
  topKeywords: string[];
  performanceScore: number;
}

export class AnalyticsService {
  /**
   * Get analytics data from call_metrics_summary or generate demo data if needed
   */
  static async getAnalyticsData(options?: {
    period?: 'day' | 'week' | 'month' | 'all';
    userId?: string;
  }): Promise<AnalyticsData> {
    try {
      // First try to get the most recent entry from call_metrics_summary
      const { data: metricsSummary, error } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .order('report_date', { ascending: false })
        .limit(1);

      // If successful, map database record to AnalyticsData interface
      if (!error && metricsSummary && metricsSummary.length > 0) {
        const metrics = metricsSummary[0];
        
        // Calculate percentages
        const totalSentimentCount = 
          (metrics.positive_sentiment_count || 0) + 
          (metrics.neutral_sentiment_count || 0) + 
          (metrics.negative_sentiment_count || 0);
          
        const positivePercent = totalSentimentCount > 0 
          ? (metrics.positive_sentiment_count / totalSentimentCount) * 100 
          : 33.3;
          
        const neutralPercent = totalSentimentCount > 0 
          ? (metrics.neutral_sentiment_count / totalSentimentCount) * 100 
          : 33.3;
          
        const negativePercent = totalSentimentCount > 0 
          ? (metrics.negative_sentiment_count / totalSentimentCount) * 100 
          : 33.3;

        return {
          totalCalls: metrics.total_calls.toString(),
          avgDuration: Math.round(metrics.avg_duration / 60), // Convert to minutes
          conversionRate: `${Math.round((metrics.conversion_rate || 0) * 100)}%`,
          sentimentScore: `${Math.round((metrics.avg_sentiment || 0.5) * 100)}%`,
          positiveCallsPercent: positivePercent,
          neutralCallsPercent: neutralPercent,
          negativeCallsPercent: negativePercent,
          talkRatioAgent: metrics.agent_talk_ratio || 50,
          talkRatioCustomer: metrics.customer_talk_ratio || 50,
          topKeywords: metrics.top_keywords || [],
          performanceScore: metrics.performance_score || 75
        };
      }

      // Fallback - try getting data directly from calls table
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('duration, sentiment_agent, talk_ratio_agent, talk_ratio_customer')
        .order('created_at', { ascending: false });
        
      if (!callsError && callsData && callsData.length > 0) {
        // Calculate metrics manually
        const totalCalls = callsData.length;
        const avgDuration = callsData.reduce((sum, call) => sum + (call.duration || 0), 0) / totalCalls;
        
        // Count sentiment categories
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        
        callsData.forEach(call => {
          if (call.sentiment_agent > 0.66) positiveCount++;
          else if (call.sentiment_agent < 0.33) negativeCount++;
          else neutralCount++;
        });
        
        const positivePercent = (positiveCount / totalCalls) * 100;
        const neutralPercent = (neutralCount / totalCalls) * 100;
        const negativePercent = (negativeCount / totalCalls) * 100;
        
        const avgSentiment = callsData.reduce((sum, call) => sum + (call.sentiment_agent || 0.5), 0) / totalCalls;
        const avgTalkRatioAgent = callsData.reduce((sum, call) => sum + (call.talk_ratio_agent || 50), 0) / totalCalls;
        const avgTalkRatioCustomer = callsData.reduce((sum, call) => sum + (call.talk_ratio_customer || 50), 0) / totalCalls;
        
        return {
          totalCalls: totalCalls.toString(),
          avgDuration: Math.round(avgDuration / 60), // Convert to minutes
          conversionRate: '32%', // Demo value since we don't track this directly
          sentimentScore: `${Math.round(avgSentiment * 100)}%`,
          positiveCallsPercent: positivePercent,
          neutralCallsPercent: neutralPercent,
          negativeCallsPercent: negativePercent,
          talkRatioAgent: avgTalkRatioAgent,
          talkRatioCustomer: avgTalkRatioCustomer,
          topKeywords: [], // We'd need another query to get this
          performanceScore: Math.round(avgSentiment * 100)
        };
      }

      // Final fallback - generate demo data
      console.log('No metrics data available, using demo values');
      return this.generateDemoAnalyticsData();
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return this.generateDemoAnalyticsData();
    }
  }
  
  /**
   * Generate demo analytics data for display when no real data is available
   */
  static generateDemoAnalyticsData(): AnalyticsData {
    return {
      totalCalls: '324',
      avgDuration: 5, // minutes
      conversionRate: '28%',
      sentimentScore: '76%',
      positiveCallsPercent: 65,
      neutralCallsPercent: 23,
      negativeCallsPercent: 12,
      talkRatioAgent: 43,
      talkRatioCustomer: 57,
      topKeywords: ['pricing', 'feature', 'timeline', 'support', 'integration'],
      performanceScore: 76
    };
  }
}
