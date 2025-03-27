
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import CallTranscript from './CallTranscript';
import SentimentAnalysis from './SentimentAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, LineChart, BarChart2, UserSquare } from 'lucide-react';
import CallInsights from './CallInsights';
import CallQualityScore from './CallQualityScore';
import { transcriptAnalysisService } from '@/services/TranscriptAnalysisService';
import { useToast } from '@/hooks/use-toast';
import AdvancedCallMetrics from './AdvancedCallMetrics';

const CallDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [transcript, setTranscript] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('transcript');

  useEffect(() => {
    const fetchTranscript = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('call_transcripts')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw error;
        }
        
        setTranscript(data);
        
        // Check if the transcript has been analyzed
        if (!data.sentiment || !data.call_score) {
          // Analyze the transcript
          try {
            const analysisResult = await transcriptAnalysisService.analyzeTranscript(id);
            console.log('Analyzed transcript:', analysisResult);
            
            // Refresh the transcript data to get the updated analysis
            const { data: updatedData, error: updatedError } = await supabase
              .from('call_transcripts')
              .select('*')
              .eq('id', id)
              .single();
              
            if (updatedError) {
              console.error('Error refreshing transcript after analysis:', updatedError);
            } else {
              setTranscript(updatedData);
            }
          } catch (analysisErr) {
            console.error('Error analyzing transcript:', analysisErr);
          }
        }
      } catch (err) {
        console.error('Error fetching call transcript:', err);
        setError('Failed to load call details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTranscript();
  }, [id, toast]);

  const handleReanalyze = async () => {
    if (!id) return;
    
    try {
      toast({
        title: 'Analyzing Call',
        description: 'Updating call metrics and sentiment analysis...'
      });
      
      const analysisResult = await transcriptAnalysisService.analyzeTranscript(id);
      console.log('Reanalyzed transcript:', analysisResult);
      
      // Refresh the transcript data to get the updated analysis
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      setTranscript(data);
      
      toast({
        title: 'Analysis Complete',
        description: 'Call metrics and insights have been updated'
      });
    } catch (err) {
      console.error('Error reanalyzing transcript:', err);
      toast({
        title: 'Analysis Error',
        description: 'Failed to update call analysis',
        variant: 'destructive'
      });
    }
  };
  
  if (loading) {
    return (
      <div className="animate-pulse space-y-4 p-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-64 bg-muted rounded"></div>
        <div className="h-64 bg-muted rounded"></div>
      </div>
    );
  }
  
  if (error || !transcript) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <div className="text-destructive text-lg">Error Loading Call</div>
            <p className="text-muted-foreground mt-2">{error || 'Call data not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Call Details</h1>
          <p className="text-muted-foreground">
            {transcript.created_at 
              ? new Date(transcript.created_at).toLocaleString() 
              : 'Unknown date'}
            {transcript.duration ? ` • ${Math.floor(transcript.duration / 60)}:${(transcript.duration % 60).toString().padStart(2, '0')}` : ''}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm">Agent: {transcript.user_name || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-500"></div>
            <span className="text-sm">Customer: {transcript.customer_name || 'Unknown'}</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <Card className="h-full">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>Call Analysis</CardTitle>
                  <TabsList>
                    <TabsTrigger value="transcript" className="gap-1">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:inline">Transcript</span>
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="gap-1">
                      <LineChart className="h-4 w-4" />
                      <span className="hidden sm:inline">Insights</span>
                    </TabsTrigger>
                    <TabsTrigger value="advanced" className="gap-1">
                      <BarChart2 className="h-4 w-4" />
                      <span className="hidden sm:inline">Advanced</span>
                    </TabsTrigger>
                    <TabsTrigger value="participants" className="gap-1">
                      <UserSquare className="h-4 w-4" />
                      <span className="hidden sm:inline">Participants</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>
                  {activeTab === 'transcript' && 'Full conversation transcript with speaker identification'}
                  {activeTab === 'insights' && 'Key metrics and insights from the call'}
                  {activeTab === 'advanced' && 'Advanced AI-powered conversation analytics'}
                  {activeTab === 'participants' && 'Call participants and their roles'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-5rem)]">
                <TabsContent value="transcript" className="m-0 h-full">
                  <CallTranscript transcriptId={id} />
                </TabsContent>
                <TabsContent value="insights" className="m-0 p-4 h-full overflow-auto">
                  <div className="space-y-6">
                    <CallQualityScore transcript={transcript} onReanalyze={handleReanalyze} />
                    <CallInsights transcript={transcript} />
                  </div>
                </TabsContent>
                <TabsContent value="advanced" className="m-0 p-4 h-full overflow-auto">
                  <AdvancedCallMetrics transcriptId={id} transcript={transcript} />
                </TabsContent>
                <TabsContent value="participants" className="m-0 p-4 h-full overflow-auto">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Call Participants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-md">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <UserSquare className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{transcript.user_name || 'Sales Agent'}</h3>
                                <p className="text-sm text-muted-foreground">Sales Representative</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-md">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                                <UserSquare className="h-5 w-5 text-pink-600" />
                              </div>
                              <div>
                                <h3 className="font-medium">{transcript.customer_name || 'Customer'}</h3>
                                <p className="text-sm text-muted-foreground">Prospect</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
        
        <div>
          <SentimentAnalysis transcript={transcript} />
        </div>
      </div>
    </div>
  );
};

export default CallDetails;
