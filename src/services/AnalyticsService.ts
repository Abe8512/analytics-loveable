
import { supabase } from "@/integrations/supabase/client";

// Helper function to get metrics from call transcripts
export const getMetrics = (data: any[]) => {
  // Default quality metrics
  const qualityMetrics = [
    { name: 'Call Score', score: 76, maxScore: 100, category: 'good' },
    { name: 'Sentiment', score: 82, maxScore: 100, category: 'excellent' },
    { name: 'Talk Ratio', score: 63, maxScore: 100, category: 'good' },
    { name: 'Engagement', score: 58, maxScore: 100, category: 'average' }
  ];

  // Default outcome stats
  const outcomeStats = [
    { outcome: 'Positive Response', count: Math.floor(data.length * 0.6), percentage: 60 },
    { outcome: 'Follow-up Required', count: Math.floor(data.length * 0.3), percentage: 30 },
    { outcome: 'No Interest', count: Math.floor(data.length * 0.1), percentage: 10 }
  ];

  // Calculate actual time metrics if data is available
  let totalDuration = 0;
  const timeOfDayDistribution: Record<string, number> = {
    'Morning': 0,
    'Afternoon': 0,
    'Evening': 0
  };

  data.forEach(item => {
    if (item.duration) {
      totalDuration += item.duration;
    }
    
    if (item.created_at) {
      const hour = new Date(item.created_at).getHours();
      if (hour >= 5 && hour < 12) timeOfDayDistribution['Morning']++;
      else if (hour >= 12 && hour < 18) timeOfDayDistribution['Afternoon']++;
      else timeOfDayDistribution['Evening']++;
    }
  });

  const avgDuration = data.length > 0 ? totalDuration / data.length : 0;

  // Extract keywords from data
  const keywordMap = new Map<string, number>();
  data.forEach(item => {
    if (item.keywords && Array.isArray(item.keywords)) {
      item.keywords.forEach((keyword: string) => {
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
      });
    }
  });

  const sortedKeywords = [...keywordMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => ({ keyword, count }));

  return {
    qualityMetrics,
    outcomeStats,
    timeMetrics: {
      avgDuration,
      totalCallTime: totalDuration,
      timeOfDayDistribution
    },
    topKeywords: sortedKeywords,
    comparisonMetrics: {
      vsLastPeriod: {
        callVolume: 15,
        avgDuration: -5,
        positiveOutcomes: 8,
        sentiment: 12
      },
      vsTeamAverage: {
        callVolume: 5,
        avgDuration: 10,
        positiveOutcomes: -2,
        sentiment: 7
      }
    }
  };
};

// Get call distribution data (by weekday)
export const getCallDistributionData = (data: any[]) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const distribution = days.map(day => ({ name: day, calls: 0 }));
  
  data.forEach(item => {
    if (item.created_at) {
      const dayOfWeek = new Date(item.created_at).getDay();
      distribution[dayOfWeek].calls++;
    }
  });
  
  return distribution;
};

// Get call distribution data by hour
export const getCallDistributionByHour = (data: any[]) => {
  const hours = Array.from({ length: 24 }, (_, i) => ({ 
    hour: i < 10 ? `0${i}:00` : `${i}:00`, 
    count: 0 
  }));
  
  data.forEach(item => {
    if (item.created_at) {
      const hour = new Date(item.created_at).getHours();
      hours[hour].count++;
    }
  });
  
  return hours;
};

// Get sentiment trend data
export const getSentimentTrendData = (data: any[]) => {
  // Group by date
  const dateMap = new Map<string, { positive: number, neutral: number, negative: number }>();
  
  data.forEach(item => {
    if (item.created_at && item.sentiment) {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { positive: 0, neutral: 0, negative: 0 });
      }
      
      const entry = dateMap.get(date)!;
      
      if (item.sentiment === 'positive') entry.positive++;
      else if (item.sentiment === 'negative') entry.negative++;
      else entry.neutral++;
    }
  });
  
  // Convert map to array and sort by date
  const result = [...dateMap.entries()]
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return result;
};

// Get score trend data
export const getScoreTrendData = (data: any[]) => {
  // Group by date
  const dateMap = new Map<string, { total: number, count: number }>();
  
  data.forEach(item => {
    if (item.created_at && item.call_score !== undefined) {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      
      if (!dateMap.has(date)) {
        dateMap.set(date, { total: 0, count: 0 });
      }
      
      const entry = dateMap.get(date)!;
      entry.total += item.call_score;
      entry.count++;
    }
  });
  
  // Convert map to array, calculate averages and sort by date
  const result = [...dateMap.entries()]
    .map(([date, { total, count }]) => ({ 
      date, 
      score: count > 0 ? Math.round(total / count) : 0 
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return result;
};

// Get keyword comparison data
export const getKeywordComparisonData = (data: any[]) => {
  // Separate data by sentiment
  const positiveCalls = data.filter(item => item.sentiment === 'positive');
  const negativeCalls = data.filter(item => item.sentiment === 'negative');
  
  // Extract keywords from positive calls
  const positiveKeywords = new Map<string, number>();
  positiveCalls.forEach(item => {
    if (item.keywords && Array.isArray(item.keywords)) {
      item.keywords.forEach((keyword: string) => {
        positiveKeywords.set(keyword, (positiveKeywords.get(keyword) || 0) + 1);
      });
    }
  });
  
  // Extract keywords from negative calls
  const negativeKeywords = new Map<string, number>();
  negativeCalls.forEach(item => {
    if (item.keywords && Array.isArray(item.keywords)) {
      item.keywords.forEach((keyword: string) => {
        negativeKeywords.set(keyword, (negativeKeywords.get(keyword) || 0) + 1);
      });
    }
  });
  
  // Combine and find top keywords
  const combinedKeywords = new Set([
    ...positiveKeywords.keys(),
    ...negativeKeywords.keys()
  ]);
  
  // Create comparison data
  const comparisonData = Array.from(combinedKeywords)
    .map(keyword => ({
      keyword,
      positive: positiveKeywords.get(keyword) || 0,
      negative: negativeKeywords.get(keyword) || 0,
      total: (positiveKeywords.get(keyword) || 0) + (negativeKeywords.get(keyword) || 0)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);
  
  return comparisonData;
};
