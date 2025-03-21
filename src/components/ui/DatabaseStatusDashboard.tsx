
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Database
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const DatabaseStatusDashboard = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [tableCounts, setTableCounts] = useState<Record<string, number | null>>({});
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  
  // List of tables we want to check
  const expectedTables = ['call_transcripts', 'calls', 'team_members', 'keyword_trends', 'sentiment_trends'];
  
  useEffect(() => {
    async function checkConnection() {
      try {
        // Test connection by checking Supabase response
        const { data, error } = await supabase.from('calls').select('count', { count: 'exact', head: true });
        
        if (error) {
          console.error('Supabase connection check error:', error);
          setIsConnected(false);
        } else {
          setIsConnected(true);
          
          // Check table existence and record counts
          await Promise.all(
            expectedTables.map(async (tableName) => {
              try {
                // Use dynamic from method with string parameter safely
                // @ts-ignore - We'll handle errors in the catch block
                const { count, error } = await supabase.from(tableName).select('*', { count: 'exact', head: true });
                
                if (error) {
                  console.log(`Table ${tableName} check error:`, error);
                  setTableCounts(prev => ({ ...prev, [tableName]: null }));
                } else {
                  setTableCounts(prev => ({ ...prev, [tableName]: count }));
                }
              } catch (err) {
                console.error(`Error checking table ${tableName}:`, err);
                setTableCounts(prev => ({ ...prev, [tableName]: null }));
              }
            })
          );
        }
      } catch (error) {
        console.error('Database connection check error:', error);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkConnection();
  }, []);
  
  const getConnectionStatus = () => {
    if (loading) return 'Checking...';
    return isConnected ? 'Connected' : 'Disconnected';
  };
  
  const getTableStatus = (tableName: string) => {
    if (loading) {
      return (
        <div className="flex items-center">
          <Skeleton className="h-4 w-20" />
        </div>
      );
    }
    
    const count = tableCounts[tableName];
    
    if (count === null) {
      return (
        <div className="flex items-center text-destructive">
          <XCircle className="h-4 w-4 mr-1" />
          <span>Not found</span>
        </div>
      );
    }
    
    if (count === 0) {
      return (
        <div className="flex items-center text-yellow-500 dark:text-yellow-400">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>Empty</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-green-500 dark:text-green-400">
        <CheckCircle2 className="h-4 w-4 mr-1" />
        <span>{count} records</span>
      </div>
    );
  };
  
  const getConnectionBadge = () => {
    if (loading) return <Badge variant="outline">Checking...</Badge>;
    
    if (isConnected) {
      return <Badge variant="success" className="bg-green-500">Connected</Badge>;
    } else {
      return <Badge variant="destructive">Disconnected</Badge>;
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-primary" />
            <h3 className="text-lg font-medium">Database Status</h3>
          </div>
          {getConnectionBadge()}
        </div>
        
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 py-2 border-b border-border">
            <div className="font-medium">Connection</div>
            <div>{getConnectionStatus()}</div>
          </div>
          
          {expectedTables.map(tableName => (
            <div key={tableName} className="grid grid-cols-2 gap-2 py-2 border-b border-border">
              <div className="font-medium">{tableName}</div>
              <div>{getTableStatus(tableName)}</div>
            </div>
          ))}
        </div>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
          <CollapsibleTrigger asChild>
            <Button variant="outline" size="sm" className="w-full">
              {isOpen ? 'Hide Details' : 'Show Details'}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Database URL: {isConnected ? 'Valid configuration' : 'Invalid or missing'}</p>
              <p>Tables found: {Object.values(tableCounts).filter(count => count !== null).length} of {expectedTables.length}</p>
              <p>Schema version: 1.0</p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default DatabaseStatusDashboard;
