
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
    
    // Try call_metrics_summary first
    const { data: metricsData, error: metricsError } = await supabase
      .from('call_metrics_summary')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (!metricsError && metricsData && (data as any)?.count > 0) {
      console.log(`Found ${(metricsData as any)?.count} metrics records`);
      return true;
    }
    
    // If no metrics summary, check if there are calls directly
    const { data: callsData, error: callsError } = await supabase
      .from('calls')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (!callsError && callsData) {
      const callCount = (callsData as any)?.count ?? 0;
      console.log(`Found ${callCount} call records`);
      return callCount > 0;
    }
    
    // If no calls data, check if there are transcripts from Whisper
    const { data: transcriptData, error: transcriptError } = await supabase
      .from('call_transcripts')
      .select('count(*)', { count: 'exact' })
      .limit(1);
      
    if (!transcriptError && transcriptData) {
      const transcriptCount = (transcriptData as any)?.count ?? 0;
      console.log(`Found ${transcriptCount} transcript records`);
      return transcriptCount > 0;
    }
    
    console.log('No metrics data found in any table');
    return false;
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
      console.log('Trying to generate metrics data from calls table...');
      
      // Try to calculate metrics directly from calls table
      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });
        
      if (callsError || !callsData || callsData.length === 0) {
        console.log('No calls data found, trying transcripts...');
        
        // Try to use transcript data from Whisper
        const { data: transcriptData, error: transcriptError } = await supabase
          .from('call_transcripts')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });
          
        if (transcriptError || !transcriptData || transcriptData.length === 0) {
          console.log('No transcript data found, using demo data');
          return generateDemoCallMetrics() as RawMetricsRecord[];
        }
        
        // Convert transcript data to metrics format
        console.log(`Converting ${transcriptData.length} transcripts to metrics`);
        const metrics: RawMetricsRecord = {
          report_date: new Date().toISOString().split('T')[0],
          total_calls: transcriptData.length,
          avg_duration: transcriptData.reduce((sum, t) => sum + (t.duration || 0), 0) / transcriptData.length,
          positive_sentiment_count: transcriptData.filter(t => t.sentiment === 'positive').length,
          negative_sentiment_count: transcriptData.filter(t => t.sentiment === 'negative').length,
          neutral_sentiment_count: transcriptData.filter(t => t.sentiment === 'neutral').length,
          avg_sentiment: transcriptData.reduce((sum, t) => {
            let sentimentValue = 0.5; // Default neutral
            if (t.sentiment === 'positive') sentimentValue = 0.8;
            if (t.sentiment === 'negative') sentimentValue = 0.2;
            return sum + sentimentValue;
          }, 0) / transcriptData.length,
          performance_score: transcriptData.reduce((sum, t) => sum + (t.call_score || 50), 0) / transcriptData.length
        };
        
        return [metrics];
      }
      
      // Calculate metrics from calls data
      console.log(`Converting ${callsData.length} calls to metrics`);
      const metrics: RawMetricsRecord = {
        report_date: new Date().toISOString().split('T')[0],
        total_calls: callsData.length,
        avg_duration: callsData.reduce((sum, call) => sum + (call.duration || 0), 0) / callsData.length,
        positive_sentiment_count: callsData.filter(call => (call.sentiment_agent || 0) > 0.66).length,
        negative_sentiment_count: callsData.filter(call => (call.sentiment_agent || 0) < 0.33).length,
        neutral_sentiment_count: callsData.filter(call => {
          const sentiment = call.sentiment_agent || 0.5;
          return sentiment >= 0.33 && sentiment <= 0.66;
        }).length,
        avg_sentiment: callsData.reduce((sum, call) => sum + (call.sentiment_agent || 0.5), 0) / callsData.length,
        agent_talk_ratio: callsData.reduce((sum, call) => sum + (call.talk_ratio_agent || 50), 0) / callsData.length,
        customer_talk_ratio: callsData.reduce((sum, call) => sum + (call.talk_ratio_customer || 50), 0) / callsData.length
      };
      
      return [metrics];
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
