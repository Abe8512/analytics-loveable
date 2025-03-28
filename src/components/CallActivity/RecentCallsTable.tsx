
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ContentLoader from "@/components/ui/ContentLoader";
import { useCallTranscripts } from "@/services/CallTranscriptService";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { teamService } from '@/services/TeamService';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';

interface Call {
  id: string;
  date: string;
  userName?: string;
  customerName?: string;
  duration?: number;
  outcome?: string | object;
  sentiment: number;
  nextSteps?: string;
}

interface RecentCallsTableProps {
  onCallSelect?: (callId: string) => void;
  selectedCallId?: string | null;
  isAdmin?: boolean;
  isManager?: boolean;
}

const RecentCallsTable: React.FC<RecentCallsTableProps> = ({ 
  onCallSelect,
  selectedCallId,
  isAdmin = false, 
  isManager = false
}) => {
  const navigate = useNavigate();
  const { filters } = useSharedFilters();
  const { transcripts, loading, error, fetchTranscripts } = useCallTranscripts();
  const [calls, setCalls] = useState<Call[]>([]);
  const [teamMembersMap, setTeamMembersMap] = useState<Record<string, string>>({});
  const [retryCount, setRetryCount] = useState(0);
  const { isConnected } = useConnectionStatus();
  const [teamMembersLoading, setTeamMembersLoading] = useState(false);
  
  // Fetch team members to map IDs to names - with error handling
  const loadTeamMembers = useCallback(async () => {
    if (teamMembersLoading) return;
    
    try {
      setTeamMembersLoading(true);
      const members = await teamService.getTeamMembers();
      const memberMap: Record<string, string> = {};
      members.forEach(member => {
        if (member.id) {
          memberMap[member.id] = member.name;
        }
        if (member.user_id) {
          memberMap[member.user_id] = member.name;
        }
      });
      setTeamMembersMap(memberMap);
    } catch (error) {
      console.error("Error loading team members:", error);
    } finally {
      setTeamMembersLoading(false);
    }
  }, [teamMembersLoading]);
  
  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);
  
  // Refresh data only when connected
  useEffect(() => {
    if (isConnected) {
      const loadData = async () => {
        try {
          await fetchTranscripts();
        } catch (err) {
          console.error("Error fetching transcripts:", err);
        }
      };
      
      loadData();
    }
  }, [fetchTranscripts, isConnected]);
  
  // Convert transcripts to call format - memoized to prevent unnecessary rerenders
  useEffect(() => {
    if (transcripts && Array.isArray(transcripts)) {
      const formattedCalls = transcripts.map(transcript => {
        // Try to get team member name from our map if user_id is available
        const userName = transcript.user_id && teamMembersMap[transcript.user_id] 
          ? teamMembersMap[transcript.user_id]
          : transcript.user_name || transcript.assigned_to || 'Unknown Rep';
            
        return {
          id: transcript.id,
          date: transcript.created_at || new Date().toISOString(),
          userName,
          customerName: transcript.customer_name || 'Unknown Customer',
          duration: transcript.duration || 0,
          outcome: transcript.metadata?.outcome || 'Pending Analysis',
          sentiment: transcript.sentiment === 'positive' ? 0.8 : 
                    transcript.sentiment === 'negative' ? 0.3 : 0.6,
          nextSteps: transcript.metadata?.next_steps || 'Follow up required'
        };
      });
      setCalls(formattedCalls);
    }
  }, [transcripts, teamMembersMap]);

  // Format date in a consistent way
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
             ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return dateString || "Unknown date";
    }
  };

  const handleRowClick = (callId: string) => {
    if (onCallSelect) {
      onCallSelect(callId);
    }
  };

  const handleRetry = async () => {
    if (!isConnected) {
      return; // Don't retry if offline
    }
    
    setRetryCount(prev => prev + 1);
    try {
      await fetchTranscripts({ force: true });
    } catch (err) {
      console.error("Error retrying fetch:", err);
    }
  };

  // Check if we have any calls to display
  const hasCalls = useMemo(() => calls && calls.length > 0, [calls]);

  return (
    <Card className={selectedCallId ? 'border-primary' : ''}>
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
        <CardDescription>
          {loading 
            ? 'Loading call data...'
            : hasCalls 
              ? `Showing ${calls.length} recent calls`
              : 'No calls match the current filters'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isConnected && (
          <Alert variant="warning" className="mb-4">
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You are currently offline. Showing cached data.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error loading calls: {error.message}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2" 
                onClick={handleRetry}
                disabled={!isConnected}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <ContentLoader isLoading={loading} skeletonCount={3} height={200}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                {(isAdmin || isManager) && <TableHead>Rep</TableHead>}
                <TableHead>Customer</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin || isManager ? 7 : 6} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <p>Loading call data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : hasCalls ? (
                calls.map((call) => (
                  <TableRow 
                    key={call.id}
                    className={selectedCallId === call.id ? 'bg-accent/40' : 'hover:bg-accent/20'}
                    onClick={() => handleRowClick(call.id)}
                  >
                    <TableCell>{formatDate(call.date)}</TableCell>
                    {(isAdmin || isManager) && <TableCell>{String(call.userName || 'Unknown')}</TableCell>}
                    <TableCell>{String(call.customerName || 'Unknown')}</TableCell>
                    <TableCell>{Math.floor((call.duration || 0) / 60)} min</TableCell>
                    <TableCell>
                      {typeof call.outcome === 'string' ? call.outcome : 
                       typeof call.outcome === 'object' && call.outcome !== null ? 'Complex Outcome' : 
                       String(call.outcome || 'N/A')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              call.sentiment > 0.7 ? 'bg-green-500' : 
                              call.sentiment > 0.4 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${call.sentiment * 100}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(call.sentiment * 100)}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/transcripts?id=${call.id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin || isManager ? 7 : 6} className="text-center py-8">
                    <p className="text-muted-foreground">No calls match the current filters</p>
                    <p className="text-sm mt-1">Try adjusting your filters or date range</p>
                    {retryCount > 0 && !error && isConnected && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2" 
                        onClick={handleRetry}
                      >
                        Retry ({retryCount})
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ContentLoader>
      </CardContent>
    </Card>
  );
};

export default RecentCallsTable;
