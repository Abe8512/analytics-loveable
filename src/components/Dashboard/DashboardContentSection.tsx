
import React from 'react';
import { motion } from 'framer-motion';
import CallAnalysisSection from './CallAnalysisSection';
import AIInsights from './AIInsights';
import CallsOverview from './CallsOverview';

interface DashboardContentSectionProps {
  isLoading: boolean;
}

const DashboardContentSection: React.FC<DashboardContentSectionProps> = ({ isLoading }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <motion.div 
        className="lg:col-span-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <CallAnalysisSection isLoading={isLoading} />
      </motion.div>
      
      <div className="lg:col-span-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <AIInsights />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <CallsOverview />
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardContentSection;
