
/**
 * A lightweight browser-compatible version of key natural.js functionality
 * used in the TranscriptAnalysisService
 */

// Simple Porter Stemmer implementation
export const PorterStemmer = {
  stem: (word: string): string => {
    if (word.length < 3) return word;
    
    // Basic stemming rules (simplified)
    let stemmed = word;
    
    // Step 1: Handle plurals and past participles
    stemmed = stemmed.replace(/ies$/, 'y');
    stemmed = stemmed.replace(/es$/, 'e');
    stemmed = stemmed.replace(/s$/, '');
    
    // Step 2: Handle past tense
    stemmed = stemmed.replace(/ed$/, '');
    stemmed = stemmed.replace(/ing$/, '');
    
    return stemmed;
  }
};

// Simple word tokenizer
export class WordTokenizer {
  tokenize(text: string): string[] {
    if (!text) return [];
    
    // Remove punctuation and split on whitespace
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .split(/\s+/);
  }
}
