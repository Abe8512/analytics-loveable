
import { FormattedMetrics, RawMetricsRecord } from '@/types/metrics';
import { formatMetricsForDisplay } from './metricsFormatter';
import { createEmptyRawMetricsRecord } from './emptyStateUtils';

/**
 * Safely format metrics data for display
 * @param rawData Raw metrics data
 * @returns Formatted metrics
 */
export const safeFormatMetrics = (rawData: RawMetricsRecord | null): FormattedMetrics => {
  if (!rawData) {
    // Create and format empty metrics
    const emptyMetrics = createEmptyRawMetricsRecord();
    return formatMetricsForDisplay(emptyMetrics);
  }
  
  return formatMetricsForDisplay(rawData);
};

/**
 * Process sentiment data to ensure valid percentages that add up to 100%
 * @param positive Positive sentiment count
 * @param negative Negative sentiment count
 * @param neutral Neutral sentiment count
 * @returns Normalized sentiment percentages
 */
export const normalizeSentimentPercentages = (positive: number, negative: number, neutral: number) => {
  const total = positive + negative + neutral;
  
  if (total === 0) {
    // Default distribution when no data
    return {
      positive: 33,
      negative: 33,
      neutral: 34
    };
  }
  
  // Calculate percentages
  let positivePercent = Math.round((positive / total) * 100);
  let negativePercent = Math.round((negative / total) * 100);
  let neutralPercent = 100 - positivePercent - negativePercent;
  
  // Ensure we always have 100% total
  if (neutralPercent < 0) {
    // Adjust positive and negative if neutral goes negative
    if (positivePercent > negativePercent) {
      positivePercent += neutralPercent;
    } else {
      negativePercent += neutralPercent;
    }
    neutralPercent = 0;
  }
  
  return {
    positive: positivePercent,
    negative: negativePercent,
    neutral: neutralPercent
  };
};

/**
 * Create a synthetic metrics record for testing or when data is missing
 * @returns Synthetic metrics record
 */
export const createSyntheticMetricsRecord = (): RawMetricsRecord => {
  // Create a realistic-looking metrics record
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
