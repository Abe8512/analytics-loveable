
import { useWhisperService } from "./WhisperService";
import { useEventsStore } from "./events";
import { errorHandler } from "./ErrorHandlingService";
import { getSentimentScore } from "./AIService";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";

export type UploadStatus = 'queued' | 'processing' | 'complete' | 'error';

export interface BulkUploadCallbackParams {
  status: UploadStatus;
  progress: number;
  result?: string;
  error?: string;
  transcriptId?: string;
}

export type BulkUploadProgressCallback = (
  status: UploadStatus,
  progress: number,
  result?: string,
  error?: string,
  transcriptId?: string
) => void;

export class BulkUploadProcessorService {
  private assignedUserId: string = '';
  private whisperService = useWhisperService();
  
  constructor() {
    // Initialize service
  }
  
  setAssignedUserId(userId: string) {
    this.assignedUserId = userId;
  }
  
  async processFile(
    file: File,
    progressCallback: BulkUploadProgressCallback
  ): Promise<void> {
    try {
      // Update status to processing
      progressCallback('processing', 10);
      
      // Transcribe the audio file
      progressCallback('processing', 20, 'Transcribing audio...');
      const transcriptionResult = await this.whisperService.transcribeAudio(file);
      
      progressCallback('processing', 40, 'Analyzing sentiment...');
      
      // Generate an ID for the transcript
      const transcriptId = uuidv4();
      
      // Clean text to avoid Unicode escape sequence issues
      const cleanText = transcriptionResult.text
        .replace(/\u0000/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      
      // Analyze sentiment
      const { sentiment, sentimentScore, keywords, keyPhrases } = 
        await getSentimentScore(cleanText);
      
      progressCallback('processing', 60, 'Saving to database...');
      
      // Convert numeric values explicitly to ensure proper types
      const duration = typeof transcriptionResult.duration === 'number' 
        ? transcriptionResult.duration 
        : 0;
        
      const callScore = typeof sentimentScore === 'number' 
        ? Math.round(sentimentScore * 100) 
        : 50;
      
      // Modified insert without ON CONFLICT clause - this was causing the error
      const { data, error } = await supabase
        .from('call_transcripts')
        .insert({
          id: transcriptId,
          user_id: this.assignedUserId || 'anonymous',
          text: cleanText,
          filename: file.name,
          duration: duration,
          sentiment: sentiment,
          keywords: keywords,
          key_phrases: keyPhrases,
          call_score: callScore,
          transcript_segments: transcriptionResult.segments,
          metadata: {
            source: 'bulk_upload',
            created_at: new Date().toISOString(),
            original_filename: file.name,
            file_size: file.size,
            file_type: file.type,
            assigned_to: this.assignedUserId || 'unassigned'
          }
        })
        .select('id');
      
      if (error) {
        console.error('Error saving transcript to database:', error);
        
        // Try fallback to edge function if there's an error
        try {
          progressCallback('processing', 70, 'Using edge function fallback...');
          
          // Modified to pass the exact structure expected by the edge function
          // without any ON CONFLICT references that might be causing issues
          const edgeFunctionResult = await supabase.functions.invoke('save-call-transcript', {
            body: { 
              transcript: {
                id: transcriptId,
                user_id: this.assignedUserId || 'anonymous',
                text: cleanText,
                filename: file.name,
                duration: duration,
                sentiment: sentiment,
                keywords: keywords,
                key_phrases: keyPhrases,
                call_score: callScore,
                transcript_segments: transcriptionResult.segments,
                metadata: {
                  source: 'bulk_upload',
                  created_at: new Date().toISOString(),
                  original_filename: file.name,
                  file_size: file.size,
                  file_type: file.type,
                  assigned_to: this.assignedUserId || 'unassigned'
                }
              }
            }
          });
          
          // Improved error checking for edge function response
          if (edgeFunctionResult.error) {
            throw new Error(`Edge function error: ${edgeFunctionResult.error.message || JSON.stringify(edgeFunctionResult.error)}`);
          }
          
          // Check if we have data in the response
          if (!edgeFunctionResult.data && typeof edgeFunctionResult.data !== 'object') {
            console.warn('Edge function returned success but no data. Using original transcript ID:', transcriptId);
          }
          
          // Use the returned ID if available, otherwise use the original
          const finalTranscriptId = 
            edgeFunctionResult.data && edgeFunctionResult.data.id ? 
            edgeFunctionResult.data.id : transcriptId;
            
          progressCallback('complete', 100, 'File processed successfully', undefined, finalTranscriptId);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          
          // Try direct insert again without returning the ID
          try {
            progressCallback('processing', 80, 'Trying simplified insert...');
            
            const { error: insertError } = await supabase
              .from('call_transcripts')
              .insert({
                id: transcriptId,
                user_id: this.assignedUserId || 'anonymous',
                text: cleanText,
                filename: file.name,
                duration: duration,
                sentiment: sentiment,
                keywords: keywords,
                key_phrases: keyPhrases,
                call_score: callScore
              });
              
            if (insertError) {
              throw new Error(`Final insert attempt also failed: ${insertError.message}`);
            }
            
            progressCallback('complete', 100, 'File processed successfully', undefined, transcriptId);
          } catch (finalError) {
            // All attempts failed
            progressCallback('error', 0, undefined, 
              finalError instanceof Error ? 
              `Database error: ${finalError.message}` : 
              'Unknown database error');
            return;
          }
        }
      } else {
        progressCallback('complete', 100, 'File processed successfully', undefined, transcriptId);
      }
      
      // Dispatch event for other components
      const eventsStore = useEventsStore.getState();
      eventsStore.dispatchEvent('call-uploaded', {
        transcriptId,
        fileName: file.name,
        assignedTo: this.assignedUserId
      });
    } catch (error) {
      console.error('Error processing file:', error);
      errorHandler.handleError(error, 'BulkUploadProcessorService.processFile');
      progressCallback(
        'error', 
        0, 
        undefined, 
        error instanceof Error ? error.message : 'Unknown error processing file'
      );
    }
  }
}
