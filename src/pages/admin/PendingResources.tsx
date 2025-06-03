import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PendingResourcesPanel from '@/components/admin/PendingResourcesPanel';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const PendingResourcesPage: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect if not admin or administration
  if (!user || !['admin', 'administration'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Approval</h1>
          <p className="text-muted-foreground">
            Review and approve resources submitted by students
          </p>
        </div>
        
        <PendingResourcesPanel />
      </div>
    </MainLayout>
  );
};

export default PendingResourcesPage;