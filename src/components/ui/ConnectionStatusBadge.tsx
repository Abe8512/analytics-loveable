
import React from 'react';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNetworkLatency } from '@/hooks/useNetworkLatency';

interface ConnectionStatusBadgeProps {
  className?: string;
  showLatency?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ConnectionStatusBadge: React.FC<ConnectionStatusBadgeProps> = ({
  className,
  showLatency = false,
  size = 'md',
}) => {
  const { isConnected, checkConnection } = useConnectionStatus();
  const { networkLatency } = useNetworkLatency();
  
  // Determine icon and status text based on connection state
  const statusIcon = isConnected ? <Wifi className="h-full w-full" /> : <WifiOff className="h-full w-full" />;
  const statusText = isConnected ? 'Online' : 'Offline';
  
  // Determine connection quality based on latency
  const getConnectionQuality = () => {
    if (!isConnected) return 'Offline';
    if (networkLatency === 0) return 'Unknown';
    if (networkLatency < 150) return 'Excellent';
    if (networkLatency < 300) return 'Good';
    if (networkLatency < 600) return 'Fair';
    return 'Poor';
  };
  
  // Icon sizes based on prop
  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };
  
  // Text sizes based on prop
  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'flex items-center gap-1.5 rounded px-2 py-1 cursor-pointer transition-colors',
              isConnected ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500',
              className
            )}
            onClick={() => checkConnection()}
          >
            <div className={iconSizes[size]}>
              {statusIcon}
            </div>
            <span className={cn('font-medium', textSizes[size])}>
              {statusText}
            </span>
            {showLatency && isConnected && networkLatency > 0 && (
              <div className="flex items-center gap-1">
                <Activity className={cn('text-yellow-500', iconSizes[size])} />
                <span className={cn('text-yellow-500', textSizes[size])}>
                  {networkLatency}ms
                </span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-semibold">
              {isConnected ? `Connected (${getConnectionQuality()})` : 'Disconnected'}
            </p>
            {isConnected && (
              <p>Latency: {networkLatency}ms</p>
            )}
            <p className="text-muted-foreground italic">Click to check connection</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ConnectionStatusBadge;
