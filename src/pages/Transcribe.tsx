
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, Upload, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpeechToTextRecorder from '@/components/Whisper/SpeechToTextRecorder';
import { useWhisperService } from '@/services/WhisperService';
import { useToast } from '@/hooks/use-toast';
import BulkUploadModal from '@/components/BulkUpload/BulkUploadModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Transcribe = () => {
  const [transcript, setTranscript] = useState('');
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const { saveTranscriptionWithAnalysis } = useWhisperService();
  const { toast } = useToast();
  
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
  
  return (
    <DashboardLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Transcribe Calls</h1>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Transcription Service Ready</AlertTitle>
          <AlertDescription>
            You can upload audio files or record directly from your microphone to transcribe calls.
            Both local and OpenAI Whisper API transcription methods are available.
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
              >
                <Upload className="h-4 w-4 mr-2" />
                Open Bulk Upload
              </Button>
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
