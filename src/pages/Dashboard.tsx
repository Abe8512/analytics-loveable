
import React, { useState, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import { toast } from 'sonner';
import BulkUploadModal from '@/components/BulkUpload/BulkUploadModal';
import { useBulkUploadService } from '@/services/BulkUploadService';
import { getOpenAIKey } from '@/services/WhisperService';
import { useCallTranscripts } from '@/services/CallTranscriptService';
import { useToast } from '@/hooks/use-toast';
import { fixCallSentiments } from '@/utils/fixCallSentiments';
import DashboardMetricsSection from '@/components/Dashboard/DashboardMetricsSection';
import DashboardContentSection from '@/components/Dashboard/DashboardContentSection';
import { useMetrics } from '@/contexts/MetricsContext';
import { clearMetricsCache } from '@/hooks/useMetricsFetcher';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  
  const bulkUploadService = useBulkUploadService();
  const { transcripts, fetchTranscripts } = useCallTranscripts();
  const { toast: toastNotification } = useToast();
  const { refresh: refreshMetrics } = useMetrics();
  
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
              // Clear metrics cache and refresh metrics data
              clearMetricsCache();
              refreshMetrics(true);
              
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
  }, [bulkUploadService, fetchTranscripts, refreshMetrics]);
  
  const refreshData = useCallback(() => {
    setIsLoading(true);
    
    // Clear metrics cache to ensure fresh data
    clearMetricsCache();
    
    // Use the bulk upload service to refresh transcripts
    bulkUploadService.refreshTranscripts({ force: true })
      .then(() => {
        fetchTranscripts({ force: true })
          .then(() => {
            // Refresh metrics with force flag to bypass cache
            refreshMetrics(true);
            setIsLoading(false);
            toast('Dashboard data refreshed');
          });
      })
      .catch(() => {
        setIsLoading(false);
        toast.error('Failed to refresh data');
      });
  }, [bulkUploadService, fetchTranscripts, refreshMetrics]);
  
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
        
        {/* Metrics Section - now uses the central metrics context */}
        <DashboardMetricsSection />
        
        {/* Content Section */}
        <DashboardContentSection isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
