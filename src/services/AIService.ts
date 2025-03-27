
interface SentimentAnalysisResult {
  sentiment: "positive" | "neutral" | "negative"; // Ensuring the type is correct
  sentimentScore: number;
  keywords: string[];
  keyPhrases: string[];
}

/**
 * Analyzes a transcript and extracts sentiment and keywords
 */
export const getSentimentScore = async (text: string): Promise<SentimentAnalysisResult> => {
  try {
    // In a real implementation, this would call an AI service
    // For now, we'll use a simple mock implementation
    
    // Simple sentiment analysis based on positive and negative words
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'happy', 'satisfied', 'love', 'like'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'sad', 'unhappy', 'hate', 'dislike'];
    
    const words = text.toLowerCase().split(/\W+/);
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const totalWords = words.length;
    const sentimentScore = totalWords > 0 
      ? 0.5 + ((positiveCount - negativeCount) / totalWords) * 0.5
      : 0.5;
    
    // Clamp between 0 and 1
    const clampedScore = Math.max(0, Math.min(1, sentimentScore));
    
    // Extract keywords (simple implementation just takes longer words)
    const keywords = Array.from(new Set(
      words.filter(word => word.length > 5).slice(0, 10)
    ));
    
    // Extract key phrases (just example phrases for now)
    const keyPhrases = ['customer service', 'product quality', 'delivery time']
      .filter(() => Math.random() > 0.5);
    
    // Ensure the sentiment conforms to the expected type
    let sentiment: "positive" | "neutral" | "negative" = "neutral";
    if (clampedScore > 0.6) sentiment = "positive";
    if (clampedScore < 0.4) sentiment = "negative";
    
    return {
      sentiment,
      sentimentScore: clampedScore,
      keywords,
      keyPhrases
    };
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    return {
      sentiment: "neutral",
      sentimentScore: 0.5,
      keywords: [],
      keyPhrases: []
    };
  }
};
