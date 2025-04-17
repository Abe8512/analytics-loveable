
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Users } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  callVolume: number;
  successRate: number;
  avgSentiment: number;
}

interface TeamPerformanceMetricsProps {
  isLoading?: boolean;
}

const TeamPerformanceMetrics: React.FC<TeamPerformanceMetricsProps> = ({ isLoading = false }) => {
  // Mock data for team members
  const teamMembers: TeamMember[] = [
    { id: '1', name: 'Sarah Johnson', callVolume: 127, successRate: 78, avgSentiment: 0.82 },
    { id: '2', name: 'Michael Chen', callVolume: 98, successRate: 65, avgSentiment: 0.75 },
    { id: '3', name: 'Jessica Smith', callVolume: 112, successRate: 72, avgSentiment: 0.68 },
    { id: '4', name: 'David Wilson', callVolume: 85, successRate: 61, avgSentiment: 0.71 }
  ];

  // Format sentiment as percentage
  const formatSentiment = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  // Determine sentiment class based on value
  const getSentimentClass = (value: number): string => {
    if (value >= 0.7) return "text-green-600";
    if (value >= 0.5) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Team Performance
            </CardTitle>
            <CardDescription>
              Performance metrics for all sales representatives
            </CardDescription>
          </div>
          <Badge variant="outline" className="ml-2 bg-primary/10">
            <ArrowUpRight className="mr-1 h-3.5 w-3.5" />
            <span>Team View</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rep Name</TableHead>
                <TableHead>Call Volume</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Sentiment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.callVolume}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={member.successRate} className="h-2 w-24" />
                      <span className="text-sm">{member.successRate}%</span>
                    </div>
                  </TableCell>
                  <TableCell className={getSentimentClass(member.avgSentiment)}>
                    {formatSentiment(member.avgSentiment)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamPerformanceMetrics;
