
import { supabase } from "@/integrations/supabase/client";
import { CallTranscript } from "@/types/call";

export interface AdvancedMetric {
  name: string;
  callVolume: number;
  sentiment: number;
  conversion: number;
}

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
  score: number;
  label: string;
  text_snippet: string;
}

export interface ObjectionHandlingMetrics {
  total_objections: number;
  handled_objections: number;
  effectiveness: number;
  details: Array<{
    time: number;
    text: string;
    handled: boolean;
    response?: string;
  }>;
}

export class AdvancedMetricsService {
  /**
   * Get advanced metrics for charting and deeper analysis
   */
  static async getAdvancedMetrics(options?: {
    period?: 'day' | 'week' | 'month' | 'year';
    groupBy?: 'day' | 'week' | 'month';
    limit?: number;
  }): Promise<AdvancedMetric[]> {
    try {
      // Default options
      const period = options?.period || 'month';
      const groupBy = options?.groupBy || 'month';
      const limit = options?.limit || 6;
      
      // Build date range
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case 'day':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      // Query call_metrics_summary
      const { data, error } = await supabase
        .from('call_metrics_summary')
        .select('*')
        .gte('report_date', startDate.toISOString().split('T')[0])
        .lte('report_date', endDate.toISOString().split('T')[0])
        .order('report_date', { ascending: false })
        .limit(limit);
        
      if (error) {
        console.error('Error fetching advanced metrics:', error);
        return this.generateDemoAdvancedMetrics(limit);
      }
      
      if (!data || data.length === 0) {
        console.log('No advanced metrics data available, using demo values');
        return this.generateDemoAdvancedMetrics(limit);
      }
      
      // Transform data for charting
      const metrics: AdvancedMetric[] = data.map(record => {
        // Format date based on groupBy
        let name = '';
        const date = new Date(record.report_date);
        
        switch (groupBy) {
          case 'day':
            name = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            break;
          case 'week':
            // Get the week number
            const weekNum = Math.ceil((date.getDate() + 
              new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
            name = `Week ${weekNum}`;
            break;
          case 'month':
          default:
            name = date.toLocaleDateString(undefined, { month: 'short' });
            break;
        }
        
        return {
          name,
          callVolume: record.total_calls || 0,
          sentiment: Math.round((record.avg_sentiment || 0.5) * 100),
          conversion: Math.round((record.conversion_rate || 0) * 100)
        };
      });
      
      // Reverse to show oldest to newest (left to right on chart)
      return metrics.reverse();
      
    } catch (error) {
      console.error('Error in getAdvancedMetrics:', error);
      return this.generateDemoAdvancedMetrics();
    }
  }
  
  /**
   * Generate demo advanced metrics for display when no real data is available
   */
  static generateDemoAdvancedMetrics(count: number = 6): AdvancedMetric[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    return Array.from({ length: count }, (_, i) => {
      const monthIndex = (currentMonth - count + i + 1 + 12) % 12;
      return {
        name: months[monthIndex],
        callVolume: 100 + Math.floor(Math.random() * 80),
        sentiment: 65 + Math.floor(Math.random() * 20),
        conversion: 25 + Math.floor(Math.random() * 20)
      };
    });
  }
  
  /**
   * Calculate talk ratios from transcript
   */
  static calculateTalkRatios(transcript: CallTranscript): TalkRatioMetrics {
    try {
      // Extract metadata if available
      const metadata = transcript.metadata || {};
      const speakerRatio = metadata.speakerRatio || {};
      
      // Get agent and prospect ratios
      const agentRatio = speakerRatio.agent || 0.5;
      const prospectRatio = speakerRatio.customer || 0.5;
      
      // Calculate talk times based on duration
      const callDuration = transcript.duration || 300; // Default 5 minutes
      const agentTalkTime = callDuration * agentRatio;
      const prospectTalkTime = callDuration * prospectRatio;
      
      // Estimate silence time (10-15% of call is typically silence)
      const silenceTime = callDuration * (Math.random() * 0.05 + 0.1);
      
      // Estimate interruption count based on talk ratios
      // More balanced calls typically have fewer interruptions
      const balanceScore = Math.abs(agentRatio - 0.5) * 2; // 0 (perfect balance) to 1 (complete imbalance)
      const interruptionCount = Math.round(balanceScore * 10);
      
      // Calculate dominance score - ratio of speaker times, normalized to be >= 1
      const dominanceScore = agentRatio >= prospectRatio 
        ? agentRatio / Math.max(0.1, prospectRatio) 
        : prospectRatio / Math.max(0.1, agentRatio);
      
      return {
        agent_ratio: agentRatio,
        prospect_ratio: prospectRatio,
        dominance_score: dominanceScore,
        agent_talk_time: agentTalkTime,
        prospect_talk_time: prospectTalkTime,
        silence_time: silenceTime,
        interruption_count: interruptionCount
      };
    } catch (error) {
      console.error('Error calculating talk ratios:', error);
      // Return default values if calculation fails
      return {
        agent_ratio: 0.5,
        prospect_ratio: 0.5,
        dominance_score: 1,
        agent_talk_time: 150,
        prospect_talk_time: 150,
        silence_time: 30,
        interruption_count: 2
      };
    }
  }
  
  /**
   * Generate sentiment heatmap visualization data
   */
  static generateSentimentHeatmap(transcript: CallTranscript): SentimentHeatmapPoint[] {
    try {
      const segments = transcript.transcript_segments || [];
      const duration = transcript.duration || 300;
      
      // If no segments, create sample data points
      if (!segments || segments.length === 0) {
        return this.generateSampleSentimentHeatmap(duration);
      }
      
      // Extract sentiment points from segments
      const heatmapPoints: SentimentHeatmapPoint[] = [];
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (!segment) continue;
        
        const time = segment.start_time || i * (duration / segments.length);
        const sentiment = segment.sentiment || Math.random();
        
        // Determine sentiment label
        let label = 'NEUTRAL';
        if (sentiment > 0.66) label = 'POSITIVE';
        else if (sentiment < 0.33) label = 'NEGATIVE';
        
        heatmapPoints.push({
          time,
          score: sentiment,
          label,
          text_snippet: segment.text || 'No transcript text available'
        });
      }
      
      return heatmapPoints;
    } catch (error) {
      console.error('Error generating sentiment heatmap:', error);
      return this.generateSampleSentimentHeatmap(transcript.duration || 300);
    }
  }
  
  /**
   * Generate sample sentiment heatmap for demo purposes
   */
  private static generateSampleSentimentHeatmap(duration: number): SentimentHeatmapPoint[] {
    const sampleTexts = [
      "I understand your concerns about the pricing.",
      "That's a great question about our service.",
      "We'd be happy to offer a discount for annual plans.",
      "I'm not sure if this solution fits our needs.",
      "This feature addresses exactly what we've been looking for.",
      "We need to think about this more carefully.",
      "Our team is excited about implementing this solution.",
      "The timeline seems too aggressive for our team."
    ];
    
    // Generate 6-10 data points spread throughout the call
    const pointCount = 6 + Math.floor(Math.random() * 5);
    const points: SentimentHeatmapPoint[] = [];
    
    for (let i = 0; i < pointCount; i++) {
      const time = (i * duration) / (pointCount - 1);
      
      // Generate a sentiment score with more positive bias (realistic for sales calls)
      let sentiment: number;
      const rand = Math.random();
      if (rand < 0.6) {
        sentiment = 0.67 + (Math.random() * 0.3); // Positive
      } else if (rand < 0.8) {
        sentiment = 0.34 + (Math.random() * 0.32); // Neutral
      } else {
        sentiment = 0.05 + (Math.random() * 0.28); // Negative
      }
      
      // Determine sentiment label
      let label = 'NEUTRAL';
      if (sentiment > 0.66) label = 'POSITIVE';
      else if (sentiment < 0.33) label = 'NEGATIVE';
      
      points.push({
        time,
        score: sentiment,
        label,
        text_snippet: sampleTexts[i % sampleTexts.length]
      });
    }
    
    return points;
  }
  
  /**
   * Calculate objection handling metrics from transcript
   */
  static calculateObjectionHandling(transcript: CallTranscript): ObjectionHandlingMetrics {
    try {
      const segments = transcript.transcript_segments || [];
      const duration = transcript.duration || 300;
      
      // If no segments, create sample data
      if (!segments || segments.length === 0) {
        return this.generateSampleObjectionHandling();
      }
      
      // Extract objections from segments
      // This would typically use NLP to identify objections
      // For now, we'll use keywords to simulate
      const objectionKeywords = ['concern', 'expensive', 'issue', 'problem', 'too much', 
                                'not sure', 'competitors', 'alternative', 'think about'];
      
      const details: Array<{time: number; text: string; handled: boolean; response?: string}> = [];
      let totalObjections = 0;
      let handledObjections = 0;
      
      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        if (!segment || !segment.text) continue;
        
        // Check if this segment contains an objection
        const containsObjection = objectionKeywords.some(keyword => 
          segment.text.toLowerCase().includes(keyword));
          
        if (containsObjection) {
          totalObjections++;
          
          // Check if the objection was handled by looking at subsequent segments
          let handled = false;
          let response = '';
          
          // Look at the next 3 segments to see if there's a response
          for (let j = i + 1; j < Math.min(i + 4, segments.length); j++) {
            if (segments[j]?.speaker === 'agent') {
              handled = true;
              response = segments[j]?.text || '';
              break;
            }
          }
          
          if (handled) handledObjections++;
          
          details.push({
            time: segment.start_time || i * (duration / segments.length),
            text: segment.text,
            handled,
            response: handled ? response : undefined
          });
        }
      }
      
      const effectiveness = totalObjections > 0 ? handledObjections / totalObjections : 1;
      
      return {
        total_objections: totalObjections,
        handled_objections: handledObjections,
        effectiveness,
        details
      };
      
    } catch (error) {
      console.error('Error calculating objection handling:', error);
      return this.generateSampleObjectionHandling();
    }
  }
  
  /**
   * Generate sample objection handling metrics for demo
   */
  private static generateSampleObjectionHandling(): ObjectionHandlingMetrics {
    const objectionCount = Math.floor(Math.random() * 5);
    const handledCount = Math.floor(Math.random() * (objectionCount + 1));
    const effectiveness = objectionCount > 0 ? handledCount / objectionCount : 1;
    
    const sampleObjections = [
      "I'm concerned about the price. It seems higher than what we budgeted.",
      "We're currently evaluating several competitors as well.",
      "I'm not sure this addresses all our requirements.",
      "Our team might need more time to implement this solution.",
      "We've had issues with similar products in the past."
    ];
    
    const sampleResponses = [
      "I understand your concern about pricing. We do offer flexible payment options that might work better for your budget.",
      "I appreciate you considering us among other options. Our solution differs in a few key ways that might be valuable to you.",
      "Let me walk through how our solution addresses each of your requirements in detail.",
      "We provide comprehensive implementation support to make the transition as smooth as possible.",
      "I'd like to hear more about those past issues to ensure we can address them properly."
    ];
    
    const details: Array<{time: number; text: string; handled: boolean; response?: string}> = [];
    
    for (let i = 0; i < objectionCount; i++) {
      const handled = i < handledCount;
      details.push({
        time: 30 + (i * 60),
        text: sampleObjections[i % sampleObjections.length],
        handled,
        response: handled ? sampleResponses[i % sampleResponses.length] : undefined
      });
    }
    
    return {
      total_objections: objectionCount,
      handled_objections: handledCount,
      effectiveness,
      details
    };
  }
}
