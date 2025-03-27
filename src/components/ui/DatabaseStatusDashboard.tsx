
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Database, Check, X, AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { realtimeService } from '@/services/RealtimeService';
import { toast } from 'sonner';

interface TableStatus {
  name: string;
  recordCount: number;
  hasRealtime: boolean;
  hasGinIndex: boolean;
}

export const DatabaseStatusDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  
  useEffect(() => {
    checkDatabaseStatus();
  }, []);
  
  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    
    try {
      // Check basic connection
      const { data: pingData, error: pingError } = await supabase
        .from('call_transcripts')
        .select('id')
        .limit(1);
        
      setDbConnected(!pingError);
      
      // Get table information
      const requiredTables = [
        'call_transcripts', 
        'calls', 
        'keyword_trends', 
        'sentiment_trends',
        'team_members',
        'call_metrics_summary',
        'rep_metrics_summary'
      ];
      
      const tableStatuses: TableStatus[] = [];
      
      for (const tableName of requiredTables) {
        try {
          // Count records
          const { count, error: countError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          // Check if table is in realtime publication
          const realtimeEnabled = await realtimeService.checkTableRealtimeStatus(tableName);
          
          // Check for GIN indexes (can't directly query this, so we'll estimate based on table name)
          const hasGinIndex = 
            tableName === 'call_transcripts' || 
            tableName === 'calls' || 
            tableName === 'call_metrics_summary' || 
            tableName === 'rep_metrics_summary';
          
          tableStatuses.push({
            name: tableName,
            recordCount: count || 0,
            hasRealtime: realtimeEnabled,
            hasGinIndex
          });
        } catch (tableError) {
          console.error(`Error checking table ${tableName}:`, tableError);
          tableStatuses.push({
            name: tableName,
            recordCount: 0,
            hasRealtime: false,
            hasGinIndex: false
          });
        }
      }
      
      setTables(tableStatuses);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error in database status check:', error);
      toast.error('Database status check failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    checkDatabaseStatus();
    toast.info('Refreshing database status...');
  };
  
  const enableRealtimeForAll = async () => {
    setIsRefreshing(true);
    try {
      const results = await realtimeService.enableRealtimeForAllTables();
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed === 0) {
        toast.success(`Realtime enabled for all ${successful} tables.`);
      } else {
        toast.warning(`Enabled realtime for ${successful} tables, ${failed} failed.`);
      }
      
      // Refresh status
      checkDatabaseStatus();
    } catch (error) {
      toast.error('Failed to enable realtime for tables', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg">Database Status</CardTitle>
          <CardDescription>
            System health and configuration
          </CardDescription>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                <span>Connection:</span>
              </div>
              {dbConnected === true ? (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Connected
                </Badge>
              ) : dbConnected === false ? (
                <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
                  <X className="h-3.5 w-3.5 mr-1" />
                  Disconnected
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
                  <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                  Unknown
                </Badge>
              )}
            </div>
            
            <Accordion type="single" collapsible defaultValue="tables">
              <AccordionItem value="tables">
                <AccordionTrigger>Tables Status</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {tables.map(table => (
                      <div key={table.name} className="flex items-center justify-between p-2 bg-muted/40 rounded">
                        <span className="font-mono text-sm">{table.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={`text-xs ${table.recordCount > 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                            {table.recordCount} records
                          </Badge>
                          
                          <Badge variant="outline" className={table.hasRealtime ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}>
                            {table.hasRealtime ? 'Realtime' : 'No Realtime'}
                          </Badge>
                          
                          <Badge variant="outline" className={table.hasGinIndex ? 'bg-purple-500/10 text-purple-500' : 'bg-gray-500/10 text-gray-500'}>
                            {table.hasGinIndex ? 'GIN Index' : 'No GIN Index'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-muted-foreground">
          {lastChecked ? `Last checked: ${lastChecked.toLocaleTimeString()}` : 'Not checked yet'}
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={enableRealtimeForAll}
          disabled={isRefreshing}
        >
          Enable Realtime for All Tables
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseStatusDashboard;
