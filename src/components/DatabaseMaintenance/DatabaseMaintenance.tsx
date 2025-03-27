
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle2, Database, Shield, Trash2, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createDatabaseFunctions } from '@/utils/createDatabaseFunctions';
import { cleanupTechnicalDebt } from '@/utils/cleanupTechnicalDebt';
import { configureRealtime } from '@/utils/configureRealtime';
import { createRLSFunctions } from '@/utils/createRLSFunctions';
import { secureRLSPolicies } from '@/utils/secureRLSPolicies';

const DatabaseMaintenance: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});

  const runMaintenance = async (task: string, operation: () => Promise<any>) => {
    setIsLoading(task);
    try {
      const result = await operation();
      setResults(prev => ({ ...prev, [task]: result }));
      toast({
        title: result.success ? 'Success' : 'Operation Completed',
        description: result.message,
        variant: result.success ? 'default' : 'destructive',
      });
    } catch (error) {
      console.error(`Error running ${task}:`, error);
      toast({
        title: 'Error',
        description: `Failed to run ${task}. See console for details.`,
        variant: 'destructive',
      });
      setResults(prev => ({ 
        ...prev, 
        [task]: { 
          success: false, 
          message: error instanceof Error ? error.message : 'Unknown error'
        } 
      }));
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          Database Maintenance
        </CardTitle>
        <CardDescription>
          Perform maintenance tasks to optimize and secure your database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Create Database Functions */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                Create Database Functions
              </CardTitle>
              <CardDescription className="text-xs">
                Create utility functions for database operations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Creates helper functions needed for RLS policies and Realtime configuration.
              </p>
              {results.createFunctions && (
                <div className={`text-sm p-2 rounded ${results.createFunctions.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {results.createFunctions.message}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => runMaintenance('createFunctions', createDatabaseFunctions)}
                disabled={isLoading !== null}
                className="w-full"
              >
                {isLoading === 'createFunctions' ? 'Creating...' : 'Create Functions'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Technical Debt Cleanup */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-amber-500" />
                Clean Technical Debt
              </CardTitle>
              <CardDescription className="text-xs">
                Remove unnecessary backup tables
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Removes redundant backup tables to streamline the database schema.
              </p>
              {results.cleanup && (
                <div className={`text-sm p-2 rounded ${results.cleanup.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p>{results.cleanup.message}</p>
                  {results.cleanup.tablesRemoved?.length > 0 && (
                    <div className="mt-1">
                      <p className="font-medium">Tables removed:</p>
                      <ul className="list-disc list-inside">
                        {results.cleanup.tablesRemoved.map((table: string) => (
                          <li key={table}>{table}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => runMaintenance('cleanup', cleanupTechnicalDebt)}
                disabled={isLoading !== null}
                className="w-full"
              >
                {isLoading === 'cleanup' ? 'Cleaning...' : 'Clean Tables'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Configure Realtime */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-500" />
                Configure Realtime
              </CardTitle>
              <CardDescription className="text-xs">
                Enable real-time updates for key tables
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">
                Configures tables for real-time updates to enable live features.
              </p>
              {results.realtime && (
                <div className={`text-sm p-2 rounded ${results.realtime.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <p>{results.realtime.message}</p>
                  {results.realtime.tablesConfigured?.length > 0 && (
                    <div className="mt-1">
                      <p className="font-medium">Tables configured:</p>
                      <ul className="list-disc list-inside">
                        {results.realtime.tablesConfigured.map((table: string) => (
                          <li key={table}>{table}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => runMaintenance('realtime', configureRealtime)}
                disabled={isLoading !== null}
                className="w-full"
              >
                {isLoading === 'realtime' ? 'Configuring...' : 'Configure Realtime'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Security Configuration Section */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-medium">Security Configuration</h3>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Warning: Production Security Settings</p>
                <p className="text-sm text-amber-700 mt-1">
                  The following actions will replace development-friendly RLS policies with production-ready ones.
                  This may impact your ability to access data as an anonymous user for testing purposes.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Create RLS Functions */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-500" />
                  Create RLS Functions
                </CardTitle>
                <CardDescription className="text-xs">
                  Step 1: Create RLS policy management functions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Creates database functions needed to update RLS policies.
                </p>
                {results.rlsFunctions && (
                  <div className={`text-sm p-2 rounded ${results.rlsFunctions.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {results.rlsFunctions.message}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => runMaintenance('rlsFunctions', createRLSFunctions)}
                  disabled={isLoading !== null}
                  className="w-full"
                >
                  {isLoading === 'rlsFunctions' ? 'Creating...' : 'Create Functions'}
                </Button>
              </CardFooter>
            </Card>
            
            {/* Secure RLS Policies */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  Secure RLS Policies
                </CardTitle>
                <CardDescription className="text-xs">
                  Step 2: Update RLS policies for production
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">
                  Replaces development RLS policies with secure production ones.
                </p>
                {results.rlsPolicies && (
                  <div className={`text-sm p-2 rounded ${results.rlsPolicies.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <p>{results.rlsPolicies.message}</p>
                    {results.rlsPolicies.updated?.length > 0 && (
                      <div className="mt-1">
                        <p className="font-medium">Tables updated:</p>
                        <ul className="list-disc list-inside">
                          {results.rlsPolicies.updated.map((table: string) => (
                            <li key={table}>{table}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button 
                  variant={results.rlsFunctions?.success ? "outline" : "ghost"}
                  size="sm" 
                  onClick={() => runMaintenance('rlsPolicies', secureRLSPolicies)}
                  disabled={isLoading !== null || !results.rlsFunctions?.success}
                  className="w-full"
                >
                  {isLoading === 'rlsPolicies' ? 'Securing...' : 'Secure Policies'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <p className="text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 inline-block mr-1 text-green-500" />
          These maintenance tasks help ensure your database is optimized, secure, and properly configured.
        </p>
      </CardFooter>
    </Card>
  );
};

export default DatabaseMaintenance;
