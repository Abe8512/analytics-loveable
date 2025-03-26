
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface ContentLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  skeletonCount?: number;
  height?: number;
}

const ContentLoader: React.FC<ContentLoaderProps> = ({ 
  isLoading, 
  children, 
  skeletonCount = 3,
  height = 150
}) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
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
