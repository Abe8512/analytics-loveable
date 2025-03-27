
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, Database, RefreshCw } from "lucide-react";
import { databaseDiagnosticService } from '@/services/DatabaseDiagnosticService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';

const DatabaseDiagnostic = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [formattedResults, setFormattedResults] = useState<string>('');
  
  const runDiagnostic = async () => {
    setIsRunning(true);
    
    try {
      toast.info("Running database diagnostic...");
      const diagnosticResults = await databaseDiagnosticService.runDiagnostic();
      setResults(diagnosticResults);
      setFormattedResults(databaseDiagnosticService.formatResults(diagnosticResults));
      
      // Show toast based on results
      if (diagnosticResults.errors.length === 0) {
        toast.success("Database diagnostic completed successfully");
      } else {
        toast.warning(`Database diagnostic found ${diagnosticResults.errors.length} issues`);
      }
    } catch (error) {
      console.error('Error running diagnostic:', error);
      toast.error("Failed to run database diagnostic", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsRunning(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Diagnostic
          </CardTitle>
          <CardDescription>
            Run a comprehensive check of your database and upload functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={runDiagnostic} 
            disabled={isRunning}
            className="mb-4"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Diagnostic...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Database Diagnostic
              </>
            )}
          </Button>
          
          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Tables</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{results.tables.length}</p>
                    <p className="text-muted-foreground">Tables found</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Functions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{results.functions.length}</p>
                    <p className="text-muted-foreground">Functions found</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-4">
                    <CardTitle className="text-lg">Upload Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      {results.uploadPathWorkingCorrectly ? (
                        <>
                          <CheckCircle className="h-8 w-8 text-green-500 mr-2" />
                          <span className="text-xl">Working</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-8 w-8 text-red-500 mr-2" />
                          <span className="text-xl">Issues Found</span>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {results.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTitle>Issues Found</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 mt-2">
                      {results.errors.map((error: string, idx: number) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
              
              <Accordion type="single" collapsible>
                <AccordionItem value="tables">
                  <AccordionTrigger>Tables Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2 text-left text-sm font-medium">Table Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Columns</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Rows</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">RLS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {results.tables.map((table: any, idx: number) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                              <td className="px-4 py-2 text-sm">{table.tableName}</td>
                              <td className="px-4 py-2 text-sm">{table.columnCount}</td>
                              <td className="px-4 py-2 text-sm">{table.rowCount}</td>
                              <td className="px-4 py-2 text-sm">
                                {table.hasRLS ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Enabled
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                    Disabled
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="functions">
                  <AccordionTrigger>Functions Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-border">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2 text-left text-sm font-medium">Function Name</th>
                            <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {results.functions.map((func: any, idx: number) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                              <td className="px-4 py-2 text-sm">{func.functionName}</td>
                              <td className="px-4 py-2 text-sm">
                                {func.isWorking ? (
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    Working
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                    Not Working
                                  </Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="storage">
                  <AccordionTrigger>Storage Information</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Storage Buckets:</span> {results.storage.buckets.length}
                      </div>
                      <div>
                        <span className="font-medium">Files Stored:</span> {results.storage.fileCount}
                      </div>
                      <div>
                        <span className="font-medium">Buckets:</span>
                        <ul className="list-disc pl-5 mt-1">
                          {results.storage.buckets.map((bucket: string, idx: number) => (
                            <li key={idx}>{bucket}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="report">
                  <AccordionTrigger>Full Report</AccordionTrigger>
                  <AccordionContent>
                    <pre className="text-xs bg-muted p-4 rounded-md whitespace-pre-wrap">
                      {formattedResults}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatabaseDiagnostic;
