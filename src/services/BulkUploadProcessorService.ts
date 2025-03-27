import { v4 as uuidv4 } from 'uuid';
import { DatabaseService, databaseService } from './DatabaseService';
import { EventsService, EventTypes } from './EventsService';
import { getSentimentScore } from './AIService';

interface ProcessingResult {
  success: boolean;
  message: string;
  id?: string;
  filename?: string;
  duration?: number;
  keywords?: string[];
  sentiment?: string;
  sentimentScore?: number;
}

/**
 * Service for processing bulk uploads of audio files and transcripts
 */
export class BulkUploadProcessorService {
  /**
   * Process a single file
   */
  public async processFile(file: File, teamMember: string): Promise<ProcessingResult> {
    return await processAudioFile(file, teamMember);
  }
  
  /**
   * Process multiple files
   */
  public async processFiles(files: File[], teamMember: string): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = [];
    
    for (const file of files) {
      try {
        const result = await processAudioFile(file, teamMember);
        results.push(result);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        results.push({
          success: false,
          message: `Error processing file ${file.name}: ${error.message || 'Unknown error'}`
        });
      }
    }
    
    return results;
  }
}

export const bulkUploadProcessorService = new BulkUploadProcessorService();

const saveTranscriptData = async (transcript: string, metadata: any, userId: string, filename: string) => {
  try {
    // Extract sentiment and keywords from transcript
    const { sentiment, sentimentScore, keywords, keyPhrases } = await getSentimentScore(transcript);
    
    // Create transcript data
    const transcriptData = {
      text: transcript,
      user_id: userId,
      filename: filename,
      duration: metadata.duration || 0,
      sentiment: sentiment, 
      call_score: Math.round(sentimentScore * 100),
      keywords: keywords,
      key_phrases: keyPhrases,
      metadata: {
        ...metadata,
        processed_at: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    // Use the updated DatabaseService to save transcript directly
    const result = await databaseService.saveCallTranscript(transcriptData);
    
    // Update keyword trends - now handled by database triggers
    for (const keyword of keywords) {
      await databaseService.incrementKeywordCount(keyword);
    }
    
    return result;
  } catch (error) {
    console.error('Error saving transcript:', error);
    throw error;
  }
};

const processAudioFile = async (file: File, teamMember: string): Promise<ProcessingResult> => {
  try {
    // Generate a unique ID for the file
    const fileId = uuidv4();
    
    // Extract file name and extension
    const fileName = file.name;
    const fileExtension = fileName.split('.').pop() || 'unknown';
    
    // Read the file content as text
    const fileContent = await file.text();
    
    // Extract audio file duration
    const audioDuration = await getAudioDuration(file);
    
    // Save the transcript data to the database
    const transcriptResult = await saveTranscriptData(
      fileContent,
      {
        fileId: fileId,
        fileName: fileName,
        fileExtension: fileExtension,
        fileSize: file.size,
        duration: audioDuration
      },
      teamMember,
      fileName
    );
    
    // Dispatch event to update UI
    EventsService.dispatch(EventTypes.TRANSCRIPT_SAVED, transcriptResult);
    
    // Extract sentiment and keywords from transcript
    const { sentiment, sentimentScore, keywords, keyPhrases } = await getSentimentScore(fileContent);
    
    return {
      success: true,
      message: "File processed successfully",
      id: transcriptResult ? transcriptResult.id : undefined,
      filename: fileName,
      duration: audioDuration,
      keywords: keywords,
      sentiment: sentiment,
      sentimentScore: sentimentScore
    };
  } catch (error) {
    console.error("Error processing audio file:", error);
    return {
      success: false,
      message: `File processing failed: ${error.message || 'Unknown error'}`,
    };
  }
};

// Add a helper function to get audio duration
const getAudioDuration = async (file: File): Promise<number> => {
  return new Promise((resolve) => {
    try {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        URL.revokeObjectURL(audio.src);
        resolve(Math.round(duration));
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audio.src);
        console.warn('Could not determine audio duration');
        resolve(0);
      });
    } catch (e) {
      console.warn('Error getting audio duration:', e);
      resolve(0);
    }
  });
};
