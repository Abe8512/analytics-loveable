
import React from 'react';
import { ArrowLeft, Clock, Download, ThumbsDown, ThumbsUp, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StoredTranscription } from '@/services/WhisperService';
import { format, parseISO } from 'date-fns';

interface TranscriptDetailProps {
  transcript: StoredTranscription;
  onClose: () => void;
  onDelete: () => void;
}

const TranscriptDetail: React.FC<TranscriptDetailProps> = ({ 
  transcript, 
  onClose, 
  onDelete 
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'negative':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
  };
  
  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onClose} className="p-0 h-auto">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to transcripts
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="text-red-500 hover:text-red-600"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <h3 className="text-xl font-semibold">
              {transcript.speakerName || 'Transcript'} {transcript.filename ? `- ${transcript.filename}` : ''} 
            </h3>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>
                  {/*Using type assertion since user_name might not exist*/}
                  {(transcript as any).user_name || 'Unknown agent'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {transcript.date ? formatDate(transcript.date) : 
                   (transcript as any).created_at ? formatDate((transcript as any).created_at) : 'Unknown date'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant="outline" 
              className={getSentimentColor(transcript.sentiment)}
            >
              {getSentimentIcon(transcript.sentiment)}
              <span className="ml-1">{transcript.sentiment || 'neutral'}</span>
            </Badge>
            
            <div className="flex items-center gap-2 text-sm">
              <span>Duration:</span>
              <span className="font-medium">{formatDuration(transcript.duration)}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {transcript.keywords && transcript.keywords.map((keyword, idx) => (
              <Badge key={idx} variant="secondary">
                {keyword}
              </Badge>
            ))}
          </div>
          
          <div className="p-4 bg-muted/50 rounded-md">
            <h4 className="font-medium mb-2">Transcript Text</h4>
            <p className="whitespace-pre-line">{transcript.text}</p>
          </div>
          
          {/* Using optional chaining and type assertion for metadata */}
          {(transcript as any)?.metadata && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Additional Information</h4>
                <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                  {JSON.stringify((transcript as any).metadata, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {transcript.call_score !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Call Score:</span>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-16 h-2 rounded-full ${
                    transcript.call_score >= 70 
                      ? 'bg-green-500' 
                      : transcript.call_score >= 50 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                ></div>
                <span>{transcript.call_score}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TranscriptDetail;
