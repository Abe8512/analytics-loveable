
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
import { useCallTranscripts } from '@/services/CallTranscriptService';

const mockTeamMetrics = {
  totalCalls: 127,
  avgSentiment: 0.72,
  avgTalkRatio: { agent: 55, customer: 45 },
  topKeywords: ["pricing", "features", "support"]
};

const mockOutcomeStats = [
  { name: 'Successful', value: 35, color: '#22c55e' },
  { name: 'Follow-up', value: 25, color: '#3b82f6' },
  { name: 'No sale', value: 20, color: '#f97316' },
  { name: 'Objections', value: 15, color: '#ef4444' },
  { name: 'Other', value: 5, color: '#a855f7' }
];

const mockCallDistribution = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 19 },
  { name: 'Wed', value: 13 },
  { name: 'Thu', value: 17 },
  { name: 'Fri', value: 21 },
  { name: 'Sat', value: 7 },
  { name: 'Sun', value: 2 }
];

const CallActivity = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const bulkUploadService = useBulkUploadService();
  const { transcripts } = useCallTranscripts();
  
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
            <TeamPerformanceOverview 
              teamMetrics={mockTeamMetrics}
              teamMetricsLoading={false}
              callsLength={transcripts?.length || 0}
            />
            <RepPerformanceCards />
            <CallOutcomeStats 
              outcomeStats={mockOutcomeStats}
              callDistributionData={mockCallDistribution}
            />
            <SentimentAnalysisTable />
            <CallActivityTable />
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CallActivity;
