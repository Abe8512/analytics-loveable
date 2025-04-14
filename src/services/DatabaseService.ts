import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { SupabaseErrorHandler } from "@/integrations/supabase/errorHandling";

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
  assigned_to?: string;
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
      
      // Try direct database insert first
      try {
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
            assigned_to: input.assigned_to || null,
            created_at: new Date().toISOString()
          });
        
        if (error) {
          throw error;
        }
        
        return data || [{ id: transcriptId }];
      } catch (directError) {
        console.error('Direct insert failed:', directError);
        
        // If RLS violation error, try saving keywords to keyword_analytics instead
        if (input.keywords && input.keywords.length > 0) {
          try {
            for (const keyword of input.keywords) {
              if (!keyword) continue;
              
              await supabase
                .from('keyword_analytics')
                .insert({
                  keyword,
                  category: input.sentiment || 'neutral',
                  last_used: new Date().toISOString()
                });
            }
            console.log('Keywords saved to analytics table');
          } catch (keywordError) {
            console.error('Error saving keywords:', keywordError);
          }
        }
        
        // Try the edge function as a fallback
        try {
          console.log('Attempting to save via edge function...');
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
                assigned_to: input.assigned_to || null,
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
          
          toast.success("Call transcript saved successfully via edge function");
          return edgeFunctionResult.data || { id: transcriptId };
        } catch (edgeFunctionError) {
          console.error('Edge function also failed:', edgeFunctionError);
          
          // Final fallback - try with minimal data
          try {
            console.log('Attempting minimal data insert...');
            const { data: minimalData, error: minimalError } = await supabase
              .from('call_transcripts')
              .insert({
                id: transcriptId,
                user_id: input.user_id || 'anonymous',
                text: input.text,
                filename: input.filename || 'unknown.wav',
                assigned_to: input.assigned_to || null
              });
              
            if (minimalError) {
              throw minimalError;
            }
            
            toast.success("Call transcript saved with minimal data");
            return minimalData || [{ id: transcriptId }];
          } catch (finalError) {
            console.error('All insertion attempts failed:', finalError);
            
            // Display error to user
            toast.error("Failed to save transcript", {
              description: finalError instanceof Error ? finalError.message : "Database error"
            });
            
            throw finalError;
          }
        }
      }
    } catch (error) {
      console.error('Error in saveCallTranscript:', error);
      
      // Handle error with the error handler
      SupabaseErrorHandler.handlePostgrestError(
        error as any, 
        'DatabaseService.saveCallTranscript'
      );
      
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
   * Save a keyword trend entry that works with the more permissive keyword_analytics table
   */
  public async saveKeywordAnalytics(input: KeywordTrendInput) {
    try {
      const now = new Date();
      
      const { data, error } = await supabase
        .from('keyword_analytics')
        .insert({
          id: uuidv4(),
          keyword: input.keyword,
          category: input.category || 'general',
          count: input.count || 1,
          last_used: now.toISOString(),
          report_date: now.toISOString().split('T')[0],
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        });
      
      if (error) {
        console.error('Error saving keyword analytics:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in saveKeywordAnalytics:', error);
      throw error;
    }
  }
  
  /**
   * Update a keyword trend's count with fallback to more permissive table
   */
  public async incrementKeywordCount(keyword: string, category: string = 'general') {
    try {
      // First try the original keyword_trends table
      try {
        const { data, error } = await supabase
          .from('keyword_trends')
          .select('*')
          .eq('keyword', keyword)
          .eq('category', category)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Keyword exists, increment count
        const { data: updateData, error: updateError } = await supabase
          .from('keyword_trends')
          .update({
            count: (data.count || 0) + 1,
            last_used: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
        
        if (updateError) {
          throw updateError;
        }
        
        return updateData;
      } catch (trendError) {
        // If this fails, try the fallback table
        console.error('Error with keyword_trends, using keyword_analytics fallback:', trendError);
        
        // Try to find existing record in analytics table
        const { data: existingAnalytics, error: findError } = await supabase
          .from('keyword_analytics')
          .select('*')
          .eq('keyword', keyword)
          .eq('category', category)
          .single();
          
        if (findError) {
          // Create new record
          return this.saveKeywordAnalytics({ keyword, category });
        }
        
        // Update existing record
        const { data: updateResult, error: updateError } = await supabase
          .from('keyword_analytics')
          .update({
            count: (existingAnalytics.count || 0) + 1,
            last_used: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnalytics.id);
          
        if (updateError) {
          throw updateError;
        }
        
        return updateResult;
      }
    } catch (error) {
      console.error('Error in incrementKeywordCount:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
