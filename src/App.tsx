
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import CallPage from './pages/CallPage';
import AuthPage from './pages/AuthPage';
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
import Login from './pages/Login';
import Signup from './pages/Signup';

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
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                
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
              </Routes>
            </SharedFilterProvider>
          </QueryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
