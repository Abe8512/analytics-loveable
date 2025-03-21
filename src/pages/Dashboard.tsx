
import React, { useState, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PerformanceMetrics from '../components/Dashboard/PerformanceMetrics';
import CallsOverview from '../components/Dashboard/CallsOverview';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import CallAnalysisSection from '../components/Dashboard/CallAnalysisSection';
import AIInsights from '../components/Dashboard/AIInsights';
import { toast } from 'sonner';

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
      <div className="space-y-6">
        <DashboardHeader 
          onBulkUploadOpen={handleBulkUploadOpen} 
          refreshData={refreshData} 
          isDashboardScreen={true} 
        />
        <PerformanceMetrics />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CallAnalysisSection isLoading={isLoading} />
          <div className="space-y-6">
            <AIInsights />
            <CallsOverview />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
