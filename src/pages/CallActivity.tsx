import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import CallActivityTable from '../components/CallActivity/CallActivityTable';
import TeamPerformanceOverview from '../components/CallActivity/TeamPerformanceOverview';
import RepPerformanceCards from '../components/CallActivity/RepPerformanceCards';
import BulkUploadModal from '@/components/BulkUpload/BulkUploadModal';
import CallOutcomeStats from '@/components/CallActivity/CallOutcomeStats';
import { useBulkUploadService } from '@/hooks/useBulkUploadService';
import SentimentAnalysisTable from '@/components/CallActivity/SentimentAnalysisTable';

const CallActivity = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const bulkUploadService = useBulkUploadService();
  
  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleBulkUploadOpen = () => {
    setIsBulkUploadOpen(true);
  };
  
  const handleBulkUploadClose = () => {
    setIsBulkUploadOpen(false);
  };
  
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        <DashboardHeader 
          onBulkUploadOpen={handleBulkUploadOpen} 
          refreshData={() => {}} // Placeholder - add actual refresh logic
          isDashboardScreen={false}
          isRefreshing={isLoading}
        />
        
        <BulkUploadModal 
          isOpen={isBulkUploadOpen} 
          onClose={handleBulkUploadClose} 
        />
        
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : (
          <>
            <TeamPerformanceOverview />
            <RepPerformanceCards />
            <CallOutcomeStats />
            <SentimentAnalysisTable />
            <CallActivityTable />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CallActivity;
