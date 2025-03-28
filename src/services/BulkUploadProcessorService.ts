
import { useWhisperService } from "./WhisperService";
import { useEventsStore } from "./events";
import { errorHandler } from "./ErrorHandlingService";
import { getSentimentScore } from "./AIService";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { teamService } from "./TeamService";
import { dispatchEvent } from "./events";

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
    
    // Notify other components about the assignment update
    dispatchEvent("CALL_ASSIGNED", { assignedTo: userId });
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
      
      // Get user name from team members if possible
      let userName = "Unknown Rep";
      if (this.assignedUserId && this.assignedUserId.trim() !== '') {
        try {
          // Check if we can find the team member
          const teamMembers = await teamService.getTeamMembers();
          const assignedMember = teamMembers.find(member => 
            member.id === this.assignedUserId || 
            member.user_id === this.assignedUserId
          );
          
          if (assignedMember) {
            userName = assignedMember.name;
          } else if (this.assignedUserId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            // If it's a UUID format but not found in team members, try direct DB query
            const { data: userProfile, error: userError } = await supabase
              .from('team_members')
              .select('name')
              .eq('id', this.assignedUserId)
              .single();
              
            if (!userError && userProfile && userProfile.name) {
              userName = userProfile.name;
            }
          } else {
            console.log('Non-UUID format user ID, using as direct name:', this.assignedUserId);
            userName = this.assignedUserId;
          }
        } catch (e) {
          console.log('Error fetching user profile:', e);
        }
      }
      
      // Try direct insert without ON CONFLICT
      try {
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
            user_name: userName,
            customer_name: 'Customer',
            metadata: {
              source: 'bulk_upload',
              created_at: new Date().toISOString(),
              original_filename: file.name,
              file_size: file.size,
              file_type: file.type,
              assigned_to: this.assignedUserId || 'unassigned'
            }
          });
        
        if (error) {
          console.error('Error saving transcript to database:', error);
          throw error;
        }
        
        progressCallback('complete', 100, 'File processed successfully', undefined, transcriptId);
        
        // Dispatch multiple events for various components to react
        const eventsStore = useEventsStore.getState();
        eventsStore.dispatchEvent('call-uploaded', {
          transcriptId,
          fileName: file.name,
          assignedTo: this.assignedUserId,
          userName: userName
        });
        
        dispatchEvent('CALL_UPDATED', {
          id: transcriptId,
          assignedTo: this.assignedUserId,
          repName: userName
        });
        
        return;
      } catch (error) {
        console.error('Error saving transcript to database:', error);
        
        // If direct insert fails, try edge function
        progressCallback('processing', 70, 'Using edge function fallback...');
        
        try {
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
                user_name: userName,
                customer_name: 'Customer',
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
            throw new Error(`Edge function error: ${
              typeof edgeFunctionResult.error === 'string' 
                ? edgeFunctionResult.error 
                : JSON.stringify(edgeFunctionResult.error)
            }`);
          }
          
          progressCallback('complete', 100, 'File processed successfully', undefined, transcriptId);
          
          // Dispatch multiple events for various components
          const eventsStore = useEventsStore.getState();
          eventsStore.dispatchEvent('call-uploaded', {
            transcriptId,
            fileName: file.name,
            assignedTo: this.assignedUserId,
            userName: userName
          });
          
          dispatchEvent('CALL_UPDATED', {
            id: transcriptId,
            assignedTo: this.assignedUserId,
            repName: userName
          });
          
          return;
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
          
          // Final fallback - ultra simplified insert with minimal data
          progressCallback('processing', 80, 'Trying simplified insert...');
          
          try {
            const { error: simpleError } = await supabase
              .from('call_transcripts')
              .insert({
                id: transcriptId,
                user_id: this.assignedUserId || 'anonymous',
                user_name: userName,
                customer_name: 'Customer',
                text: cleanText || "No transcript available",
                filename: file.name
              });
              
            if (simpleError) {
              throw new Error(`Final insert attempt failed: ${simpleError.message}`);
            }
            
            progressCallback('complete', 100, 'File processed (minimal data saved)', undefined, transcriptId);
            
            // Dispatch events for components to react
            const eventsStore = useEventsStore.getState();
            eventsStore.dispatchEvent('call-uploaded', {
              transcriptId,
              fileName: file.name,
              assignedTo: this.assignedUserId,
              userName: userName
            });
            
            dispatchEvent('CALL_UPDATED', {
              id: transcriptId,
              assignedTo: this.assignedUserId,
              repName: userName
            });
            
            return;
          } catch (finalError) {
            // All attempts failed
            progressCallback('error', 0, undefined, 
              finalError instanceof Error ? 
              `Database error: ${finalError.message}` : 
              'Unknown database error');
          }
        }
      }
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
