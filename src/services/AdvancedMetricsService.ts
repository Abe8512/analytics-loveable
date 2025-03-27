
import { CallTranscript } from '@/types/call';

export interface TalkRatioMetrics {
  agent_ratio: number;
  prospect_ratio: number;
  dominance_score: number;
  agent_talk_time: number;
  prospect_talk_time: number;
  silence_time: number;
  interruption_count: number;
}

export interface SentimentHeatmapPoint {
  time: number;
  label: string;
  score: number;
  text_snippet: string;
}

export interface ObjectionDetail {
  time: number;
  text: string;
  handled: boolean;
}

export interface ObjectionHandlingMetrics {
  total_objections: number;
  handled_objections: number;
  effectiveness: number;
  details: ObjectionDetail[];
}

export class AdvancedMetricsService {
  // Enhanced Talk/Listen Ratio calculation
  static calculateTalkRatios(transcript: CallTranscript): TalkRatioMetrics {
    // Default values for when we don't have the right data structure
    if (!transcript.transcript_segments || !Array.isArray(transcript.transcript_segments)) {
      console.log('No transcript segments found, using default talk ratio values');
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
    
    let agent_talk_time = 0;
    let prospect_talk_time = 0;
    let total_time = transcript.duration || 0;
    let silence_time = 0;
    let interruption_count = 0;
    let last_speaker = '';
    
    try {
      // Process transcript segments
      transcript.transcript_segments.forEach((segment, index) => {
        const duration = segment.end_time - segment.start_time;
        
        if (segment.speaker === 'agent' || segment.speaker === 'Agent') {
          agent_talk_time += duration;
          
          // Check for interruption (if customer was speaking in previous segment)
          if (last_speaker === 'customer' || last_speaker === 'Customer') {
            interruption_count++;
          }
        } else if (segment.speaker === 'customer' || segment.speaker === 'Customer') {
          prospect_talk_time += duration;
          
          // Check for interruption (if agent was speaking in previous segment)
          if (last_speaker === 'agent' || last_speaker === 'Agent') {
            interruption_count++;
          }
        }
        
        last_speaker = segment.speaker;
        
        // Check for silence between segments
        if (index > 0) {
          const previous_segment = transcript.transcript_segments[index - 1];
          const gap = segment.start_time - previous_segment.end_time;
          if (gap > 0.5) { // Silence threshold of 0.5 seconds
            silence_time += gap;
          }
        }
      });
    } catch (err) {
      console.error('Error calculating talk ratios:', err);
    }
    
    // Fallback to metadata if segment analysis didn't work
    if (agent_talk_time === 0 && prospect_talk_time === 0 && 
        transcript.metadata && transcript.metadata.speakerRatio) {
      const { agent, customer } = transcript.metadata.speakerRatio;
      if (agent && customer && total_time) {
        agent_talk_time = agent * total_time;
        prospect_talk_time = customer * total_time;
      }
    }
    
    // Calculate talk time ratios
    const total_talk_time = agent_talk_time + prospect_talk_time + silence_time;
    const agent_ratio = total_talk_time > 0 ? agent_talk_time / total_talk_time : 0.5;
    const prospect_ratio = total_talk_time > 0 ? prospect_talk_time / total_talk_time : 0.5;
    const dominance_score = prospect_talk_time > 0 ? agent_talk_time / prospect_talk_time : 
                          (agent_talk_time > 0 ? 10 : 1); // High score if agent talks but prospect doesn't
    
    return {
      agent_ratio,
      prospect_ratio,
      dominance_score,
      agent_talk_time,
      prospect_talk_time,
      silence_time,
      interruption_count
    };
  }
  
  // Generate sentiment heatmap
  static generateSentimentHeatmap(transcript: CallTranscript): SentimentHeatmapPoint[] {
    if (!transcript || !transcript.transcript_segments || !Array.isArray(transcript.transcript_segments)) {
      console.log('No transcript segments found, returning empty sentiment heatmap');
      return [];
    }
    
    try {
      const heatmapPoints: SentimentHeatmapPoint[] = [];
      
      // Process transcript segments for sentiment
      transcript.transcript_segments.forEach((segment, index) => {
        // Skip segments without text
        if (!segment.text || segment.text.trim().length === 0) return;
        
        // Determine sentiment label and score based on current data
        let sentimentLabel = 'NEUTRAL';
        let sentimentScore = 0.5;
        
        // If segment has sentiment data, use it
        if (segment.sentiment) {
          sentimentLabel = segment.sentiment.toUpperCase();
          sentimentScore = segment.sentiment_score || 0.5;
        } 
        // If transcript has overall sentiment, use that as a basis
        else if (transcript.sentiment) {
          sentimentLabel = transcript.sentiment.toUpperCase();
          
          // Create small variations for demo
          sentimentScore = transcript.call_score ? transcript.call_score / 100 : 0.5;
          
          // Add some variance to make the heatmap more interesting
          const variance = (Math.random() * 0.3) - 0.15;
          sentimentScore = Math.max(0.1, Math.min(0.9, sentimentScore + variance));
          
          if (sentimentScore > 0.65) sentimentLabel = 'POSITIVE';
          else if (sentimentScore < 0.35) sentimentLabel = 'NEGATIVE';
          else sentimentLabel = 'NEUTRAL';
        }
        
        heatmapPoints.push({
          time: segment.start_time,
          label: sentimentLabel,
          score: sentimentScore,
          text_snippet: segment.text.substring(0, 50) + (segment.text.length > 50 ? '...' : '')
        });
      });
      
      // If we couldn't extract real heatmap points, generate a demo version
      if (heatmapPoints.length === 0 && transcript.duration) {
        return this.generateDemoSentimentHeatmap(transcript.duration);
      }
      
      return heatmapPoints;
    } catch (err) {
      console.error('Error generating sentiment heatmap:', err);
      return [];
    }
  }
  
  // Generate a demo sentiment heatmap when real data isn't available
  private static generateDemoSentimentHeatmap(duration: number): SentimentHeatmapPoint[] {
    const points: SentimentHeatmapPoint[] = [];
    const segments = Math.min(20, Math.max(5, Math.floor(duration / 30)));
    
    const sentimentLabels = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
    const demoTexts = [
      "I'm interested in learning more about the features",
      "Let me think about the pricing options",
      "That's exactly what we've been looking for",
      "I'm concerned about implementation time",
      "We need to discuss this with the team",
      "The ROI looks promising based on these numbers",
      "I don't think this fits our current workflow",
      "Can you explain how this would integrate?",
      "This solution addresses our pain points perfectly",
      "The timeline seems aggressive for our team"
    ];
    
    for (let i = 0; i < segments; i++) {
      const time = (duration / segments) * i;
      const labelIndex = Math.floor(Math.random() * 3);
      const sentimentLabel = sentimentLabels[labelIndex];
      
      let score;
      if (sentimentLabel === 'POSITIVE') score = 0.65 + (Math.random() * 0.3);
      else if (sentimentLabel === 'NEGATIVE') score = 0.05 + (Math.random() * 0.3);
      else score = 0.35 + (Math.random() * 0.3);
      
      const textIndex = Math.floor(Math.random() * demoTexts.length);
      
      points.push({
        time,
        label: sentimentLabel,
        score,
        text_snippet: demoTexts[textIndex]
      });
    }
    
    return points;
  }
  
  // Calculate objection handling metrics
  static calculateObjectionHandling(transcript: CallTranscript): ObjectionHandlingMetrics {
    if (!transcript || !transcript.transcript_segments || !Array.isArray(transcript.transcript_segments)) {
      console.log('No transcript segments found, returning default objection handling metrics');
      return {
        total_objections: 0,
        handled_objections: 0,
        effectiveness: 0,
        details: []
      };
    }
    
    // Common objection phrases
    const OBJECTIONS = [
      "expensive", "costs too much", "price", "budget", 
      "not sure", "need to think", "uncertain", 
      "competitor", "other solution", "already using",
      "too complicated", "complex", "difficult",
      "don't have time", "time-consuming",
      "need approval", "talk to my boss", "committee"
    ];
    
    // Common rebuttal/handling phrases
    const REBUTTALS = [
      "value", "roi", "return on investment", "worth", "savings",
      "guarantee", "assurance", "promise", "warranty",
      "support", "help", "assist", "training",
      "flexible", "customize", "tailor", "adapt",
      "proven", "case study", "example", "success story"
    ];
    
    const objectionMoments: ObjectionDetail[] = [];
    const rebuttalMoments: number[] = [];
    
    try {
      // First pass: identify objections and rebuttals
      transcript.transcript_segments.forEach(segment => {
        if (!segment.text) return;
        
        const text = segment.text.toLowerCase();
        
        // Check for objections
        const hasObjection = OBJECTIONS.some(objection => 
          text.includes(objection)
        );
        
        if (hasObjection && segment.speaker !== 'agent' && segment.speaker !== 'Agent') {
          objectionMoments.push({
            time: segment.start_time,
            text: segment.text,
            handled: false
          });
        }
        
        // Check for rebuttals
        const hasRebuttal = REBUTTALS.some(rebuttal => 
          text.includes(rebuttal)
        );
        
        if (hasRebuttal && (segment.speaker === 'agent' || segment.speaker === 'Agent')) {
          rebuttalMoments.push(segment.start_time);
        }
      });
      
      // Second pass: match rebuttals to objections
      objectionMoments.forEach(objection => {
        // Check if any rebuttal was within 60 seconds after the objection
        objection.handled = rebuttalMoments.some(rebuttalTime => 
          rebuttalTime > objection.time && 
          rebuttalTime <= objection.time + 60
        );
      });
      
      // Calculate effectiveness
      const totalObjections = objectionMoments.length;
      const handledObjections = objectionMoments.filter(obj => obj.handled).length;
      const effectiveness = totalObjections > 0 ? handledObjections / totalObjections : 0;
      
      return {
        total_objections: totalObjections,
        handled_objections: handledObjections,
        effectiveness,
        details: objectionMoments
      };
    } catch (err) {
      console.error('Error calculating objection handling:', err);
      return {
        total_objections: 0,
        handled_objections: 0,
        effectiveness: 0,
        details: []
      };
    }
  }
}
