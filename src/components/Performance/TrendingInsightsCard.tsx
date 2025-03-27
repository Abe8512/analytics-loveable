
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InsightItem {
  id: string;
  title: string;
  value: string | number;
  change: number;
  isPositive: boolean;
  tooltip?: string;
}

interface TrendingInsightsCardProps {
  title: string;
  description?: string;
  insights: InsightItem[];
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

const TrendingInsightsCard: React.FC<TrendingInsightsCardProps> = ({
  title,
  description,
  insights,
  isLoading = false,
  error = null,
  className,
}) => {
  if (isLoading) {
    return (
      <Card className={cn("shadow-md", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("shadow-md", className)}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-md", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <div 
              key={insight.id} 
              className="p-4 bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  {insight.title}
                  {insight.tooltip && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-60 text-sm">{insight.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </h3>
                <div className={cn(
                  "flex items-center text-xs px-2 py-1 rounded-full",
                  insight.isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700",
                )}>
                  {insight.change > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{insight.change}%
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 mr-1" />
                      {insight.change}%
                    </>
                  )}
                </div>
              </div>
              <div className="text-2xl font-bold">{insight.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingInsightsCard;
