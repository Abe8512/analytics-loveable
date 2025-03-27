
import React, { useState, useCallback, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PerformanceMetrics from '../components/Dashboard/PerformanceMetrics';
import CallsOverview from '../components/Dashboard/CallsOverview';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import CallAnalysisSection from '../components/Dashboard/CallAnalysisSection';
import AIInsights from '../components/Dashboard/AIInsights';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import BulkUploadModal from '@/components/BulkUpload/BulkUploadModal';
import { useBulkUploadService } from '@/services/BulkUploadService';
import { getOpenAIKey } from '@/services/WhisperService';
import { Button } from '@/components/ui/button';
import { LineChart, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallTranscripts } from '@/services/CallTranscriptService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { fixCallSentiments } from '@/utils/fixCallSentiments';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalCalls: 0,
    avgDuration: 0,
    positiveSentiment: 0,
    callScore: 0,
    conversionRate: 0
  });
  
  const bulkUploadService = useBulkUploadService();
  const { transcripts, fetchTranscripts } = useCallTranscripts();
  const { toast: toastNotification } = useToast();
  
  // Fetch dashboard statistics
  useEffect(() => {
    const calculateDashboardStats = async () => {
      try {
        if (transcripts && transcripts.length > 0) {
          // Calculate stats from actual transcripts
          const totalCalls = transcripts.length;
          
          const totalDuration = transcripts.reduce((sum, t) => sum + (t.duration || 0), 0);
          const avgDuration = totalCalls > 0 ? totalDuration / totalCalls : 0;
          
          const positiveCount = transcripts.filter(t => t.sentiment === 'positive').length;
          const positiveSentiment = totalCalls > 0 ? (positiveCount / totalCalls) * 100 : 0;
          
          const totalScore = transcripts.reduce((sum, t) => sum + (t.call_score || 0), 0);
          const callScore = totalCalls > 0 ? totalScore / totalCalls : 0;
          
          // Default for demo since we don't track conversions yet
          const conversionRate = 28;
          
          setDashboardStats({
            totalCalls,
            avgDuration,
            positiveSentiment,
            callScore,
            conversionRate
          });
          
          // Check if most calls have neutral sentiment and need fixing
          const neutralCount = transcripts.filter(t => t.sentiment === 'neutral' || !t.sentiment).length;
          const neutralPercentage = neutralCount / totalCalls;
          
          // If more than 70% of calls are neutral, show a notification to fix sentiments
          if (neutralPercentage > 0.7 && !isUpdating) {
            toast("Neutral sentiment detected", {
              description: "Most calls have neutral sentiment. Consider fixing the sentiments for better analysis.",
              action: {
                label: "Fix Now",
                onClick: handleFixSentiments
              }
            });
          }
          
          // Try to update call_metrics_summary
          try {
            // Calculate additional metrics for the summary
            const negativeCount = transcripts.filter(t => t.sentiment === 'negative').length;
            const neutralCount = transcripts.filter(t => t.sentiment === 'neutral' || !t.sentiment).length;
            
            // Get agent and customer talk ratios from metadata
            let agentTalkRatio = 50;
            let customerTalkRatio = 50;
            
            const transcriptsWithMetadata = transcripts.filter(t => 
              t.metadata && t.metadata.speakerRatio && 
              t.metadata.speakerRatio.agent && 
              t.metadata.speakerRatio.customer
            );
            
            if (transcriptsWithMetadata.length > 0) {
              const totalAgentRatio = transcriptsWithMetadata.reduce(
                (sum, t) => sum + t.metadata.speakerRatio.agent, 0
              );
              const totalCustomerRatio = transcriptsWithMetadata.reduce(
                (sum, t) => sum + t.metadata.speakerRatio.customer, 0
              );
              
              agentTalkRatio = (totalAgentRatio / transcriptsWithMetadata.length) * 100;
              customerTalkRatio = (totalCustomerRatio / transcriptsWithMetadata.length) * 100;
            }
            
            // Extract top keywords from transcripts
            const keywordsMap = new Map();
            transcripts.forEach(t => {
              if (t.keywords && Array.isArray(t.keywords)) {
                t.keywords.forEach(keyword => {
                  keywordsMap.set(keyword, (keywordsMap.get(keyword) || 0) + 1);
                });
              }
            });
            
            // Get top 5 keywords
            const topKeywords = Array.from(keywordsMap.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([keyword]) => keyword);
            
            // Update the metrics summary
            const reportDate = new Date().toISOString().split('T')[0];
            
            const { data: existingData, error: checkError } = await supabase
              .from('call_metrics_summary')
              .select('id')
              .eq('report_date', reportDate)
              .limit(1);
              
            if (checkError) {
              console.error('Error checking for existing metrics:', checkError);
            }
            
            // Either update or insert based on whether we have an existing entry
            if (existingData && existingData.length > 0) {
              const { error: updateError } = await supabase
                .from('call_metrics_summary')
                .update({
                  total_calls: totalCalls,
                  avg_duration: avgDuration,
                  positive_sentiment_count: positiveCount,
                  negative_sentiment_count: negativeCount,
                  neutral_sentiment_count: neutralCount,
                  performance_score: Math.round(callScore),
                  conversion_rate: conversionRate / 100,
                  total_duration: totalDuration,
                  avg_sentiment: callScore / 100,
                  agent_talk_ratio: agentTalkRatio,
                  customer_talk_ratio: customerTalkRatio,
                  top_keywords: topKeywords,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingData[0].id);
                
              if (updateError) {
                console.error('Error updating metrics summary:', updateError);
              }
            } else {
              const { error: insertError } = await supabase
                .from('call_metrics_summary')
                .insert({
                  report_date: reportDate,
                  total_calls: totalCalls,
                  avg_duration: avgDuration,
                  positive_sentiment_count: positiveCount,
                  negative_sentiment_count: negativeCount,
                  neutral_sentiment_count: neutralCount,
                  performance_score: Math.round(callScore),
                  conversion_rate: conversionRate / 100,
                  total_duration: totalDuration,
                  avg_sentiment: callScore / 100,
                  agent_talk_ratio: agentTalkRatio,
                  customer_talk_ratio: customerTalkRatio,
                  top_keywords: topKeywords
                });
                
              if (insertError) {
                console.error('Error inserting metrics summary:', insertError);
              }
            }
          } catch (err) {
            console.error('Error in metrics upsert:', err);
          }
        }
      } catch (error) {
        console.error('Error calculating dashboard stats:', error);
      }
    };
    
    calculateDashboardStats();
  }, [transcripts]);
  
  const handleFixSentiments = async () => {
    setIsUpdating(true);
    
    try {
      const result = await fixCallSentiments();
      
      if (result.success) {
        toastNotification({
          title: "Sentiment Update Complete",
          description: `Updated ${result.updated} of ${result.total} calls`
        });
        
        // Refresh data after updating
        refreshData();
      } else {
        toastNotification({
          title: "Update Failed",
          description: result.error || "Could not update sentiments",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error fixing sentiments:', err);
      toastNotification({
        title: "Error",
        description: "Failed to update call sentiments",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleBulkUploadOpen = useCallback(() => {
    // Check if OpenAI API key is set when opening bulk upload modal
    const apiKey = getOpenAIKey();
    if (!apiKey) {
      toast.warning("API Key Missing", {
        description: "Consider adding your OpenAI API key in Settings for better transcription results.",
        duration: 5000,
      });
    }
    
    setIsBulkUploadOpen(true);
  }, []);
  
  const handleBulkUploadClose = useCallback(() => {
    setIsBulkUploadOpen(false);
    
    // Refresh data after closing the modal if we have uploads
    if (bulkUploadService.files.length > 0) {
      setIsLoading(true);
      bulkUploadService.refreshTranscripts({ force: true })
        .then(() => {
          fetchTranscripts({ force: true })
            .then(() => {
              setIsLoading(false);
              if (bulkUploadService.files.some(f => f.status === 'complete')) {
                toast.success('Dashboard data refreshed with new transcripts');
              }
            });
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [bulkUploadService, fetchTranscripts]);
  
  const refreshData = useCallback(() => {
    setIsLoading(true);
    
    // Use the bulk upload service to refresh transcripts
    bulkUploadService.refreshTranscripts({ force: true })
      .then(() => {
        fetchTranscripts({ force: true })
          .then(() => {
            setIsLoading(false);
            toast('Dashboard data refreshed');
          });
      })
      .catch(() => {
        setIsLoading(false);
        toast.error('Failed to refresh data');
      });
  }, [bulkUploadService, fetchTranscripts]);
  
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <DashboardHeader 
          onBulkUploadOpen={handleBulkUploadOpen} 
          refreshData={refreshData} 
          isDashboardScreen={true} 
        />
        
        <BulkUploadModal 
          isOpen={isBulkUploadOpen} 
          onClose={handleBulkUploadClose} 
        />
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col space-y-2"
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Performance Overview</h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Link to="/performance-metrics">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  View Detailed Metrics
                </Button>
              </Link>
            </div>
          </div>
          
          <PerformanceMetrics 
            metricsData={dashboardStats}
            isLoading={isLoading}
          />
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CallAnalysisSection isLoading={isLoading} />
          </motion.div>
          
          <div className="lg:col-span-4 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <AIInsights />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <CallsOverview />
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
