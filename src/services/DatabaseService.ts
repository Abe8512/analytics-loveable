
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface CallTranscriptInput {
  text: string;
  user_id?: string;
  call_id?: string;
  filename?: string;
  duration?: number;
  call_score?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  keywords?: string[];
  key_phrases?: string[];
  transcript_segments?: any;
  metadata?: any;
}

interface CallInput {
  user_id?: string;
  filename?: string;
  duration?: number;
  sentiment_agent?: number;
  sentiment_customer?: number;
  talk_ratio_agent?: number;
  talk_ratio_customer?: number;
  key_phrases?: string[];
}

interface KeywordTrendInput {
  keyword: string;
  category?: string;
  count?: number;
}

interface AlertInput {
  alert_name: string;
  alert_type: string;
  threshold: number;
  description?: string;
}

/**
 * Service for database operations like saving calls and transcripts
 */
export class DatabaseService {
  /**
   * Save a call transcript to the database
   */
  public async saveCallTranscript(input: CallTranscriptInput) {
    try {
      // Ensure numeric values are properly typed
      const duration = typeof input.duration === 'number' ? input.duration : 0;
      const callScore = typeof input.call_score === 'number' ? input.call_score : 50;
      
      // Generate a transcript ID
      const transcriptId = uuidv4();
      
      // Simple insert with no ON CONFLICT clause (removed to fix error)
      const { data, error } = await supabase
        .from('call_transcripts')
        .insert({
          id: transcriptId,
          user_id: input.user_id || 'anonymous',
          call_id: input.call_id,
          filename: input.filename,
          text: input.text,
          duration: duration,
          call_score: callScore,
          sentiment: input.sentiment || 'neutral',
          keywords: input.keywords || [],
          key_phrases: input.key_phrases || [],
          transcript_segments: input.transcript_segments || null,
          metadata: input.metadata || {},
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error saving call transcript:', error);
        
        // Try the edge function as a fallback
        try {
          const edgeFunctionResult = await supabase.functions.invoke('save-call-transcript', {
            body: { 
              data: {
                id: transcriptId,
                user_id: input.user_id || 'anonymous',
                text: input.text,
                filename: input.filename,
                duration: duration,
                sentiment: input.sentiment || 'neutral',
                keywords: input.keywords || [],
                key_phrases: input.key_phrases || [],
                call_score: callScore,
                metadata: input.metadata || {},
                created_at: new Date().toISOString()
              }
            }
          });
          
          // Improved error handling for edge function
          if (edgeFunctionResult.error) {
            console.error('Edge function error:', edgeFunctionResult.error);
            throw new Error(`Edge function error: ${
              edgeFunctionResult.error.message || JSON.stringify(edgeFunctionResult.error)
            }`);
          }
          
          return edgeFunctionResult.data || { id: transcriptId };
        } catch (edgeFunctionError) {
          console.error('Edge function also failed:', edgeFunctionError);
          
          // Final fallback - try with minimal data
          try {
            const { data: minimalData, error: minimalError } = await supabase
              .from('call_transcripts')
              .insert({
                id: transcriptId,
                user_id: input.user_id || 'anonymous',
                text: input.text,
                filename: input.filename || 'unknown.wav'
              })
              .select();
              
            if (minimalError) {
              throw minimalError;
            }
            
            return minimalData;
          } catch (finalError) {
            console.error('All insertion attempts failed:', finalError);
            throw finalError;
          }
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error in saveCallTranscript:', error);
      throw error;
    }
  }
  
  /**
   * Save a call directly to the database
   */
  public async saveCall(input: CallInput) {
    try {
      const { data, error } = await supabase
        .from('calls')
        .insert({
          id: uuidv4(),
          user_id: input.user_id || 'anonymous',
          filename: input.filename,
          duration: input.duration || 0,
          sentiment_agent: input.sentiment_agent || 0.5,
          sentiment_customer: input.sentiment_customer || 0.5,
          talk_ratio_agent: input.talk_ratio_agent || 50,
          talk_ratio_customer: input.talk_ratio_customer || 50,
          key_phrases: input.key_phrases || [],
          created_at: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error saving call:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in saveCall:', error);
      throw error;
    }
  }
  
  /**
   * Save a keyword trend entry
   */
  public async saveKeywordTrend(input: KeywordTrendInput) {
    try {
      const now = new Date();
      
      const { data, error } = await supabase
        .from('keyword_trends')
        .insert({
          id: uuidv4(),
          keyword: input.keyword,
          category: input.category || 'general',
          count: input.count || 1,
          last_used: now.toISOString(),
          report_date: now.toISOString().split('T')[0],
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error saving keyword trend:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in saveKeywordTrend:', error);
      throw error;
    }
  }
  
  /**
   * Update a keyword trend's count
   */
  public async incrementKeywordCount(keyword: string, category: string = 'general') {
    try {
      const { data, error } = await supabase
        .from('keyword_trends')
        .select('*')
        .eq('keyword', keyword)
        .eq('category', category)
        .single();
      
      if (error) {
        // Keyword doesn't exist, create it
        return await this.saveKeywordTrend({ keyword, category });
      }
      
      // Keyword exists, increment count
      const { data: updateData, error: updateError } = await supabase
        .from('keyword_trends')
        .update({
          count: (data.count || 0) + 1,
          last_used: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id)
        .select();
      
      if (updateError) {
        console.error('Error incrementing keyword count:', updateError);
        throw updateError;
      }
      
      return updateData;
    } catch (error) {
      console.error('Error in incrementKeywordCount:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
