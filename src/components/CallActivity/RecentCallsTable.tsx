
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import ContentLoader from "@/components/ui/ContentLoader";
import { useCallTranscripts } from "@/services/CallTranscriptService";
import { useSharedFilters } from "@/contexts/SharedFilterContext";

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
  const { transcripts, loading, fetchTranscripts } = useCallTranscripts();
  const [calls, setCalls] = useState<Call[]>([]);
  
  // Refresh data to ensure we have the latest transcripts
  useEffect(() => {
    fetchTranscripts({ force: true });
  }, [fetchTranscripts]);
  
  // Convert transcripts to call format
  useEffect(() => {
    if (transcripts) {
      const formattedCalls = transcripts.map(transcript => ({
        id: transcript.id,
        date: transcript.created_at || new Date().toISOString(),
        userName: transcript.user_name || 'Unknown Rep',
        customerName: transcript.customer_name || 'Unknown Customer',
        duration: transcript.duration || 0,
        outcome: transcript.metadata?.outcome || 'Pending Analysis',
        sentiment: transcript.sentiment === 'positive' ? 0.8 : 
                  transcript.sentiment === 'negative' ? 0.3 : 0.6,
        nextSteps: transcript.metadata?.next_steps || 'Follow up required'
      }));
      setCalls(formattedCalls);
    }
  }, [transcripts]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
           ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleRowClick = (callId: string) => {
    if (onCallSelect) {
      onCallSelect(callId);
    }
  };

  return (
    <Card className={selectedCallId ? 'border-primary' : ''}>
      <CardHeader>
        <CardTitle>Recent Calls</CardTitle>
        <CardDescription>
          {loading 
            ? 'Loading call data...'
            : calls.length > 0 
              ? `Showing ${calls.length} recent calls`
              : 'No calls match the current filters'}
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              ) : calls.length > 0 ? (
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
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
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
