
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';
import { Wifi, WifiOff } from 'lucide-react';

/**
 * Component that monitors connection status and shows toast notifications
 * when connection status changes. This should be mounted at the application root.
 */
const ConnectionMonitor: React.FC = () => {
  const { isConnected } = useConnectionStatus();
  
  // Track previous connection state to detect changes
  const prevConnectedRef = React.useRef<boolean | null>(null);
  
  useEffect(() => {
    // Only show notifications for state changes, not initial state
    if (prevConnectedRef.current !== null && prevConnectedRef.current !== isConnected) {
      if (isConnected) {
        toast.success('Connection restored', {
          description: 'You are now back online. Data will be synced.',
          icon: <Wifi className="h-4 w-4 text-green-500" />,
          duration: 3000,
        });
      } else {
        toast.error('Connection lost', {
          description: 'You are currently offline. Some features may be unavailable.',
          icon: <WifiOff className="h-4 w-4 text-red-500" />,
          duration: 5000,
        });
      }
    }
    
    // Update the previous state reference
    prevConnectedRef.current = isConnected;
  }, [isConnected]);
  
  // This component doesn't render anything visible
  return null;
};

export default ConnectionMonitor;
