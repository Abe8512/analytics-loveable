
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Database, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import RealtimeStatus from './RealtimeStatus';

interface TableStatus {
  name: string;
  exists: boolean;
  rowCount?: number;
  error?: string;
}

interface IndexStatus {
  name: string;
  exists: boolean;
  table: string;
  type: string;
}

const DatabaseStatusDashboard = () => {
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [indexes, setIndexes] = useState<IndexStatus[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  
  const requiredTables = [
    'call_transcripts',
    'calls',
    'team_members',
    'keyword_trends',
    'sentiment_trends',
    'call_metrics_summary',
    'rep_metrics_summary'
  ];
  
  useEffect(() => {
    checkDatabase();
  }, []);
  
  const checkDatabase = async () => {
    setIsLoading(true);
    
    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('call_transcripts')
        .select('id')
        .limit(1);
      
      if (error) {
        setConnectionStatus('error');
        throw error;
      }
      
      setConnectionStatus('connected');
      
      // Check tables
      const tableStatuses: TableStatus[] = [];
      
      for (const tableName of requiredTables) {
        try {
          // Use dynamic query to check if table exists
          const { count, error: countError } = await supabase
            .from(tableName as any) // Type assertion to handle strict type checking
            .select('*', { count: 'exact', head: true });
          
          tableStatuses.push({
            name: tableName,
            exists: !countError,
            rowCount: count || 0,
            error: countError?.message
          });
        } catch (tableError) {
          tableStatuses.push({
            name: tableName,
            exists: false,
            error: tableError instanceof Error ? tableError.message : 'Unknown error'
          });
        }
      }
      
      setTables(tableStatuses);
      
      // Check indexes using SQL function rather than direct query
      try {
        const indexSQL = `
          SELECT i.relname AS index_name, 
                 t.relname AS table_name,
                 am.amname AS index_type
          FROM pg_index idx
          JOIN pg_class i ON i.oid = idx.indexrelid
          JOIN pg_class t ON t.oid = idx.indrelid
          JOIN pg_am am ON am.oid = i.relam
          WHERE t.relname IN ('call_transcripts', 'calls', 'keyword_trends', 'sentiment_trends')
          ORDER BY t.relname, i.relname;
        `;
        
        const { data: indexData, error: indexError } = await supabase.rpc(
          'execute_sql_with_results',
          { query_text: indexSQL }
        );
        
        if (indexError) {
          console.error('Error fetching indexes:', indexError);
        } else if (Array.isArray(indexData)) {
          const formattedIndexes: IndexStatus[] = indexData.map((idx: any) => ({
            name: idx.index_name,
            table: idx.table_name,
            exists: true,
            type: idx.index_type
          }));
          
          setIndexes(formattedIndexes);
        }
      } catch (indexError) {
        console.error('Error checking indexes:', indexError);
      }
    } catch (error) {
      console.error('Database check error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <span>Database Status</span>
          <RefreshCw 
            className={`h-4 w-4 cursor-pointer ml-auto ${isLoading ? 'animate-spin' : ''}`} 
            onClick={() => !isLoading && checkDatabase()}
          />
        </CardTitle>
        <CardDescription>Current status of database connections and tables</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Connection:</span>
            {connectionStatus === 'connected' ? (
              <Badge variant="success" className="gap-1 font-normal">
                <CheckCircle className="h-3.5 w-3.5" />
                Connected
              </Badge>
            ) : connectionStatus === 'error' ? (
              <Badge variant="destructive" className="gap-1 font-normal">
                <XCircle className="h-3.5 w-3.5" />
                Connection Error
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 font-normal">
                <AlertTriangle className="h-3.5 w-3.5" />
                Checking...
              </Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Tables:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {tables.map(table => (
                <div key={table.name} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                  <span className="text-xs font-medium">{table.name}</span>
                  {table.exists ? (
                    <Badge variant="outline" className="gap-1 text-xs font-normal">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      {table.rowCount !== undefined ? `${table.rowCount} rows` : "OK"}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1 text-xs font-normal">
                      <XCircle className="h-3 w-3" />
                      Missing
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium">GIN Indexes:</h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {indexes.filter(idx => idx.type === 'gin').map(index => (
                <div key={index.name} className="flex items-center justify-between text-xs p-1.5 bg-muted/30 rounded">
                  <span className="font-mono">{index.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">{index.table}</span>
                    <Badge variant="outline" className="text-xs">{index.type}</Badge>
                  </div>
                </div>
              ))}
              {indexes.filter(idx => idx.type === 'gin').length === 0 && (
                <p className="text-xs text-muted-foreground">No GIN indexes found</p>
              )}
            </div>
          </div>
          
          <RealtimeStatus />
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseStatusDashboard;
