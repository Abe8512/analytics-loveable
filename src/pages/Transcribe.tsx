
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic } from 'lucide-react';

const Transcribe = () => {
  return (
    <DashboardLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Transcribe Calls</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              <span>Audio Transcription</span>
            </CardTitle>
            <CardDescription>
              Upload audio files or record directly to transcribe calls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The transcription feature will be implemented in a future update.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Transcribe;
