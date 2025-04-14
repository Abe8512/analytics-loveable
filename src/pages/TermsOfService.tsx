
import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <div className="prose prose-sm sm:prose lg:prose-lg mx-auto">
        <p>Last updated: April 14, 2025</p>
        
        <h2>1. Introduction</h2>
        <p>
          These Terms of Service govern your use of Future Sentiment Analytics. By using our service,
          you agree to these terms.
        </p>
        
        <h2>2. Accounts</h2>
        <p>
          You must provide accurate information when you create an account. You are responsible
          for maintaining the security of your account and for all activities that occur under your account.
        </p>
        
        <h2>3. Acceptable Use</h2>
        <p>
          You agree not to use the service for any unlawful purpose or to engage in any activity
          that could harm our service or other users.
        </p>
        
        <h2>4. Subscriptions and Payments</h2>
        <p>
          Some features of our service require a paid subscription. Billing terms and conditions
          will be provided during the subscription process.
        </p>
        
        <h2>5. Intellectual Property</h2>
        <p>
          Our service and its original content, features, and functionality are and will remain the
          exclusive property of Future Sentiment Analytics.
        </p>
        
        <h2>6. Termination</h2>
        <p>
          We may terminate or suspend your account and bar access to the service immediately, without
          prior notice or liability, for any breach of these Terms.
        </p>
        
        <h2>7. Changes to Terms</h2>
        <p>
          We reserve the right to modify or replace these Terms at any time. It is your responsibility
          to review these Terms periodically for changes.
        </p>
        
        <h2>8. Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at:
          terms@futuresentiment.com
        </p>
        
        <div className="mt-8">
          <Link to="/" className="text-blue-500 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
