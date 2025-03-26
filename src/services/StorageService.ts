
import { supabase } from "@/integrations/supabase/client";
import { errorHandler } from './ErrorHandlingService';
import { v4 as uuidv4 } from 'uuid';

export class StorageService {
  private readonly AUDIO_BUCKET = 'transcripts';
  
  /**
   * Upload an audio file to the transcripts bucket
   */
  async uploadAudioFile(file: File, userId: string | null): Promise<{
    path: string;
    error: Error | null;
  }> {
    try {
      // Create a unique path for the file
      const timestamp = new Date().getTime();
      const fileExt = file.name.split('.').pop();
      const filePath = `${userId || 'anonymous'}/${timestamp}_${uuidv4()}.${fileExt}`;
      
      console.log(`Uploading audio file to ${this.AUDIO_BUCKET}/${filePath}`);
      
      // Upload the file
      const { data, error } = await supabase
        .storage
        .from(this.AUDIO_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Error uploading audio file:', error);
        errorHandler.handleError(error, 'StorageService.uploadAudioFile');
        return { path: '', error };
      }
      
      console.log('Successfully uploaded audio file:', data?.path);
      return { path: data?.path || '', error: null };
    } catch (error) {
      console.error('Exception uploading audio file:', error);
      errorHandler.handleError(error, 'StorageService.uploadAudioFile');
      return { path: '', error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
  
  /**
   * Get a public URL for an uploaded audio file
   */
  getPublicUrl(filePath: string): string {
    try {
      const { data } = supabase
        .storage
        .from(this.AUDIO_BUCKET)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting public URL:', error);
      errorHandler.handleError(error, 'StorageService.getPublicUrl');
      return '';
    }
  }
  
  /**
   * Get signed URL with temporary access for an audio file
   */
  async getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
    try {
      const { data, error } = await supabase
        .storage
        .from(this.AUDIO_BUCKET)
        .createSignedUrl(filePath, expiresIn);
      
      if (error) {
        console.error('Error creating signed URL:', error);
        errorHandler.handleError(error, 'StorageService.getSignedUrl');
        return '';
      }
      
      return data?.signedUrl || '';
    } catch (error) {
      console.error('Exception creating signed URL:', error);
      errorHandler.handleError(error, 'StorageService.getSignedUrl');
      return '';
    }
  }
  
  /**
   * Delete an audio file from storage
   */
  async deleteAudioFile(filePath: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .storage
        .from(this.AUDIO_BUCKET)
        .remove([filePath]);
      
      if (error) {
        console.error('Error deleting audio file:', error);
        errorHandler.handleError(error, 'StorageService.deleteAudioFile');
        return false;
      }
      
      console.log('Successfully deleted audio file:', filePath);
      return true;
    } catch (error) {
      console.error('Exception deleting audio file:', error);
      errorHandler.handleError(error, 'StorageService.deleteAudioFile');
      return false;
    }
  }
}

export const storageService = new StorageService();
