
import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import PerformanceMetrics from '../components/Dashboard/PerformanceMetrics';
import CallsOverview from '../components/Dashboard/CallsOverview';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import CallAnalysisSection from '../components/Dashboard/CallAnalysisSection';
import AIInsights from '../components/Dashboard/AIInsights';

const Dashboard = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <DashboardHeader />
        <PerformanceMetrics />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CallAnalysisSection />
          <div className="space-y-6">
            <AIInsights />
            <CallsOverview />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
