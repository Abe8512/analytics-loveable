
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Check, X, AlertCircle } from 'lucide-react';
import { ObjectionHandlingMetrics } from '@/services/AdvancedMetricsService';
import { Progress } from '@/components/ui/progress';

interface ObjectionHandlingCardProps {
  metrics: ObjectionHandlingMetrics;
  isLoading?: boolean;
}

const ObjectionHandlingCard: React.FC<ObjectionHandlingCardProps> = ({ 
  metrics, 
  isLoading = false 
}) => {
  // Format time in minutes and seconds
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate effectiveness rating
  const getEffectivenessRating = () => {
    const score = metrics.effectiveness;
    
    if (score === 0 && metrics.total_objections === 0) {
      return { label: 'No Objections', color: 'text-gray-500', bgColor: 'bg-gray-100' };
    }
    if (score >= 0.8) {
      return { label: 'Excellent', color: 'text-green-700', bgColor: 'bg-green-100' };
    }
    if (score >= 0.6) {
      return { label: 'Good', color: 'text-blue-700', bgColor: 'bg-blue-100' };
    }
    if (score >= 0.4) {
      return { label: 'Average', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    }
    return { label: 'Needs Improvement', color: 'text-red-700', bgColor: 'bg-red-100' };
  };
  
  const effectivenessRating = getEffectivenessRating();
  const effectivenessPercentage = Math.round(metrics.effectiveness * 100);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Objection Handling
        </CardTitle>
        <CardDescription>
          How well objections were addressed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Effectiveness Score
              </div>
              <div className={`text-sm px-2 py-0.5 rounded-full ${effectivenessRating.bgColor} ${effectivenessRating.color}`}>
                {effectivenessRating.label}
              </div>
            </div>
            
            <Progress 
              value={effectivenessPercentage} 
              className="h-2" 
            />
            
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="text-center p-2 bg-muted/20 rounded-md">
                <div className="text-muted-foreground text-xs">Total</div>
                <div className="text-xl font-bold">{metrics.total_objections}</div>
                <div className="text-xs">Objections</div>
              </div>
              
              <div className="text-center p-2 bg-muted/20 rounded-md">
                <div className="text-muted-foreground text-xs">Handled</div>
                <div className="text-xl font-bold">{metrics.handled_objections}</div>
                <div className="text-xs">Successfully</div>
              </div>
              
              <div className="text-center p-2 bg-muted/20 rounded-md">
                <div className="text-muted-foreground text-xs">Success</div>
                <div className="text-xl font-bold">{effectivenessPercentage}%</div>
                <div className="text-xs">Rate</div>
              </div>
            </div>
            
            {metrics.details.length > 0 && (
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Objection Details</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {metrics.details.map((objection, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm border-b pb-1">
                      {objection.handled ? (
                        <Check className="h-4 w-4 text-green-500 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-red-500 mt-0.5" />
                      )}
                      <div>
                        <div className="font-medium">
                          {objection.text.length > 50 
                            ? objection.text.substring(0, 50) + '...' 
                            : objection.text}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Time: {formatTime(objection.time)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-2 border-t">
              <h4 className="text-sm font-medium mb-1">Insights</h4>
              <ul className="text-sm space-y-1">
                {metrics.total_objections === 0 ? (
                  <li className="flex items-start gap-1 text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground mt-2"></div>
                    No objections detected in this call.
                  </li>
                ) : (
                  <>
                    {metrics.effectiveness < 0.5 && (
                      <li className="flex items-start gap-1 text-red-600">
                        <div className="w-1 h-1 rounded-full bg-red-600 mt-2"></div>
                        Several objections were not adequately addressed.
                      </li>
                    )}
                    {metrics.effectiveness >= 0.8 && (
                      <li className="flex items-start gap-1 text-green-600">
                        <div className="w-1 h-1 rounded-full bg-green-600 mt-2"></div>
                        Excellent job addressing customer concerns.
                      </li>
                    )}
                    {metrics.total_objections > 3 && (
                      <li className="flex items-start gap-1 text-yellow-600">
                        <div className="w-1 h-1 rounded-full bg-yellow-600 mt-2"></div>
                        High number of objections indicates potential issues with the offering or approach.
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ObjectionHandlingCard;
