
// Sentiment analysis interfaces and services

export interface SentimentTrend {
  date: string;
  avg_agent_sentiment: number;
  avg_customer_sentiment: number;
  total_calls: number;
  positive_agent_calls: number;
  negative_agent_calls: number;
}

export class SentimentAnalysisService {
  // This could be expanded with more methods as needed
  static analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    // Simple sentiment analysis logic
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'pleased'];
    const negativeWords = ['bad', 'poor', 'terrible', 'unhappy', 'disappointed'];
    
    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeCount += matches.length;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
}

export const sentimentAnalysisService = new SentimentAnalysisService();
