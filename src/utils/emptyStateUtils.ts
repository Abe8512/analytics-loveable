
/**
 * Utility functions for handling empty states in the application
 * instead of using demo data
 */

import { CallMetric, CallOutcome, CallQualityMetric, TopKeyword } from "@/types/metrics";

/**
 * Create an empty metrics record
 * @returns Empty metrics structure
 */
export const createEmptyMetrics = () => ({
  total_calls: 0,
  avg_duration: 0,
  total_duration: 0,
  positive_sentiment_count: 0,
  negative_sentiment_count: 0, 
  neutral_sentiment_count: 0,
  avg_sentiment: 0.5,
  agent_talk_ratio: 50,
  customer_talk_ratio: 50,
  top_keywords: [],
  report_date: new Date().toISOString().split('T')[0]
});

/**
 * Create placeholder call metrics
 * @returns Array with empty call metrics
 */
export const createEmptyCallMetrics = (): CallMetric[] => {
  return [
    { name: 'Avg Call Duration', value: 0, change: 0 },
    { name: 'Talk Ratio', value: 0, change: 0 },
    { name: 'Engagement Score', value: 0, change: 0 },
    { name: 'Objection Rate', value: 0, change: 0 }
  ];
};

/**
 * Create placeholder call quality metrics
 * @returns Array with empty call quality metrics
 */
export const createEmptyCallQualityMetrics = (): CallQualityMetric[] => {
  return [
    { name: 'Discovery Questions', value: 0, maxScore: 10 },
    { name: 'Value Articulation', value: 0, maxScore: 10 },
    { name: 'Objection Handling', value: 0, maxScore: 10 },
    { name: 'Closing Techniques', value: 0, maxScore: 10 }
  ];
};

/**
 * Create placeholder call outcomes
 * @returns Array with empty call outcomes
 */
export const createEmptyCallOutcomes = (): CallOutcome[] => {
  return [
    { name: 'Closed Won', count: 0, percentage: 0 },
    { name: 'Next Steps', count: 0, percentage: 0 },
    { name: 'Qualified', count: 0, percentage: 0 },
    { name: 'No Interest', count: 0, percentage: 0 }
  ];
};

/**
 * Create placeholder trending keywords 
 * @returns Array with empty trending keywords
 */
export const createEmptyTrendingKeywords = (): TopKeyword[] => {
  return [
    { keyword: 'No data available', count: 0, category: 'general' },
  ];
};
