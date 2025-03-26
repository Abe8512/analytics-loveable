
import { useEventsStore } from "@/services/events";
import { toast } from "sonner";
import { databaseService } from "./DatabaseService";
import { UploadStatus } from "@/store/useBulkUploadStore";
import { WhisperTranscriptionResponse } from "@/services/WhisperService";
import { throttle } from "lodash";
import { errorHandler } from "./ErrorHandlingService";

export class BulkUploadProcessorService {
  private whisperService: any;
  private assignedUserId: string | null = null;
  private dispatchEvent: (type: string, data?: any) => void;
  private processingFile = false;
  private maxFileSize = 25 * 1024 * 1024; // 25MB limit to prevent memory issues
  private supportedFormats = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/m4a', 'audio/mp4', 'audio/ogg', 'audio/webm'];
  
  constructor(whisperService: any) {
    this.whisperService = whisperService;
    
    // Throttled event dispatch to reduce UI jitter
    this.dispatchEvent = throttle(useEventsStore.getState().dispatchEvent, 300);
  }
  
  // Set the user ID to assign to the uploaded files
  public setAssignedUserId(userId: string | null) {
    console.log('Setting assigned user ID:', userId);
    this.assignedUserId = userId;
  }
  
  // Process a single file with improved error handling and validation
  public async processFile(
    file: File, 
    updateStatus: (status: UploadStatus, progress: number, result?: string, error?: string, transcriptId?: string) => void
  ): Promise<string | null> {
    console.log(`BulkUploadProcessor: Starting to process file ${file.name}`);
    
    // If another file is currently being processed, don't allow concurrent processing
    if (this.processingFile) {
      console.error('Another file is already being processed');
      updateStatus('error', 0, undefined, "Another file is currently being processed");
      return null;
    }
    
    // Validate file type
    if (!this.isSupportedFormat(file.type)) {
      const errorMsg = `Unsupported file format: ${file.type}. Please upload audio files only.`;
      console.error(errorMsg);
      errorHandler.handleError(new Error(errorMsg), 'BulkUploadProcessorService.processFile.unsupportedFormat');
      updateStatus('error', 0, undefined, errorMsg);
      return null;
    }
    
    // Check file size
    if (file.size > this.maxFileSize) {
      const errorMsg = `File too large: ${Math.round(file.size/1024/1024)}MB. Maximum size is ${Math.round(this.maxFileSize/1024/1024)}MB`;
      console.error(errorMsg);
      errorHandler.handleError(new Error(errorMsg), 'BulkUploadProcessorService.processFile.fileTooLarge');
      updateStatus('error', 0, undefined, errorMsg);
      return null;
    }
    
    // Acquire processing lock
    this.processingFile = true;
    console.log(`Starting to process file: ${file.name} (${Math.round(file.size/1024)}KB)`);
    
    try {
      // Update status to processing and track start time
      updateStatus('processing', 10);
      const startTime = performance.now();
      
      this.dispatchEvent('bulk-upload-started', { 
        filename: file.name, 
        size: file.size
      });
      
      // Phase 1: Transcribe the audio file
      console.log('Transcribing audio...');
      updateStatus('processing', 20, 'Transcribing audio...', undefined);
      
      // Check if we're using local Whisper or API
      const useLocalWhisper = this.whisperService.getUseLocalWhisper();
      console.log(`Using ${useLocalWhisper ? 'local' : 'API'} Whisper for transcription`);

      // Check for API key if using OpenAI API
      if (!useLocalWhisper) {
        const apiKey = this.whisperService.getOpenAIKey();
        if (!apiKey) {
          const error = new Error("OpenAI API key is missing. Please add it in the Settings page.");
          errorHandler.handleError(error, 'BulkUploadProcessorService.processFile.missingApiKey');
          updateStatus('error', 0, undefined, error.message);
          this.processingFile = false;
          return null;
        }
      }

      // Real transcription
      console.log('Calling whisperService.transcribeAudio with file:', file.name);
      const result = await this.whisperService.transcribeAudio(file);
      console.log('Transcription completed successfully:', result ? 'Has result' : 'No result');

      if (!result || !result.text) {
        const errorMsg = "Transcription failed. Please check your audio file or API key.";
        errorHandler.handleError(new Error(errorMsg), 'BulkUploadProcessorService.processFile.noTranscriptionResult');
        updateStatus('error', 0, undefined, errorMsg);
        this.processingFile = false;
        return null;
      }
      
      // Phase 2: Process transcription
      console.log('Processing transcription result:', result);
      updateStatus('processing', 50, result.text, undefined);
      
      // Process and save transcript data
      console.log('Saving transcript to database');
      await this.processTranscriptData(result, file, updateStatus);
      
      // Calculate processing time
      const processingTime = Math.round((performance.now() - startTime) / 1000);
      console.log(`Completed processing ${file.name} in ${processingTime} seconds`);
      
      return null;
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      errorHandler.handleError(error, 'BulkUploadProcessorService.processFile');
      updateStatus('error', 100, undefined, error instanceof Error ? error.message : "Processing failed");
      return null;
    } finally {
      // Always release the processing lock when done
      this.processingFile = false;
    }
  }
  
  // Check if file format is supported
  private isSupportedFormat(mimeType: string): boolean {
    return this.supportedFormats.includes(mimeType);
  }
  
  // Process transcript data and save to database
  private async processTranscriptData(
    result: WhisperTranscriptionResponse, 
    file: File,
    updateStatus: (status: UploadStatus, progress: number, result?: string, error?: string, transcriptId?: string) => void
  ): Promise<void> {
    try {
      // Update status to indicate database save
      updateStatus('processing', 70, result.text, undefined, undefined);
      
      console.log('Saving transcript to database with file:', file.name);
      console.log('Transcript text length:', result.text?.length || 0);
      console.log('Assigned user ID:', this.assignedUserId);
      
      // Save to database
      const { id, error } = await databaseService.saveTranscriptToDatabase(
        result, 
        file, 
        this.assignedUserId,
        this.whisperService.getNumSpeakers()
      );
      
      if (error) {
        const errorMsg = `Failed to save transcript: ${error instanceof Error ? error.message : String(error)}`;
        errorHandler.handleError(new Error(errorMsg), 'BulkUploadProcessorService.processTranscriptData.saveError');
        throw new Error(errorMsg);
      }
      
      if (!id) {
        const errorMsg = "Failed to generate transcript ID";
        errorHandler.handleError(new Error(errorMsg), 'BulkUploadProcessorService.processTranscriptData.noId');
        throw new Error(errorMsg);
      }
      
      console.log('Successfully saved transcript with ID:', id);
      
      // Update status to indicate processing trends
      updateStatus('processing', 90, result.text, undefined, id);
      
      // Update trends data - use Promise.allSettled to ensure both operations run
      // even if one of them fails, and we capture any errors
      console.log('Updating keyword and sentiment trends');
      const [keywordResults, sentimentResults] = await Promise.allSettled([
        databaseService.updateKeywordTrends(result),
        databaseService.updateSentimentTrends(result, this.assignedUserId)
      ]);

      // Log any errors in the background processes
      if (keywordResults.status === 'rejected') {
        console.error("Error updating keyword trends:", keywordResults.reason);
        errorHandler.handleError(keywordResults.reason, 'BulkUploadProcessorService.updateKeywordTrends');
      }

      if (sentimentResults.status === 'rejected') {
        console.error("Error updating sentiment trends:", sentimentResults.reason);
        errorHandler.handleError(sentimentResults.reason, 'BulkUploadProcessorService.updateSentimentTrends');
      }
      
      // Update status to complete
      updateStatus('complete', 100, result.text, undefined, id);
      
      // Force a refresh of the local storage transcriptions
      this.whisperService.forceRefreshTranscriptions();
      
      // Dispatch event to notify components
      this.dispatchEvent('transcript-created', { 
        id,
        filename: file.name,
        duration: await databaseService.calculateAudioDuration(file)
      });
      
      console.log('Transcript processing completed successfully');
    } catch (error) {
      console.error('Error processing transcript data:', error);
      errorHandler.handleError(error, 'BulkUploadProcessorService.processTranscriptData');
      throw error;
    }
  }
}
