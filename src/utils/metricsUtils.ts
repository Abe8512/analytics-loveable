
import { supabase } from '@/integrations/supabase/client';
import { generateDemoCallMetrics, generateDemoRepMetricsData } from '@/services/DemoDataService';
import { RawMetricsRecord, FormattedMetrics } from '@/types/metrics';

/**
 * Checks if metrics data is available in the database
 * @returns {Promise<boolean>} True if metrics data exists
 */
export const checkMetricsAvailability = async (): Promise<boolean> => {
  try {
    console.log('Checking for metrics data availability...');
    const { data, error } = await supabase
      .from('call_metrics_summary')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (error) {
      console.error('Error checking metrics availability:', error);
      return false;
    }
    
    // Use count if available, otherwise check if data array has length
    const count = (data as any)?.count ?? (Array.isArray(data) ? data.length : 0);
    console.log(`Found ${count} metrics records`);
    return count > 0;
  } catch (err) {
    console.error('Exception in checkMetricsAvailability:', err);
    return false;
  }
};

/**
 * Gets metrics data from the database
 * @param {number} days Number of days to retrieve
 * @returns {Promise<RawMetricsRecord[]>} Metrics data array
 */
export const getMetricsData = async (days = 7): Promise<RawMetricsRecord[]> => {
  try {
    console.log(`Fetching metrics data for last ${days} days...`);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('call_metrics_summary')
      .select('*')
      .gte('report_date', startDate.toISOString().split('T')[0])
      .order('report_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching metrics data:', error);
      console.log('Falling back to demo data');
      return generateDemoCallMetrics() as RawMetricsRecord[];
    }
    
    if (!data || data.length === 0) {
      console.log('No metrics data found, using demo data');
      return generateDemoCallMetrics() as RawMetricsRecord[];
    }
    
    console.log(`Successfully retrieved ${data.length} metrics records`);
    return data as RawMetricsRecord[];
  } catch (err) {
    console.error('Exception in getMetricsData:', err);
    console.log('Falling back to demo data');
    return generateDemoCallMetrics() as RawMetricsRecord[];
  }
};

/**
 * Gets rep metrics data or falls back to demo data
 * @param {number} count Number of reps to retrieve
 * @returns {Promise<any[]>} Rep metrics data array
 */
export const getRepMetricsData = async (count = 5) => {
  try {
    console.log('Fetching rep metrics data...');
    const { data, error } = await supabase
      .from('rep_metrics_summary')
      .select('*')
      .order('call_volume', { ascending: false })
      .limit(count);
      
    if (error) {
      console.error('Error fetching rep metrics data:', error);
      console.log('Falling back to demo rep data');
      return generateDemoRepMetricsData(count);
    }
    
    if (!data || data.length === 0) {
      console.log('No rep metrics data found, using demo data');
      return generateDemoRepMetricsData(count);
    }
    
    console.log(`Successfully retrieved ${data.length} rep metrics records`);
    return data;
  } catch (err) {
    console.error('Exception in getRepMetricsData:', err);
    console.log('Falling back to demo rep data');
    return generateDemoRepMetricsData(count);
  }
};

/**
 * Formats metrics for display
 * @param {RawMetricsRecord} metrics Raw metrics data
 * @returns {FormattedMetrics | null} Formatted metrics
 */
export const formatMetricsForDisplay = (metrics: RawMetricsRecord): FormattedMetrics | null => {
  if (!metrics) return null;
  
  // Format duration from seconds to minutes and seconds
  const formatDuration = (seconds: number = 0) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate sentiment percentages safely
  const totalSentiment = 
    (metrics.positive_sentiment_count || 0) + 
    (metrics.neutral_sentiment_count || 0) + 
    (metrics.negative_sentiment_count || 0);
    
  const positiveSentimentPercent = totalSentiment > 0 
    ? Math.round((metrics.positive_sentiment_count || 0) / totalSentiment * 100) 
    : 33;
    
  const negativeSentimentPercent = totalSentiment > 0 
    ? Math.round((metrics.negative_sentiment_count || 0) / totalSentiment * 100) 
    : 33;
    
  // Ensure the total is exactly 100%
  const neutralSentimentPercent = totalSentiment > 0 
    ? 100 - positiveSentimentPercent - negativeSentimentPercent
    : 34;
  
  return {
    totalCalls: metrics.total_calls || 0,
    avgDuration: formatDuration(metrics.avg_duration),
    avgDurationSeconds: metrics.avg_duration || 0,
    avgDurationMinutes: Math.round((metrics.avg_duration || 0) / 60),
    totalDuration: metrics.total_duration || 0,
    positiveCallsCount: metrics.positive_sentiment_count || 0,
    negativeCallsCount: metrics.negative_sentiment_count || 0,
    neutralCallsCount: metrics.neutral_sentiment_count || 0,
    positiveSentimentPercent,
    negativeSentimentPercent,
    neutralSentimentPercent,
    avgSentiment: metrics.avg_sentiment || 0.5,
    avgSentimentPercent: Math.round((metrics.avg_sentiment || 0.5) * 100),
    callScore: metrics.performance_score || 70,
    conversionRate: metrics.conversion_rate ? Math.round(metrics.conversion_rate * 100) : 0,
    agentTalkRatio: Math.round(metrics.agent_talk_ratio || 50),
    customerTalkRatio: Math.round(metrics.customer_talk_ratio || 50),
    topKeywords: metrics.top_keywords || [],
    reportDate: metrics.report_date || new Date().toISOString().split('T')[0]
  };
};
