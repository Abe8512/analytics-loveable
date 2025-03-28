
/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset by entering their email address.
 * Displays confirmation when the reset email has been sent.
 * Handles form validation and error display.
 * 
 * @module pages/ForgotPassword
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ConnectionStatusBadge from '@/components/ui/ConnectionStatusBadge';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';
import { validateForgotPasswordForm } from '@/utils/formValidation';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage, logError } from '@/utils/errorUtils';

/**
 * ForgotPassword Component
 * 
 * Renders a form for requesting a password reset and displays confirmation
 * when the reset email has been sent.
 */
const ForgotPassword = () => {
  // State
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Hooks
  const { resetPassword, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { isConnected } = useConnectionStatus();
  const navigate = useNavigate();
  
  // Computed values
  const formReady = useMemo(() => email.trim() !== '', [email]);
  
  // Clear error when email changes
  useEffect(() => {
    if (error && email) {
      setError(null);
    }
  }, [email, error]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
      toast({
        title: "Already logged in",
        description: "You are already logged in to your account.",
      });
    }
  }, [isAuthenticated, navigate, toast]);
  
  /**
   * Handles form submission for password reset
   * Validates email, checks connection, and calls resetPassword
   * Improved error handling with standardized patterns
   * 
   * @param e - Form submission event
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateForgotPasswordForm(email);
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
      // Use the auth context to reset password
      const { error: resetError } = await resetPassword(email);
      
      if (resetError) {
        setError(resetError.message);
        logError(resetError, 'Password Reset');
      } else {
        setIsSubmitted(true);
        toast({
          title: "Reset link sent",
          description: `Password reset instructions have been sent to ${email}`,
        });
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      logError(err, 'Password Reset Exception');
    } finally {
      setIsSubmitting(false);
    }
  }, [email, isConnected, resetPassword, toast]);
  
  /**
   * Allows user to try a different email after submission
   * Resets form state
   */
  const tryDifferentEmail = useCallback(() => {
    setEmail('');
    setIsSubmitted(false);
    setError(null);
  }, []);
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-4">
        <div className="flex justify-between mb-2">
          <Link to="/auth" className="flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to login
          </Link>
          <ConnectionStatusBadge showLatency={false} size="sm" />
        </div>
        
        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {isSubmitted ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="text-lg font-medium">Check your email</h3>
                <p className="text-muted-foreground">
                  We've sent a password reset link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  If you don't see it, check your spam folder.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={tryDifferentEmail}
                >
                  Try a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !formReady}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
