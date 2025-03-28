
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false,
  requireManager = false
}) => {
  const { isAuthenticated, isLoading, isAdmin, isManager } = useAuth();
  const location = useLocation();

  // Notify user about access requirements if they've been redirected
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Authentication required", {
        description: "Please sign in to access this page"
      });
    } else if (!isLoading && isAuthenticated) {
      if (requireAdmin && !isAdmin) {
        toast.error("Access denied", {
          description: "Administrator privileges required"
        });
      } else if (requireManager && !isManager) {
        toast.error("Access denied", {
          description: "Manager privileges required"
        });
      }
    }
  }, [isLoading, isAuthenticated, requireAdmin, requireManager, isAdmin, isManager]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to auth page, but save the page they tried to visit
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Check for admin requirement
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Check for manager requirement
  if (requireManager && !isManager) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
