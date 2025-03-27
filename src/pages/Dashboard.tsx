
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
import { LineChart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallTranscripts } from '@/services/CallTranscriptService';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
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
          
          // Hardcoded for demo since we don't track conversions yet
          const conversionRate = 28;
          
          setDashboardStats({
            totalCalls,
            avgDuration,
            positiveSentiment,
            callScore,
            conversionRate
          });
          
          // Try to update call_metrics_summary
          try {
            const { error } = await supabase
              .from('call_metrics_summary')
              .upsert({
                report_date: new Date().toISOString().split('T')[0],
                total_calls: totalCalls,
                avg_duration: avgDuration,
                positive_sentiment_count: positiveCount,
                performance_score: Math.round(callScore),
                conversion_rate: conversionRate / 100,
                total_duration: totalDuration
              });
              
            if (error) {
              console.error('Error updating metrics summary:', error);
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
      <div className="space-y-8 max-w-7xl mx-auto">
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
          className="flex justify-between items-center"
        >
          <PerformanceMetrics 
            metricsData={dashboardStats}
            isLoading={isLoading}
          />
          <Link to="/performance-metrics">
            <Button variant="outline" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              View Detailed Metrics
            </Button>
          </Link>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CallAnalysisSection isLoading={isLoading} />
          </motion.div>
          
          <div className="lg:col-span-5 space-y-8">
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
