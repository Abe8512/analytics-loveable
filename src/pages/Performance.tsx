
import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Download, FileDown, Settings, CalendarRange, BarChart2 } from "lucide-react";
import PerformanceMetrics from "@/components/Dashboard/PerformanceMetrics";
import HistoricalTrends from "@/components/Performance/HistoricalTrends";
import GoalTracking from "@/components/Performance/GoalTracking";
import KeyMetricsTable from "@/components/Performance/KeyMetricsTable";
import ReportGenerator from "@/components/Performance/ReportGenerator";
import { useAuth } from "@/contexts/AuthContext";
import TeamFilter from "@/components/Performance/TeamFilter";
import LiveCallAnalysis from "@/components/Performance/LiveCallAnalysis";
import CustomScoring from "@/components/Performance/CustomScoring";
import AISimulator from "@/components/Performance/AISimulator";
import LearningPath from "@/components/Performance/LearningPath";
import { DateRangeFilter } from "@/components/CallAnalysis/DateRangeFilter";
import { useSharedFilters } from "@/contexts/SharedFilterContext";
import { useToast } from "@/hooks/use-toast";
import KeywordTrendsChart from "@/components/CallAnalysis/KeywordTrendsChart";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AdvancedCallMetrics from '@/components/CallAnalysis/AdvancedCallMetrics';

const Performance = () => {
  const { isManager, isAdmin } = useAuth();
  const { toast } = useToast();
  const { filters, updateDateRange } = useSharedFilters();
  const [activeTab, setActiveTab] = useState("trends");
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(true);
  
  const handleExport = () => {
    toast({
      title: "Report Exported",
      description: "Performance report has been downloaded",
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center bg-gradient-to-r from-purple-900/20 to-blue-900/20 dark:from-purple-900/30 dark:to-blue-900/30 p-4 md:p-6 rounded-lg shadow-md">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Performance Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track performance metrics and analyze trends over time.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <DateRangeFilter 
                dateRange={filters.dateRange} 
                setDateRange={updateDateRange}
              />
              <CalendarRange className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="gap-2">
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Export Performance Report</AlertDialogTitle>
                    <AlertDialogDescription>
                      Choose the format for your performance report export.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2" 
                      variant="outline"
                      onClick={handleExport}
                    >
                      <FileDown className="h-8 w-8" />
                      <span>PDF Report</span>
                    </Button>
                    <Button 
                      className="h-24 flex flex-col items-center justify-center gap-2" 
                      variant="outline"
                      onClick={handleExport}
                    >
                      <Download className="h-8 w-8" />
                      <span>CSV Data</span>
                    </Button>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button variant="outline" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
        
        {(isManager || isAdmin) && <TeamFilter />}
        
        <div className="grid grid-cols-1 gap-6">
          <PerformanceMetrics />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <KeywordTrendsChart />
            <KeyMetricsTable dateRange={filters.dateRange} />
          </div>
          
          <Tabs defaultValue="trends" value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="mb-6 w-full h-auto flex flex-wrap justify-start overflow-x-auto">
              <TabsTrigger value="trends">Historical Trends</TabsTrigger>
              <TabsTrigger value="goals">Goal Tracking</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="live-analysis">Live Call Analysis</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Metrics</TabsTrigger>
              {isManager && <TabsTrigger value="scoring">Scoring Criteria</TabsTrigger>}
              <TabsTrigger value="simulator">AI Simulator</TabsTrigger>
              <TabsTrigger value="learning">Learning Path</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trends">
              <HistoricalTrends dateRange={filters.dateRange} />
            </TabsContent>
            
            <TabsContent value="goals">
              <GoalTracking dateRange={filters.dateRange} />
            </TabsContent>
            
            <TabsContent value="reports">
              <ReportGenerator dateRange={filters.dateRange} />
            </TabsContent>
            
            <TabsContent value="live-analysis">
              <LiveCallAnalysis />
            </TabsContent>
            
            <TabsContent value="advanced">
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                          <BarChart2 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium">Advanced Call Analysis</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            AI-powered metrics that analyze conversation dynamics, sentiment patterns, and objection handling
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant={showAdvancedMetrics ? "default" : "outline"}
                        onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                        className="shrink-0"
                      >
                        {showAdvancedMetrics ? "Hide Metrics" : "Show Metrics"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {showAdvancedMetrics && (
                  <>
                    <AdvancedCallMetrics />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Team Talk Ratio Analysis</CardTitle>
                          <CardDescription>
                            Conversation balance across team members
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Select a date range and team to view team-wide metrics</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Objection Handling Comparison</CardTitle>
                          <CardDescription>
                            Compare objection handling across team members
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-center py-8 text-muted-foreground">
                            <p>Select a date range and team to view comparative metrics</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="scoring">
              <CustomScoring />
            </TabsContent>
            
            <TabsContent value="simulator">
              <AISimulator />
            </TabsContent>
            
            <TabsContent value="learning">
              <LearningPath />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Performance;
