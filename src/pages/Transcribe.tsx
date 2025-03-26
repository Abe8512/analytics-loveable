
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Upload, Info, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpeechToTextRecorder from '@/components/Whisper/SpeechToTextRecorder';
import { useWhisperService } from '@/services/WhisperService';
import { useToast } from '@/hooks/use-toast';
import BulkUploadModal from '@/components/BulkUpload/BulkUploadModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { realtimeService } from '@/services/RealtimeService';

const Transcribe = () => {
  const [transcript, setTranscript] = useState('');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [realtimeStatus, setRealtimeStatus] = useState<'checking' | 'enabled' | 'disabled'>('checking');
  const { saveTranscriptionWithAnalysis, getOpenAIKey, getUseLocalWhisper } = useWhisperService();
  const { toast } = useToast();
  
  // Check database connection and realtime status on component load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Try a simple check to see if we can access the database
        const { data, error } = await supabase
          .from('call_transcripts')
          .select('id')
          .limit(1);
          
        if (error) {
          console.error('Database connection check failed:', error);
          setDatabaseStatus('error');
        } else {
          console.log('Database connection successful, found data:', data);
          setDatabaseStatus('ready');
          
          // Check realtime status for call_transcripts table
          const realtimeEnabled = await realtimeService.checkRealtimeEnabled('call_transcripts');
          setRealtimeStatus(realtimeEnabled.enabled ? 'enabled' : 'disabled');
        }
      } catch (err) {
        console.error('Error checking database connection:', err);
        setDatabaseStatus('error');
      }
    };
    
    checkConnection();
  }, []);
  
  const handleTranscriptionComplete = async (text: string) => {
    setTranscript(text);
    if (text) {
      try {
        const savedTranscription = await saveTranscriptionWithAnalysis(text);
        toast({
          title: "Transcription Saved",
          description: `Saved transcription: ${savedTranscription.id.slice(0, 8)}...`,
        });
      } catch (error) {
        console.error('Error saving transcription:', error);
        toast({
          title: "Error Saving Transcription",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    }
  };
  
  // Check if API key is configured for OpenAI API usage
  const isConfigured = getUseLocalWhisper() || !!getOpenAIKey();
  
  return (
    <DashboardLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Transcribe Calls</h1>
        
        {databaseStatus === 'error' && (
          <Alert className="mb-6" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Database Connection Error</AlertTitle>
            <AlertDescription>
              There seems to be an issue connecting to the database. Some features may not work correctly.
              Please check your Supabase configuration or try again later.
            </AlertDescription>
          </Alert>
        )}
        
        {realtimeStatus === 'disabled' && databaseStatus === 'ready' && (
          <Alert className="mb-6" variant="default">
            <Info className="h-4 w-4" />
            <AlertTitle>Realtime Updates Disabled</AlertTitle>
            <AlertDescription>
              Realtime updates are not enabled for call transcripts. You may not see live updates.
              Visit the Settings page to enable realtime features.
            </AlertDescription>
          </Alert>
        )}
        
        <Alert className="mb-6" variant={isConfigured ? "default" : "destructive"}>
          <Info className="h-4 w-4" />
          <AlertTitle>{isConfigured ? "Transcription Service Ready" : "Configuration Required"}</AlertTitle>
          <AlertDescription>
            {isConfigured ? (
              `You can upload audio files or record directly from your microphone to transcribe calls.
              Using ${getUseLocalWhisper() ? 'local Whisper model' : 'OpenAI API'} for transcription.`
            ) : (
              "Please add your OpenAI API key in Settings before using the transcription service, or enable local Whisper."
            )}
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                <span>Record Audio</span>
              </CardTitle>
              <CardDescription>
                Use your microphone to record and transcribe in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <SpeechToTextRecorder 
                onTranscriptionComplete={handleTranscriptionComplete}
                showTranscript={true}
                buttonSize="lg"
              />
              
              {transcript && (
                <div className="mt-4 w-full">
                  <h3 className="text-sm font-medium mb-1">Transcript:</h3>
                  <div className="p-3 border rounded-md bg-muted/50 text-sm max-h-40 overflow-y-auto">
                    {transcript}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                <span>Upload Files</span>
              </CardTitle>
              <CardDescription>
                Upload audio files for batch transcription
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
              <p className="text-muted-foreground mb-4 text-center">
                Upload audio files in WAV, MP3, M4A, or OGG format
              </p>
              <Button 
                className="w-full max-w-xs"
                onClick={() => setIsBulkUploadOpen(true)}
                disabled={!isConfigured || databaseStatus === 'error'}
              >
                <Upload className="h-4 w-4 mr-2" />
                Open Bulk Upload
              </Button>
              
              {!isConfigured && (
                <p className="text-destructive text-sm mt-2">
                  Configure OpenAI API key in Settings first
                </p>
              )}
              
              {databaseStatus === 'error' && (
                <p className="text-destructive text-sm mt-2">
                  Database connection error - please check configuration
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        <BulkUploadModal 
          isOpen={isBulkUploadOpen} 
          onClose={() => setIsBulkUploadOpen(false)} 
        />
      </div>
    </DashboardLayout>
  );
};

export default Transcribe;
