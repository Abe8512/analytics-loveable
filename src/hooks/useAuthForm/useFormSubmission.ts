
/**
 * Auth Form Submission Hook
 * 
 * Handles form submission logic for authentication
 */
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';
import { validateLoginForm, validateSignupForm } from '@/utils/formValidation';

interface UseFormSubmissionProps {
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  setError: (error: string | null) => void;
}

export const useFormSubmission = ({
  email,
  password,
  name,
  confirmPassword,
  setError
}: UseFormSubmissionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isConnected } = useConnectionStatus();
  
  /**
   * Handles the login form submission
   * Validates form data, checks connection, and attempts login
   * 
   * @param e - Form submission event
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateLoginForm(email, password);
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
      const { error: loginError } = await login(email, password);
      
      if (loginError) {
        setError(loginError.message);
      } else {
        // Fixed error: Instead of accessing location.state directly,
        // safely handle the case when state might not exist
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
        navigate(from, { replace: true });
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Handles the signup form submission
   * Validates form data, checks connection, and attempts signup
   * 
   * @param e - Form submission event
   */
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const validation = validateSignupForm(name, email, password, confirmPassword);
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
      const { error: signupError } = await signup(email, password, name);
      
      if (signupError) {
        setError(signupError.message);
      } else {
        toast({
          title: "Account created",
          description: "Your account has been created successfully. You can now log in.",
        });
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  /**
   * Resets the form to its initial state
   * Clears all input fields and error state
   */
  const resetForm = () => {
    // This is empty because it needs to be implemented at the parent level
    // where we have access to all the setState functions
  };
  
  return {
    isSubmitting,
    handleLogin,
    handleSignup,
    resetForm
  };
};
