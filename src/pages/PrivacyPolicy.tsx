
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <div className="prose prose-sm sm:prose lg:prose-lg mx-auto">
        <p>Last updated: April 14, 2025</p>
        
        <h2>Introduction</h2>
        <p>
          This Privacy Policy explains how Future Sentiment Analytics ("we", "us", or "our") 
          collects, uses, and shares your personal information when you use our service.
        </p>
        
        <h2>Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, including:
        </p>
        <ul>
          <li>Account information (name, email, etc.)</li>
          <li>Call recordings and transcripts you upload</li>
          <li>Usage information and analytics</li>
        </ul>
        
        <h2>How We Use Your Information</h2>
        <p>
          We use the information we collect to:
        </p>
        <ul>
          <li>Provide, maintain, and improve our services</li>
          <li>Process and analyze call recordings</li>
          <li>Generate insights and analytics</li>
          <li>Communicate with you about products and services</li>
        </ul>
        
        <h2>Data Retention</h2>
        <p>
          We retain your data for as long as your account is active or as needed to provide 
          you with our services. You can request deletion of your data at any time.
        </p>
        
        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
          privacy@futuresentiment.com
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

export default PrivacyPolicy;
