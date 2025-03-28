
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RecentCallsTable, SentimentAnalysisTable, TeamMembersTable } from "@/components/CallActivity";
import { Download, UploadCloud, Users, Phone, LineChart } from "lucide-react";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import BulkUploadModal from "@/components/BulkUpload/BulkUploadModal";
import { useBulkUploadService } from "@/services/BulkUploadService";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";

const CallActivity = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("recent-calls");
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string | null>(null);
  const { refreshTranscripts } = useBulkUploadService();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
    setIsRefreshing(true);
    refreshTranscripts({ force: true })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [refreshTranscripts]);
  
  const handleCallSelect = useCallback((callId: string) => {
    setSelectedCallId(callId);
    console.log(`Selected call: ${callId}`);
  }, []);
  
  const handleTeamMemberSelect = useCallback((teamMemberId: string) => {
    setSelectedTeamMemberId(teamMemberId);
    console.log(`Selected team member: ${teamMemberId}`);
  }, []);

  const refreshAllData = useCallback(() => {
    setIsRefreshing(true);
    refreshTranscripts({ force: true })
      .finally(() => {
        setIsRefreshing(false);
      });
  }, [refreshTranscripts]);
  
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
          <Button 
            variant="outline" 
            className="hidden sm:flex items-center gap-2"
            disabled={isRefreshing}
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
