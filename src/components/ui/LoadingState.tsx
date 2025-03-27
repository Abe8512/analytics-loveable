
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  overlay?: boolean;
  spinnerClassName?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  loadingText = 'Loading...',
  children,
  className,
  size = 'md',
  overlay = false,
  spinnerClassName,
}) => {
  const spinnerSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  if (!isLoading) return <>{children}</>;

  if (!overlay) {
    return (
      <div className={cn('flex flex-col items-center justify-center p-4', className)}>
        <Loader2 className={cn('animate-spin text-primary', spinnerSize[size], spinnerClassName)} />
        {loadingText && <p className="text-sm text-muted-foreground mt-2">{loadingText}</p>}
      </div>
    );
  }

  return (
    <div className="relative">
      {children}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[1px] z-10">
        <Loader2 className={cn('animate-spin text-primary', spinnerSize[size], spinnerClassName)} />
        {loadingText && <p className="text-sm text-muted-foreground mt-2">{loadingText}</p>}
      </div>
    </div>
  );
};

export default LoadingState;
