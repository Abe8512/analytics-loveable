
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

export const pricing: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Essential features for small teams',
    price: 29,
    interval: 'month',
    features: [
      'Up to 50 call transcriptions/month',
      'Basic sentiment analysis',
      'Team performance metrics',
      'Email support'
    ],
    buttonText: 'Start Basic',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced features for growing teams',
    price: 79,
    interval: 'month',
    features: [
      'Up to 200 call transcriptions/month',
      'Advanced sentiment analysis',
      'AI coaching suggestions',
      'Custom reporting',
      'Priority support'
    ],
    buttonText: 'Get Professional',
    featured: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large organizations',
    price: 199,
    interval: 'month',
    features: [
      'Unlimited call transcriptions',
      'Real-time sentiment analysis',
      'Advanced AI coaching',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantees'
    ],
    buttonText: 'Contact Sales',
  }
];
