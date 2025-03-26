import { CallTranscript } from '@/types/call';

export interface CallOutcome {
  outcome: string;
  count: number;
  percentage: number;
}

export interface CallMetric {
  name: string;
  value: number;
  change: number; // Percentage change from previous period
  status: 'increase' | 'decrease' | 'stable';
}

export interface CallQualityMetric {
  name: string;
  score: number; 
  maxScore: number;
  category: 'excellent' | 'good' | 'average' | 'poor';
}

export interface TopKeyword {
  keyword: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  category?: string;
}

export interface MetricsResult {
  outcomeStats: CallOutcome[];
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  averageCallScore: number;
  callMetrics: CallMetric[];
  qualityMetrics: CallQualityMetric[];
  topKeywords: TopKeyword[];
  timeMetrics: {
    avgDuration: number;
    totalCallTime: number;
    timeOfDayDistribution: {[key: string]: number};
  };
  comparisonMetrics: {
    vsLastPeriod: {[key: string]: number};
    vsTeamAverage: {[key: string]: number};
  };
}

export const getMetrics = (transcripts: CallTranscript[]): MetricsResult => {
  const total = transcripts.length;
  let qualified = 0;
  let followUp = 0;
  let noInterest = 0;
  let positive = 0;
  let neutral = 0;
  let negative = 0;
  let totalScore = 0;
  let totalDuration = 0;
  const keywordCount: {[key: string]: number} = {};
  const timeOfDay: {[key: string]: number} = {
    'morning': 0,
    'afternoon': 0,
    'evening': 0,
  };
  
  for (const transcript of transcripts) {
    const sentiment = transcript.sentiment || 'neutral';
    
    if (sentiment === 'positive') {
      qualified++;
      positive++;
    } else if (sentiment === 'negative') {
      noInterest++;
      negative++;
    } else {
      followUp++;
      neutral++;
    }

    if (transcript.call_score) {
      totalScore += transcript.call_score;
    }
    
    if (transcript.duration) {
      totalDuration += transcript.duration;
    }
    
    if (transcript.keywords && Array.isArray(transcript.keywords)) {
      transcript.keywords.forEach(keyword => {
        keywordCount[keyword] = (keywordCount[keyword] || 0) + 1;
      });
    }
    
    if (transcript.created_at) {
      const hour = new Date(transcript.created_at).getHours();
      if (hour >= 5 && hour < 12) {
        timeOfDay.morning++;
      } else if (hour >= 12 && hour < 18) {
        timeOfDay.afternoon++;
      } else {
        timeOfDay.evening++;
      }
    }
  }

  const outcomeStats: CallOutcome[] = [
    {
      outcome: 'Qualified Leads',
      count: qualified,
      percentage: total > 0 ? Math.round((qualified / total) * 100) : 0
    },
    {
      outcome: 'Follow Up Required',
      count: followUp,
      percentage: total > 0 ? Math.round((followUp / total) * 100) : 0
    },
    {
      outcome: 'No Interest',
      count: noInterest,
      percentage: total > 0 ? Math.round((noInterest / total) * 100) : 0
    },
    {
      outcome: 'Total',
      count: total,
      percentage: 100
    }
  ];
  
  const callMetrics: CallMetric[] = [
    {
      name: 'Call Volume',
      value: total,
      change: 8,
      status: 'increase'
    },
    {
      name: 'Conversion Rate',
      value: total > 0 ? Math.round((qualified / total) * 100) : 0,
      change: 5,
      status: 'increase'
    },
    {
      name: 'Avg Call Duration',
      value: total > 0 ? Math.round(totalDuration / total / 60) : 0,
      change: -2,
      status: 'decrease'
    },
    {
      name: 'Engagement Score',
      value: total > 0 ? Math.round((positive + neutral * 0.5) / total * 100) : 0,
      change: 12,
      status: 'increase'
    }
  ];
  
  const qualityMetrics: CallQualityMetric[] = [
    {
      name: 'Discovery Questions',
      score: 78,
      maxScore: 100,
      category: 'good'
    },
    {
      name: 'Objection Handling',
      score: 65,
      maxScore: 100,
      category: 'average'
    },
    {
      name: 'Value Proposition',
      score: 82,
      maxScore: 100,
      category: 'excellent'
    },
    {
      name: 'Closing Technique',
      score: 71,
      maxScore: 100,
      category: 'good'
    }
  ];
  
  const topKeywords: TopKeyword[] = Object.entries(keywordCount)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 10)
    .map(([keyword, count]) => ({
      keyword,
      count,
      trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
      category: getKeywordCategory(keyword)
    }));

  return {
    outcomeStats,
    sentimentBreakdown: {
      positive,
      neutral,
      negative
    },
    averageCallScore: total > 0 ? totalScore / total : 0,
    callMetrics,
    qualityMetrics,
    topKeywords,
    timeMetrics: {
      avgDuration: total > 0 ? Math.round(totalDuration / total) : 0,
      totalCallTime: totalDuration,
      timeOfDayDistribution: timeOfDay
    },
    comparisonMetrics: {
      vsLastPeriod: {
        callVolume: 15,
        conversions: 8,
        avgDuration: -3,
        engagement: 10
      },
      vsTeamAverage: {
        callVolume: 5,
        conversions: 12,
        avgDuration: -2,
        engagement: 7
      }
    }
  };
};

const getKeywordCategory = (keyword: string): string => {
  const productKeywords = ['pricing', 'features', 'product', 'service', 'solution'];
  const painKeywords = ['problem', 'issue', 'challenge', 'difficulty', 'concern'];
  const competitionKeywords = ['competitor', 'alternative', 'comparison', 'versus', 'vs'];
  const timelineKeywords = ['timeline', 'deadline', 'schedule', 'when', 'implementation'];
  
  if (productKeywords.some(k => keyword.toLowerCase().includes(k))) return 'Product';
  if (painKeywords.some(k => keyword.toLowerCase().includes(k))) return 'Pain Points';
  if (competitionKeywords.some(k => keyword.toLowerCase().includes(k))) return 'Competition';
  if (timelineKeywords.some(k => keyword.toLowerCase().includes(k))) return 'Timeline';
  return 'Other';
};

export const getCallDistributionData = (transcripts: CallTranscript[]) => {
  const now = new Date();
  const dates: { [key: string]: number } = {};
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    dates[date.toISOString().slice(0, 10)] = 0;
  }
  
  for (const transcript of transcripts) {
    if (transcript.created_at) {
      const date = transcript.created_at.slice(0, 10);
      if (dates[date] !== undefined) {
        dates[date]++;
      }
    }
  }
  
  return Object.entries(dates).map(([date, count]) => ({
    name: date,
    calls: count
  }));
};

export const getCallDistributionByHour = (transcripts: CallTranscript[]) => {
  const hours: { [key: string]: number } = {};
  
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0');
    hours[hour] = 0;
  }
  
  for (const transcript of transcripts) {
    if (transcript.created_at) {
      const hour = new Date(transcript.created_at).getHours().toString().padStart(2, '0');
      hours[hour]++;
    }
  }
  
  return Object.entries(hours).map(([hour, count]) => ({
    hour: `${hour}:00`,
    count
  }));
};

export const getSentimentTrendData = (transcripts: CallTranscript[]) => {
  const sortedTranscripts = [...transcripts].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  
  const sentimentByDay: { [key: string]: {positive: number, neutral: number, negative: number, total: number} } = {};
  
  for (const transcript of sortedTranscripts) {
    if (!transcript.created_at) continue;
    
    const date = transcript.created_at.slice(0, 10);
    if (!sentimentByDay[date]) {
      sentimentByDay[date] = {positive: 0, neutral: 0, negative: 0, total: 0};
    }
    
    const sentiment = transcript.sentiment || 'neutral';
    sentimentByDay[date][sentiment as 'positive' | 'neutral' | 'negative']++;
    sentimentByDay[date].total++;
  }
  
  return Object.entries(sentimentByDay).map(([date, counts]) => ({
    date,
    positive: Math.round((counts.positive / counts.total) * 100),
    neutral: Math.round((counts.neutral / counts.total) * 100),
    negative: Math.round((counts.negative / counts.total) * 100)
  }));
};

export const getScoreTrendData = (transcripts: CallTranscript[]) => {
  const sortedTranscripts = [...transcripts].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
  
  const scoreByDay: { [key: string]: {total: number, count: number} } = {};
  
  for (const transcript of sortedTranscripts) {
    if (!transcript.created_at || !transcript.call_score) continue;
    
    const date = transcript.created_at.slice(0, 10);
    if (!scoreByDay[date]) {
      scoreByDay[date] = {total: 0, count: 0};
    }
    
    scoreByDay[date].total += transcript.call_score;
    scoreByDay[date].count++;
  }
  
  return Object.entries(scoreByDay).map(([date, counts]) => ({
    date,
    score: Math.round(counts.total / counts.count)
  }));
};

export const getKeywordComparisonData = (transcripts: CallTranscript[]) => {
  const positiveTranscripts = transcripts.filter(t => t.sentiment === 'positive');
  const negativeTranscripts = transcripts.filter(t => t.sentiment === 'negative');
  
  const positiveKeywords: {[key: string]: number} = {};
  const negativeKeywords: {[key: string]: number} = {};
  
  for (const transcript of positiveTranscripts) {
    if (!transcript.keywords || !Array.isArray(transcript.keywords)) continue;
    
    transcript.keywords.forEach(keyword => {
      positiveKeywords[keyword] = (positiveKeywords[keyword] || 0) + 1;
    });
  }
  
  for (const transcript of negativeTranscripts) {
    if (!transcript.keywords || !Array.isArray(transcript.keywords)) continue;
    
    transcript.keywords.forEach(keyword => {
      negativeKeywords[keyword] = (negativeKeywords[keyword] || 0) + 1;
    });
  }
  
  const commonKeywords = new Set([
    ...Object.keys(positiveKeywords),
    ...Object.keys(negativeKeywords)
  ]);
  
  return Array.from(commonKeywords).map(keyword => ({
    keyword,
    positive: positiveKeywords[keyword] || 0,
    negative: negativeKeywords[keyword] || 0
  })).sort((a, b) => (b.positive + b.negative) - (a.positive + a.negative)).slice(0, 10);
};
