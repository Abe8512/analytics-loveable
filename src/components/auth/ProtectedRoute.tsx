
/**
 * Protected Route Component
 * 
 * A route wrapper that ensures users are authenticated before accessing protected routes.
 * Can also enforce admin or manager role requirements.
 * Redirects unauthenticated users to the login page.
 * 
 * @module components/auth/ProtectedRoute
 */
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Props for the ProtectedRoute component
 */
interface ProtectedRouteProps {
  /** The components/content to render if access is granted */
  children: React.ReactNode;
  /** Whether admin privileges are required for this route */
  requireAdmin?: boolean;
  /** Whether manager privileges are required for this route */
  requireManager?: boolean;
}

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication or specific authorization roles.
 * Shows loading state while authentication is being checked.
 * Redirects and shows appropriate error messages based on access requirements.
 */
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

  // Show loading state while authentication is being checked
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

  // Redirect to auth page if not authenticated
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

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
