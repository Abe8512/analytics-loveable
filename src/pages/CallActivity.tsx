
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RecentCallsTable, SentimentAnalysisTable, TeamMembersTable } from "@/components/CallActivity";
import { Download, UploadCloud, Users, Phone, LineChart, WifiOff } from "lucide-react";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import BulkUploadModal from "@/components/BulkUpload/BulkUploadModal";
import { useBulkUploadService } from "@/services/BulkUploadService";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { useEventListener } from "@/services/events/hooks";
import ConnectionStatusIndicator from '@/components/ui/ConnectionStatusIndicator';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';
import { toast } from "sonner";

// Time between refreshes to prevent overloading
const MIN_REFRESH_INTERVAL = 30000; // 30 seconds

const CallActivity = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("recent-calls");
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);
  const { refreshTranscripts } = useBulkUploadService();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastRefreshTimeRef = useRef<number>(0);
  const { isConnected } = useConnectionStatus();
  
  // Track connection state to show appropriate UI
  const [wasDisconnected, setWasDisconnected] = useState<boolean>(false);
  
  // Listen for team or transcript events to refresh data, but only when connected
  const handleDataUpdate = useCallback(() => {
    if (!isConnected) {
      console.log('Data update event received but offline - will refresh when reconnected');
      setWasDisconnected(true);
      return;
    }
    
    const now = Date.now();
    // Only refresh if it's been at least MIN_REFRESH_INTERVAL since the last refresh
    if (now - lastRefreshTimeRef.current >= MIN_REFRESH_INTERVAL) {
      refreshAllData();
      lastRefreshTimeRef.current = now;
    } else {
      console.log(`Skipping refresh, last refresh was ${(now - lastRefreshTimeRef.current) / 1000}s ago`);
    }
  }, [isConnected]);
  
  // Watch for connection changes to refresh data when reconnected
  useEffect(() => {
    if (isConnected && wasDisconnected) {
      toast.info("Connection restored, refreshing data...");
      refreshAllData();
      setWasDisconnected(false);
    }
  }, [isConnected, wasDisconnected]);
  
  useEventListener('team-member-added', handleDataUpdate);
  useEventListener('team-member-removed', handleDataUpdate);
  useEventListener('transcript-created', handleDataUpdate);
  useEventListener('bulk-upload-completed', handleDataUpdate);
  
  // Handle tab changes
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    // Reset selections when changing tabs
    if (value === "team-members") {
      setSelectedCallId(null);
    } else if (value === "recent-calls") {
      setSelectedTeamMemberId(null);
    }
  }, []);
  
  const handleBulkUploadOpen = useCallback(() => {
    setIsBulkUploadOpen(true);
  }, []);
  
  const handleBulkUploadClose = useCallback(() => {
    setIsBulkUploadOpen(false);
    // Use a short timeout to prevent UI jank
    setTimeout(() => {
      if (isConnected) {
        refreshAllData();
      }
    }, 500);
  }, [isConnected]);
  
  const handleCallSelect = useCallback((callId: string) => {
    setSelectedCallId(callId);
  }, []);
  
  const handleTeamMemberSelect = useCallback((teamMemberId: string) => {
    setSelectedTeamMemberId(teamMemberId);
  }, []);

  const refreshAllData = useCallback(() => {
    if (!isConnected) {
      toast.error("You're offline", {
        description: "Can't refresh data while offline. Will try again when connection is restored.",
        duration: 3000
      });
      setWasDisconnected(true);
      return;
    }
    
    setIsRefreshing(true);
    lastRefreshTimeRef.current = Date.now();
    
    refreshTranscripts({ force: true })
      .then(() => {
        toast.success("Data refreshed", { duration: 2000 });
      })
      .catch(err => {
        console.error("Error refreshing data:", err);
        toast.error("Failed to refresh data", { 
          description: "There was a problem refreshing the data. Please try again later." 
        });
      })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [refreshTranscripts, isConnected]);
  
  // Initial data load - only once on component mount
  useEffect(() => {
    if (isConnected) {
      const initialLoadTimeout = setTimeout(() => {
        refreshAllData();
      }, 300); // Slight delay for UI to render first
      
      return () => clearTimeout(initialLoadTimeout);
    } else {
      setWasDisconnected(true);
    }
  }, []);
  
  // Memoize TabsContent to prevent re-renders
  const tabContent = useMemo(() => {
    return (
      <>
        <TabsContent value="recent-calls" className="space-y-6">
          <RecentCallsTable 
            onCallSelect={handleCallSelect}
            selectedCallId={selectedCallId} 
            isAdmin={true}
          />
        </TabsContent>
        
        <TabsContent value="team-members" className="space-y-6">
          <TeamMembersTable 
            selectedUserId={selectedTeamMemberId}
            onTeamMemberSelect={handleTeamMemberSelect}
            limit={10}
          />
        </TabsContent>
        
        <TabsContent value="sentiment-analysis" className="space-y-6">
          <SentimentAnalysisTable limit={10} />
        </TabsContent>
      </>
    );
  }, [handleCallSelect, selectedCallId, handleTeamMemberSelect, selectedTeamMemberId]);
  
  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Activity</h1>
          <p className="text-muted-foreground">
            Monitor and analyze call activity across your team.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isConnected && (
            <div className="flex items-center text-red-500 mr-2 text-sm font-medium">
              <WifiOff className="h-4 w-4 mr-1.5" />
              Offline Mode
            </div>
          )}
          
          <Button 
            variant="outline" 
            className="hidden sm:flex items-center gap-2"
            disabled={isRefreshing || !isConnected}
            onClick={refreshAllData}
          >
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          
          <Button 
            className="flex items-center gap-2"
            onClick={handleBulkUploadOpen}
          >
            <UploadCloud className="h-4 w-4" />
            Upload Calls
          </Button>
          
          <ConnectionStatusIndicator position="inline" />
        </div>
      </div>
      
      <BulkUploadModal 
        isOpen={isBulkUploadOpen} 
        onClose={handleBulkUploadClose} 
      />
      
      <Tabs 
        defaultValue="recent-calls" 
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full space-y-6"
      >
        <div className="sticky top-0 z-10 pb-2 pt-1">
          <TabsList className={cn(
            "bg-background/80 backdrop-blur-md w-full p-1 rounded-lg",
            isDark ? "border border-white/5" : "border border-gray-200/80"
          )}>
            <TabsTrigger value="recent-calls" className="flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              Recent Calls
            </TabsTrigger>
            <TabsTrigger value="team-members" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="sentiment-analysis" className="flex items-center gap-1.5">
              <LineChart className="h-4 w-4" />
              Sentiment Analysis
            </TabsTrigger>
          </TabsList>
        </div>
        
        {tabContent}
      </Tabs>
    </DashboardLayout>
  );
};

export default CallActivity;
