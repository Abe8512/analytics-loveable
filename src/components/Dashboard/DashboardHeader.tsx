
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Upload, Filter, Download } from 'lucide-react';

interface DashboardHeaderProps {
  onBulkUploadOpen: () => void;
  refreshData: () => void;
  isDashboardScreen?: boolean;
  isRefreshing?: boolean;  // Added isRefreshing as an optional prop
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onBulkUploadOpen,
  refreshData,
  isDashboardScreen = false,
  isRefreshing = false  // Default to false if not provided
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <h1 className="text-2xl font-bold tracking-tight">
        {isDashboardScreen ? 'Dashboard' : 'Call Activity'}
      </h1>
      
      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData}
          disabled={isRefreshing}
          className="flex items-center gap-1 w-full sm:w-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
        
        <Button 
          variant="default"
          size="sm"
          onClick={onBulkUploadOpen}
          className="flex items-center gap-1 w-full sm:w-auto"
        >
          <Upload className="h-4 w-4" />
          Upload Calls
        </Button>
        
        {!isDashboardScreen && (
          <>
            <Button variant="outline" size="sm" className="flex items-center gap-1 w-full sm:w-auto">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1 w-full sm:w-auto">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
