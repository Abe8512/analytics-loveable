import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Zap, BarChart2, Cpu } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { CallTranscript, safeCallTranscriptCast } from '@/types/call';
import { AdvancedMetricsService, TalkRatioMetrics, ObjectionHandlingMetrics, SentimentHeatmapPoint } from '@/services/AdvancedMetricsService';
import EnhancedTalkRatioCard from './EnhancedTalkRatioCard';
import SentimentHeatmapCard from './SentimentHeatmapCard';
import ObjectionHandlingCard from './ObjectionHandlingCard';

interface AdvancedCallMetricsProps {
  transcriptId?: string;
  transcript?: CallTranscript;
}

const AdvancedCallMetrics: React.FC<AdvancedCallMetricsProps> = ({ transcriptId, transcript: propTranscript }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [transcript, setTranscript] = useState<CallTranscript | null>(propTranscript || null);
  
  const [talkRatioMetrics, setTalkRatioMetrics] = useState<TalkRatioMetrics>({
    agent_ratio: 0.5,
    prospect_ratio: 0.5,
    dominance_score: 1,
    agent_talk_time: 0,
    prospect_talk_time: 0,
    silence_time: 0,
    interruption_count: 0
  });
  
  const [sentimentHeatmap, setSentimentHeatmap] = useState<SentimentHeatmapPoint[]>([]);
  
  const [objectionMetrics, setObjectionMetrics] = useState<ObjectionHandlingMetrics>({
    total_objections: 0,
    handled_objections: 0,
    effectiveness: 0,
    details: []
  });

  useEffect(() => {
    const fetchTranscript = async () => {
      if (propTranscript) {
        setTranscript(propTranscript);
        generateMetrics(propTranscript);
        return;
      }
      
      if (!transcriptId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('call_transcripts')
          .select('*')
          .eq('id', transcriptId)
          .single();
          
        if (error) {
          throw error;
        }
        
        const safeTranscript = safeCallTranscriptCast(data);
        setTranscript(safeTranscript);
        generateMetrics(safeTranscript);
      } catch (err) {
        console.error('Error fetching transcript for advanced metrics:', err);
        toast({
          title: "Error",
          description: "Failed to fetch call transcript data",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };
    
    fetchTranscript();
  }, [transcriptId, propTranscript, toast]);
  
  const generateMetrics = (transcriptData: CallTranscript) => {
    try {
      // Calculate enhanced talk ratio metrics
      const talkRatio = AdvancedMetricsService.calculateTalkRatios(transcriptData);
      setTalkRatioMetrics(talkRatio);
      
      // Generate sentiment heatmap
      const heatmap = AdvancedMetricsService.generateSentimentHeatmap(transcriptData);
      setSentimentHeatmap(heatmap);
      
      // Calculate objection handling metrics
      const objectionHandling = AdvancedMetricsService.calculateObjectionHandling(transcriptData);
      setObjectionMetrics(objectionHandling);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error generating advanced metrics:', err);
      toast({
        title: "Processing Error",
        description: "Failed to generate advanced call metrics",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };
  
  if (!transcript && !isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            Advanced Call Metrics
          </CardTitle>
          <CardDescription>
            In-depth analysis of call dynamics and patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Cpu className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No transcript data available for advanced analysis</p>
            <p className="text-sm mt-2">Select a call to see detailed metrics</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5 text-primary" />
          Advanced Call Metrics
        </CardTitle>
        <CardDescription>
          In-depth analysis of call dynamics and patterns
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <EnhancedTalkRatioCard 
            metrics={talkRatioMetrics} 
            isLoading={isLoading} 
          />
          
          <SentimentHeatmapCard 
            heatmapData={sentimentHeatmap} 
            isLoading={isLoading}
            duration={transcript?.duration || 0}
          />
          
          <ObjectionHandlingCard 
            metrics={objectionMetrics} 
            isLoading={isLoading} 
          />
        </div>
        
        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-md p-3 text-sm border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Zap className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-300">
                Advanced Call Analysis
              </p>
              <p className="mt-1 text-blue-700 dark:text-blue-400">
                These metrics use AI-powered analysis to provide deeper insights into conversation dynamics, 
                sentiment patterns, and objection handling effectiveness, helping improve sales techniques.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedCallMetrics;
