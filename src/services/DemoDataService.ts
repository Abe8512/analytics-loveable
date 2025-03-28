
/**
 * Service for generating demo data when real data is not available
 * Centralizes all demo data generation to avoid duplication
 */

/**
 * Generates demo call metrics summary data
 * @param days Number of days to generate data for
 * @returns Array of demo metrics data
 */
export const generateDemoCallMetricsSummary = (days = 7): any[] => {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Base values that decrease slightly as we go back in time
    const baseTotalCalls = 42 - i;
    const basePositive = 28 - Math.floor(i / 2);
    const baseNeutral = 10;
    const baseNegative = 4 + Math.floor(i / 3);
    
    result.push({
      id: `demo-${i}`,
      report_date: dateStr,
      total_calls: baseTotalCalls,
      total_duration: baseTotalCalls * 300,
      avg_duration: 300 + (i * 20),
      positive_sentiment_count: basePositive,
      neutral_sentiment_count: baseNeutral,
      negative_sentiment_count: baseNegative,
      avg_sentiment: 0.65 - (i * 0.02),
      agent_talk_ratio: 45 + (i * 0.5),
      customer_talk_ratio: 55 - (i * 0.5),
      performance_score: 75 - (i * 2),
      conversion_rate: (0.25 - (i * 0.01)),
      top_keywords: ['pricing', 'features', 'support', 'timeline', 'integration'],
      updated_at: new Date().toISOString()
    });
  }
  
  return result;
};

/**
 * Generates demo rep metrics data
 * @param count Number of reps to generate data for
 * @returns Array of demo rep metrics data
 */
export const generateDemoRepMetrics = (count = 5): any[] => {
  const repNames = ['John Smith', 'Sarah Davis', 'Michael Chen', 'Emma Wilson', 'David Rodriguez', 
                    'Olivia Martinez', 'James Johnson', 'Sofia Garcia', 'Robert Taylor'];
  const result = [];
  
  for (let i = 0; i < count; i++) {
    // Create some variation in the metrics
    const callVolume = 30 + Math.floor(Math.random() * 50);
    const sentimentScore = 0.4 + (Math.random() * 0.4); // 0.4 to 0.8
    const successRate = 50 + Math.floor(Math.random() * 40); // 50 to 90
    
    result.push({
      id: `demo-rep-${i}`,
      rep_id: `demo-${i}`,
      rep_name: repNames[i % repNames.length],
      call_volume: callVolume,
      sentiment_score: sentimentScore,
      success_rate: successRate,
      top_keywords: ['price', 'features', 'timeline', 'support', 'integration'].slice(0, 3 + (i % 3)),
      updated_at: new Date().toISOString()
    });
  }
  
  return result;
};

/**
 * Generates demo analytics data
 * @returns Object with demo analytics metrics
 */
export const generateDemoAnalyticsData = () => {
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
};

/**
 * Generates demo sales insights data
 * @returns Array of demo sales insights
 */
export const generateDemoSalesInsights = () => {
  return [
    {
      id: '1',
      title: 'Conversion Rate',
      value: '42%',
      change: 8,
      isPositive: true,
      tooltip: 'Percentage of calls resulting in a successful sale'
    },
    {
      id: '2',
      title: 'Avg. Call Duration',
      value: '12.5 min',
      change: -3,
      isPositive: true,
      tooltip: 'Average length of sales calls - shorter calls can indicate improved efficiency'
    },
    {
      id: '3',
      title: 'Daily Calls',
      value: '48',
      change: 15,
      isPositive: true,
      tooltip: 'Number of calls made per day'
    },
    {
      id: '4',
      title: 'Sentiment Score',
      value: '76%',
      change: 5,
      isPositive: true,
      tooltip: 'Average sentiment score across all calls'
    },
    {
      id: '5',
      title: 'Response Time',
      value: '4.2 hrs',
      change: -12,
      isPositive: true,
      tooltip: 'Average time to respond to customer inquiries'
    },
    {
      id: '6',
      title: 'Talk Ratio',
      value: '38%',
      change: -5,
      isPositive: true,
      tooltip: 'Percentage of time sales reps spend talking vs. listening'
    }
  ];
};

/**
 * Generates demo coaching insights data
 * @returns Array of demo coaching insights
 */
export const generateDemoCoachingInsights = () => {
  return [
    {
      id: 'c1',
      title: 'Objection Handling',
      value: '65%',
      change: -8,
      isPositive: false,
      tooltip: 'Success rate in overcoming customer objections'
    },
    {
      id: 'c2',
      title: 'Feature Knowledge',
      value: '82%',
      change: 5,
      isPositive: true,
      tooltip: 'Accuracy of product feature explanations'
    },
    {
      id: 'c3',
      title: 'Call Confidence',
      value: '71%',
      change: 12,
      isPositive: true,
      tooltip: 'Confidence level detected in voice analysis'
    },
    {
      id: 'c4',
      title: 'Follow-up Rate',
      value: '58%',
      change: -3,
      isPositive: false,
      tooltip: 'Percentage of calls with proper follow-up'
    }
  ];
};

/**
 * Generates demo opportunity insights data
 * @returns Array of demo opportunity insights
 */
export const generateDemoOpportunityInsights = () => {
  return [
    {
      id: 'o1',
      title: 'Pricing Discussions',
      value: '62%',
      change: 15,
      isPositive: true,
      tooltip: 'Percentage of calls with successful pricing discussions'
    },
    {
      id: 'o2',
      title: 'Competitor Mentions',
      value: '24',
      change: -5,
      isPositive: true,
      tooltip: 'Number of competitor mentions in calls'
    },
    {
      id: 'o3',
      title: 'Upsell Attempts',
      value: '43%',
      change: 7,
      isPositive: true,
      tooltip: 'Percentage of calls with upsell attempts'
    },
    {
      id: 'o4',
      title: 'Demo Requests',
      value: '38',
      change: 22,
      isPositive: true,
      tooltip: 'Number of requests for product demonstrations'
    }
  ];
};
