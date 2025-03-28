
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  InfoIcon
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface MetricCardProps {
  title: string;
  value: number | string;
  unit?: string;
  icon?: React.ReactNode;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
  tooltip?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  titleExtra?: React.ReactNode;
}

/**
 * Standardized MetricCard component for displaying metrics throughout the app
 */
const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit = '',
  icon,
  change,
  trend = 'neutral',
  isLoading = false,
  tooltip,
  className,
  size = 'md',
  onClick,
  titleExtra
}) => {
  // Size-specific classes
  const sizeClasses = {
    sm: {
      card: 'h-24',
      title: 'text-xs',
      value: 'text-xl'
    },
    md: {
      card: 'h-32',
      title: 'text-sm',
      value: 'text-3xl'
    },
    lg: {
      card: 'h-40',
      title: 'text-base',
      value: 'text-4xl'
    }
  };
  
  // Color classes for trend
  const trendColorClasses = {
    up: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    down: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300'
  };
  
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  
  return (
    <motion.div
      whileHover={{ y: -2, transition: { type: 'spring', stiffness: 400, damping: 10 } }}
      className={cn(onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <Card className={cn(
        'border border-border shadow-sm transition-all hover:shadow-md', 
        sizeClasses[size].card,
        className
      )}>
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className={cn(
                    "font-medium text-muted-foreground flex items-center gap-1",
                    sizeClasses[size].title
                  )}>
                    {icon && <span className="mr-1">{icon}</span>}
                    {title}
                    {tooltip && <InfoIcon className="h-3 w-3 opacity-70" />}
                  </span>
                </TooltipTrigger>
                {tooltip && (
                  <TooltipContent>
                    <p>{tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            
            {titleExtra}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col">
            {isLoading ? (
              <Skeleton className={cn('h-9 w-20', size === 'lg' && 'h-12 w-24')} />
            ) : (
              <span className={cn(
                "font-bold tracking-tight",
                sizeClasses[size].value
              )}>
                {value}{unit}
              </span>
            )}
            
            {!isLoading && change && (
              <div className="mt-1 flex items-center">
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1',
                  trendColorClasses[trend]
                )}>
                  <TrendIcon className="h-3 w-3" />
                  {change}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MetricCard;
