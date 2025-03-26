
import React, { useState, useCallback } from 'react';
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

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const bulkUploadService = useBulkUploadService();
  
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
          setIsLoading(false);
          if (bulkUploadService.files.some(f => f.status === 'complete')) {
            toast.success('Dashboard data refreshed with new transcripts');
          }
        })
        .catch(() => {
          setIsLoading(false);
        });
    }
  }, [bulkUploadService]);
  
  const refreshData = useCallback(() => {
    setIsLoading(true);
    
    // Use the bulk upload service to refresh transcripts
    bulkUploadService.refreshTranscripts({ force: true })
      .then(() => {
        setIsLoading(false);
        toast('Dashboard data refreshed');
      })
      .catch(() => {
        setIsLoading(false);
        toast.error('Failed to refresh data');
      });
  }, [bulkUploadService]);
  
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
        >
          <PerformanceMetrics />
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
