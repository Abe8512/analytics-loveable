
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
      
      // Modified insert to correctly handle the ON CONFLICT clause
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
          
          const edgeFunctionResult = await supabase.functions.invoke('save-call-transcript', {
            body: { 
              data: {
                id: transcriptId,
                user_id: this.assignedUserId || 'anonymous',
                text: cleanText,
                filename: file.name,
                duration: duration,
                sentiment: sentiment,
                keywords: keywords,
                key_phrases: keyPhrases,
                call_score: callScore,
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
          
          if (edgeFunctionResult.error) {
            throw new Error(`Edge function error: ${edgeFunctionResult.error.message}`);
          }
          
          progressCallback('complete', 100, 'File processed successfully', undefined, transcriptId);
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          progressCallback('error', 0, undefined, `Database error: ${error.message}`);
          return;
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
