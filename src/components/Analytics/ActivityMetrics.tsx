
import React, { memo, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { PhoneCall, Mail, Calendar, Clock, ArrowUpRight, AlertCircle } from "lucide-react";
import ContentLoader from '../ui/ContentLoader';
import AnimatedNumber from '../ui/AnimatedNumber';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

// Demo data - will be replaced with real data when available
const responseRateData = [
  { name: 'Mon', rate: 42 },
  { name: 'Tue', rate: 38 },
  { name: 'Wed', rate: 45 },
  { name: 'Thu', rate: 39 },
  { name: 'Fri', rate: 35 },
  { name: 'Sat', rate: 28 },
  { name: 'Sun', rate: 25 }
];

const meetingsPerRepData = [
  { name: 'John', meetings: 14 },
  { name: 'Sarah', meetings: 19 },
  { name: 'Mike', meetings: 11 },
  { name: 'Emma', meetings: 22 },
  { name: 'David', meetings: 16 }
];

interface ActivityMetricsProps {
  isLoading?: boolean;
}

const ActivityMetrics = ({ isLoading: propsIsLoading = false }: ActivityMetricsProps) => {
  const [isLoading, setIsLoading] = useState(propsIsLoading);
  const [isUsingDemoData, setIsUsingDemoData] = useState(true);
  const [activityMetrics, setActivityMetrics] = useState({
    callToDemo: 8.2, // Example: Takes 8.2 calls on average to secure a demo
    demoToClose: 28, // Example: 28% of demos convert to sales
    emailResponseRate: 34, // Example: 34% email response rate
    followUpEffectiveness: 45, // Example: 45% conversion rate after follow-ups
  });
  
  useEffect(() => {
    const fetchActivityMetrics = async () => {
      try {
        console.log('Attempting to fetch activity metrics from Supabase...');
        setIsLoading(true);
        
        // Check if the table exists
        const { data: tableExists, error: tableCheckError } = await supabase
          .from('activity_metrics_summary')
          .select('count(*)')
          .limit(1);
          
        if (tableCheckError || !tableExists) {
          console.log('Activity metrics table not found or error:', tableCheckError);
          setIsUsingDemoData(true);
          return;
        }
        
        // Fetch actual metrics if table exists
        const { data, error } = await supabase
          .from('activity_metrics_summary')
          .select('*')
          .order('report_date', { ascending: false })
          .limit(1);
          
        if (error || !data || data.length === 0) {
          console.error('Error fetching activity metrics:', error);
          setIsUsingDemoData(true);
          return;
        }
        
        console.log('Successfully retrieved activity metrics:', data[0]);
        setActivityMetrics({
          callToDemo: data[0].call_to_demo_ratio || 8.2,
          demoToClose: data[0].demo_to_close_percentage || 28,
          emailResponseRate: data[0].email_response_rate || 34,
          followUpEffectiveness: data[0].follow_up_effectiveness || 45
        });
        setIsUsingDemoData(false);
      } catch (err) {
        console.error('Exception in fetchActivityMetrics:', err);
        setIsUsingDemoData(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchActivityMetrics();
  }, []);
  
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-blue-500" />
          Activity Metrics
        </CardTitle>
        <CardDescription>
          Sales activity performance indicators
          {isUsingDemoData && !isLoading && (
            <Alert variant="warning" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Using demo data. Real-time metrics will be available when the activity_metrics_summary database table is created.
              </AlertDescription>
            </Alert>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ContentLoader isLoading={isLoading} height={450} delay={500}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Call-to-Demo Ratio</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber 
                        value={activityMetrics.callToDemo} 
                        formatter={(val) => val.toFixed(1)}
                        suffix=" calls"
                      />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-blue-500/10">
                    <PhoneCall className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Demo-to-Close</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={activityMetrics.demoToClose} suffix="%" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-green-500/10">
                    <ArrowUpRight className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email Response Rate</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={activityMetrics.emailResponseRate} suffix="%" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-purple-500/10">
                    <Mail className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Follow-up Effectiveness</p>
                    <h4 className="text-2xl font-bold mt-1">
                      <AnimatedNumber value={activityMetrics.followUpEffectiveness} suffix="%" />
                    </h4>
                  </div>
                  <div className="p-2 rounded-full bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Email Response Rate by Day</h3>
              {isUsingDemoData && <p className="text-sm text-muted-foreground mb-2">Demo data shown</p>}
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={responseRateData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{ 
                      value: 'Response Rate (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' } 
                    }}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                    name="Response Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Meetings Per Rep</h3>
              {isUsingDemoData && <p className="text-sm text-muted-foreground mb-2">Demo data shown</p>}
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={meetingsPerRepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    label={{ 
                      value: 'Meetings', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle' } 
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="meetings" fill="#82ca9d" name="Meetings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ContentLoader>
      </CardContent>
    </Card>
  );
};

export default memo(ActivityMetrics);
