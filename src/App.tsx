import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from "@/components/theme-provider"
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import Settings from './pages/Settings';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';
import { SharedFilterProvider } from './contexts/SharedFilterContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ErrorPage } from './components/ErrorPage';
import { RealTimeMetricsProvider } from './components/metrics/RealTimeMetricsProvider';
import { MetricsProvider } from './contexts/MetricsContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
    errorElement: <ErrorPage />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/performance",
    element: <ProtectedRoute><Performance /></ProtectedRoute>,
  },
  {
    path: "/settings",
    element: <ProtectedRoute><Settings /></ProtectedRoute>,
  },
  {
    path: "/admin",
    element: <AdminRoute><div>Admin Area</div></AdminRoute>,
  },
]);

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ErrorBoundary>
          <RouterProvider router={router}>
            <AuthProvider>
              <SharedFilterProvider>
                <MetricsProvider>
                  <RealTimeMetricsProvider>
                  </RealTimeMetricsProvider>
                </MetricsProvider>
              </SharedFilterProvider>
            </AuthProvider>
          </RouterProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
