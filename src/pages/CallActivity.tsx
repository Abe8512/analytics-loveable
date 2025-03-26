
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RecentCallsTable } from '@/components/CallActivity/RecentCallsTable';
import { RepPerformanceCards } from '@/components/CallActivity/RepPerformanceCards';
import { CallOutcomeStats } from '@/components/CallActivity/CallOutcomeStats';
import { TeamPerformanceOverview } from '@/components/CallActivity/TeamPerformanceOverview';
import { TeamPerformanceComparison } from '@/components/Team/TeamPerformanceComparison';
import LiveCallAnalysis from '@/components/Performance/LiveCallAnalysis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUp, Filter, MoreHorizontal, Phone, Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useRealTimeTeamMetrics } from '@/services/RealTimeMetricsService';
import { useSharedFilters } from '@/contexts/SharedFilterContext';
import DateRangeFilter from '@/components/CallAnalysis/DateRangeFilter';
import { keywordAnalysisService } from '@/services/KeywordAnalysisService';
import BulkUploadModal from '@/components/BulkUpload/BulkUploadModal';
import CallTranscript from '@/components/CallAnalysis/CallTranscript';

const CallActivity = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [selectedCall, setSelectedCall] = useState<string | null>(null);
  const { filters } = useSharedFilters();
  
  const [teamMetrics, loading] = useRealTimeTeamMetrics(filters);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset selected call when switching tabs
    setSelectedCall(null);
  };
  
  return (
    <DashboardLayout>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Call Activity</h1>
            <p className="text-muted-foreground mt-1">Monitor and analyze sales team call performance</p>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm"
              className="gap-2 w-full sm:w-auto"
              onClick={() => setShowBulkUpload(true)}
            >
              <FileUp className="h-4 w-4" />
              <span className="hidden sm:inline">Bulk Upload</span>
              <span className="sm:hidden">Upload</span>
            </Button>
            
            <BulkUploadModal 
              isOpen={showBulkUpload} 
              onClose={() => setShowBulkUpload(false)} 
            />
            
            <Button variant="default" size="sm" className="gap-2 w-full sm:w-auto">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">New Call</span>
              <span className="sm:hidden">Call</span>
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className={`md:col-span-${selectedCall ? '2' : '4'}`}>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="w-full bg-background/80 backdrop-blur-md">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="team">Team Performance</TabsTrigger>
                <TabsTrigger value="recordings">Call Recordings</TabsTrigger>
                <TabsTrigger value="live">Live Analysis</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center justify-between my-4">
                <div className="flex items-center gap-2">
                  <DateRangeFilter />
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filters</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                      <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <div className="p-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Checkbox id="filter-positive" />
                            <label htmlFor="filter-positive" className="text-sm">Positive Sentiment</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="filter-negative" />
                            <label htmlFor="filter-negative" className="text-sm">Negative Sentiment</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="filter-short" />
                            <label htmlFor="filter-short" className="text-sm">Short Calls (&lt; 3 min)</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox id="filter-long" />
                            <label htmlFor="filter-long" className="text-sm">Long Calls (&gt; 10 min)</label>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="search" 
                    placeholder="Search calls..." 
                    className="w-[200px] pl-8 h-9"
                  />
                </div>
              </div>
              
              <TabsContent value="overview" className="space-y-6">
                <TeamPerformanceOverview 
                  teamMetrics={teamMetrics} 
                  teamMetricsLoading={loading}
                  callsLength={0}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <RecentCallsTable 
                      onCallSelect={setSelectedCall} 
                      selectedCallId={selectedCall}
                    />
                  </div>
                  <div>
                    <CallOutcomeStats />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="team" className="space-y-6">
                <RepPerformanceCards />
                <TeamPerformanceComparison />
              </TabsContent>
              
              <TabsContent value="recordings" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Recent Recordings</h3>
                  <Button size="sm" variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Upload Recording</span>
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Card 
                      key={index} 
                      className={`cursor-pointer hover:bg-accent/50 ${selectedCall === `recording-${index}` ? 'border-primary' : ''}`}
                      onClick={() => setSelectedCall(`recording-${index}`)}
                    >
                      <CardHeader className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">Call with Client {index + 1}</CardTitle>
                            <CardDescription>
                              {`${index % 2 === 0 ? 'Alex Johnson' : 'Sam Wilson'} • ${5 + index}:${(30 + index * 10).toString().padStart(2, '0')}`}
                            </CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Download Audio</DropdownMenuItem>
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="live" className="space-y-6">
                <LiveCallAnalysis />
              </TabsContent>
            </Tabs>
          </div>
          
          {selectedCall && (
            <div className="md:col-span-2 h-[calc(100vh-14rem)] border rounded-md overflow-hidden">
              <CallTranscript />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CallActivity;
