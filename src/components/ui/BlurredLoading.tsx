
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BlurredLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerClass?: string;
  hideContentWhileLoading?: boolean;
}

const BlurredLoading: React.FC<BlurredLoadingProps> = ({
  isLoading,
  children,
  className,
  spinnerClass,
  hideContentWhileLoading = false,
}) => {
  return (
    <div className={cn('relative', className)}>
      {(!hideContentWhileLoading || !isLoading) && children}
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-[1px] z-10">
          <Loader2 className={cn("h-8 w-8 animate-spin text-primary", spinnerClass)} />
        </div>
      )}
    </div>
  );
};

export default BlurredLoading;
