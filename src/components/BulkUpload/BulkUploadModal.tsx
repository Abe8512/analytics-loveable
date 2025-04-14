import React, { useContext, useState, useRef, useEffect } from "react";
import { X, Upload, CheckCircle, Clock, AlertCircle, FileAudio, ToggleLeft, ToggleRight, UserPlus, Settings } from "lucide-react";
import { ThemeContext } from "@/App";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useWhisperService, getOpenAIKey, setOpenAIKey } from "@/services/WhisperService";
import { useBulkUploadService } from '@/hooks/useBulkUploadService';
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BulkUploadModal = ({ isOpen, onClose }: BulkUploadModalProps) => {
  const { isDarkMode } = useContext(ThemeContext);
  const { toast } = useToast();
  const whisperService = useWhisperService();
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [openAIKeyMissing, setOpenAIKeyMissing] = useState(false);
  const [useLocalWhisper, setUseLocalWhisperState] = useState(false);
  const [selectedRepId, setSelectedRepId] = useState<string>("");
  const [showApiSettings, setShowApiSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [managedUsers, setManagedUsers] = useState<any[]>([]);
  const bulkUploadService = useBulkUploadService();
  const { files, addFiles, processQueue, isProcessing } = bulkUploadService;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      const storedKey = getOpenAIKey();
      setOpenAIKeyMissing(!storedKey || storedKey.trim() === '');
      setApiKey(storedKey || '');
      
      setUseLocalWhisperState(whisperService.getUseLocalWhisper());
      
      if (user?.id && !selectedRepId) {
        setSelectedRepId(user.id);
      }
      
      fetchManagedUsers();
    }
  }, [isOpen, whisperService, user, selectedRepId]);
  
  const fetchManagedUsers = async () => {
    try {
      setManagedUsers([
        { id: 'user1', email: 'user1@example.com' },
        { id: 'user2', email: 'user2@example.com' }
      ]);
    } catch (error) {
      console.error('Error fetching managed users:', error);
    }
  };
  
  useEffect(() => {
    const handleUploadComplete = () => {
      toast({
        title: "Upload Complete",
        description: "All files have been processed successfully",
      });
    };
    
    const handleUploadError = (event: CustomEvent) => {
      if (event.detail?.error) {
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: event.detail.error.message || "Failed to upload audio file.",
        });
      }
    };
    
    window.addEventListener('upload-completed' as any, handleUploadComplete as EventListener);
    window.addEventListener('upload-error' as any, handleUploadError as EventListener);
    
    return () => {
      window.removeEventListener('upload-completed' as any, handleUploadComplete as EventListener);
      window.removeEventListener('upload-error' as any, handleUploadError as EventListener);
    };
  }, [toast]);
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    if (!useLocalWhisper && openAIKeyMissing) {
      toast({
        title: "API Key Required",
        description: "Please add your OpenAI API key in the settings tab or enable local Whisper",
        variant: "destructive",
      });
      setShowApiSettings(true);
      return;
    }
    
    const audioFiles = Array.from(fileList).filter(file => 
      file.type.includes('audio') || 
      file.name.toLowerCase().endsWith('.wav') ||
      file.name.toLowerCase().endsWith('.mp3') ||
      file.name.toLowerCase().endsWith('.m4a') ||
      file.name.toLowerCase().endsWith('.webm')
    );
    
    if (audioFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please upload audio files only (WAV, MP3, M4A, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedRepId) {
      bulkUploadService.setAssignedUserId(selectedRepId);
    }
    
    addFiles(audioFiles);
    
    toast({
      title: "Files Added",
      description: `${audioFiles.length} audio file(s) added to queue`,
    });
  };
  
  const toggleLocalWhisper = (checked: boolean) => {
    setUseLocalWhisperState(checked);
    whisperService.setUseLocalWhisper(checked);
    toast({
      title: checked ? "Local Whisper Enabled" : "OpenAI API Mode",
      description: checked 
        ? "Transcription will run locally in your browser" 
        : "Transcription will use the OpenAI API",
    });
  };

  const handleRepChange = (value: string) => {
    setSelectedRepId(value);
    bulkUploadService.setAssignedUserId(value);
    toast({
      title: "Sales Rep Selected",
      description: "All uploaded files will be assigned to this rep"
    });
  };
  
  const saveApiKey = () => {
    if (apiKey.trim()) {
      setOpenAIKey(apiKey.trim());
      setOpenAIKeyMissing(false);
      toast({
        title: "API Key Saved",
        description: "Your OpenAI API key has been saved"
      });
      setShowApiSettings(false);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid API Key",
        description: "Please enter a valid OpenAI API key"
      });
    }
  };
  
  const startProcessing = () => {
    if (files.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files",
        description: "Please add files to the queue first"
      });
      return;
    }
    
    if (!useLocalWhisper && openAIKeyMissing) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please add your OpenAI API key or enable local Whisper"
      });
      setShowApiSettings(true);
      return;
    }
    
    processQueue();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[600px] ${isDarkMode ? "bg-dark-purple border border-white/10" : "bg-white"}`}>
        <DialogHeader>
          <DialogTitle className={isDarkMode ? "text-white" : "text-gray-800"}>Bulk Upload Recordings</DialogTitle>
          <DialogDescription className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
            Upload multiple audio files for transcription and analysis with Whisper AI
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="upload" className="flex items-center gap-1.5">
              <Upload className="h-4 w-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5" onClick={() => setShowApiSettings(true)}>
              <Settings className="h-4 w-4" />
              API Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="grid grid-cols-1 gap-4 mb-2">
              <div className="space-y-2">
                <Label htmlFor="sales-rep-select" className="text-sm flex items-center">
                  <UserPlus className="h-4 w-4 mr-1" /> 
                  Assign Calls to Sales Rep
                </Label>
                
                <Select value={selectedRepId} onValueChange={handleRepChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a sales rep" />
                  </SelectTrigger>
                  <SelectContent>
                    {user && (
                      <SelectItem value={user.id}>
                        {user.email || 'Current User'} (You)
                      </SelectItem>
                    )}
                    
                    {managedUsers && managedUsers.length > 0 && (
                      managedUsers
                        .filter(rep => rep.id !== user?.id)
                        .map(rep => (
                          <SelectItem key={rep.id} value={rep.id}>
                            {rep.email}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="bulk-upload-local-whisper"
                  checked={useLocalWhisper}
                  onCheckedChange={toggleLocalWhisper}
                />
                <Label htmlFor="bulk-upload-local-whisper" className="text-sm">
                  {useLocalWhisper ? (
                    <span className="flex items-center">
                      <ToggleRight className="h-4 w-4 mr-1 text-green-500" /> 
                      Use Local Whisper (Browser-Based)
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <ToggleLeft className="h-4 w-4 mr-1 text-gray-500" /> 
                      Use OpenAI API {openAIKeyMissing && <Badge variant="destructive" className="ml-1 text-xs">API Key Missing</Badge>}
                    </span>
                  )}
                </Label>
              </div>
            </div>
            
            {openAIKeyMissing && !useLocalWhisper && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  OpenAI API key is required for API transcription. Please add your API key in the Settings tab or enable local Whisper.
                </p>
              </div>
            )}
            
            {useLocalWhisper && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Using local Whisper model. The first transcription may take longer as the model downloads.
                </p>
              </div>
            )}
            
            <div 
              className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive 
                  ? isDarkMode 
                    ? "border-purple-500 bg-purple-500/10" 
                    : "border-purple-500 bg-purple-500/5"
                  : isDarkMode
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-300 hover:border-gray-400"
              } transition-all cursor-pointer`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                ref={fileInputRef}
                id="fileInput" 
                type="file" 
                multiple 
                accept="audio/*,.wav,.mp3,.m4a,.webm" 
                className="hidden" 
                onChange={handleFileInputChange}
              />
              <Upload className={`mx-auto h-12 w-12 mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`} />
              <h3 className={`font-medium mb-1 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                Drop audio files here or click to browse
              </h3>
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                Supports WAV, MP3, M4A and other audio formats
              </p>
            </div>
            
            <div className="mt-4">
              {files.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Files to process ({files.length})</h3>
                  <div className="max-h-40 overflow-y-auto border rounded-md">
                    {files.map((file: BulkUploadFile) => (
                      <div key={file.id} className="flex items-center justify-between p-2 border-b last:border-b-0">
                        <div className="flex items-center gap-2">
                          <FileAudio className="h-4 w-4 text-gray-500" />
                          <span className="text-sm truncate">{file.file.name}</span>
                        </div>
                        <div>
                          {file.status === 'queued' && <Clock className="h-4 w-4 text-gray-500" />}
                          {file.status === 'uploading' || file.status === 'processing' && <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />}
                          {file.status === 'complete' && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {file.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            
              <div className="flex justify-between gap-3 mt-4">
                <Button 
                  variant="default"
                  className="flex-1" 
                  onClick={startProcessing}
                  disabled={isProcessing || files.length === 0}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    <>Start Processing</>
                  )}
                </Button>
                
                <DialogClose asChild>
                  <Button variant="outline" className={isDarkMode ? "text-white border-white/20" : ""}>
                    Close
                  </Button>
                </DialogClose>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <Label htmlFor="openai-key" className="text-sm mb-1 block">
                  OpenAI API Key
                </Label>
                <div className="flex space-x-2">
                  <Input
                    id="openai-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1"
                  />
                  <Button onClick={saveApiKey}>Save</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your API key is stored locally in your browser and never sent to our servers.
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">API Usage Notes</h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 list-disc list-inside">
                  <li>OpenAI charges based on audio duration and model used</li>
                  <li>For best results, ensure files are clear and less than 25MB</li>
                  <li>Enable local mode to avoid API costs (but with reduced quality)</li>
                </ul>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setShowApiSettings(false)}>Return to Upload</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;
