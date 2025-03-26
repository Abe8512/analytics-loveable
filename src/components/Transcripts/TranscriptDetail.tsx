
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Award, CheckCircle, Clock, MessageSquare, User, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { StoredTranscription } from '@/services/WhisperService';
import { cn } from '@/lib/utils';

export interface TranscriptDetailProps {
  transcript: StoredTranscription;
  onDelete?: () => void;
  onClose?: () => void;
}

const TranscriptDetail: React.FC<TranscriptDetailProps> = ({ transcript, onDelete, onClose }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };
  
  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const renderScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-200';
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-red-500';
  };
  
  const formatCreatedAt = (date?: string) => {
    if (!date) return 'Unknown date';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return 'Invalid date';
    }
  };
  
  // Use call_score instead of callScore to match the StoredTranscription type
  const renderScoreText = (score?: number) => {
    if (!score) return 'No score available';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs improvement';
  };
  
  return (
    <Dialog open={!!transcript} onOpenChange={() => onClose && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader className="relative mb-4">
          <DialogTitle className="text-xl">Call Transcript: {transcript.filename || 'Unknown'}</DialogTitle>
          <DialogDescription>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                <Clock className="h-3 w-3" />
                {formatDuration(transcript.duration)}
              </Badge>
              
              <Badge variant="outline" className={cn("flex items-center gap-1 px-2 py-1", getSentimentColor(transcript.sentiment))}>
                {getSentimentIcon(transcript.sentiment)}
                {transcript.sentiment || 'Unknown sentiment'}
              </Badge>
              
              {transcript.user_name && (
                <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
                  <User className="h-3 w-3" />
                  {transcript.user_name}
                </Badge>
              )}
              
              <span className="text-xs text-muted-foreground">
                {formatCreatedAt(transcript.created_at)}
              </span>
            </div>
          </DialogDescription>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-0 right-0" 
            onClick={() => onClose && onClose()}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Call Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {transcript.call_score || '-'}
              </div>
              <Progress value={transcript.call_score} className={cn("h-2", renderScoreColor(transcript.call_score))} />
              <div className="text-xs text-muted-foreground mt-1">
                {renderScoreText(transcript.call_score)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {transcript.keywords && transcript.keywords.length > 0 ? (
                  transcript.keywords.slice(0, 5).map((keyword, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No keywords detected</span>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex items-start space-x-2">
                <Award className="h-4 w-4 text-amber-500 mt-0.5" />
                <div className="text-xs">
                  {transcript.sentiment === 'positive' ? 
                    'Positive sentiment detected throughout the call.' : 
                    transcript.sentiment === 'negative' ?
                    'Negative sentiment detected, opportunity for improvement.' :
                    'Neutral tone maintained throughout the call.'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap mb-4 max-h-[300px] overflow-y-auto">
          {transcript.text || 'No transcript text available.'}
        </div>
        
        {transcript.metadata && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Additional Metadata</h4>
            <div className="bg-muted p-3 rounded-md text-xs">
              <pre className="whitespace-pre-wrap overflow-x-auto">
                {JSON.stringify(transcript.metadata, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <DialogFooter className="gap-2">
          {!showConfirmDelete ? (
            <>
              {onDelete && (
                <Button 
                  variant="destructive" 
                  onClick={() => setShowConfirmDelete(true)}
                >
                  Delete Transcript
                </Button>
              )}
              <Button onClick={() => onClose && onClose()}>Close</Button>
            </>
          ) : (
            <>
              <div className="text-sm text-red-500 mr-auto">
                Are you sure? This cannot be undone.
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  onDelete && onDelete();
                  setShowConfirmDelete(false);
                }}
              >
                Confirm Delete
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TranscriptDetail;
