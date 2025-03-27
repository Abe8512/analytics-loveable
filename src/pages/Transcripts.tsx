
import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/card';
import {
  Download,
  Trash2,
  Search,
  Calendar,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCallTranscripts } from '@/services/CallTranscriptService';
import { Skeleton } from '@/components/ui/skeleton';
import TranscriptViewer from '@/components/Transcripts/TranscriptViewer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type SortField = 'date' | 'sentiment' | 'duration' | 'score';
type SortOrder = 'asc' | 'desc';

export default function Transcripts() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const viewId = params.get('id');
  
  const { transcripts = [], loading, fetchTranscripts } = useCallTranscripts();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Ensure initial load
  useEffect(() => {
    fetchTranscripts({ force: true });
  }, [fetchTranscripts]);
  
  // Filter transcripts based on search term - memoized to prevent unnecessary rerenders
  const filteredTranscripts = useMemo(() => {
    if (!Array.isArray(transcripts)) return [];
    
    return transcripts.filter(t => 
      (t.text || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.filename || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.user_name && t.user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.customer_name && t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [transcripts, searchTerm]);
  
  // Sort transcripts based on sort field and order - memoized to prevent unnecessary rerenders
  const sortedTranscripts = useMemo(() => {
    return [...filteredTranscripts].sort((a, b) => {
      switch (sortField) {
        case 'date':
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        case 'sentiment':
          const sentMap = { positive: 3, neutral: 2, negative: 1, undefined: 0 };
          const sentA = sentMap[a.sentiment as keyof typeof sentMap] || 0;
          const sentB = sentMap[b.sentiment as keyof typeof sentMap] || 0;
          return sortOrder === 'asc' ? sentA - sentB : sentB - sentA;
        case 'duration':
          const durA = a.duration || 0;
          const durB = b.duration || 0;
          return sortOrder === 'asc' ? durA - durB : durB - durA;
        case 'score':
          const scoreA = a.call_score || 0;
          const scoreB = b.call_score || 0;
          return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
        default:
          return 0;
      }
    });
  }, [filteredTranscripts, sortField, sortOrder]);
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };
  
  const handleViewTranscript = (id: string) => {
    navigate(`/transcripts?id=${id}`);
  };
  
  const handleCloseTranscript = () => {
    navigate('/transcripts');
  };
  
  const handleDeleteTranscript = async (id: string) => {
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('call_transcripts')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Transcript deleted",
        description: "The transcript has been deleted successfully.",
      });
      
      // If we're viewing the deleted transcript, close it
      if (viewId === id) {
        handleCloseTranscript();
      }
      
      // Refresh the transcript list
      fetchTranscripts({ force: true });
      
    } catch (error) {
      console.error('Error deleting transcript:', error);
      toast({
        title: "Error",
        description: "Failed to delete transcript. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  const handleDownloadTranscript = (transcript: any) => {
    if (!transcript || !transcript.text) {
      toast({
        title: "Error",
        description: "No transcript content available to download",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a blob with the transcript text
      const blob = new Blob([transcript.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a download link and trigger it
      const a = document.createElement('a');
      a.href = url;
      a.download = `transcript-${transcript.id.substring(0, 8)}.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Transcript downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading transcript:', error);
      toast({
        title: "Error",
        description: "Failed to download transcript",
        variant: "destructive"
      });
    }
  };
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Unknown date';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  const sentimentColors = {
    positive: 'bg-green-100 text-green-800',
    negative: 'bg-red-100 text-red-800',
    neutral: 'bg-blue-100 text-blue-800',
  };
  
  // Determine if transcripts are actually loading
  const isLoading = loading && (!transcripts || transcripts.length === 0);
  
  return (
    <DashboardLayout>
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Transcripts</h1>
          <p className="text-sm text-muted-foreground">
            View and analyze your call transcripts
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column - transcript list */}
          <div className={`space-y-6 ${viewId ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
            <div className="flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center">
              <div className="w-full sm:w-auto max-w-md">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500/50" />
                  <Input
                    type="search"
                    placeholder="Search transcripts..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="hidden sm:inline">Date Range</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Last 7 days
                        </Button>
                        <Button variant="outline" size="sm">
                          Last 30 days
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="text-xs mb-1">Start Date</div>
                            <Input type="date" />
                          </div>
                          <div>
                            <div className="text-xs mb-1">End Date</div>
                            <Input type="date" />
                          </div>
                        </div>
                        <Button size="sm">Apply</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex gap-1">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="hidden sm:inline">Filter</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs mb-1">Sentiment</div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            Positive
                          </Button>
                          <Button variant="outline" size="sm">
                            Neutral
                          </Button>
                          <Button variant="outline" size="sm">
                            Negative
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs mb-1">Duration</div>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            &lt; 5 min
                          </Button>
                          <Button variant="outline" size="sm">
                            5-15 min
                          </Button>
                          <Button variant="outline" size="sm">
                            &gt; 15 min
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex gap-1">
                      <ArrowUpDown className="h-4 w-4" />
                      <span className="hidden sm:inline">Sort</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSort('date')}>
                      Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('sentiment')}>
                      Sentiment {sortField === 'sentiment' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('duration')}>
                      Duration {sortField === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSort('score')}>
                      Score {sortField === 'score' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium text-sm">Date</th>
                      <th className="text-left p-4 font-medium text-sm">Content</th>
                      <th className="text-left p-4 font-medium text-sm">Duration</th>
                      <th className="text-left p-4 font-medium text-sm">Sentiment</th>
                      <th className="text-left p-4 font-medium text-sm">Score</th>
                      <th className="text-left p-4 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <tr key={i} className="border-b">
                            <td className="p-4">
                              <Skeleton className="h-5 w-24" />
                            </td>
                            <td className="p-4">
                              <Skeleton className="h-5 w-48" />
                            </td>
                            <td className="p-4">
                              <Skeleton className="h-5 w-12" />
                            </td>
                            <td className="p-4">
                              <Skeleton className="h-5 w-20" />
                            </td>
                            <td className="p-4">
                              <Skeleton className="h-5 w-12" />
                            </td>
                            <td className="p-4">
                              <Skeleton className="h-9 w-20" />
                            </td>
                          </tr>
                        ))
                    ) : sortedTranscripts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-500">
                          {searchTerm ? 
                            'No transcripts match your search. Try different keywords.' : 
                            'No transcripts found. Upload audio files to see transcripts here.'}
                        </td>
                      </tr>
                    ) : (
                      sortedTranscripts.map((transcript) => (
                        <tr key={transcript.id} className="border-b">
                          <td className="p-4 whitespace-nowrap">
                            {formatDate(transcript.created_at)}
                          </td>
                          <td className="p-4">
                            <div className="max-w-md truncate">
                              {transcript.text ? 
                                transcript.text.substring(0, 100) + "..." : 
                                "No text available"}
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {formatDuration(transcript.duration)}
                          </td>
                          <td className="p-4">
                            <Badge
                              className={
                                transcript.sentiment && 
                                sentimentColors[transcript.sentiment as keyof typeof sentimentColors] || 
                                sentimentColors.neutral
                              }
                            >
                              {transcript.sentiment || 'neutral'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div
                              className={`font-medium ${
                                (transcript.call_score || 0) > 70
                                  ? 'text-green-600'
                                  : (transcript.call_score || 0) > 40
                                  ? 'text-amber-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {transcript.call_score || 0}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewTranscript(transcript.id)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDownloadTranscript(transcript)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleDeleteTranscript(transcript.id)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 text-sm text-center text-gray-500">
                Showing {sortedTranscripts.length} of {Array.isArray(transcripts) ? transcripts.length : 0} transcripts
              </div>
            </Card>
          </div>
          
          {/* Right column - transcript viewer */}
          {viewId && (
            <div className="lg:col-span-6">
              <div className="h-full min-h-[600px]">
                <TranscriptViewer transcriptId={viewId} onClose={handleCloseTranscript} />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
