
import { TeamPerformance } from '@/types/teamTypes';
import { CallVolumeDataPoint, KeywordTrend } from '@/services/RealTimeMetricsService';
import { RawMetricsRecord } from '@/types/metrics';

/**
 * Creates an empty team performance object
 */
export const createEmptyTeamPerformance = (): TeamPerformance => {
  return {
    active_reps: 0,
    total_calls: 0,
    avg_sentiment: 0.5,
    avg_duration: 0,
    positive_calls: 0,
    negative_calls: 0
  };
};

/**
 * Creates empty call volume data points for a given number of days
 */
export const createEmptyCallVolume = (days: number = 7): CallVolumeDataPoint[] => {
  const result: CallVolumeDataPoint[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    result.push({
      date: date.toISOString().split('T')[0],
      calls: 0
    });
  }
  
  return result;
};

/**
 * Creates empty keyword trends
 */
export const createEmptyKeywordTrends = (): KeywordTrend[] => {
  return [
    { keyword: 'pricing', count: 0, category: 'sales' },
    { keyword: 'feature', count: 0, category: 'product' },
    { keyword: 'support', count: 0, category: 'customer service' },
    { keyword: 'discount', count: 0, category: 'sales' },
    { keyword: 'competitor', count: 0, category: 'competition' }
  ];
};

/**
 * Creates empty sentiment trends data
 */
export const createEmptySentimentTrends = (days: number = 7) => {
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    result.push({
      date: date.toISOString().split('T')[0],
      avg_agent_sentiment: 0.5,
      avg_customer_sentiment: 0.5,
      positive_agent_calls: 0,
      negative_agent_calls: 0,
      total_calls: 0
    });
  }
  
  return result;
};

/**
 * Creates empty metrics objects for backward compatibility
 */
export const createEmptyMetrics = () => {
  return {
    totalCalls: 0,
    avgDuration: 0,
    avgSentiment: 0.5
  };
};

/**
 * Creates an empty raw metrics record
 */
export const createEmptyRawMetricsRecord = (): RawMetricsRecord => {
  return {
    report_date: new Date().toISOString().split('T')[0],
    total_calls: 0,
    avg_duration: 0,
    positive_sentiment_count: 0,
    negative_sentiment_count: 0,
    neutral_sentiment_count: 0,
    avg_sentiment: 0.5,
    agent_talk_ratio: 50,
    customer_talk_ratio: 50
  };
};

/**
 * Creates empty call metrics for backward compatibility
 */
export const createEmptyCallMetrics = () => {
  return {
    callVolume: 0,
    talkRatio: 50,
    callDuration: 0
  };
};

/**
 * Creates empty call quality metrics for backward compatibility
 */
export const createEmptyCallQualityMetrics = () => {
  return {
    clarityScore: 0,
    engagementScore: 0,
    objectionHandlingScore: 0
  };
};
