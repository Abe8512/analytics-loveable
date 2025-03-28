
/**
 * Reset Password Page
 * 
 * Allows users to set a new password after clicking a reset password link.
 * Validates the reset token and handles form submission.
 * Provides feedback on success or error conditions.
 * 
 * @module pages/ResetPassword
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ConnectionStatusBadge from '@/components/ui/ConnectionStatusBadge';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';
import { getErrorMessage, logError } from '@/utils/errorUtils';

/**
 * ResetPassword Component
 * 
 * Renders a form for setting a new password and handles the password reset process.
 * Validates inputs and provides feedback on the operation result.
 */
const ResetPassword = () => {
  // State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Hooks
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isConnected } = useConnectionStatus();
  
  // Extract token from URL
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  
  // Computed values
  const formValid = useMemo(() => 
    password && password.length >= 6 && password === confirmPassword,
  [password, confirmPassword]);
  
  // Check token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid password reset link. Please request a new one.');
    }
  }, [token]);
  
  // Clear errors when inputs change
  useEffect(() => {
    if (error && (password || confirmPassword)) {
      setError(null);
    }
  }, [password, confirmPassword, error]);
  
  /**
   * Validates password fields
   * 
   * @returns Validation result with optional error message
   */
  const validateForm = useCallback(() => {
    if (!password) {
      return { isValid: false, message: 'Password is required' };
    }
    
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    
    if (password !== confirmPassword) {
      return { isValid: false, message: 'Passwords do not match' };
    }
    
    return { isValid: true, message: null };
  }, [password, confirmPassword]);
  
  /**
   * Handles form submission for password reset
   * Validates form data, checks connection, and performs reset
   * Improved error handling with standardized patterns
   * 
   * @param e - Form submission event
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!token) {
      setError('Invalid password reset link. Please request a new one.');
      return;
    }
    
    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }
    
    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "You appear to be offline. Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Properly call resetPassword with the token
      const { error: resetError } = await resetPassword(token);
      
      if (resetError) {
        setError(resetError.message);
        logError(resetError, 'Password Reset');
      } else {
        setSuccess(true);
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. You can now log in with your new password.",
        });
        setTimeout(() => navigate('/auth', { state: { resetComplete: true } }), 3000);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      logError(err, 'Password Reset Exception');
    } finally {
      setIsSubmitting(false);
    }
  }, [token, validateForm, isConnected, resetPassword, toast, navigate]);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-end mb-2">
          <ConnectionStatusBadge showLatency={false} size="sm" />
        </div>
        
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success ? (
              <Alert className="mb-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800">
                <AlertDescription>
                  Password reset successful. You will be redirected to the login page.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !token || !formValid}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting password...
                    </>
                  ) : 'Reset Password'}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="link" onClick={() => navigate('/auth')} size="sm">
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
