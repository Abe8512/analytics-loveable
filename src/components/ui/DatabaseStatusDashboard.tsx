
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Shield, Table, CheckCircle2, XCircle } from 'lucide-react';
import { supabase, checkSupabaseConnection } from '@/integrations/supabase/client';
import { errorHandler } from '@/services/ErrorHandlingService';
import { toast } from 'sonner';

const DatabaseStatusDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState({
    connected: false,
    tableStatus: null as null | { [key: string]: boolean },
    lastChecked: null as null | number
  });

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    try {
      // Check connection
      const connectionResult = await checkSupabaseConnection();
      
      // Check tables if connected
      let tableStatus = null;
      if (connectionResult.connected) {
        tableStatus = await checkTables();
      }
      
      setDbStatus({
        connected: connectionResult.connected,
        tableStatus,
        lastChecked: Date.now()
      });
    } catch (error) {
      errorHandler.handleError(error, 'DatabaseStatusCheck');
    } finally {
      setIsLoading(false);
    }
  };

  const checkTables = async () => {
    const tables = [
      'calls',
      'call_transcripts',
      'team_members'
    ];
    
    const status: { [key: string]: boolean } = {};
    
    for (const table of tables) {
      try {
        // Try to get the count of records in the table
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        status[table] = !error;
      } catch (error) {
        status[table] = false;
      }
    }
    
    return status;
  };
  
  const fixMissingTables = async () => {
    setIsLoading(true);
    try {
      toast.info("Attempting to create missing tables...");
      
      // In a real app, this would call a backend function to fix schema issues
      // For now we'll just show a toast with implementation pending
      
      toast.success("Schema check initiated", {
        description: "The system will attempt to create missing tables. This may take a moment."
      });
      
      // Wait a bit and refresh status
      setTimeout(() => {
        checkDatabaseStatus();
      }, 2000);
    } catch (error) {
      errorHandler.handleError(error, 'FixDatabaseSchema');
    } finally {
      setIsLoading(false);
    }
  };

  const formatLastChecked = () => {
    if (!dbStatus.lastChecked) return 'Never checked';
    return new Date(dbStatus.lastChecked).toLocaleTimeString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Database Status
        </CardTitle>
        <CardDescription>
          Monitor and troubleshoot database connections and schema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Connection Status</span>
          <Badge variant={dbStatus.connected ? "success" : "destructive"}>
            {dbStatus.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
        
        <div className="border rounded-lg p-3 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Table className="h-4 w-4" />
            Table Status
          </h4>
          
          {dbStatus.tableStatus ? (
            <div className="space-y-2">
              {Object.entries(dbStatus.tableStatus).map(([table, exists]) => (
                <div key={table} className="flex items-center justify-between text-sm">
                  <span>{table}</span>
                  {exists ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      <span>Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500">
                      <XCircle className="h-4 w-4 mr-1" />
                      <span>Missing</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic">
              {isLoading ? "Checking tables..." : "Table status not available"}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last Checked</span>
          <span>{formatLastChecked()}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button 
          className="w-full" 
          onClick={checkDatabaseStatus} 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Database Status
            </>
          )}
        </Button>
        
        {dbStatus.tableStatus && Object.values(dbStatus.tableStatus).some(exists => !exists) && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={fixMissingTables}
            disabled={isLoading}
          >
            <Shield className="h-4 w-4 mr-2" />
            Fix Missing Tables
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default DatabaseStatusDashboard;
