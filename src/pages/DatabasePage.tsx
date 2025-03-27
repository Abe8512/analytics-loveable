
import React from 'react';
import DatabaseDiagnostic from '@/components/DatabaseDiagnostic';
import DatabaseStatusDashboard from '@/components/ui/DatabaseStatusDashboard';
import { realtimeService } from '@/services/RealtimeService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const DatabasePage = () => {
  const handleEnableRealtime = async () => {
    try {
      toast.info("Enabling realtime for database tables...");
      const results = await realtimeService.enableRealtimeForAllTables();
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      
      if (failed === 0) {
        toast.success(`Realtime enabled for all ${successful} tables.`);
      } else {
        toast.warning(`Enabled realtime for ${successful} tables, ${failed} failed.`);
      }
    } catch (error) {
      toast.error("Failed to enable realtime", {
        description: error instanceof Error ? error.message : "Unknown error"
      });
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Database Management</h1>
      <p className="text-muted-foreground">
        Comprehensive tools to inspect, diagnose and manage your database configuration.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <DatabaseDiagnostic />
        </div>
        <div>
          <DatabaseStatusDashboard />
          
          <div className="mt-6">
            <Button 
              onClick={handleEnableRealtime}
              variant="outline"
              className="w-full"
            >
              Enable Realtime for Tables
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;
