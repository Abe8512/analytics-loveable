import { supabase, generateAnonymousUserId } from "@/integrations/supabase/client";
import { TranscriptAnalysisService, transcriptAnalysisService } from './TranscriptAnalysisService';
import { WhisperTranscriptionResponse } from "@/services/WhisperService";
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '@/integrations/supabase/types';

export class DatabaseService {
  // Save transcript to call_transcripts table
  public async saveTranscriptToDatabase(
    result: WhisperTranscriptionResponse, 
    file: File, 
    userId: string | null,
    numSpeakers: number
  ): Promise<{ id: string; error: any }> {
    try {
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
        const { data: { user } } = await supabase.auth.getUser();
        finalUserId = user?.id || generateAnonymousUserId();
      }
      
      console.log(`Saving transcript with user_id: ${finalUserId}`);
      
      // Create timestamp for consistent usage
      const timestamp = new Date().toISOString();
      
      // Create a unique ID for the transcript using proper UUID format
      const transcriptId = uuidv4();
      console.log(`Generated transcript ID: ${transcriptId}`);
      
      // Prepare data with proper typing
      const transcriptData: Database['public']['Tables']['call_transcripts']['Insert'] = {
        user_id: finalUserId,
        filename: file.name,
        text: result.text,
        duration,
        call_score: callScore,
        sentiment,
        keywords,
        transcript_segments: transcriptSegments ? JSON.stringify(transcriptSegments) : null,
        created_at: timestamp
      };
      
      // Insert into database
      const { data, error } = await supabase
        .from('call_transcripts')
        .insert(transcriptData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error inserting transcript into database:', error);
        return { id: transcriptId, error };
      }
      
      console.log('Successfully inserted transcript:', data);
      
      // Also update the calls table with similar data for real-time metrics
      const callData: Database['public']['Tables']['calls']['Insert'] = {
        user_id: finalUserId,
        duration: duration || 0,
        sentiment_agent: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.3 : 0.5,
        sentiment_customer: sentiment === 'positive' ? 0.7 : sentiment === 'negative' ? 0.2 : 0.5,
        talk_ratio_agent: 50 + (Math.random() * 20 - 10), // Random value between 40-60
        talk_ratio_customer: 50 - (Math.random() * 20 - 10), // Random value between 40-60
        key_phrases: keywords || [],
        created_at: timestamp // Use the same timestamp for consistency
      };
      
      await this.updateCallsTable(callData);
      
      return { id: data?.id || transcriptId, error: null };
    } catch (error) {
      console.error('Error saving transcript:', error);
      return { id: '', error };
    }
  }
  
  // Update calls table for real-time metrics
  private async updateCallsTable(callData: Database['public']['Tables']['calls']['Insert']): Promise<void> {
    try {
      console.log('Updating calls table with data:', callData);
      const { error } = await supabase
        .from('calls')
        .insert(callData);
      
      if (error) {
        console.error('Error updating calls table:', error);
      } else {
        console.log('Successfully updated calls table');
      }
    } catch (error) {
      console.error('Exception updating calls table:', error);
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
            } as Database['public']['Tables']['keyword_trends']['Update'])
            .eq('id', data.id);
        } else {
          // Insert new keyword with proper UUID
          const trendData: Database['public']['Tables']['keyword_trends']['Insert'] = {
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
      const trendData: Database['public']['Tables']['sentiment_trends']['Insert'] = {
        sentiment_label: sentiment,
        confidence: sentiment === 'positive' ? 0.8 : sentiment === 'negative' ? 0.7 : 0.6,
        user_id: userId,
        recorded_at: new Date().toISOString()
      };
      
      await supabase
        .from('sentiment_trends')
        .insert(trendData);
    } catch (error) {
      console.error('Error updating sentiment trend:', error);
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
