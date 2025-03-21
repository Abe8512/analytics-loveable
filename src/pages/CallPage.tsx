
import React from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';

const CallPage = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <DashboardLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Call Details</h1>
        <p>Viewing call with ID: {id}</p>
        {/* More call details would go here */}
      </div>
    </DashboardLayout>
  );
};

export default CallPage;
