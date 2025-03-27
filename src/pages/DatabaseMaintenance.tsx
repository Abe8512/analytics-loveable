
import React from 'react';
import { PageHeader } from "@/components/ui/page-header";
import { Database, Shield } from "lucide-react";
import DatabaseMaintenance from "@/components/DatabaseMaintenance";

const DatabaseMaintenancePage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <PageHeader
        title="Database Maintenance"
        description="Optimize and secure your database for production use"
        icon={<Database className="h-6 w-6" />}
      />
      
      <div className="grid grid-cols-1 gap-6">
        <DatabaseMaintenance />
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Production Readiness Guide</h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                Before deploying to production, ensure your database is properly secured by:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-400 list-disc list-inside">
                <li>Removing development-only RLS policies that grant public access</li>
                <li>Configuring proper Row Level Security (RLS) for all tables</li>
                <li>Setting up Realtime for tables that need live updates</li>
                <li>Cleaning up unnecessary backup tables to reduce database size</li>
                <li>Reviewing user access controls and permissions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseMaintenancePage;
