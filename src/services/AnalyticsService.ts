
import { supabase } from '@/integrations/supabase/client';
import { TeamMetricsData, RepMetricsData, getTeamMetrics as getMockTeamMetrics, getRepMetrics as getMockRepMetrics } from './SharedDataService';

export interface AnalyticsData {
  pipelineData: { name: string; value: number }[];
  conversionData: { name: string; rate: number }[];
  revenueData: { name: string; actual: number; target: number }[];
  productMixData: { name: string; value: number }[];
}

export const getAnalyticsData = async (): Promise<AnalyticsData> => {
  try {
    // In a real implementation, we would fetch this data from Supabase
    // For now, return mock data
    return {
      pipelineData: [
        { name: 'Leads', value: 120 },
        { name: 'Qualified', value: 85 },
        { name: 'Proposal', value: 42 },
        { name: 'Negotiation', value: 28 },
        { name: 'Closed', value: 18 },
      ],
      conversionData: [
        { name: 'Jan', rate: 32 },
        { name: 'Feb', rate: 38 },
        { name: 'Mar', rate: 30 },
        { name: 'Apr', rate: 42 },
        { name: 'May', rate: 35 },
        { name: 'Jun', rate: 48 },
        { name: 'Jul', rate: 50 },
        { name: 'Aug', rate: 45 },
      ],
      revenueData: [
        { name: 'Jan', actual: 4000, target: 4500 },
        { name: 'Feb', actual: 5000, target: 4500 },
        { name: 'Mar', actual: 3500, target: 4500 },
        { name: 'Apr', actual: 6000, target: 5000 },
        { name: 'May', actual: 5500, target: 5000 },
        { name: 'Jun', actual: 7000, target: 5500 },
        { name: 'Jul', actual: 6500, target: 5500 },
        { name: 'Aug', actual: 8000, target: 6000 },
      ],
      productMixData: [
        { name: 'Product A', value: 35 },
        { name: 'Product B', value: 25 },
        { name: 'Product C', value: 20 },
        { name: 'Product D', value: 15 },
        { name: 'Other', value: 5 },
      ],
    };
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    throw error;
  }
};

export const getTeamMetrics = async (): Promise<TeamMetricsData> => {
  try {
    // First try to get data from Supabase
    const { data: callMetricsSummary, error } = await supabase
      .from('call_metrics_summary')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !callMetricsSummary) {
      console.warn('No data found in call_metrics_summary, using mock data');
      return getMockTeamMetrics();
    }

    return {
      totalCalls: callMetricsSummary.total_calls || 0,
      avgSentiment: callMetricsSummary.avg_sentiment || 0.5,
      avgTalkRatio: {
        agent: callMetricsSummary.agent_talk_ratio || 50,
        customer: callMetricsSummary.customer_talk_ratio || 50
      },
      topKeywords: callMetricsSummary.top_keywords || ['pricing', 'features', 'support', 'timeline', 'integration'],
      performanceScore: callMetricsSummary.performance_score || 0,
      conversionRate: callMetricsSummary.conversion_rate || 0
    };
  } catch (error) {
    console.error('Error fetching team metrics:', error);
    return getMockTeamMetrics();
  }
};

export const getRepMetrics = async (): Promise<RepMetricsData[]> => {
  try {
    // First try to get data from Supabase
    const { data: repMetricsSummary, error } = await supabase
      .from('rep_metrics_summary')
      .select('*')
      .order('success_rate', { ascending: false });

    if (error || !repMetricsSummary || repMetricsSummary.length === 0) {
      console.warn('No data found in rep_metrics_summary, using mock data');
      return getMockRepMetrics();
    }

    return repMetricsSummary.map(rep => ({
      id: rep.rep_id,
      name: rep.rep_name || 'Unknown',
      callVolume: rep.call_volume || 0,
      successRate: rep.success_rate || 0,
      sentiment: rep.sentiment_score || 0.5,
      insights: rep.insights || []
    }));
  } catch (error) {
    console.error('Error fetching rep metrics:', error);
    return getMockRepMetrics();
  }
};

// Get sentiment trends over time
export const getSentimentTrends = async () => {
  try {
    const { data, error } = await supabase
      .from('sentiment_trends_view')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching sentiment trends:', error);
    return [];
  }
};

// Get keyword analytics
export const getKeywordAnalytics = async () => {
  try {
    const { data, error } = await supabase
      .from('keyword_analysis_view')
      .select('*')
      .order('occurrence_count', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching keyword analytics:', error);
    return [];
  }
};

// Get daily call metrics
export const getDailyCallMetrics = async () => {
  try {
    const { data, error } = await supabase
      .from('daily_call_metrics_view')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching daily call metrics:', error);
    return [];
  }
};
