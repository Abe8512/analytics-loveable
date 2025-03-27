
import React from 'react';
import { Badge } from './badge';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DeltaType = 'increase' | 'decrease' | 'neutral';

export interface BadgeDeltaProps {
  deltaType: DeltaType;
  children: React.ReactNode;
  className?: string;
}

export function BadgeDelta({ deltaType, children, className }: BadgeDeltaProps) {
  const Icon = {
    increase: ArrowUpIcon,
    decrease: ArrowDownIcon,
    neutral: MinusIcon,
  }[deltaType];

  const badgeColorClass = {
    increase: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-500',
    decrease: 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-500',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-500',
  }[deltaType];

  return (
    <Badge variant="outline" className={cn("gap-1 px-2 font-normal", badgeColorClass, className)}>
      <Icon className="h-3.5 w-3.5" />
      {children}
    </Badge>
  );
}

export default BadgeDelta;
