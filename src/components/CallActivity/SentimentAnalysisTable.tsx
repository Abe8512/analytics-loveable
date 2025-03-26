
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { useSentimentTrends, SentimentRecord } from "@/services/SentimentAnalysisService";
import ContentLoader from "@/components/ui/ContentLoader";

interface SentimentAnalysisTableProps {
  limit?: number;
}

const SentimentAnalysisTable: React.FC<SentimentAnalysisTableProps> = ({ limit = 10 }) => {
  const { sentimentTrends, loading } = useSentimentTrends();
  const [displayRecords, setDisplayRecords] = useState<SentimentRecord[]>([]);
  
  useEffect(() => {
    if (sentimentTrends && sentimentTrends.length > 0) {
      setDisplayRecords(sentimentTrends.slice(0, limit));
    }
  }, [sentimentTrends, limit]);
  
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };
  
  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };
  
  const getSentimentClass = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/10 text-green-500';
      case 'negative':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-blue-500/10 text-blue-500';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Analysis</CardTitle>
        <CardDescription>
          Analysis of sentiment across recorded calls
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContentLoader isLoading={loading} skeletonCount={5} height={300}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      <p>Loading sentiment data...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : displayRecords.length > 0 ? (
                displayRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.recorded_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(record.sentiment_label)}
                        <Badge variant="outline" className={getSentimentClass(record.sentiment_label)}>
                          {record.sentiment_label.charAt(0).toUpperCase() + record.sentiment_label.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div 
                          className={`h-2 rounded-full ${
                            record.sentiment_label === 'positive' ? 'bg-green-500' : 
                            record.sentiment_label === 'negative' ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${record.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {Math.round(record.confidence * 100)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <a 
                        href="#" 
                        className="text-sm text-primary hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          // View sentiment details - to be implemented
                          console.log(`View sentiment record: ${record.id}`);
                        }}
                      >
                        View Details
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <p className="text-muted-foreground">No sentiment records found</p>
                    <p className="text-sm mt-1">Start analyzing calls to see sentiment data</p>
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
