
import { supabase, generateAnonymousUserId } from "@/integrations/supabase/client";
import { transcriptAnalysisService } from './TranscriptAnalysisService';
import { WhisperTranscriptionResponse } from "@/services/WhisperService";
import { v4 as uuidv4 } from 'uuid';
import { errorHandler } from './ErrorHandlingService';

export class DatabaseService {
  // Save transcript to call_transcripts table
  public async saveTranscriptToDatabase(
    result: WhisperTranscriptionResponse, 
    file: File, 
    userId: string | null,
    numSpeakers: number
  ): Promise<{ id: string; error: any }> {
    try {
      console.log('DatabaseService: Saving transcript to database:', {
        filename: file.name,
        textLength: result.text.length,
        numSpeakers
      });
      
      // Process the transcription into segments by speaker
      const transcriptSegments = numSpeakers > 1 
        ? transcriptAnalysisService.splitBySpeaker(result.text, result.segments, numSpeakers)
        : undefined;
      
      // Generate sentiment and keywords
      const sentiment = transcriptAnalysisService.analyzeSentiment(result.text);
      const keywords = transcriptAnalysisService.extractKeywords(result.text);
      const callScore = transcriptAnalysisService.generateCallScore(result.text, sentiment);
      
      // Calculate duration if possible
      const duration = await this.calculateAudioDuration(file);
      
      // If no assigned userId, try to get current user from auth
      // If neither is available, use 'anonymous-{randomId}' to ensure uniqueness
      let finalUserId = userId;
      if (!finalUserId) {
        console.log('No userId provided, checking auth system');
        const { data: { user } } = await supabase.auth.getUser();
        finalUserId = user?.id || generateAnonymousUserId();
      }
      
      console.log(`Saving transcript with user_id: ${finalUserId}`);
      
      // Create timestamp for consistent usage
      const timestamp = new Date().toISOString();
      
      // Create a unique ID for the transcript using proper UUID format
      const transcriptId = uuidv4();
      console.log(`Generated transcript ID: ${transcriptId}`);
      
      // Prepare transcript segments for storage
      let segmentsForStorage = null;
      if (transcriptSegments && transcriptSegments.length > 0) {
        try {
          segmentsForStorage = JSON.stringify(transcriptSegments);
        } catch (error) {
          console.error('Error stringifying transcript segments:', error);
          errorHandler.handleError(error, 'DatabaseService.saveTranscriptToDatabase.stringifySegments');
        }
      }
      
      // Prepare data with proper typing for the database schema
      const transcriptData = {
        id: transcriptId,
        user_id: finalUserId,
        filename: file.name,
        text: result.text,
        duration,
        call_score: callScore,
        sentiment,
        keywords: keywords,  // Store in keywords field
        key_phrases: keywords, // Also store in key_phrases field
        transcript_segments: segmentsForStorage,
        created_at: timestamp
      };
      
      console.log('Transcript data prepared for database insert:', {
        id: transcriptId,
        filename: file.name,
        textLength: result.text.length,
        segmentsLength: segmentsForStorage ? JSON.parse(segmentsForStorage).length : 0
      });
      
      // Try using the edge function first
      try {
        const response = await supabase.functions.invoke('save-call-transcript', {
          body: { data: transcriptData }
        });
        
        if (response.error) {
          throw new Error(response.error.message || 'Edge function error');
        }
        
        console.log('Successfully saved transcript using edge function:', response.data);
        return { id: transcriptId, error: null };
      } catch (edgeFunctionError) {
        console.error('Edge function error:', edgeFunctionError);
        errorHandler.handleError(edgeFunctionError, 'DatabaseService.saveTranscriptToDatabase.edgeFunction');
        
        // Fallback to RPC function
        try {
          console.log('Falling back to RPC function...');
          const { data: rpcResult, error: rpcError } = await supabase.rpc(
            'save_call_transcript',
            { p_data: transcriptData }
          );
          
          if (rpcError) {
            console.error('RPC function error:', rpcError);
            throw rpcError;
          }
          
          console.log('Successfully saved transcript using RPC function:', rpcResult);
          return { id: transcriptId, error: null };
        } catch (rpcError) {
          console.error('RPC fallback error:', rpcError);
          errorHandler.handleError(rpcError, 'DatabaseService.saveTranscriptToDatabase.rpcFallback');
          
          // Final fallback to direct insert
          try {
            const { error: insertError } = await supabase
              .from('call_transcripts')
              .insert(transcriptData);
              
            if (insertError) {
              console.error('Direct insert error:', insertError);
              return { id: transcriptId, error: insertError };
            }
            
            console.log('Successfully saved transcript using direct insert');
            return { id: transcriptId, error: null };
          } catch (insertError) {
            console.error('Direct insert exception:', insertError);
            return { id: transcriptId, error: insertError };
          }
        }
      }
    } catch (error) {
      console.error('Error saving transcript:', error);
      errorHandler.handleError(error, 'DatabaseService.saveTranscriptToDatabase');
      return { id: '', error };
    }
  }
  
  // Update calls table for real-time metrics
  public async updateCallsTable(callData: any): Promise<void> {
    try {
      console.log('Updating calls table with data:', callData);
      
      // Fix the key_phrases format issue
      const fixedCallData = {
        ...callData,
        // Ensure key_phrases is properly formatted for database
        key_phrases: Array.isArray(callData.key_phrases) ? callData.key_phrases : []
      };
      
      // Try using RPC function first
      try {
        const { data: rpcResult, error: rpcError } = await supabase.rpc(
          'save_call',
          { p_data: fixedCallData }
        );
        
        if (rpcError) {
          console.error('Error using save_call RPC:', rpcError);
          throw rpcError;
        }
        
        console.log('Successfully updated calls table using RPC');
      } catch (rpcError) {
        console.error('RPC save_call error:', rpcError);
        errorHandler.handleError(rpcError, 'DatabaseService.updateCallsTable.saveRPC');
        
        // Direct insert fallback
        try {
          const { error: insertError } = await supabase
            .from('calls')
            .insert(fixedCallData);
            
          if (insertError) {
            console.error('Direct insert error:', insertError);
            throw insertError;
          }
          
          console.log('Successfully updated calls table using direct insert');
        } catch (insertError) {
          console.error('Direct insert error:', insertError);
          errorHandler.handleError(insertError, 'DatabaseService.updateCallsTable.directInsert');
        }
      }
    } catch (error) {
      console.error('Exception updating calls table:', error);
      errorHandler.handleError(error, 'DatabaseService.updateCallsTable');
    }
  }
  
  // Update keyword trends in Supabase
  public async updateKeywordTrends(result: WhisperTranscriptionResponse): Promise<void> {
    const keywords = transcriptAnalysisService.extractKeywords(result.text);
    const sentiment = transcriptAnalysisService.analyzeSentiment(result.text);
    
    // Map sentiment to valid category
    let category: 'positive' | 'neutral' | 'negative' | 'general' = 'general';
    if (sentiment === 'positive') category = 'positive';
    if (sentiment === 'neutral') category = 'neutral';
    if (sentiment === 'negative') category = 'negative';
    
    // Add top keywords to trends
    for (const keyword of keywords.slice(0, 5)) {
      try {
        // Use optimized RPC function
        const { data, error } = await supabase.rpc(
          'save_keyword_trend', 
          { 
            p_keyword: keyword as string,
            p_category: category,
            p_timestamp: new Date().toISOString()
          }
        );
        
        if (error) {
          console.error(`Error saving keyword trend for ${keyword}:`, error);
          errorHandler.handleError(error, 'DatabaseService.updateKeywordTrends.saveRPC');
          
          // Fallback to direct insert/update
          const { error: fallbackError } = await supabase
            .from('keyword_trends')
            .insert({
              keyword: keyword as string,
              category,
              count: 1,
              last_used: new Date().toISOString()
            })
            .onConflict(['keyword', 'category'])
            .merge({ 
              count: supabase.rpc('increment', { count: 1 }),
              last_used: new Date().toISOString()
            });
            
          if (fallbackError) {
            console.error(`Error inserting keyword trend for ${keyword}:`, fallbackError);
          }
        }
      } catch (error) {
        console.error(`Error updating keyword trend for ${keyword}:`, error);
        errorHandler.handleError(error, 'DatabaseService.updateKeywordTrends');
      }
    }
  }
  
  // Update sentiment trends in Supabase
  public async updateSentimentTrends(
    result: WhisperTranscriptionResponse, 
    userId: string | null
  ): Promise<void> {
    const sentiment = transcriptAnalysisService.analyzeSentiment(result.text);
    
    try {
      const trendData = {
        sentiment_label: sentiment,
        confidence: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.7 : 0.6,
        user_id: userId,
        recorded_at: new Date().toISOString()
      };
      
      // Insert directly (no need for conflict handling here)
      const { error } = await supabase
        .from('sentiment_trends')
        .insert(trendData);
        
      if (error) {
        console.error('Error inserting sentiment trend:', error);
        errorHandler.handleError(error, 'DatabaseService.updateSentimentTrends.insert');
      }
    } catch (error) {
      console.error('Error updating sentiment trend:', error);
      errorHandler.handleError(error, 'DatabaseService.updateSentimentTrends');
    }
  }
  
  // Calculate audio duration
  public async calculateAudioDuration(audioFile: File): Promise<number> {
    return new Promise((resolve) => {
      const audioUrl = URL.createObjectURL(audioFile);
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audioUrl);
        resolve(Math.round(duration));
      });
      
      // Fallback if metadata doesn't load properly
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audioUrl);
        // Estimate duration based on file size (very rough approximation)
        // Assuming 16bit 16kHz mono audio (~32kB per second)
        const estimatedSeconds = Math.round(audioFile.size / 32000);
        resolve(estimatedSeconds > 0 ? estimatedSeconds : 60); // Default to 60 seconds if calculation fails
      });
    });
  }
}

export const databaseService = new DatabaseService();
