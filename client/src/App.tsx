import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SuperAdminLayout } from '@/components/layout/SuperAdminLayout';
import { StoreDashboardLayout } from '@/components/layout/StoreDashboardLayout';
import LandingPage from '@/components/pages/CentralOneLanding';
import LoginPage from '@/components/pages/LoginPage';
import SignupPage from '@/components/pages/SignupPage';
import ForgotPasswordPage from '@/components/pages/ForgotPasswordPage';
import CataloguePage from '@/components/pages/CataloguePage';
import StoreDashboard from '@/components/pages/StoreDashboard';
import SuperAdminDashboard from '@/components/pages/SuperAdminDashboard';
import SuperAdminUsers from '@/components/pages/SuperAdminUsers';
import SuperAdminRoles from '@/components/pages/SuperAdminRoles';
import SuperAdminStores from '@/components/pages/SuperAdminStores';
import StoreDetailPage from '@/components/pages/StoreDetailPage';
import SuperAdminSettings from '@/components/pages/SuperAdminSettings';
import PrivacyPolicy from '@/components/pages/PrivacyPolicy';
import TermsAndConditions from '@/components/pages/TermsAndConditions';
import DemoRequestsAdmin from '@/components/pages/DemoRequestsAdmin';
import PlaceholderPage from '@/components/pages/PlaceholderPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount: number, error: unknown) => {
        const err = error as { status?: number; message?: string };
        if (err?.status === 401 || err?.message?.includes('401')) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, auth } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
          <p className="text-sm text-gray-400 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (auth.user?.roles?.includes('SUPER_ADMIN')) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, auth } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="h-12 w-12 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!auth.user?.roles?.includes('SUPER_ADMIN')) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, auth } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) {
    const isSuper = auth.user?.roles?.includes('SUPER_ADMIN');
    return <Navigate to={isSuper ? '/admin' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/centralone" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      <Route
        path="/admin"
        element={<SuperAdminRoute><SuperAdminLayout><SuperAdminDashboard /></SuperAdminLayout></SuperAdminRoute>}
      />
      <Route
        path="/admin/users"
        element={<SuperAdminRoute><SuperAdminLayout><SuperAdminUsers /></SuperAdminLayout></SuperAdminRoute>}
      />
      <Route
        path="/admin/roles"
        element={<SuperAdminRoute><SuperAdminLayout><SuperAdminRoles /></SuperAdminLayout></SuperAdminRoute>}
      />
      <Route
        path="/admin/stores"
        element={<SuperAdminRoute><SuperAdminLayout><SuperAdminStores /></SuperAdminLayout></SuperAdminRoute>}
      />
      <Route
        path="/admin/stores/:id"
        element={<SuperAdminRoute><SuperAdminLayout><StoreDetailPage /></SuperAdminLayout></SuperAdminRoute>}
      />
      <Route
        path="/admin/settings"
        element={<SuperAdminRoute><SuperAdminLayout><SuperAdminSettings /></SuperAdminLayout></SuperAdminRoute>}
      />
      <Route
        path="/admin/demo-requests"
        element={<SuperAdminRoute><SuperAdminLayout><DemoRequestsAdmin /></SuperAdminLayout></SuperAdminRoute>}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <StoreDashboard />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalogue"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <CataloguePage />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalogue/categories"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <CataloguePage />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/catalogue/brands"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <CataloguePage />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <PlaceholderPage title="POS / Billing" />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <PlaceholderPage title="Customers" />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <PlaceholderPage title="Inventory" />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <PlaceholderPage title="Reports" />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/suppliers"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <PlaceholderPage title="Suppliers" />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/purchases"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <PlaceholderPage title="Purchases" />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <PlaceholderPage title="Invoices" />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/gst"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <PlaceholderPage title="GST" />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/backup"
        element={
          <ProtectedRoute>
            <StoreDashboardLayout>
              <PlaceholderPage title="Backup & Restore" />
            </StoreDashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
