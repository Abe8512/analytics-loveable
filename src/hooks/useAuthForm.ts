
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useConnectionStatus } from '@/services/ConnectionMonitorService';
import { validateLoginForm, validateSignupForm } from '@/utils/formValidation';

export const useAuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [formReady, setFormReady] = useState(false);
  
  const { login, signup, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isConnected } = useConnectionStatus();
  
  // Get the redirect path from location state, or default to '/'
  const from = location.state?.from?.pathname || '/';
  
  // Clear error when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setError(null);
  };
  
  // Clear error when form inputs change
  useEffect(() => {
    setError(null);
  }, [email, password, name, confirmPassword]);
  
  // Check if the user is already authenticated and redirect if they are
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);
  
  // Set form ready state
  useEffect(() => {
    if (activeTab === 'login') {
      setFormReady(email.trim() !== '' && password.trim() !== '');
    } else {
      setFormReady(
        email.trim() !== '' && 
        password.trim() !== '' && 
        name.trim() !== '' && 
        confirmPassword.trim() !== ''
      );
    }
  }, [activeTab, email, password, name, confirmPassword]);
  
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
        setActiveTab('login');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
    setError(null);
  };
  
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
