import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { EventsStore } from '@/services/events/store';
import { EventType, EVENT_TYPES } from '@/services/events/types';
import { useBulkUploadService } from '@/hooks/useBulkUploadService';
import { BulkUploadFilter } from '@/types/teamTypes';
import { Progress } from "@/components/ui/progress";

interface CSVData {
  filename: string;
  text: string;
  keywords: string;
  sentiment: string;
  call_score: string;
  duration: string;
}

const BulkUploadProcessor: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('');
  const { refreshTranscripts } = useBulkUploadService();
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setCsvData(results.data as CSVData[]);
          } else {
            toast({
              variant: "destructive",
              title: "Upload error",
              description: "Could not parse CSV file."
            });
          }
        },
        error: (error) => {
          toast({
            variant: "destructive",
            title: "Upload error",
            description: error.message
          });
        }
      });
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: {
    'text/csv': ['.csv']
  } });

  const uploadData = async () => {
    if (!apiKey || !modelName) {
      toast({
        variant: "destructive",
        title: "Configuration required",
        description: "Please provide both API Key and Model Name."
      });
      return;
    }

    if (csvData.length === 0) {
      toast({
        variant: "destructive",
        title: "No data to upload",
        description: "Please upload a CSV file first."
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    EventsStore.dispatchEvent(EVENT_TYPES.BULK_UPLOAD_STARTED as EventType, {
      timestamp: new Date().toISOString()
    });

    try {
      const totalRows = csvData.length;
      let uploadedCount = 0;

      for (const data of csvData) {
        try {
          EventsStore.dispatchEvent(EVENT_TYPES.BULK_UPLOAD_PROGRESS as EventType, { 
            progress: (uploadedCount / totalRows) * 100,
            timestamp: new Date().toISOString()
          });
          setUploadProgress((uploadedCount / totalRows) * 100);

          await new Promise(resolve => setTimeout(resolve, 500)); // Simulate upload time

          uploadedCount++;
          EventsStore.dispatchEvent(EVENT_TYPES.BULK_UPLOAD_PROGRESS as EventType, { 
            progress: (uploadedCount / totalRows) * 100,
            timestamp: new Date().toISOString()
          });
          setUploadProgress((uploadedCount / totalRows) * 100);
        } catch (uploadError: any) {
          console.error('Upload failed for row:', data, uploadError);
          toast({
            variant: "destructive",
            title: "Upload error",
            description: `Failed to upload row: ${data.filename || 'Unknown'}. ${uploadError?.message || 'Unknown error'}`
          });
          EventsStore.dispatchEvent(EVENT_TYPES.BULK_UPLOAD_ERROR as EventType, { 
            error: uploadError,
            timestamp: new Date().toISOString()
          });
        }
      }

      setIsUploading(false);
      setUploadProgress(100);
      EventsStore.dispatchEvent(EVENT_TYPES.BULK_UPLOAD_COMPLETED as EventType, {
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Upload complete",
        description: `Successfully uploaded ${uploadedCount} of ${totalRows} rows.`,
      });
    } catch (error: any) {
      console.error('Bulk upload process failed:', error);
      setIsUploading(false);
      EventsStore.dispatchEvent(EVENT_TYPES.BULK_UPLOAD_ERROR as EventType, { 
        error,
        timestamp: new Date().toISOString()
      });
      toast({
        variant: "destructive",
        title: "Upload error",
        description: error.message
      });
    }
  };

  const processData = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    EventsStore.dispatchEvent('processing-started' as EventType, {
      timestamp: new Date().toISOString()
    });

    try {
      const totalRows = csvData.length;
      let processedCount = 0;

      for (const data of csvData) {
        try {
          EventsStore.dispatchEvent('processing-progress' as EventType, { 
            progress: (processedCount / totalRows) * 100,
            timestamp: new Date().toISOString()
          });
          setProcessingProgress((processedCount / totalRows) * 100);

          await new Promise(resolve => setTimeout(resolve, 800)); // Simulate processing time

          processedCount++;
          EventsStore.dispatchEvent('processing-progress' as EventType, { 
            progress: (processedCount / totalRows) * 100,
            timestamp: new Date().toISOString()
          });
          setProcessingProgress((processedCount / totalRows) * 100);
        } catch (processError: any) {
          console.error('Processing failed for row:', data, processError);
          toast({
            variant: "destructive",
            title: "Processing error",
            description: `Failed to process row: ${data.filename || 'Unknown'}. ${processError?.message || 'Unknown error'}`
          });
          EventsStore.dispatchEvent('processing-error' as EventType, { 
            error: processError,
            timestamp: new Date().toISOString()
          });
        }
      }

      setIsProcessing(false);
      setProcessingProgress(100);
      EventsStore.dispatchEvent('processing-completed' as EventType, {
        timestamp: new Date().toISOString()
      });
      toast({
        title: "Processing complete",
        description: `Successfully processed ${processedCount} of ${totalRows} rows.`,
      });
    } catch (error: any) {
      console.error('Bulk processing failed:', error);
      setIsProcessing(false);
      EventsStore.dispatchEvent('processing-error' as EventType, { 
        error,
        timestamp: new Date().toISOString()
      });
      toast({
        variant: "destructive",
        title: "Processing error",
        description: error.message
      });
    }
  };

  const refreshData = async (force = false) => {
    try {
      toast({
        description: "Refreshing transcript data...",
      });
      const filter: BulkUploadFilter = { force };
      await refreshTranscripts(filter);
      toast({
        title: "Data refreshed",
        description: "Successfully refreshed transcript data.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Refresh error",
        description: error.message
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bulk Upload Transcripts</h1>

      <div className="mb-4">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          type="password"
          id="apiKey"
          placeholder="Enter API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="mb-4">
        <Label htmlFor="modelName">Model Name</Label>
        <Input
          type="text"
          id="modelName"
          placeholder="Enter Model Name"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          className="mt-1"
        />
      </div>

      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} mb-4 border-2 border-dashed p-6 rounded cursor-pointer text-center`}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Drop the files here ...</p> :
            <p>Drag 'n' drop some files here, or click to select files</p>
        }
      </div>

      {csvData.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Uploaded Data Preview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Filename</th>
                  <th className="py-2 px-4 border-b">Text</th>
                  <th className="py-2 px-4 border-b">Keywords</th>
                  <th className="py-2 px-4 border-b">Sentiment</th>
                  <th className="py-2 px-4 border-b">Call Score</th>
                  <th className="py-2 px-4 border-b">Duration</th>
                </tr>
              </thead>
              <tbody>
                {csvData.map((data, index) => (
                  <tr key={index}>
                    <td className="py-2 px-4 border-b">{data.filename}</td>
                    <td className="py-2 px-4 border-b">{data.text}</td>
                    <td className="py-2 px-4 border-b">{data.keywords}</td>
                    <td className="py-2 px-4 border-b">{data.sentiment}</td>
                    <td className="py-2 px-4 border-b">{data.call_score}</td>
                    <td className="py-2 px-4 border-b">{data.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {uploadProgress > 0 && isUploading && (
        <div className="mb-4">
          <Label>Upload Progress</Label>
          <Progress value={uploadProgress} />
          <p className="text-sm text-gray-500 mt-1">Uploading data to the server...</p>
        </div>
      )}

      {processingProgress > 0 && isProcessing && (
        <div className="mb-4">
          <Label>Processing Progress</Label>
          <Progress value={processingProgress} />
          <p className="text-sm text-gray-500 mt-1">Processing data on the server...</p>
        </div>
      )}

      <div className="flex gap-4">
        <Button onClick={uploadData} disabled={isUploading || isProcessing}>
          {isUploading ? 'Uploading...' : 'Upload Data'}
        </Button>
        <Button onClick={processData} disabled={isProcessing || isUploading}>
          {isProcessing ? 'Processing...' : 'Process Data'}
        </Button>
        <Button onClick={() => refreshData(true)}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default BulkUploadProcessor;
