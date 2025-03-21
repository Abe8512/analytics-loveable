
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { animationUtils } from "@/utils/animationUtils";
import { useStableLoadingState } from "@/hooks/useStableLoadingState";

interface ContentLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  height?: string | number;
  width?: string | number;
  delay?: number; // Minimum loading time to prevent flashes
  skeletonCount?: number; // Number of skeleton items to show
  preserveHeight?: boolean; // Keep container height consistent during transitions
}

/**
 * An optimized component that shows a skeleton loading state and prevents content shifting
 */
const ContentLoader = memo(({
  isLoading,
  children,
  className,
  height = "auto",
  width = "100%",
  delay = 300,
  skeletonCount = 1,
  preserveHeight = true
}: ContentLoaderProps) => {
  // Use stable loading state to prevent flickers
  const stableLoading = useStableLoadingState(isLoading, delay);
  const [contentHeight, setContentHeight] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const initialRenderRef = useRef<boolean>(true);
  
  // Measure content height once it's available
  const updateContentHeight = useCallback(() => {
    if (preserveHeight && contentRef.current) {
      const newHeight = animationUtils.getStableHeight(contentRef.current);
      
      // Only update if height is valid and different enough from current
      if (newHeight > 10) {
        setContentHeight(prev => {
          // If initialRender or significant height change, update
          if (initialRenderRef.current || prev === null || Math.abs(newHeight - prev) >= 16) {
            initialRenderRef.current = false;
            return newHeight;
          }
          return prev;
        });
      }
    }
  }, [preserveHeight]);

  // Set up resize observer to update height when content changes
  useEffect(() => {
    if (preserveHeight && contentRef.current) {
      // Only measure height when not in loading state
      if (!stableLoading) {
        // Delay measurement to allow DOM to settle
        const timer = setTimeout(() => {
          updateContentHeight();
        }, 50);
        
        return () => clearTimeout(timer);
      }
      
      // Set up resize observer for dynamic content
      if (!resizeObserverRef.current && window.ResizeObserver) {
        resizeObserverRef.current = new ResizeObserver(
          animationUtils.throttle(() => updateContentHeight(), 100)
        );
        resizeObserverRef.current.observe(contentRef.current);
      }
      
      return () => {
        if (resizeObserverRef.current) {
          resizeObserverRef.current.disconnect();
          resizeObserverRef.current = null;
        }
      };
    }
  }, [preserveHeight, stableLoading, updateContentHeight]);
  
  // Calculate container style with stable height if needed
  const containerStyle: React.CSSProperties = {
    width,
    // Fixed height based on contentHeight or minimum height prop
    height: preserveHeight && contentHeight ? contentHeight : 
      (typeof height === 'number' ? `${height}px` : height),
    minHeight: typeof height === 'number' ? `${height}px` : 
      height !== 'auto' ? height : undefined,
    // Use flex to center content
    display: 'flex',
    flexDirection: 'column',
    // Only add transition when content is already measured
    transition: contentHeight ? 'height 0.3s ease-out' : undefined
  };
  
  // Generate skeleton items with optimized rendering
  const renderSkeletons = useCallback(() => {
    return Array.from({ length: skeletonCount }).map((_, i) => {
      const skeletonHeight = typeof height === 'number' 
        ? Math.max(60, Math.floor((height / skeletonCount) - 12))
        : 60;
        
      return (
        <Skeleton 
          key={i} 
          className={`mb-3 rounded-md`}
          style={{ height: `${skeletonHeight}px` }}
        />
      );
    });
  }, [skeletonCount, height]);
  
  // Optimize the transition between states
  return (
    <div className={cn("relative", className)} style={containerStyle}>
      {stableLoading && (
        <div 
          className="absolute top-0 left-0 w-full h-full transition-opacity duration-300 space-y-3 p-1"
          style={{ opacity: 1 }}
        >
          {renderSkeletons()}
        </div>
      )}
      
      <div 
        ref={contentRef}
        className={cn(
          "flex-1 w-full transition-opacity duration-300 transform-gpu",
          stableLoading ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
      >
        {children}
      </div>
    </div>
  );
});

ContentLoader.displayName = "ContentLoader";

export default ContentLoader;
