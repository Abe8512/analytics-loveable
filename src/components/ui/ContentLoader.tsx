
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export interface ContentLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeletonCount?: number;
  height?: number;
  preserveHeight?: boolean;
  delay?: number;
}

const ContentLoader: React.FC<ContentLoaderProps> = ({ 
  isLoading, 
  children, 
  skeletonCount = 3,
  height = 150,
  preserveHeight = false,
  delay = 0
}) => {
  const [showLoader, setShowLoader] = React.useState(isLoading);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (delay && isLoading) {
      timeoutId = setTimeout(() => {
        setShowLoader(isLoading);
      }, delay);
    } else {
      setShowLoader(isLoading);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, delay]);

  if (showLoader) {
    return (
      <div className="space-y-2" style={preserveHeight ? {height: `${height}px`} : undefined}>
        {Array(skeletonCount).fill(0).map((_, index) => (
          <Skeleton 
            key={index} 
            className="w-full rounded-md" 
            style={{ height: `${height / skeletonCount}px` }}
          />
        ))}
      </div>
    );
  }
  
  return <>{children}</>;
};

export default ContentLoader;
