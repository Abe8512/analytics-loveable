
import React, { useCallback, useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import CallsOverview from "../components/Dashboard/CallsOverview";
import AIInsights from "../components/Dashboard/AIInsights";
import LiveMetricsDisplay from "../components/CallAnalysis/LiveMetricsDisplay";
import PastCallsList from "../components/CallAnalysis/PastCallsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallMetricsStore } from "@/store/useCallMetricsStore";
import KeywordTrendsChart from "../components/CallAnalysis/KeywordTrendsChart";
import { SentimentTrendsChart } from "../components/CallAnalysis/SentimentTrendsChart";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { useCallTranscripts } from "@/services/CallTranscriptService";
import ContentLoader from "@/components/ui/ContentLoader";
import { useEventListener } from "@/services/EventsService";
import { animationUtils } from "@/utils/animationUtils";
import TeamPerformanceOverview from "@/components/CallActivity/TeamPerformanceOverview";
import { useRealTimeTeamMetrics } from "@/services/RealTimeMetricsService";
import { generateMockTeamMetrics, USE_MOCK_DATA } from "@/services/MockDataService";
import BulkUploadModal from "../components/BulkUpload/BulkUploadModal";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import AdvancedSalesMetrics from "@/components/Dashboard/AdvancedSalesMetrics";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import CallAnalysisSection from "@/components/Dashboard/CallAnalysisSection";
import { motion } from "framer-motion";
import { Brain, Headphones, Mic, BarChart2, Sparkles } from "lucide-react";
import GlowingCard from "@/components/ui/GlowingCard";

const Index = () => {
  const { isDark } = useTheme();
  const { filters, updateDateRange } = useSharedFilters();
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [showLiveMetrics, setShowLiveMetrics] = useState(false);
  const { startRecording, stopRecording, isRecording, saveSentimentTrend } = useCallMetricsStore();
  
  const { 
    fetchTranscripts,
    transcripts,
    loading: transcriptsLoading 
  } = useCallTranscripts();
  
  const [teamMetrics, teamMetricsLoading] = useRealTimeTeamMetrics(filters);
  
  const throttledFetchTranscripts = useCallback(
    animationUtils.throttle((options?: any) => {
      fetchTranscripts({
        dateRange: filters.dateRange,
        ...options
      });
    }, 1000),
    [fetchTranscripts, filters.dateRange]
  );
  
  useEffect(() => {
    throttledFetchTranscripts();
    
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [filters.dateRange, isRecording, stopRecording, throttledFetchTranscripts]);
  
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        saveSentimentTrend();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [isRecording, saveSentimentTrend]);
  
  const handleTranscriptCreated = useCallback(() => {
    console.log('New transcript created, refreshing data...');
    throttledFetchTranscripts();
  }, [throttledFetchTranscripts]);
  
  const handleBulkUploadCompleted = useCallback(() => {
    console.log('Bulk upload completed, refreshing data...');
    throttledFetchTranscripts();
  }, [throttledFetchTranscripts]);
  
  useEventListener('transcript-created', handleTranscriptCreated);
  useEventListener('bulk-upload-completed', handleBulkUploadCompleted);
  
  useEffect(() => {
    const handleTranscriptionsUpdated = () => {
      console.log("Transcriptions updated, refreshing data...");
      throttledFetchTranscripts();
    };
    
    window.addEventListener('transcriptions-updated', handleTranscriptionsUpdated);
    
    return () => {
      window.removeEventListener('transcriptions-updated', handleTranscriptionsUpdated);
    };
  }, [throttledFetchTranscripts]);
  
  const handleBulkUploadClose = useCallback(() => {
    setIsBulkUploadOpen(false);
    throttledFetchTranscripts();
  }, [throttledFetchTranscripts]);

  const handleLiveMetricsTab = useCallback((value: string) => {
    if (value === 'livemetrics') {
      setShowLiveMetrics(true);
      if (!isRecording) {
        startRecording();
      }
    } else {
      setShowLiveMetrics(false);
      if (isRecording) {
        stopRecording();
      }
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <DashboardLayout>
      <DashboardHeader 
        onBulkUploadOpen={() => setIsBulkUploadOpen(true)} 
        refreshData={throttledFetchTranscripts}
      />
      
      <BulkUploadModal 
        isOpen={isBulkUploadOpen} 
        onClose={handleBulkUploadClose} 
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TeamPerformanceOverview 
          teamMetrics={teamMetrics} 
          teamMetricsLoading={teamMetricsLoading}
          callsLength={transcripts?.length || 0}
        />
      </motion.div>
      
      <Tabs 
        defaultValue="dashboard" 
        className="w-full my-6"
        onValueChange={handleLiveMetricsTab}
      >
        <div className="sticky top-0 z-10 pb-2 pt-1">
          <TabsList className={cn(
            "bg-background/80 backdrop-blur-md w-full p-1 rounded-lg",
            isDark ? "border border-white/5" : "border border-gray-200/80"
          )}>
            <TabsTrigger value="dashboard" className="flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-1.5">
              <Brain className="h-4 w-4" />
              Advanced Metrics
            </TabsTrigger>
            <TabsTrigger value="livemetrics" className="flex items-center gap-1.5">
              <Mic className="h-4 w-4" />
              Live Analysis
              {isRecording && <span className="flex h-2 w-2 rounded-full bg-ai-rose animate-pulse"></span>}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5">
              <Headphones className="h-4 w-4" />
              Call History
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="dashboard" className="space-y-6 mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ContentLoader 
                isLoading={transcriptsLoading && !USE_MOCK_DATA} 
                height={400}
                skeletonCount={1}
                preserveHeight={true}
              >
                <CallsOverview />
              </ContentLoader>
            </div>
            <div className="md:col-span-1">
              <ContentLoader 
                isLoading={transcriptsLoading && !USE_MOCK_DATA} 
                height={400}
                skeletonCount={1}
                preserveHeight={true}
              >
                <AIInsights />
              </ContentLoader>
            </div>
          </div>
          
          <CallAnalysisSection isLoading={transcriptsLoading && !USE_MOCK_DATA} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <GlowingCard 
                variant="glass" 
                gradient="blue"
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-ai-blue" />
                    <span>Keyword Trends</span>
                  </h3>
                </div>
                <CardContent className="p-0">
                  <KeywordTrendsChart />
                </CardContent>
              </GlowingCard>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <GlowingCard 
                variant="glass" 
                gradient="purple"
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4 text-ai-purple" />
                    <span>Sentiment Analysis</span>
                  </h3>
                </div>
                <CardContent className="p-0">
                  <SentimentTrendsChart />
                </CardContent>
              </GlowingCard>
            </motion.div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6 mt-2">
          <AdvancedSalesMetrics />
        </TabsContent>
        
        <TabsContent value="livemetrics" className="mt-2">
          <LiveMetricsDisplay isCallActive={showLiveMetrics} />
        </TabsContent>
        
        <TabsContent value="history" className="mt-2">
          <PastCallsList />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default React.memo(Index);
