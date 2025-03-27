
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import CallPage from './pages/CallPage';
import Auth from './pages/Auth';
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
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/call/:id" element={<CallPage />} />
                <Route path="/ai-coaching" element={<AICoaching />} />
                <Route path="/transcribe" element={<Transcribe />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/transcripts" element={<Transcripts />} />
                <Route path="/call-activity" element={<CallActivity />} />
                <Route path="/performance" element={<Performance />} />
                <Route path="/performance-metrics" element={<PerformanceMetrics />} />
              </Routes>
            </SharedFilterProvider>
          </QueryProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
