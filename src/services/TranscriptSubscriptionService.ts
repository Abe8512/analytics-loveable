// Update import to use the correct path
import { CallTranscript } from '@/types/call';
import { supabase } from "@/integrations/supabase/client";

export class TranscriptSubscriptionService {
  async subscribeToTranscripts(transcriptId: string, userId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('transcript_subscriptions')
        .insert([
          { transcript_id: transcriptId, user_id: userId }
        ]);
      
      if (error) {
        console.error('Error subscribing to transcript:', error);
        throw new Error(`Could not subscribe to transcript: ${error.message}`);
      }
      
      console.log('Successfully subscribed to transcript:', transcriptId);
    } catch (error: any) {
      console.error('Failed to subscribe to transcript:', error.message);
      throw new Error(`Subscription failed: ${error.message}`);
    }
  }
  
  async unsubscribeFromTranscripts(transcriptId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('transcript_subscriptions')
        .delete()
        .match({ transcript_id: transcriptId, user_id: userId });
      
      if (error) {
        console.error('Error unsubscribing from transcript:', error);
        throw new Error(`Could not unsubscribe from transcript: ${error.message}`);
      }
      
      console.log('Successfully unsubscribed from transcript:', transcriptId);
    } catch (error: any) {
      console.error('Failed to unsubscribe from transcript:', error.message);
      throw new Error(`Unsubscription failed: ${error.message}`);
    }
  }
  
  async getSubscribedUsers(transcriptId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('transcript_subscriptions')
        .select('user_id')
        .eq('transcript_id', transcriptId);
      
      if (error) {
        console.error('Error fetching subscribed users:', error);
        return [];
      }
      
      return data.map(item => item.user_id);
    } catch (error) {
      console.error('Failed to fetch subscribed users:', error);
      return [];
    }
  }
  
  async isUserSubscribed(transcriptId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('transcript_subscriptions')
        .select('*')
        .match({ transcript_id: transcriptId, user_id: userId });
      
      if (error) {
        console.error('Error checking subscription:', error);
        return false;
      }
      
      return data !== null && data.length > 0;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return false;
    }
  }
}

export const transcriptSubscriptionService = new TranscriptSubscriptionService();
