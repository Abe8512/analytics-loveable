
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface OverviewCardProps {
  title: string;
  value: string;
  trend?: number;
  trendDirection?: 'up' | 'down';
  icon?: React.ReactNode;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  trend,
  trendDirection = 'up',
  icon
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon && (
          <div className="h-4 w-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend !== undefined && (
          <p className="flex items-center text-xs text-muted-foreground mt-1">
            {trendDirection === 'up' ? (
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
            )}
            <span className={`${trendDirection === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend}% from last month
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};
