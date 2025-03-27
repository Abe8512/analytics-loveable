
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, User, BarChart } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTeamMetrics } from '@/services/RealTimeMetricsService';
import { useEventListener } from '@/services/EventsService';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const Index = () => {
  const { metrics, isLoading, error } = useTeamMetrics();
  const [latestCall, setLatestCall] = useState({
    agent: 'John Doe',
    customer: 'Acme Corp',
    duration: '5:30',
    sentiment: 'Positive',
  });

  useEventListener('CALL_UPDATED', (data: any) => {
    if (data && data.data) {
      setLatestCall(data.data);
    }
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div>Loading...</div>
                ) : error ? (
                  <div>Error: {error.message}</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team</TableHead>
                        <TableHead>Calls</TableHead>
                        <TableHead>Avg. Sentiment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.map((metric) => (
                        <TableRow key={metric.id}>
                          <TableCell>{metric.team_name}</TableCell>
                          <TableCell>{metric.call_count}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{metric.avg_sentiment}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Call</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" alt="Agent" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{latestCall.agent}</p>
                  <p className="text-xs text-muted-foreground">
                    {latestCall.customer}
                  </p>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{latestCall.duration}</span>
                  <Badge variant="outline">{latestCall.sentiment}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/call-activity">
                <Button className="w-full">
                  <User className="mr-2 h-4 w-4" />
                  Call Activity
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link to="/analytics">
                <Button className="w-full">
                  <BarChart className="mr-2 h-4 w-4" />
                  Analytics
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
              <Link to="/performance">
                <Button className="w-full">
                  <BarChart className="mr-2 h-4 w-4" />
                  Performance
                  <ArrowRight className="ml-auto h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Index;
