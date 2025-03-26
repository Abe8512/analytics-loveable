
import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className,
  icon
}) => {
  return (
    <div className={cn('flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4', className)}>
      <div className="flex items-center gap-2">
        {icon && icon}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2 mt-2 sm:mt-0 ml-auto">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
