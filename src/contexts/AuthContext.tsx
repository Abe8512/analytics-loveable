
import React, { createContext, useContext } from 'react';
import { useAuthClient, AuthState } from '@/hooks/useAuthClient';

// Create the context with a default empty value
const AuthContext = createContext<AuthState | undefined>(undefined);

// Provider component that wraps parts of the app that need the auth context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthClient();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
