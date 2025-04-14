
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { BulkUploadFilter } from '@/types/bulkUpload';

/**
 * BulkUploadService handles the uploading and processing of batch call transcripts
 */
export class BulkUploadService {
  /**
   * Uploads a file to the storage bucket
   * @param file The file to upload
   * @returns The path to the file in the storage bucket
   */
  static async uploadFile(file: File): Promise<string> {
    const filename = `${uuidv4()}-${file.name}`;
    const { error } = await supabase.storage
      .from('call-recordings')
      .upload(filename, file);
    
    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
    
    return filename;
  }
  
  /**
   * Gets a list of transcriptions from the database
   * @param filters Optional filters for the query
   * @returns Array of transcriptions
   */
  static async getTranscriptions(filters?: BulkUploadFilter) {
    try {
      let query = supabase
        .from('call_transcripts')
        .select('*');
      
      // Apply filters
      if (filters) {
        // Apply limit and offset if provided
        if (filters.limit) {
          query = query.limit(filters.limit);
        }
        
        if (filters.offset) {
          query = query.range(
            filters.offset, 
            filters.offset + (filters.limit || 10) - 1
          );
        }
        
        // Apply sorting
        if (filters.sortBy) {
          const order = filters.sortDirection || 'desc';
          query = query.order(filters.sortBy, { ascending: order === 'asc' });
        } else {
          // Default sort by created_at
          query = query.order('created_at', { ascending: false });
        }
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching transcriptions:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTranscriptions:', error);
      throw error;
    }
  }
  
  /**
   * Processes a file for transcription
   * @param file The file to process
   * @param filters Optional processing filters
   */
  static async processFile(file: File, filters?: BulkUploadFilter): Promise<void> {
    try {
      // Upload the file to storage
      const filePath = await this.uploadFile(file);
      
      // Call the transcription service
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { 
          filePath,
          force: filters?.force || false
        }
      });
      
      if (error) {
        console.error('Error invoking transcribe function:', error);
        throw error;
      }
      
      console.log('Transcription response:', data);
      
      return data;
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }
}
