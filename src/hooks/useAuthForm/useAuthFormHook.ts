
/**
 * Auth Form Hook
 * 
 * Core implementation of the authentication form hook
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';
import { validateLoginForm, validateSignupForm } from '@/utils/formValidation';
import { useFormState } from './useFormState';
import { useFormSubmission } from './useFormSubmission';

export const useAuthForm = () => {
  // Get form state management from the custom hook
  const {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    confirmPassword,
    setConfirmPassword,
    activeTab,
    setActiveTab,
    formReady,
    error,
    setError
  } = useFormState();
  
  // Get form submission logic from the custom hook
  const {
    isSubmitting,
    handleLogin,
    handleSignup,
    resetForm
  } = useFormSubmission({
    email,
    password,
    name,
    confirmPassword,
    setError
  });
  
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Get the redirect path from location state, or default to '/'
  const from = location.state?.from?.pathname || '/';
  
  /**
   * Handles tab change between login and signup forms
   * Clears error state when switching tabs
   * 
   * @param value - The tab to switch to ('login' or 'signup')
   */
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null);
  };
  
  // Clear error when form inputs change
  useEffect(() => {
    setError(null);
  }, [email, password, name, confirmPassword, setError]);
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Return all state variables and handlers
  return {
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    error,
    setError,
    activeTab,
    formReady,
    handleTabChange,
    handleLogin,
    handleSignup,
    resetForm,
    from
  };
};
