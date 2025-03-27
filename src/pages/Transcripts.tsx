
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Download, Filter, Search, Calendar, Upload } from 'lucide-react';
import { useCallTranscripts } from '@/services/CallTranscriptService';
import BulkUploadModal from '@/components/BulkUpload/BulkUploadModal';
import { toast } from 'sonner';
import ContentLoader from '@/components/ui/ContentLoader';
import TranscriptViewer from '@/components/Transcripts/TranscriptViewer';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Transcripts = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTranscriptId, setSelectedTranscriptId] = useState<string | null>(
    searchParams.get('id')
  );
  
  const { transcripts, loading, fetchTranscripts } = useCallTranscripts();
  
  // Refresh data when the component mounts or when selectedTranscriptId changes
  useEffect(() => {
    fetchTranscripts();
  }, [fetchTranscripts]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const filteredTranscripts = transcripts
    ? transcripts.filter(transcript => 
        transcript.text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transcript.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transcript.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];
  
  const handleRowClick = (id: string) => {
    setSelectedTranscriptId(id);
  };
  
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown date';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('en-US', { 
        month: 'short', 
        day: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const openBulkUploadModal = () => {
    setIsModalOpen(true);
  };
  
  const closeBulkUploadModal = () => {
    setIsModalOpen(false);
    // Refresh transcripts after closing the modal
    fetchTranscripts({ force: true });
    toast('Transcript list refreshed');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transcripts</h1>
            <p className="text-muted-foreground">View and analyze your call transcripts</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast('Export functionality coming soon')}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button onClick={openBulkUploadModal}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </div>
        </div>
        
        <BulkUploadModal isOpen={isModalOpen} onClose={closeBulkUploadModal} />
        
        <div className="flex flex-col lg:flex-row h-full gap-6">
          {/* Transcripts List */}
          <div className={cn(
            "w-full lg:w-2/3 overflow-hidden",
            selectedTranscriptId ? "lg:block" : "block"
          )}>
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transcripts..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <ContentLoader isLoading={loading} skeletonCount={5}>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                      <th className="text-left p-3 text-muted-foreground font-medium hidden sm:table-cell">Content</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Duration</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Sentiment</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Score</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTranscripts.length > 0 ? (
                      filteredTranscripts.map((transcript) => (
                        <tr 
                          key={transcript.id} 
                          className={cn(
                            "cursor-pointer hover:bg-muted/50",
                            selectedTranscriptId === transcript.id ? "bg-primary/10" : ""
                          )}
                          onClick={() => handleRowClick(transcript.id)}
                        >
                          <td className="p-3 align-top">
                            {formatDate(transcript.created_at)}
                          </td>
                          <td className="p-3 hidden sm:table-cell">
                            <div className="max-w-md truncate">
                              {transcript.text?.substring(0, 100)}...
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            {formatDuration(transcript.duration || 0)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transcript.sentiment === 'positive' ? 'bg-green-100 text-green-800' :
                              transcript.sentiment === 'negative' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {transcript.sentiment}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center">
                              <div className="h-2 w-16 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    (transcript.call_score || 0) > 70 ? 'bg-green-500' :
                                    (transcript.call_score || 0) > 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${transcript.call_score || 0}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-sm">{transcript.call_score || 0}</span>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(`/transcripts?id=${transcript.id}`, '_blank');
                                }}
                              >
                                View
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          {loading ? (
                            <p>Loading transcripts...</p>
                          ) : (
                            <>
                              <p className="text-muted-foreground">No transcripts found</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {searchTerm ? 'Try a different search term' : 'Upload audio files to get started'}
                              </p>
                            </>
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <div className="p-3 border-t text-center text-sm text-muted-foreground">
                  Showing {filteredTranscripts.length} transcripts
                </div>
              </div>
            </ContentLoader>
          </div>
          
          {/* Transcript Viewer */}
          {selectedTranscriptId && (
            <div className="w-full lg:w-1/3 h-full overflow-auto">
              <TranscriptViewer
                transcriptId={selectedTranscriptId}
                onClose={() => setSelectedTranscriptId(null)}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Transcripts;
