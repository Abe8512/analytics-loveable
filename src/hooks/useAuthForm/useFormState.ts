
/**
 * Auth Form State Hook
 * 
 * Manages the form state for authentication forms
 */
import { useState, useEffect } from 'react';

export const useFormState = () => {
  // Form input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Form status states
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('login');
  const [formReady, setFormReady] = useState(false);
  
  // Set form ready state based on filled fields
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
  
  return {
    email,
    setEmail,
    password,
    setPassword,
    name, 
    setName,
    confirmPassword,
    setConfirmPassword,
    error,
    setError,
    activeTab,
    setActiveTab,
    formReady
  };
};
