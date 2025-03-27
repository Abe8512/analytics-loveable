
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RealtimeTableStatus {
  name: string;
  enabled: boolean;
}

const RealtimeStatus = () => {
  const [tableStatus, setTableStatus] = useState<RealtimeTableStatus[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isEnabling, setIsEnabling] = useState(false);
  
  const coreTables = ['call_transcripts', 'calls', 'keyword_trends', 'sentiment_trends'];
  
  useEffect(() => {
    checkRealtimeStatus();
  }, []);
  
  const checkRealtimeStatus = async () => {
    setIsChecking(true);
    
    try {
      // Direct approach to check realtime status
      const statuses: RealtimeTableStatus[] = [];
      
      for (const table of coreTables) {
        try {
          const { data, error } = await supabase
            .from('pg_publication_tables')
            .select('*')
            .eq('tablename', table)
            .eq('pubname', 'supabase_realtime')
            .maybeSingle();
          
          statuses.push({
            name: table,
            enabled: !error && !!data
          });
        } catch (err) {
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
    } finally {
      setIsChecking(false);
    }
  };
  
  const enableRealtime = async (tableName: string) => {
    try {
      // Try to enable realtime with a direct SQL approach
      const { error } = await supabase.rpc('add_table_to_realtime_publication', {
        table_name: tableName
      });
      
      if (error) {
        console.error(`Error enabling realtime for ${tableName}:`, error);
        toast.error(`Failed to enable realtime for ${tableName}`);
        return false;
      }
      
      toast.success(`Enabled realtime for ${tableName}`);
      return true;
    } catch (error) {
      console.error(`Error enabling realtime for ${tableName}:`, error);
      return false;
    }
  };
  
  const handleEnableRealtime = async () => {
    setIsEnabling(true);
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
      toast.error("Failed to enable realtime", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsEnabling(false);
    }
  };
  
  return (
    <div className="space-y-2">
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
          disabled={isEnabling}
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
