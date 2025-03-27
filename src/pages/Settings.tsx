
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Key, Shield, User, Bell, Cpu, Database, CheckCircle2, XCircle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { getOpenAIKey, setOpenAIKey } from "@/services/WhisperService";
import ConnectionDiagnostics from '@/components/ui/ConnectionDiagnostics';
import DatabaseStatusDashboard from '@/components/ui/DatabaseStatusDashboard';
import { Progress } from "@/components/ui/progress";

const apiKeySchema = z.object({
  openaiKey: z.string().min(1, "API Key is required").startsWith("sk-", "OpenAI API keys start with 'sk-'"),
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const Settings = () => {
  const { toast } = useToast();
  const [savedKey, setSavedKey] = useState<string>("");
  const [keyStatus, setKeyStatus] = useState<'unknown' | 'checking' | 'valid' | 'invalid'>('unknown');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  
  useEffect(() => {
    const storedKey = getOpenAIKey();
    if (storedKey) {
      setSavedKey(storedKey);
      console.log('OpenAI API key found in settings:', storedKey.substring(0, 3) + '...');
      setKeyStatus('unknown');
    } else {
      console.log('No OpenAI API key found in settings');
      setKeyStatus('unknown');
    }
  }, []);

  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      openaiKey: "",
    }
  });

  const onSubmit = (values: ApiKeyFormValues) => {
    const { openaiKey } = values;
    
    setOpenAIKey(openaiKey);
    setSavedKey(openaiKey);
    
    console.log('API key saved:', openaiKey.substring(0, 3) + '...');
    
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved",
    });
    
    testApiKey(openaiKey);
    form.reset({ openaiKey: "" });
  };

  const clearApiKey = () => {
    setOpenAIKey('');
    setSavedKey('');
    setKeyStatus('unknown');
    toast({
      title: "API Key Cleared",
      description: "Your OpenAI API key has been removed",
    });
  };

  const testApiKey = async (key: string) => {
    if (!key) {
      toast({
        title: "No API Key",
        description: "Please provide an API key to test",
        variant: "destructive"
      });
      return;
    }

    setIsTestingKey(true);
    setKeyStatus('checking');
    setTestProgress(25);

    try {
      // Create a simple test request to OpenAI's models endpoint
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        }
      });

      setTestProgress(75);
      
      if (response.ok) {
        setKeyStatus('valid');
        toast({
          title: "API Key Valid",
          description: "Your OpenAI API key is working correctly",
        });
      } else {
        setKeyStatus('invalid');
        const error = await response.json();
        toast({
          title: "API Key Invalid",
          description: error.error?.message || "Your API key was rejected by OpenAI",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setKeyStatus('invalid');
      toast({
        title: "Connection Error",
        description: "Could not connect to OpenAI API to validate your key",
        variant: "destructive"
      });
    } finally {
      setTestProgress(100);
      setTimeout(() => {
        setIsTestingKey(false);
        setTestProgress(0);
      }, 500);
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Tabs defaultValue="api-keys">
            <TabsList className="mb-4">
              <TabsTrigger value="api-keys" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span>API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="integrations" className="flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                <span>Integrations</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span>Database</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api-keys">
              <Card>
                <CardHeader>
                  <CardTitle>OpenAI API Keys</CardTitle>
                  <CardDescription>
                    Configure your OpenAI API key for Whisper transcription and other AI features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {savedKey && (
                    <div className="p-4 bg-muted rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-sm">Current API Key</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm">
                              {savedKey.substring(0, 3)}...{savedKey.substring(savedKey.length - 4)}
                            </p>
                            {keyStatus === 'valid' && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {keyStatus === 'invalid' && (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            {keyStatus === 'checking' && (
                              <span className="text-xs text-muted-foreground">Checking...</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => testApiKey(savedKey)}
                            disabled={isTestingKey}
                          >
                            Test Key
                          </Button>
                          <Button variant="outline" size="sm" onClick={clearApiKey}>
                            Clear Key
                          </Button>
                        </div>
                      </div>
                      
                      {isTestingKey && (
                        <div className="mt-3">
                          <Progress value={testProgress} className="h-1" />
                          <p className="text-xs text-center mt-1">Testing API key...</p>
                        </div>
                      )}
                    </div>
                  )}

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="openaiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>OpenAI API Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="sk-..." {...field} />
                            </FormControl>
                            <FormDescription>
                              Your API key is stored locally and never sent to our servers.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Save API Key</Button>
                    </form>
                  </Form>
                  
                  <div className="mt-4 text-sm text-muted-foreground">
                    <p>Need help?</p>
                    <ul className="list-disc pl-5 mt-2">
                      <li>Make sure your OpenAI API key is valid and has access to the Whisper API</li>
                      <li>The API key should start with "sk-"</li>
                      <li>Ensure your OpenAI account has billing enabled</li>
                      <li>Check for any rate limits or usage restrictions on your OpenAI account</li>
                      <li>If issues persist, try the local Whisper option in the transcription settings</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Account settings will be implemented in a future update.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle>Database Status</CardTitle>
                  <CardDescription>
                    View the status of your database connection and tables
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DatabaseStatusDashboard />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Status</CardTitle>
                  <CardDescription>
                    View detailed information about your connection status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ConnectionDiagnostics />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
