
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Shield } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval?: string;
  features: string[];
  buttonText?: string;
  featured?: boolean;
}

interface SubscriptionPageProps {
  isSubscribed: boolean;
  pricingPlans: PricingPlan[];
}

const SubscriptionPage = ({ isSubscribed, pricingPlans }: SubscriptionPageProps) => {
  const { subscription, isLoading, error, checkSubscription } = useSubscription();
  
  const handleSubscribe = async (planId: string) => {
    // Call subscription service
    console.log(`Subscribing to plan: ${planId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Subscription</h1>
        {isSubscribed ? (
          <div className="p-4 bg-green-100 text-green-800 rounded-md inline-flex items-center mb-4">
            <Shield className="mr-2 h-5 w-5" />
            <p>You currently have an active subscription</p>
          </div>
        ) : (
          <p className="text-lg text-muted-foreground">
            Choose a subscription plan to access all features
          </p>
        )}
      </div>
      
      {error && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`${plan.featured ? 'border-primary shadow-lg' : ''} ${
              subscription?.planId === plan.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{plan.name}</CardTitle>
                {subscription?.planId === plan.id && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                    Current Plan
                  </span>
                )}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">${plan.price}</span>
                {plan.interval && <span className="text-muted-foreground">/{plan.interval}</span>}
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                variant={plan.featured ? 'default' : 'outline'}
                disabled={subscription?.planId === plan.id || isLoading}
                onClick={() => handleSubscribe(plan.id)}
              >
                {subscription?.planId === plan.id
                  ? 'Current Plan'
                  : isLoading
                  ? 'Loading...'
                  : plan.buttonText || 'Choose Plan'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {isSubscribed && (
        <div className="text-center mt-12">
          <Button variant="outline" onClick={() => checkSubscription()}>
            Refresh Subscription Status
          </Button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
