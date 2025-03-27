
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { databaseDiagnosticService } from '@/services/DatabaseDiagnosticService';
import { RefreshCw, Database, ServerCrash } from 'lucide-react';

const DatabaseDiagnostic: React.FC = () => {
  const [results, setResults] = useState<string>('No diagnostic results yet.');
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const runDiagnostic = async () => {
    try {
      setIsRunning(true);
      setResults('Running diagnostic...');
      
      const diagnosticResults = await databaseDiagnosticService.runDiagnostic();
      setIsConnected(diagnosticResults.connected);
      
      const formattedResults = databaseDiagnosticService.formatResults(diagnosticResults);
      setResults(formattedResults);
    } catch (error) {
      setIsConnected(false);
      setResults(`Error running diagnostic: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Diagnostic error:', error);
    } finally {
      setIsRunning(false);
    }
  };
  
  useEffect(() => {
    runDiagnostic();
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          {isConnected === null ? (
            <Database className="mr-2 h-4 w-4" />
          ) : isConnected ? (
            <Database className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <ServerCrash className="mr-2 h-4 w-4 text-destructive" />
          )}
          Database Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-72">
          {results}
        </pre>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runDiagnostic} 
          disabled={isRunning}
          className="text-xs"
        >
          <RefreshCw className={`mr-1 h-3 w-3 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running...' : 'Run Diagnostic'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DatabaseDiagnostic;
