
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Filter, 
  Mic, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Upload,
  ListFilter,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { getStoredTranscriptions, StoredTranscription } from '@/services/WhisperService';
import TranscriptDetail from '@/components/Transcripts/TranscriptDetail';
import BlurredLoading from '@/components/ui/BlurredLoading';
import BulkUploadModal from '@/components/BulkUpload/BulkUploadModal';
import { useToast } from '@/hooks/use-toast';
import PageHeader from '@/components/ui/PageHeader';

const Transcripts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  
  const [transcripts, setTranscripts] = useState<StoredTranscription[]>([]);
  const [filteredTranscripts, setFilteredTranscripts] = useState<StoredTranscription[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<StoredTranscription | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  useEffect(() => {
    // Check if a specific transcript id was requested in the URL
    const searchParams = new URLSearchParams(location.search);
    const requestedId = searchParams.get('id');
    
    const storedTranscripts = getStoredTranscriptions();
    
    // Generate sample transcript data if none exists
    if (storedTranscripts.length === 0) {
      const sampleTranscripts: StoredTranscription[] = [
        {
          id: '1',
          text: "Hi, this is John from sales. I'm calling to follow up on our previous conversation about our software solution. Could you tell me more about your current needs?",
          date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
          sentiment: 'positive',
          duration: 124,
          call_score: 85,
          keywords: ['software', 'needs', 'solution']
        },
        {
          id: '2',
          text: "Hello, I'm calling about the issue you reported yesterday. I understand it's been frustrating. Let me see how I can help resolve this problem quickly for you.",
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
          sentiment: 'neutral',
          duration: 183,
          call_score: 72,
          keywords: ['issue', 'problem', 'help']
        },
        {
          id: '3',
          text: "I'm disappointed with the service quality. We've had repeated issues with the product and the support has been inadequate. I'd like to speak with a manager.",
          date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
          sentiment: 'negative',
          duration: 215,
          call_score: 45,
          keywords: ['disappointed', 'issues', 'inadequate']
        }
      ];
      
      setTranscripts(sampleTranscripts);
      setFilteredTranscripts(sampleTranscripts);
      
      // If an ID was requested, select that transcript
      if (requestedId) {
        const requested = sampleTranscripts.find(t => t.id === requestedId);
        if (requested) {
          setSelectedTranscript(requested);
        }
      }
    } else {
      // Sort by date (newest first)
      const sortedTranscripts = [...storedTranscripts].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setTranscripts(sortedTranscripts);
      setFilteredTranscripts(sortedTranscripts);
      
      // If an ID was requested, select that transcript
      if (requestedId) {
        const requested = sortedTranscripts.find(t => t.id === requestedId);
        if (requested) {
          setSelectedTranscript(requested);
        }
      }
    }
    
    setIsLoading(false);
  }, [location.search]);
  
  useEffect(() => {
    if (!searchQuery && !selectedDate && !activeFilter) {
      setFilteredTranscripts(transcripts);
      return;
    }
    
    let results = [...transcripts];
    
    // Filter by search query
    if (searchQuery) {
      results = results.filter(transcript => 
        transcript.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by date
    if (selectedDate) {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      results = results.filter(transcript => {
        const transcriptDate = new Date(transcript.date);
        return format(transcriptDate, 'yyyy-MM-dd') === dateString;
      });
    }
    
    // Filter by sentiment
    if (activeFilter) {
      results = results.filter(transcript => 
        transcript.sentiment?.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    
    setFilteredTranscripts(results);
  }, [searchQuery, selectedDate, activeFilter, transcripts]);
  
  const handleTranscriptClick = (transcript: StoredTranscription) => {
    setSelectedTranscript(transcript);
    
    // Update URL without reload
    navigate(`/transcripts?id=${transcript.id}`, { replace: true });
  };
  
  const handleCloseDetail = () => {
    setSelectedTranscript(null);
    navigate('/transcripts', { replace: true });
  };
  
  const handleDeleteTranscript = (id: string) => {
    // Filter out the transcript with the matching id
    const updatedTranscripts = transcripts.filter(t => t.id !== id);
    
    // Update state
    setTranscripts(updatedTranscripts);
    setFilteredTranscripts(prevFiltered => prevFiltered.filter(t => t.id !== id));
    
    // If the deleted transcript was selected, clear selection
    if (selectedTranscript && selectedTranscript.id === id) {
      setSelectedTranscript(null);
      navigate('/transcripts', { replace: true });
    }
    
    toast({
      title: 'Transcript deleted',
      description: 'The transcript has been successfully removed',
    });
  };
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate(undefined);
    setActiveFilter(null);
  };
  
  const sentimentClasses = {
    positive: 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
    neutral: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    negative: 'bg-red-500/10 text-red-500 hover:bg-red-500/20',
  };
  
  const formatTranscriptDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  if (isLoading) {
    return <BlurredLoading />;
  }
  
  return (
    <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
      <PageHeader 
        title="Transcripts" 
        description="View and analyze your call transcripts"
        icon={<Mic className="h-6 w-6 text-primary" />}
      />
      
      {selectedTranscript ? (
        <TranscriptDetail
          transcript={selectedTranscript}
          onClose={handleCloseDetail}
          onDelete={() => handleDeleteTranscript(selectedTranscript.id)}
        />
      ) : (
        <>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search transcripts..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal w-full md:w-auto",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <ListFilter className="h-4 w-4" />
                      {activeFilter ? activeFilter : "Filter"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by sentiment</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => setActiveFilter('positive')}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span>Positive</span>
                          {activeFilter === 'positive' && <Check className="ml-2 h-4 w-4" />}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter('neutral')}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <span>Neutral</span>
                          {activeFilter === 'neutral' && <Check className="ml-2 h-4 w-4" />}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setActiveFilter('negative')}>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span>Negative</span>
                          {activeFilter === 'negative' && <Check className="ml-2 h-4 w-4" />}
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={clearFilters}>
                      Clear filters
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {(searchQuery || selectedDate || activeFilter) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button 
                variant="outline" 
                className="gap-2 w-full md:w-auto"
                onClick={() => setShowBulkUpload(true)}
              >
                <Upload className="h-4 w-4" />
                <span>Bulk Upload</span>
              </Button>
              
              <BulkUploadModal
                isOpen={showBulkUpload}
                onClose={() => setShowBulkUpload(false)}
              />
            </div>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
            <Table>
              <TableCaption>
                {filteredTranscripts.length === 0
                  ? searchQuery || selectedDate || activeFilter
                    ? "No matching transcripts found. Try adjusting your filters."
                    : "No transcripts available. Upload a recording to get started."
                  : `Showing ${filteredTranscripts.length} transcript${filteredTranscripts.length === 1 ? '' : 's'}`
                }
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead className="w-[150px]">Duration</TableHead>
                  <TableHead className="w-[120px]">Sentiment</TableHead>
                  <TableHead className="w-[100px]">Score</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTranscripts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No transcripts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTranscripts.map((transcript) => (
                    <TableRow 
                      key={transcript.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => handleTranscriptClick(transcript)}
                    >
                      <TableCell className="font-medium">
                        {format(new Date(transcript.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="max-w-md truncate">
                        {transcript.text}
                      </TableCell>
                      <TableCell>
                        {formatTranscriptDuration(transcript.duration)}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            sentimentClasses[
                              transcript.sentiment as keyof typeof sentimentClasses
                            ] || sentimentClasses.neutral
                          }
                        >
                          {transcript.sentiment || 'neutral'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className={`w-10 h-1 rounded-full mr-2 ${
                              transcript.call_score && transcript.call_score >= 70 
                                ? 'bg-green-500' 
                                : transcript.call_score && transcript.call_score >= 50 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                            }`}
                          ></div>
                          <span>{transcript.call_score || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              toast({
                                title: 'Transcript downloaded',
                                description: 'The transcript has been downloaded as a text file',
                              });
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTranscript(transcript.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
};

export default Transcripts;
