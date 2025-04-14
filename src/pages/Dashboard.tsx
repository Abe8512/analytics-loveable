
import React, { useState, useCallback, useEffect } from 'react';
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
  
  // Add effect to listen for bulk upload completion events
  useEffect(() => {
    const handleBulkUploadCompleted = () => {
      console.log('Dashboard detected bulk-upload-completed event');
      refreshData();
    };
    
    window.addEventListener('bulk-upload-completed', handleBulkUploadCompleted);
    
    return () => {
      window.removeEventListener('bulk-upload-completed', handleBulkUploadCompleted);
    };
  }, []);
  
  const handleFixSentiments = async () => {
    setIsUpdating(true);
    
    try {
      toast.loading("Updating call sentiments...");
      const result = await fixCallSentiments();
      
      if (result.success) {
        toast.success(`Updated ${result.updated} of ${result.total} calls`);
        toastNotification({
          title: "Sentiment Update Complete",
          description: `Updated ${result.updated} of ${result.total} calls`
        });
        
        // Refresh data after updating
        refreshData();
      } else {
        toast.error("Could not update sentiments");
        toastNotification({
          title: "Update Failed",
          description: result.error || "Could not update sentiments",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error fixing sentiments:', err);
      toast.error("Failed to update call sentiments");
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
      toast.loading("Refreshing data with new transcripts...");
      
      bulkUploadService.refreshTranscripts({ force: true })
        .then(() => {
          fetchTranscripts({ force: true })
            .then(() => {
              // Clear metrics cache and refresh metrics data
              clearMetricsCache();
              refreshMetrics();
              
              setIsLoading(false);
              if (bulkUploadService.files.some(f => f.status === 'complete')) {
                toast.success('Dashboard data refreshed with new transcripts');
              }
            });
        })
        .catch((err) => {
          console.error("Error refreshing data:", err);
          toast.error("Failed to refresh data");
          setIsLoading(false);
        });
    }
  }, [bulkUploadService, fetchTranscripts, refreshMetrics]);
  
  const refreshData = useCallback(() => {
    setIsLoading(true);
    toast.loading("Refreshing dashboard data...");
    
    console.log("Dashboard - manually refreshing all data");
    
    // Clear metrics cache to ensure fresh data
    clearMetricsCache();
    
    // Use the bulk upload service to refresh transcripts
    bulkUploadService.refreshTranscripts({ force: true })
      .then(() => {
        fetchTranscripts({ force: true })
          .then(() => {
            // Refresh metrics with force flag to bypass cache
            refreshMetrics();
            setIsLoading(false);
            toast.success('Dashboard data refreshed');
          });
      })
      .catch((err) => {
        console.error("Error refreshing data:", err);
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
          isRefreshing={isLoading}
        />
        
        <BulkUploadModal 
          isOpen={isBulkUploadOpen} 
          onClose={handleBulkUploadClose} 
        />
        
        {/* Metrics Section - uses the central metrics context */}
        <DashboardMetricsSection isLoading={isLoading} />
        
        {/* Content Section */}
        <DashboardContentSection isLoading={isLoading} />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
