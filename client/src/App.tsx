import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/layout/Layout';
import LoginPage from '@/components/pages/LoginPage';
import DashboardPage from '@/components/pages/DashboardPage';
import POSPage from '@/components/pages/POSPage';
import InventoryDashboard from '@/components/inventory/InventoryDashboard';
import InventoryListPage from '@/components/inventory/InventoryListPage';
import StockHistoryPage from '@/components/inventory/StockHistoryPage';
import CategoryManagementPage from '@/components/pages/CategoryManagementPage';
import BrandManagementPage from '@/components/pages/BrandManagementPage';
import ProductListPage from '@/components/pages/ProductListPage';
import ProductCreatePage from '@/components/pages/ProductCreatePage';
import ProductEditPage from '@/components/pages/ProductEditPage';
import AddStockBarcodePage from '@/components/inventory/AddStockBarcodePage';
import ReturnScanPage from '@/components/pages/ReturnScanPage';
import ForbiddenPage from '@/components/pages/ForbiddenPage';
import UserManagementPage from '@/components/pages/UserManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.message?.includes('401')) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PermissionGuard({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) {
  const { hasPermission } = useAuth();
  if (hasPermission(permission)) return <>{children}</>;
  return <ForbiddenPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pos"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="pos:access">
                <POSPage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="inventory:view">
                <InventoryListPage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="dashboard:view">
                <InventoryDashboard />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/history"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="inventory:history:view">
                <StockHistoryPage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/categories"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="category:view">
                <CategoryManagementPage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/brands"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="brand:view">
                <BrandManagementPage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/products"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="product:view">
                <ProductListPage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/products/new"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="product:create">
                <ProductCreatePage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/products/:id/edit"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="product:edit">
                <ProductEditPage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/add-stock-barcode"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="inventory:stock:add">
                <AddStockBarcodePage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory/returns/scan"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="pos:return">
                <ReturnScanPage />
              </PermissionGuard>
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <PermissionGuard permission="user:view">
                <UserManagementPage />
              </PermissionGuard>
            </Layout>
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
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
