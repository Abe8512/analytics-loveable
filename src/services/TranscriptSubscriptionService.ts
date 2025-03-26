
import { CallTranscript } from '@/types/call';
import { supabase } from "@/integrations/supabase/client";

export class TranscriptSubscriptionService {
  // Instead of trying to use a non-existent table, we'll use localStorage for now
  // This approach means we're just simulating the subscription functionality until
  // the proper database table is created
  
  private getSubscriptions(): Record<string, string[]> {
    const subscriptions = localStorage.getItem('transcript_subscriptions');
    return subscriptions ? JSON.parse(subscriptions) : {};
  }
  
  private saveSubscriptions(subscriptions: Record<string, string[]>): void {
    localStorage.setItem('transcript_subscriptions', JSON.stringify(subscriptions));
  }
  
  async subscribeToTranscripts(transcriptId: string, userId: string): Promise<void> {
    try {
      const subscriptions = this.getSubscriptions();
      
      if (!subscriptions[transcriptId]) {
        subscriptions[transcriptId] = [];
      }
      
      if (!subscriptions[transcriptId].includes(userId)) {
        subscriptions[transcriptId].push(userId);
        this.saveSubscriptions(subscriptions);
      }
      
      console.log('Successfully subscribed to transcript:', transcriptId);
    } catch (error: any) {
      console.error('Failed to subscribe to transcript:', error.message);
      throw new Error(`Subscription failed: ${error.message}`);
    }
  }
  
  async unsubscribeFromTranscripts(transcriptId: string, userId: string): Promise<void> {
    try {
      const subscriptions = this.getSubscriptions();
      
      if (subscriptions[transcriptId]) {
        subscriptions[transcriptId] = subscriptions[transcriptId].filter(id => id !== userId);
        this.saveSubscriptions(subscriptions);
      }
      
      console.log('Successfully unsubscribed from transcript:', transcriptId);
    } catch (error: any) {
      console.error('Failed to unsubscribe from transcript:', error.message);
      throw new Error(`Unsubscription failed: ${error.message}`);
    }
  }
  
  async getSubscribedUsers(transcriptId: string): Promise<string[]> {
    try {
      const subscriptions = this.getSubscriptions();
      return subscriptions[transcriptId] || [];
    } catch (error) {
      console.error('Failed to fetch subscribed users:', error);
      return [];
    }
  }
  
  async isUserSubscribed(transcriptId: string, userId: string): Promise<boolean> {
    try {
      const subscriptions = this.getSubscriptions();
      return subscriptions[transcriptId]?.includes(userId) || false;
    } catch (error) {
      console.error('Failed to check subscription:', error);
      return false;
    }
  }
}

export const transcriptSubscriptionService = new TranscriptSubscriptionService();
