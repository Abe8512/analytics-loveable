
import React from 'react';
import DatabaseDiagnostic from '@/components/DatabaseDiagnostic';

const DatabasePage = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Database Management</h1>
      <p className="text-muted-foreground">
        Comprehensive tools to inspect, diagnose and manage your database configuration.
      </p>
      
      <DatabaseDiagnostic />
    </div>
  );
};

export default DatabasePage;
