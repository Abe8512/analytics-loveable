
import React, { createContext, useState, useEffect, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { TeamProvider } from '@/contexts/TeamContext'; 
import { TranscriptProvider } from '@/contexts/TranscriptContext';
import { EventsProvider } from '@/services/events/EventsContext';
import Dashboard from '@/pages/Dashboard';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Settings from '@/pages/Settings';
import Team from '@/pages/Team';
import CallActivity from '@/pages/CallActivity';
import Transcripts from '@/pages/Transcripts';
import CallDetails from '@/components/CallAnalysis/CallDetails';
import { RequireAuth } from '@/components/auth/RequireAuth';
import { RequireUnauth } from '@/components/auth/RequireUnauth';
import PricingPage from '@/pages/PricingPage';
import SubscriptionPage from '@/pages/SubscriptionPage';
import AccountSettings from '@/pages/AccountSettings';
import { pricing } from '@/config/pricing';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { siteConfig } from '@/config/site';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';

export const ThemeContext = createContext({
  isDarkMode: false,
  setIsDarkMode: (value: boolean) => {},
});

function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    document.body.dataset.theme = isDarkMode ? 'dark' : 'light';
  }, [isDarkMode]);

  const handleThemeChange = (value: boolean) => {
    setIsDarkMode(value);
    localStorage.setItem('theme', value ? 'dark' : 'light');
  };

  const stripePromise = useMemo(() => loadStripe(siteConfig.stripe.publicKey), []);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode: handleThemeChange }}>
      <ThemeProvider defaultTheme={isDarkMode ? 'dark' : 'light'}>
        <EventsProvider>
          <AuthProvider>
            <TeamProvider>
              <TranscriptProvider>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Router>
                    <Routes>
                      <Route path="/login" element={<RequireUnauth><Login /></RequireUnauth>} />
                      <Route path="/register" element={<RequireUnauth><Register /></RequireUnauth>} />
                      <Route path="/forgot-password" element={<RequireUnauth><ForgotPassword /></RequireUnauth>} />
                      <Route path="/reset-password" element={<RequireUnauth><ResetPassword /></RequireUnauth>} />
                      <Route path="/pricing" element={<PricingPage />} />
                      <Route path="/privacy" element={<PrivacyPolicy />} />
                      <Route path="/terms" element={<TermsOfService />} />

                      <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
                      <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
                      <Route path="/team" element={<RequireAuth><Team /></RequireAuth>} />
                      <Route path="/call-activity" element={<RequireAuth><CallActivity /></RequireAuth>} />
                      <Route path="/transcripts" element={<RequireAuth><Transcripts /></RequireAuth>} />
                      <Route path="/call-details/:id" element={<RequireAuth><CallDetails /></RequireAuth>} />
                      <Route path="/account" element={<RequireAuth><AccountSettings /></RequireAuth>} />

                      {/* Subscription Routes */}
                      <Route
                        path="/subscription"
                        element={
                          <RequireAuth>
                            <Elements stripe={stripePromise}>
                              <SubscriptionPage
                                isSubscribed={false}
                                pricingPlans={pricing}
                              />
                            </Elements>
                          </RequireAuth>
                        }
                      />
                    </Routes>
                  </Router>
                  <Toaster />
                </div>
              </TranscriptProvider>
            </TeamProvider>
          </AuthProvider>
        </EventsProvider>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
