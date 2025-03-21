
import React, { useState, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import CallPage from './pages/CallPage';
import Auth from './pages/Auth';
import { AuthProvider } from './contexts/AuthContext';
import { QueryProvider } from './contexts/QueryContext';
import TopBar from './components/layout/TopBar';
import SideBar from './components/layout/SideBar';
import AICoaching from './pages/AICoaching';
import Transcribe from './pages/Transcribe';
import { Toaster } from 'sonner';
import ConnectionMonitor from './components/ui/ConnectionMonitor';
import Analytics from './pages/Analytics';

export const ThemeContext = createContext({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  const toggleDarkMode = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={isDarkMode ? 'dark' : 'light'}>
        <BrowserRouter>
          <AuthProvider>
            <QueryProvider>
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
              </Routes>
            </QueryProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
