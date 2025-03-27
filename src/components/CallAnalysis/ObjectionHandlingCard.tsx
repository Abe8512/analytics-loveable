
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, AlertCircle, Zap, ArrowRight } from 'lucide-react';
import { ObjectionHandlingMetrics, ObjectionMoment } from '@/services/AdvancedMetricsService';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

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
  
  // Get score rating
  const getScoreRating = () => {
    const score = metrics.effectiveness * 100;
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };
  
  // Get score color
  const getScoreColor = () => {
    const score = metrics.effectiveness * 100;
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Get objection category color
  const getCategoryColor = (category: string = 'other') => {
    const colors: Record<string, string> = {
      price: 'bg-red-100 text-red-800 border-red-200',
      uncertainty: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      concern: 'bg-orange-100 text-orange-800 border-orange-200',
      performance: 'bg-blue-100 text-blue-800 border-blue-200',
      competition: 'bg-purple-100 text-purple-800 border-purple-200',
      other: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return colors[category] || colors.other;
  };
  
  // Group objections by category
  const getObjectionsByCategory = () => {
    const categories: Record<string, ObjectionMoment[]> = {};
    
    metrics.details.forEach(objection => {
      const category = objection.category || 'other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(objection);
    });
    
    return Object.entries(categories);
  };
  
  // Get insights based on metrics
  const getInsights = () => {
    const insights = [];
    
    if (metrics.total_objections === 0) {
      insights.push("No objections detected in this call.");
      return insights;
    }
    
    // Overall handling effectiveness
    if (metrics.effectiveness >= 0.8) {
      insights.push("Excellent objection handling throughout the call.");
    } else if (metrics.effectiveness < 0.4 && metrics.total_objections > 1) {
      insights.push("Significant improvement needed in objection handling techniques.");
    }
    
    // Unhandled objections
    const unhandledCount = metrics.total_objections - metrics.handled_objections;
    if (unhandledCount > 0) {
      insights.push(`${unhandledCount} objection${unhandledCount > 1 ? 's' : ''} left unaddressed during the call.`);
    }
    
    // Category-specific insights
    const categories = getObjectionsByCategory();
    
    // Price objections
    const priceCategory = categories.find(([category]) => category === 'price');
    if (priceCategory && priceCategory[1].length > 1) {
      const handled = priceCategory[1].filter(obj => obj.handled).length;
      const effectiveness = handled / priceCategory[1].length;
      
      if (effectiveness < 0.5) {
        insights.push("Consider improving value proposition when handling price objections.");
      }
    }
    
    // Uncertainty objections
    const uncertaintyCategory = categories.find(([category]) => category === 'uncertainty');
    if (uncertaintyCategory && uncertaintyCategory[1].length > 0) {
      const handled = uncertaintyCategory[1].filter(obj => obj.handled).length;
      if (handled === 0) {
        insights.push("Work on building customer confidence to address uncertainty objections.");
      }
    }
    
    return insights;
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Objection Handling Analysis
        </CardTitle>
        <CardDescription>
          How effectively objections were addressed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        ) : metrics.total_objections === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No significant objections detected in this call</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-2">
              <div className="text-2xl font-bold mb-1">
                <span className={getScoreColor()}>
                  {Math.round(metrics.effectiveness * 100)}%
                </span>
              </div>
              <div className="text-sm font-medium">{getScoreRating()} Handling</div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.handled_objections} of {metrics.total_objections} objections addressed
              </div>
            </div>
            
            <Progress 
              value={metrics.effectiveness * 100} 
              className="h-2" 
            />
            
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="objections">
                <AccordionTrigger className="text-sm">
                  Detected Objections ({metrics.total_objections})
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    {getObjectionsByCategory().map(([category, objections]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-xs font-medium uppercase text-muted-foreground">
                          {category.charAt(0).toUpperCase() + category.slice(1)} Objections
                        </h4>
                        
                        <div className="space-y-2">
                          {objections.map((objection, index) => (
                            <div key={index} className="text-sm border rounded-md p-2">
                              <div className="flex justify-between items-start">
                                <Badge variant="outline" className={getCategoryColor(category)}>
                                  {category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {formatTime(objection.time)}
                                </span>
                              </div>
                              
                              <p className="mt-2 text-sm">{objection.text}</p>
                              
                              {objection.handled && objection.rebuttal_text && (
                                <div className="mt-2 flex items-start gap-2">
                                  <ArrowRight className="h-3.5 w-3.5 text-green-500 mt-0.5" />
                                  <p className="text-sm text-green-700">
                                    {objection.rebuttal_text}
                                  </p>
                                </div>
                              )}
                              
                              {!objection.handled && (
                                <div className="mt-2 text-xs text-yellow-600 flex items-center gap-1">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  Not directly addressed
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="pt-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <Zap className="h-4 w-4 text-amber-500" />
                Coaching Insights
              </h4>
              <ul className="text-sm space-y-1 mt-1">
                {getInsights().map((insight, index) => (
                  <li key={index} className="flex items-start gap-1">
                    <div className="w-1 h-1 rounded-full bg-amber-500 mt-2"></div>
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ObjectionHandlingCard;
