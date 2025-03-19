
import React, { useContext, useState, useEffect, useCallback } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import PerformanceMetrics from "../components/Dashboard/PerformanceMetrics";
import CallsOverview from "../components/Dashboard/CallsOverview";
import AIInsights from "../components/Dashboard/AIInsights";
import { ThemeContext } from "@/App";
import BulkUploadButton from "../components/BulkUpload/BulkUploadButton";
import BulkUploadModal from "../components/BulkUpload/BulkUploadModal";
import WhisperButton from "../components/Whisper/WhisperButton";
import LiveMetricsDisplay from "../components/CallAnalysis/LiveMetricsDisplay";
import PastCallsList from "../components/CallAnalysis/PastCallsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCallMetricsStore } from "@/store/useCallMetricsStore";
import KeywordTrendsChart from "../components/CallAnalysis/KeywordTrendsChart";
import { SentimentTrendsChart } from "../components/CallAnalysis/SentimentTrendsChart";
import { DateRangeFilter } from "../components/CallAnalysis/DateRangeFilter";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { useCallTranscripts } from "@/services/CallTranscriptService";
import ContentLoader from "@/components/ui/ContentLoader";
import { useEventListener } from "@/services/EventsService";
import { animationUtils } from "@/utils/animationUtils";
import CallAnalysisSection from "@/components/Dashboard/CallAnalysisSection";
import TeamPerformanceOverview from "@/components/CallActivity/TeamPerformanceOverview";
import { useRealTimeTeamMetrics } from "@/services/RealTimeMetricsService";
import { Brain, Sparkles, ChevronRight, MicOff, Mic, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const { filters, updateDateRange } = useSharedFilters();
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [showLiveMetrics, setShowLiveMetrics] = useState(false);
  const { startRecording, stopRecording, isRecording, saveSentimentTrend } = useCallMetricsStore();
  
  const { 
    fetchTranscripts,
    transcripts,
    loading: transcriptsLoading 
  } = useCallTranscripts();
  
  // Get team metrics for the team performance overview
  const [teamMetrics, teamMetricsLoading] = useRealTimeTeamMetrics(filters);
  
  // Use useCallback for throttledFetchTranscripts to prevent recreation on each render
  const throttledFetchTranscripts = useCallback(
    animationUtils.throttle((options?: any) => {
      fetchTranscripts({
        dateRange: filters.dateRange,
        ...options
      });
    }, 1000), // Decreased throttle time for faster updates
    [fetchTranscripts, filters.dateRange]
  );
  
  // Only run effect when filters.dateRange changes
  useEffect(() => {
    throttledFetchTranscripts();
    
    return () => {
      if (isRecording) {
        stopRecording();
      }
    };
  }, [filters.dateRange, isRecording, stopRecording, throttledFetchTranscripts]);
  
  // Separate effect for recording-related logic to prevent cycles
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        saveSentimentTrend();
      }, 15000);
      
      return () => clearInterval(interval);
    }
  }, [isRecording, saveSentimentTrend]);
  
  // Event listeners with useCallback to prevent infinite loops
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
  
  // Use a single effect for the transcriptions-updated event
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
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-1 flex items-center gap-2`}>
            <span className="text-gradient-blue">AI</span> Sales Call Analyzer
            <Sparkles className="h-6 w-6 text-neon-purple animate-pulse-slow" />
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Gain real-time insights and improve your sales performance
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
          <DateRangeFilter 
            dateRange={filters.dateRange} 
            setDateRange={updateDateRange}
          />
          <WhisperButton recordingId="latest" />
          <BulkUploadButton onClick={() => setIsBulkUploadOpen(true)} />
          <BulkUploadModal 
            isOpen={isBulkUploadOpen} 
            onClose={handleBulkUploadClose} 
          />
        </div>
      </div>

      {/* Overview metrics section */}
      <TeamPerformanceOverview 
        teamMetrics={teamMetrics} 
        teamMetricsLoading={teamMetricsLoading}
        callsLength={transcripts?.length || 0}
      />

      {/* Performance metrics showcase */}
      <div className="mb-6">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4 flex items-center`}>
          <Brain className="mr-2 h-5 w-5 text-neon-purple" />
          Key Performance Indicators
        </h2>
        <PerformanceMetrics />
      </div>

      {/* Live recording button */}
      {!showLiveMetrics && (
        <div className="mb-6">
          <Button 
            className="bg-gradient-to-r from-neon-purple to-neon-blue text-white hover:from-neon-purple/90 hover:to-neon-blue/90 transition-all duration-300"
            onClick={() => handleLiveMetricsTab('livemetrics')}
          >
            {isRecording ? (
              <>
                <MicOff className="mr-2 h-4 w-4" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="mr-2 h-4 w-4" />
                Start Live Recording
              </>
            )}
          </Button>
        </div>
      )}

      <Tabs 
        defaultValue="dashboard" 
        className="w-full mb-8"
        onValueChange={handleLiveMetricsTab}
      >
        <TabsList className="mb-4 flex overflow-x-auto bg-background/90 dark:bg-dark-purple/90 backdrop-blur-sm p-1 rounded-lg">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="livemetrics" className="flex items-center gap-1">
            <Mic className="h-3.5 w-3.5" />
            Live Metrics
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <Headphones className="h-3.5 w-3.5" />
            Call History
          </TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-2">
              <ContentLoader 
                isLoading={transcriptsLoading} 
                height={400}
                skeletonCount={1}
                preserveHeight={true}
              >
                <CallsOverview />
              </ContentLoader>
            </div>
            <div>
              <ContentLoader 
                isLoading={transcriptsLoading} 
                height={400}
                skeletonCount={1}
                preserveHeight={true}
              >
                <AIInsights />
              </ContentLoader>
            </div>
          </div>
          
          <CallAnalysisSection isLoading={transcriptsLoading} />
        </TabsContent>
        
        <TabsContent value="livemetrics">
          <LiveMetricsDisplay isCallActive={showLiveMetrics} />
        </TabsContent>
        
        <TabsContent value="history">
          <PastCallsList />
        </TabsContent>
        
        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <KeywordTrendsChart />
            <SentimentTrendsChart />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between items-center mt-8 mb-4">
        <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} flex items-center`}>
          Recent Call Analysis
        </h2>
        <Button variant="ghost" className="text-neon-purple hover:text-neon-purple/80 px-2" onClick={() => navigate('/transcripts')}>
          View All
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default React.memo(Index);
