
import { supabase, generateAnonymousUserId } from "@/integrations/supabase/client";
import { transcriptAnalysisService } from './TranscriptAnalysisService';
import { WhisperTranscriptionResponse } from "@/services/WhisperService";
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '@/integrations/supabase/types';
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
        key_phrases: keywords, // Also store in key_phrases field (the updated schema)
        transcript_segments: segmentsForStorage,
        created_at: timestamp
      };
      
      console.log('Transcript data prepared for database insert:', {
        id: transcriptId,
        filename: file.name,
        textLength: result.text.length,
        segmentsLength: segmentsForStorage ? JSON.parse(segmentsForStorage).length : 0
      });
      
      // Insert into database
      const { data, error } = await supabase
        .from('call_transcripts')
        .insert(transcriptData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error inserting transcript into database:', error);
        errorHandler.handleError(error, 'DatabaseService.saveTranscriptToDatabase.insert');
        
        // If key_phrases is causing the error, try a more targeted approach
        if (error.message && (error.message.includes('key_phrases') || error.message.includes('column'))) {
          console.log('Retrying with a more compatible data structure');
          
          // Create a more compatible version of the data
          const { keywords, key_phrases, ...cleanedData } = transcriptData;
          
          // Try to determine which field is supported
          const hasKeywords = await this.checkColumnExists('call_transcripts', 'keywords');
          const hasKeyPhrases = await this.checkColumnExists('call_transcripts', 'key_phrases');
          
          console.log(`Column check: keywords=${hasKeywords}, key_phrases=${hasKeyPhrases}`);
          
          // Add back the appropriate field
          const updatedData: any = { ...cleanedData };
          if (hasKeywords) updatedData.keywords = keywords;
          if (hasKeyPhrases) updatedData.key_phrases = keywords;
          
          const retryResult = await supabase
            .from('call_transcripts')
            .insert(updatedData)
            .select('id')
            .single();
            
          if (retryResult.error) {
            console.error('Error on second attempt to insert transcript:', retryResult.error);
            return { id: transcriptId, error: retryResult.error };
          }
          
          return { id: retryResult.data?.id || transcriptId, error: null };
        }
        
        return { id: transcriptId, error };
      }
      
      console.log('Successfully inserted transcript:', data);
      
      // Also update the calls table with similar data for real-time metrics
      try {
        await this.updateCallsTable({
          id: transcriptId, // Use the same ID for calls as transcripts to link them
          user_id: finalUserId,
          duration: duration || 0,
          sentiment_agent: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.3 : 0.5,
          sentiment_customer: sentiment === 'positive' ? 0.7 : sentiment === 'negative' ? 0.2 : 0.5,
          talk_ratio_agent: 50 + (Math.random() * 20 - 10), // Random value between 40-60
          talk_ratio_customer: 50 - (Math.random() * 20 - 10), // Random value between 40-60
          key_phrases: keywords || [],
          filename: file.name, // Add filename to calls table
          created_at: timestamp // Use the same timestamp for consistency
        });
      } catch (callsError) {
        // Non-critical error, just log it
        console.error('Error updating calls table, but transcript was saved:', callsError);
        errorHandler.handleError(callsError, 'DatabaseService.saveTranscriptToDatabase.updateCallsTable');
      }
      
      return { id: data?.id || transcriptId, error: null };
    } catch (error) {
      console.error('Error saving transcript:', error);
      errorHandler.handleError(error, 'DatabaseService.saveTranscriptToDatabase');
      return { id: '', error };
    }
  }
  
  // Check if a column exists in a table
  private async checkColumnExists(table: string, column: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('check_column_exists', {
        p_table_name: table,
        p_column_name: column
      });
      
      if (error) {
        console.error(`Error checking if column ${column} exists in ${table}:`, error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error(`Exception checking if column ${column} exists in ${table}:`, error);
      return false;
    }
  }
  
  // Update calls table for real-time metrics
  private async updateCallsTable(callData: any): Promise<void> {
    try {
      console.log('Updating calls table with data:', callData);
      
      // Fix the key_phrases format issue
      const fixedCallData = {
        ...callData,
        // Ensure key_phrases is properly formatted for database
        key_phrases: Array.isArray(callData.key_phrases) ? callData.key_phrases : []
      };
      
      const { error } = await supabase
        .from('calls')
        .insert(fixedCallData);
      
      if (error) {
        console.error('Error updating calls table:', error);
        errorHandler.handleError(error, 'DatabaseService.updateCallsTable');
      } else {
        console.log('Successfully updated calls table');
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
    
    let category: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (sentiment === 'positive') category = 'positive';
    if (sentiment === 'negative') category = 'negative';
    
    // Add top keywords to trends
    for (const keyword of keywords.slice(0, 5)) {
      try {
        // First check if keyword exists
        const { data } = await supabase
          .from('keyword_trends')
          .select('*')
          .eq('keyword', keyword as string)
          .eq('category', category)
          .maybeSingle();
        
        if (data) {
          // Update existing keyword
          await supabase
            .from('keyword_trends')
            .update({ 
              count: (data.count || 1) + 1,
              last_used: new Date().toISOString()
            })
            .eq('id', data.id);
        } else {
          // Insert new keyword with proper UUID
          const trendData = {
            keyword: keyword as string,
            category,
            count: 1,
            last_used: new Date().toISOString()
          };
          
          await supabase
            .from('keyword_trends')
            .insert(trendData);
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
