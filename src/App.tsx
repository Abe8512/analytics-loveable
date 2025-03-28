
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import CallPage from './pages/CallPage';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './contexts/QueryContext';
import AICoaching from './pages/AICoaching';
import Transcribe from './pages/Transcribe';
import Transcripts from './pages/Transcripts';
import { Toaster } from 'sonner';
import ConnectionMonitor from './components/ui/ConnectionMonitor';
import Analytics from './pages/Analytics';
import CallActivity from './pages/CallActivity';
import Performance from './pages/Performance';
import PerformanceMetrics from './pages/PerformanceMetrics';
import { SharedFilterProvider } from './contexts/SharedFilterContext';
import { createContext, useState, useEffect } from 'react';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Define the ThemeContext type
interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

// Create the ThemeContext with a default value
export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

// ThemeProvider component to wrap the app
const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // Apply theme class to html element for global styling
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={isDarkMode ? 'dark' : 'light'}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <QueryProvider>
            <SharedFilterProvider>
              {/* ConnectionMonitor for offline detection and notifications */}
              <ConnectionMonitor />
              
              {/* Sonner Toast provider */}
              <Toaster position="top-right" />
              
              <Routes>
                {/* Auth routes */}
                <Route path="/auth" element={<Auth />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Redirect /login and /signup to /auth for consistency */}
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/signup" element={<Navigate to="/auth" replace />} />
                
                {/* Protected routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/call/:id" element={
                  <ProtectedRoute>
                    <CallPage />
                  </ProtectedRoute>
                } />
                <Route path="/ai-coaching" element={
                  <ProtectedRoute>
                    <AICoaching />
                  </ProtectedRoute>
                } />
                <Route path="/transcribe" element={
                  <ProtectedRoute>
                    <Transcribe />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/transcripts" element={
                  <ProtectedRoute>
                    <Transcripts />
                  </ProtectedRoute>
                } />
                <Route path="/call-activity" element={
                  <ProtectedRoute>
                    <CallActivity />
                  </ProtectedRoute>
                } />
                <Route path="/performance" element={
                  <ProtectedRoute>
                    <Performance />
                  </ProtectedRoute>
                } />
                <Route path="/performance-metrics" element={
                  <ProtectedRoute>
                    <PerformanceMetrics />
                  </ProtectedRoute>
                } />
                
                {/* Catch all route - redirect to login */}
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </Routes>
            </SharedFilterProvider>
          </QueryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
