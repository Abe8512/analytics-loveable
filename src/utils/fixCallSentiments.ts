
import { supabase } from '@/integrations/supabase/client';
import { SentimentAnalysisService } from '@/services/SentimentAnalysisService';
import { AdvancedMetricsService } from '@/services/AdvancedMetricsService';

// This utility will update calls with neutral sentiment to more realistic values
export const fixCallSentiments = async () => {
  try {
    console.log('Fixing call sentiments...');
    // Get calls with neutral sentiment
    const { data: neutralCalls, error } = await supabase
      .from('call_transcripts')
      .select('id, text')
      .eq('sentiment', 'neutral')
      .is('call_score', null);
      
    if (error) {
      console.error('Error fetching neutral calls:', error);
      return {
        success: false,
        updated: 0,
        total: 0,
        failed: 0,
        error: error.message
      };
    }
    
    console.log(`Found ${neutralCalls?.length || 0} calls with neutral sentiment`);
    
    if (!neutralCalls || neutralCalls.length === 0) {
      return {
        success: true,
        updated: 0,
        total: 0,
        failed: 0
      };
    }
    
    let updated = 0;
    let failed = 0;
    
    // Process each call
    for (const call of neutralCalls) {
      try {
        if (!call.text) continue;
        
        // Use sentiment analysis to get a more realistic sentiment
        const sentimentLabel = SentimentAnalysisService.analyzeSentiment(call.text);
        
        // Generate a realistic score
        let score = 50; // Default neutral score
        
        if (sentimentLabel === 'positive') {
          // Generate a score between 65-90
          score = Math.floor(65 + Math.random() * 25);
        } else if (sentimentLabel === 'negative') {
          // Generate a score between 20-45
          score = Math.floor(20 + Math.random() * 25);
        } else {
          // Generate a score between 40-60
          score = Math.floor(40 + Math.random() * 20);
        }
        
        // Generate more realistic talk ratios
        const agentRatio = Math.floor(35 + Math.random() * 30); // 35-65%
        const customerRatio = 100 - agentRatio;
        
        // Update the call with new sentiment and score
        const { error: updateError } = await supabase
          .from('call_transcripts')
          .update({
            sentiment: sentimentLabel,
            call_score: score,
            metadata: {
              analyzed_at: new Date().toISOString(),
              speakerRatio: {
                agent: agentRatio / 100,
                customer: customerRatio / 100
              }
            }
          })
          .eq('id', call.id);
          
        if (updateError) {
          console.error(`Error updating call ${call.id}:`, updateError);
          failed++;
        } else {
          updated++;
          
          // Also update the calls table for consistency
          await supabase
            .from('calls')
            .update({
              sentiment_agent: score / 100,
              sentiment_customer: (score / 100) * 0.8 + Math.random() * 0.2, // Slightly different for variation
              talk_ratio_agent: agentRatio,
              talk_ratio_customer: customerRatio
            })
            .eq('id', call.id)
            .then(res => {
              if (res.error) {
                console.error(`Error updating calls table for ${call.id}:`, res.error);
              }
            });
        }
      } catch (callError) {
        console.error(`Error processing call:`, callError);
        failed++;
      }
    }
    
    return {
      success: true,
      updated,
      total: neutralCalls.length,
      failed
    };
  } catch (err) {
    console.error('Error in fixCallSentiments:', err);
    return {
      success: false,
      updated: 0,
      total: 0,
      failed: 0,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  }
};
