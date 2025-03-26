
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { useSentimentTrends } from '@/services/SentimentAnalysisService';
import { Badge } from '@/components/ui/badge';
import ContentLoader from '@/components/ui/ContentLoader';

interface SentimentAnalysisTableProps {
  limit?: number;
}

const SentimentAnalysisTable: React.FC<SentimentAnalysisTableProps> = ({ limit = 5 }) => {
  const { sentimentTrends, loading } = useSentimentTrends();
  
  const getSentimentIcon = (label: string) => {
    switch(label) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getSentimentColor = (label: string) => {
    switch(label) {
      case 'positive':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'negative':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           ' at ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
        <CardDescription>Recent call sentiment trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ContentLoader isLoading={loading} skeletonCount={3} height={200}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Confidence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sentimentTrends.slice(0, limit).map((trend, index) => (
                <TableRow key={index}>
                  <TableCell className="text-sm">
                    {formatDate(trend.recorded_at)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`flex items-center gap-1 ${getSentimentColor(trend.sentiment_label)}`}
                    >
                      {getSentimentIcon(trend.sentiment_label)}
                      <span>{trend.sentiment_label}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            trend.sentiment_label === 'positive' ? 'bg-green-500' : 
                            trend.sentiment_label === 'negative' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${trend.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span>{Math.round(trend.confidence * 100)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {sentimentTrends.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    <p className="text-muted-foreground">No sentiment data available</p>
                    <p className="text-sm mt-1">Add more calls to generate sentiment analysis</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ContentLoader>
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysisTable;
