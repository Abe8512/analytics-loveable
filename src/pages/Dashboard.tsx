
import React, { useState, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PerformanceMetrics from '../components/Dashboard/PerformanceMetrics';
import CallsOverview from '../components/Dashboard/CallsOverview';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import CallAnalysisSection from '../components/Dashboard/CallAnalysisSection';
import AIInsights from '../components/Dashboard/AIInsights';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  
  const handleBulkUploadOpen = useCallback(() => {
    setIsBulkUploadOpen(true);
  }, []);
  
  const refreshData = useCallback(() => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
      toast('Dashboard data refreshed');
    }, 1000);
  }, []);
  
  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-7xl mx-auto">
        <DashboardHeader 
          onBulkUploadOpen={handleBulkUploadOpen} 
          refreshData={refreshData} 
          isDashboardScreen={true} 
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
