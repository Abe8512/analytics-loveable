
import { FormattedMetrics, RawMetricsRecord } from '@/types/metrics';

/**
 * Provides empty state data for charts and metrics when no data is available
 */

/**
 * Create an empty formatted metrics object
 * @returns Empty formatted metrics
 */
export const createEmptyFormattedMetrics = (): FormattedMetrics => {
  return {
    totalCalls: 0,
    avgDuration: '0:00',
    avgDurationSeconds: 0,
    avgDurationMinutes: 0,
    totalDuration: 0,
    positiveCallsCount: 0,
    negativeCallsCount: 0,
    neutralCallsCount: 0,
    positiveSentimentPercent: 33,
    negativeSentimentPercent: 33,
    neutralSentimentPercent: 34,
    avgSentiment: 0.5,
    avgSentimentPercent: 50,
    callScore: 0,
    conversionRate: 0,
    agentTalkRatio: 50,
    customerTalkRatio: 50,
    topKeywords: [],
    reportDate: new Date().toISOString().split('T')[0]
  };
};

// Alias for MetricsService to use
export const createEmptyMetrics = (): RawMetricsRecord => {
  return createEmptyRawMetricsRecord();
};

// Add these empty metrics functions
export const createEmptyCallMetrics = () => {
  return {
    totalCalls: 0,
    avgDuration: '0:00',
    totalDuration: 0,
    callsByDay: []
  };
};

export const createEmptyCallQualityMetrics = () => {
  return {
    avgScore: 0,
    distribution: [
      { name: 'Excellent', value: 0 },
      { name: 'Good', value: 0 },
      { name: 'Average', value: 0 },
      { name: 'Poor', value: 0 }
    ]
  };
};

/**
 * Create empty sentiment trend data
 * @returns Array of empty sentiment trends
 */
export const createEmptySentimentTrends = (days = 7) => {
  const trends = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    trends.push({
      date: date.toISOString().split('T')[0],
      avg_agent_sentiment: 0.5,
      avg_customer_sentiment: 0.5,
      positive_agent_calls: 0,
      negative_agent_calls: 0,
      total_calls: 0
    });
  }
  
  return trends;
};

/**
 * Create empty team performance data
 * @returns Empty team performance data
 */
export const createEmptyTeamPerformance = () => {
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
 * Create empty keyword trends
 * @returns Empty keyword trends
 */
export const createEmptyKeywordTrends = () => {
  return [
    { keyword: 'No data', count: 0, category: 'empty' },
    { keyword: 'No trends', count: 0, category: 'empty' },
    { keyword: 'Upload calls', count: 0, category: 'empty' }
  ];
};

/**
 * Create empty call volume data
 * @returns Empty call volume data by day
 */
export const createEmptyCallVolume = (days = 7) => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      calls: 0
    });
  }
  
  return data;
};

/**
 * Create empty raw metrics record
 * @returns Empty raw metrics record
 */
export const createEmptyRawMetricsRecord = () => {
  return {
    report_date: new Date().toISOString().split('T')[0],
    total_calls: 0,
    avg_duration: 0,
    positive_sentiment_count: 0,
    negative_sentiment_count: 0,
    neutral_sentiment_count: 0,
    avg_sentiment: 0.5,
    performance_score: 0,
    agent_talk_ratio: 50,
    customer_talk_ratio: 50,
    top_keywords: []
  };
};
