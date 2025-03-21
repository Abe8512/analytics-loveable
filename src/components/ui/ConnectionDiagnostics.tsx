
import React, { useState } from 'react';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';
import { errorHandler } from '@/services/ErrorHandlingService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, RefreshCw, Wifi, WifiOff, Check, X, AlertTriangle } from 'lucide-react';

const ConnectionDiagnostics: React.FC = () => {
  const { isConnected, checkConnection, lastChecked } = useConnectionStatus();
  const [isChecking, setIsChecking] = useState(false);
  const [latency, setLatency] = useState(errorHandler.networkLatency);
  
  const handleCheckConnection = async () => {
    setIsChecking(true);
    try {
      await checkConnection();
      setLatency(errorHandler.networkLatency);
    } finally {
      setIsChecking(false);
    }
  };
  
  const formatLastChecked = () => {
    if (!lastChecked) return 'Never';
    
    const diff = Date.now() - lastChecked;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} minutes ago`;
    } else {
      return new Date(lastChecked).toLocaleTimeString();
    }
  };
  
  const getLatencyColor = () => {
    if (!isConnected) return 'bg-gray-300';
    if (latency < 150) return 'bg-green-500';
    if (latency < 300) return 'bg-green-400';
    if (latency < 500) return 'bg-yellow-400';
    return 'bg-red-500';
  };
  
  const getLatencyPercentage = () => {
    if (!isConnected) return 0;
    if (latency === 0) return 0;
    
    // Scale from 0-1000ms to 0-100%
    const percentage = Math.min(100, Math.max(0, 100 - (latency / 10)));
    return percentage;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isConnected ? 
            <Wifi className="h-5 w-5 text-green-500" /> : 
            <WifiOff className="h-5 w-5 text-red-500" />
          }
          Connection Status
        </CardTitle>
        <CardDescription>
          Monitor and troubleshoot your connection to our servers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className={isConnected ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Checked</span>
            <span>{formatLastChecked()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network Latency</span>
            <span className="flex items-center gap-1">
              <Activity className="h-3.5 w-3.5" />
              {isConnected ? `${latency}ms` : "N/A"}
            </span>
          </div>
        </div>
        
        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Connection Quality</span>
            <span></span>
          </div>
          <Progress value={getLatencyPercentage()} className={`h-2 ${getLatencyColor()}`} />
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Connection Diagnostics</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between items-center py-1 border-b">
              <span>Browser Online</span>
              {navigator.onLine ? 
                <Check className="h-4 w-4 text-green-500" /> : 
                <X className="h-4 w-4 text-red-500" />
              }
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span>Database Connection</span>
              {isConnected ? 
                <Check className="h-4 w-4 text-green-500" /> : 
                <X className="h-4 w-4 text-red-500" />
              }
            </div>
            <div className="flex justify-between items-center py-1 border-b">
              <span>Data Synchronization</span>
              {isConnected ? 
                (latency > 500 ? 
                  <AlertTriangle className="h-4 w-4 text-yellow-500" /> : 
                  <Check className="h-4 w-4 text-green-500" />
                ) : 
                <X className="h-4 w-4 text-red-500" />
              }
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleCheckConnection} 
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Check Connection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectionDiagnostics;
