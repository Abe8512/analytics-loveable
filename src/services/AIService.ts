
/**
 * AI Service for text analysis including sentiment analysis
 */

// Define the result type for sentiment analysis
export interface SentimentAnalysisResult {
  sentiment: string;
  sentimentScore: number;
  keywords: string[];
  keyPhrases: string[];
}

/**
 * Analyze sentiment from text
 * @param text The text to analyze
 * @returns Sentiment analysis result
 */
export async function getSentimentScore(text: string): Promise<SentimentAnalysisResult> {
  try {
    // For now, implement a simple demo sentiment analysis
    // In production, this would call an AI service API
    console.log('Analyzing sentiment for text:', text.substring(0, 100) + '...');
    
    // Extract some basic keywords from the text
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'like', 'through', 'over', 'before', 'between', 'after', 'since', 'without', 'under', 'within', 'along', 'following', 'across', 'behind', 'beyond', 'plus', 'except', 'but', 'up', 'down', 'off', 'on']);
    
    // Extract keywords (not common words, longer than 3 chars)
    const potentialKeywords = words.filter(word => 
      !commonWords.has(word) && 
      word.length > 3 && 
      /^[a-z]+$/.test(word)
    );
    
    // Count word frequency
    const wordFrequency: Record<string, number> = {};
    potentialKeywords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    // Take top keywords
    const keywords = sortedWords.slice(0, 10);
    
    // Simple key phrases (pairs of adjacent keywords)
    const keyPhrases: string[] = [];
    for (let i = 0; i < potentialKeywords.length - 1; i++) {
      const phrase = `${potentialKeywords[i]} ${potentialKeywords[i + 1]}`;
      if (phrase.length > 5 && !keyPhrases.includes(phrase)) {
        keyPhrases.push(phrase);
        if (keyPhrases.length >= 5) break;
      }
    }
    
    // Simple sentiment analysis based on word count
    // In a real implementation, this would use an ML model
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'outstanding', 'awesome', 'best', 'positive', 'agree', 'yes', 'like', 'love', 'happy', 'satisfied', 'perfect', 'ideal', 'brilliant', 'helpful'];
    const negativeWords = ['bad', 'terrible', 'horrible', 'awful', 'poor', 'negative', 'worst', 'disagree', 'no', 'dislike', 'hate', 'unhappy', 'disappointed', 'imperfect', 'frustrating', 'useless', 'difficult', 'hard', 'complicated', 'challenging'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
    });
    
    const totalSentimentWords = positiveScore + negativeScore;
    let sentimentScore = 0.5; // Neutral default
    
    if (totalSentimentWords > 0) {
      sentimentScore = positiveScore / (totalSentimentWords);
    }
    
    let sentiment;
    if (sentimentScore > 0.66) {
      sentiment = 'positive';
    } else if (sentimentScore < 0.33) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }
    
    return {
      sentiment,
      sentimentScore,
      keywords,
      keyPhrases
    };
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // Return a neutral sentiment as fallback
    return {
      sentiment: 'neutral',
      sentimentScore: 0.5,
      keywords: [],
      keyPhrases: []
    };
  }
}
