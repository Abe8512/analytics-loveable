
import { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  description?: string; // Keep for backward compatibility
  icon?: ReactNode;
  action?: ReactNode;
}

export function PageHeader({ 
  title, 
  subtitle, 
  description, 
  icon, 
  action 
}: PageHeaderProps) {
  // Use subtitle if provided, otherwise fall back to description for backward compatibility
  const displayDescription = subtitle || description;
  
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {displayDescription && (
            <p className="text-sm text-muted-foreground mt-1">
              {displayDescription}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
