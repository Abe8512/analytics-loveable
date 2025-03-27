
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RealtimeTableStatus {
  name: string;
  enabled: boolean;
}

const RealtimeStatus = () => {
  const [tableStatus, setTableStatus] = useState<RealtimeTableStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const coreTables = ['call_transcripts', 'calls', 'keyword_trends', 'sentiment_trends'];
  
  useEffect(() => {
    checkRealtimeStatus();
  }, []);
  
  const checkRealtimeStatus = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      // Use RPC instead of direct table access
      const statuses: RealtimeTableStatus[] = [];
      
      for (const table of coreTables) {
        try {
          // Use the RPC function for checking
          const { data, error } = await supabase
            .rpc('check_table_in_publication', { 
              table_name: table,
              publication_name: 'supabase_realtime'
            });
          
          statuses.push({
            name: table,
            enabled: !error && !!data
          });
        } catch (err) {
          console.error(`Error checking realtime status for ${table}:`, err);
          // Fallback to assume it's not enabled if we can't check
          statuses.push({
            name: table,
            enabled: false
          });
        }
      }
      
      setTableStatus(statuses);
    } catch (error) {
      console.error('Error checking realtime status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error checking realtime status';
      setError(errorMessage);
    } finally {
      setIsChecking(false);
    }
  };
  
  const enableRealtime = async (tableName: string) => {
    try {
      console.log(`Attempting to enable realtime for ${tableName}`);
      
      // Use the RPC function
      const { error } = await supabase.rpc('add_table_to_realtime_publication', {
        table_name: tableName
      });
      
      if (error) {
        console.error(`Error enabling realtime for ${tableName}:`, error);
        toast.error(`Failed to enable realtime for ${tableName}`, {
          description: error.message
        });
        return false;
      }
      
      toast.success(`Enabled realtime for ${tableName}`);
      return true;
    } catch (error) {
      console.error(`Error enabling realtime for ${tableName}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error enabling realtime';
      toast.error(`Failed to enable realtime for ${tableName}`, {
        description: errorMessage
      });
      return false;
    }
  };
  
  const handleEnableRealtime = async () => {
    setIsEnabling(true);
    setError(null);
    toast.info("Enabling realtime for all tables...");
    
    try {
      const results = [];
      
      // Try to enable for each table that isn't already enabled
      for (const table of tableStatus) {
        if (!table.enabled) {
          const success = await enableRealtime(table.name);
          results.push({ table: table.name, success });
        } else {
          results.push({ table: table.name, success: true });
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed === 0) {
        toast.success(`Realtime enabled for all ${successful} tables.`);
      } else {
        toast.warning(`Enabled realtime for ${successful} tables, ${failed} failed.`);
      }
      
      await checkRealtimeStatus();
    } catch (error) {
      console.error('Error enabling realtime:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
      toast.error("Failed to enable realtime", {
        description: errorMessage
      });
    } finally {
      setIsEnabling(false);
    }
  };
  
  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Realtime Status:</h4>
        <RefreshCw 
          className={`h-3.5 w-3.5 cursor-pointer ${isChecking ? 'animate-spin' : ''}`} 
          onClick={() => !isChecking && checkRealtimeStatus()}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {tableStatus.map(table => (
          <div 
            key={table.name} 
            className="flex items-center justify-between text-xs p-1.5 bg-muted/30 rounded"
          >
            <span>{table.name}</span>
            {table.enabled ? (
              <Badge variant="success" className="gap-1 text-xs font-normal">
                <CheckCircle className="h-3 w-3" />
                Enabled
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1 text-xs font-normal">
                <XCircle className="h-3 w-3" />
                Disabled
              </Badge>
            )}
          </div>
        ))}
      </div>
      
      {tableStatus.some(t => !t.enabled) && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full text-xs h-8" 
          onClick={handleEnableRealtime}
          disabled={isEnabling || isChecking}
        >
          {isEnabling ? (
            <>
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Enabling...
            </>
          ) : (
            'Enable Realtime for All Tables'
          )}
        </Button>
      )}
    </div>
  );
};

export default RealtimeStatus;
