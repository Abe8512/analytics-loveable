
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due';
  currentPeriodEnd: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call an API or Supabase function
      console.log('Checking subscription for user:', user);
      
      // Mock subscription data
      // Replace with actual API call in production
      const mockSubscription = {
        id: 'sub_123456',
        planId: 'professional',
        status: 'active' as const,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      setSubscription(mockSubscription);
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to check subscription');
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Check subscription when auth state changes
  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  return {
    subscription,
    isLoading,
    error,
    checkSubscription
  };
};
