
import { SentimentAnalysisService } from './SentimentAnalysisService';
import type { CallTranscript } from '@/types/call';

// Common objection and rebuttal terms for objection handling analysis
const OBJECTIONS = [
  "expensive", "costly", "price", "budget", 
  "not sure", "uncertain", "hesitant", 
  "concerned", "worry", "worried", "issue",
  "too slow", "complicated", "difficult", 
  "competitor", "alternative", "other options",
  "think about it", "need time"
];

const REBUTTALS = [
  "value", "worth", "roi", "return", "investment", 
  "guarantee", "assurance", "confidence",
  "faster", "quicker", "efficient", "streamlined",
  "solution", "resolve", "address", "proven",
  "discount", "special", "offer",
  "unique", "different", "better"
];

export interface TalkRatioMetrics {
  agent_ratio: number;
  prospect_ratio: number;
  dominance_score: number;
  agent_talk_time: number; // in seconds
  prospect_talk_time: number; // in seconds
  silence_time: number; // in seconds
  interruption_count: number;
}

export interface SentimentHeatmapPoint {
  time: number;
  label: string;
  score: number;
  text_snippet: string;
}

export interface ObjectionHandlingMetrics {
  total_objections: number;
  handled_objections: number;
  effectiveness: number;
  details: ObjectionMoment[];
}

export interface ObjectionMoment {
  time: number;
  text: string;
  handled: boolean;
  category?: string;
  rebuttal_text?: string;
}

export class AdvancedMetricsService {
  /**
   * Calculate enhanced talk/listen ratios based on transcript segments
   */
  static calculateTalkRatios(transcript: CallTranscript): TalkRatioMetrics {
    if (!transcript.transcript_segments || !Array.isArray(transcript.transcript_segments)) {
      return {
        agent_ratio: 0.5,
        prospect_ratio: 0.5,
        dominance_score: 1,
        agent_talk_time: 0,
        prospect_talk_time: 0,
        silence_time: 0,
        interruption_count: 0
      };
    }

    const segments = transcript.transcript_segments;
    
    // Calculate speaking durations
    let agentTalkTime = 0;
    let prospectTalkTime = 0;
    let interruptionCount = 0;
    let lastSpeaker = '';
    let lastEndTime = 0;
    let totalSilenceTime = 0;
    
    // Process each segment
    segments.forEach((segment, index) => {
      // Skip invalid segments
      if (!segment.text || typeof segment.start !== 'number' || typeof segment.end !== 'number') {
        return;
      }
      
      const speaker = segment.speaker.toLowerCase().includes('agent') ? 'agent' : 'customer';
      const duration = segment.end - segment.start;
      
      // Add to the appropriate speaker's talk time
      if (speaker === 'agent') {
        agentTalkTime += duration;
      } else {
        prospectTalkTime += duration;
      }
      
      // Check for interruptions (segments that start before previous ends)
      if (index > 0 && segment.start < lastEndTime) {
        interruptionCount++;
      }
      
      // Calculate silence between segments
      if (index > 0 && segment.start > lastEndTime) {
        totalSilenceTime += (segment.start - lastEndTime);
      }
      
      lastSpeaker = speaker;
      lastEndTime = segment.end;
    });
    
    // Calculate total audio duration
    const totalDuration = transcript.duration || 
      (segments.length > 0 ? Math.max(...segments.map(s => s.end || 0)) : 0);
    
    // Calculate ratios
    const agentRatio = totalDuration > 0 ? agentTalkTime / totalDuration : 0.5;
    const prospectRatio = totalDuration > 0 ? prospectTalkTime / totalDuration : 0.5;
    
    // Ensure prospect talk time isn't zero to avoid division by zero
    const dominanceScore = agentTalkTime / Math.max(prospectTalkTime, 0.1);
    
    return {
      agent_ratio: agentRatio,
      prospect_ratio: prospectRatio,
      dominance_score: dominanceScore,
      agent_talk_time: agentTalkTime,
      prospect_talk_time: prospectTalkTime,
      silence_time: totalSilenceTime,
      interruption_count: interruptionCount
    };
  }

  /**
   * Generate sentiment heatmap based on transcript
   */
  static generateSentimentHeatmap(transcript: CallTranscript): SentimentHeatmapPoint[] {
    if (!transcript.text || !transcript.transcript_segments) {
      return [];
    }
    
    const segments = Array.isArray(transcript.transcript_segments) 
      ? transcript.transcript_segments 
      : [];
    
    if (segments.length === 0) {
      return [];
    }
    
    // Group segments into logical chunks based on pauses
    const chunks: { text: string; time: number }[] = [];
    let currentChunk = "";
    let chunkStartTime = segments[0].start || 0;
    
    segments.forEach((segment, index) => {
      // Skip invalid segments
      if (!segment.text) return;
      
      // If there's a significant pause or change in speaker, start a new chunk
      if (index > 0 && 
          ((segment.start && segments[index-1].end && 
           segment.start - segments[index-1].end > 1.5) ||
           segment.speaker !== segments[index-1].speaker)) {
        
        if (currentChunk.trim().length > 0) {
          chunks.push({
            text: currentChunk.trim(),
            time: chunkStartTime
          });
        }
        
        currentChunk = "";
        chunkStartTime = segment.start || 0;
      }
      
      currentChunk += segment.text + " ";
    });
    
    // Add the last chunk if it exists
    if (currentChunk.trim().length > 0) {
      chunks.push({
        text: currentChunk.trim(),
        time: chunkStartTime
      });
    }
    
    // Analyze sentiment for each chunk
    const results: SentimentHeatmapPoint[] = [];
    
    chunks.forEach(chunk => {
      // Use our existing sentiment analysis service
      const sentiment = SentimentAnalysisService.analyzeSentiment(chunk.text);
      let score = 0.5;
      
      // Convert sentiment labels to scores
      if (sentiment === 'positive') score = 0.8 + (Math.random() * 0.2);
      else if (sentiment === 'negative') score = Math.random() * 0.3;
      else score = 0.3 + (Math.random() * 0.4);
      
      results.push({
        time: chunk.time,
        label: sentiment.toUpperCase(),
        score,
        text_snippet: chunk.text.length > 50 ? chunk.text.substring(0, 50) + "..." : chunk.text
      });
    });
    
    return results;
  }

  /**
   * Calculate objection handling metrics
   */
  static calculateObjectionHandling(transcript: CallTranscript): ObjectionHandlingMetrics {
    if (!transcript.text || !transcript.transcript_segments) {
      return {
        total_objections: 0,
        handled_objections: 0,
        effectiveness: 0,
        details: []
      };
    }
    
    const segments = Array.isArray(transcript.transcript_segments) 
      ? transcript.transcript_segments 
      : [];
    
    if (segments.length === 0) {
      return {
        total_objections: 0,
        handled_objections: 0,
        effectiveness: 0,
        details: []
      };
    }
    
    const objectionMoments: ObjectionMoment[] = [];
    const rebuttalMoments: { time: number; text: string }[] = [];
    
    // Identify objections and rebuttals
    segments.forEach(segment => {
      if (!segment.text || typeof segment.start !== 'number') return;
      
      const text = segment.text.toLowerCase();
      const isCustomer = !segment.speaker.toLowerCase().includes('agent');
      
      // Only look for objections in customer speech
      if (isCustomer) {
        for (const objection of OBJECTIONS) {
          if (text.includes(objection)) {
            objectionMoments.push({
              time: segment.start,
              text: segment.text,
              handled: false,
              category: this.categorizeObjection(objection)
            });
            break; // Only count once per segment
          }
        }
      } else {
        // Look for rebuttals in agent speech
        for (const rebuttal of REBUTTALS) {
          if (text.includes(rebuttal)) {
            rebuttalMoments.push({
              time: segment.start,
              text: segment.text
            });
            break; // Only count once per segment
          }
        }
      }
    });
    
    // Match rebuttals to objections (within 30 seconds)
    for (const obj of objectionMoments) {
      for (const reb of rebuttalMoments) {
        // Rebuttal must come after objection but within 30 seconds
        if (reb.time > obj.time && reb.time - obj.time < 30) {
          obj.handled = true;
          obj.rebuttal_text = reb.text;
          break;
        }
      }
    }
    
    // Calculate effectiveness
    const handledCount = objectionMoments.filter(obj => obj.handled).length;
    const totalCount = objectionMoments.length;
    const effectiveness = totalCount > 0 ? handledCount / totalCount : 0;
    
    return {
      total_objections: totalCount,
      handled_objections: handledCount,
      effectiveness,
      details: objectionMoments
    };
  }
  
  /**
   * Categorize the type of objection
   */
  private static categorizeObjection(objection: string): string {
    const categories = {
      price: ["expensive", "costly", "price", "budget", "afford"],
      uncertainty: ["not sure", "uncertain", "hesitant", "think about it", "need time"],
      concern: ["concerned", "worry", "worried", "issue"],
      performance: ["too slow", "complicated", "difficult"],
      competition: ["competitor", "alternative", "other options"]
    };
    
    for (const [category, terms] of Object.entries(categories)) {
      if (terms.some(term => objection.includes(term))) {
        return category;
      }
    }
    
    return "other";
  }
}
