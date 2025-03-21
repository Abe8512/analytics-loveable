
import React, { useEffect, useState, useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { animationUtils } from "@/utils/animationUtils";

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
  formatter?: (value: number) => string;
}

const AnimatedNumber = memo(({
  value,
  duration = 1500, // Increased duration for smoother animations
  className,
  prefix = "",
  suffix = "",
  formatter = (val) => val.toString(),
}: AnimatedNumberProps) => {
  // Use floor to ensure consistent display without decimal jitter
  const targetValue = Math.floor(value);
  const [displayValue, setDisplayValue] = useState(targetValue);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(Date.now());
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef<number>(0);
  const lastValueRef = useRef<number>(targetValue);
  
  useEffect(() => {
    // Skip animation entirely for initial render to avoid flicker
    if (lastValueRef.current === 0 && targetValue !== 0) {
      setDisplayValue(targetValue);
      lastValueRef.current = targetValue;
      return;
    }
    
    // Skip tiny changes (less than 2 units difference)
    if (Math.abs(targetValue - lastValueRef.current) < 2) {
      setDisplayValue(targetValue);
      lastValueRef.current = targetValue;
      return;
    }
    
    // Debounce value changes to prevent rapid updates
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 800) { // Significantly increased debounce time
      // If changes are happening too quickly, just jump to the final value
      if (Math.abs(targetValue - lastValueRef.current) > 20) {
        setDisplayValue(targetValue);
        lastValueRef.current = targetValue;
      }
      return;
    }
    
    lastUpdateTimeRef.current = now;
    lastValueRef.current = targetValue;
    
    startTimeRef.current = Date.now();
    startValueRef.current = displayValue;
    
    const updateValue = () => {
      const now = Date.now();
      const elapsedTime = now - startTimeRef.current;
      
      if (elapsedTime < duration) {
        // Use easeOutQuart for smoother animation
        const progress = animationUtils.easeOutCubic(elapsedTime / duration);
        const newValue = startValueRef.current + ((targetValue - startValueRef.current) * progress);
        
        // Stabilize by using Math.floor to prevent decimal wobbling
        setDisplayValue(Math.floor(newValue));
        animationFrameRef.current = requestAnimationFrame(updateValue);
      } else {
        setDisplayValue(targetValue);
        animationFrameRef.current = null;
      }
    };
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(updateValue);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValue, duration, displayValue]);
  
  // Render with hardware acceleration to improve animation performance
  return (
    <span className={cn("font-medium transform-gpu", className)}>
      {prefix}{formatter(displayValue)}{suffix}
    </span>
  );
});

AnimatedNumber.displayName = "AnimatedNumber";

export default AnimatedNumber;
