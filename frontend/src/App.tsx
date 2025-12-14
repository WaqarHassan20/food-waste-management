import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Footer } from './components';
import { Loader } from './components/ui';
import { HomePage, AuthPage, UserDashboard, RestaurantDashboard, AdminDashboard } from './pages';
import NotificationsPage from './pages/NotificationsPage';
import type { UserRole } from './types';

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userName: string | null;
  token: string | null;
  userId: string | null;
}

// Protected Route Component
function ProtectedRoute({ children, isAuthenticated }: { children: React.ReactNode; isAuthenticated: boolean }) {
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth/signin" replace />;
}

// Role-based Route Component
function RoleRoute({
  children,
  isAuthenticated,
  userRole,
  allowedRoles
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  allowedRoles: UserRole[];
}) {
  if (!isAuthenticated) {
    return <Navigate to="/auth/signin" replace />;
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Main App Content Component
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isInitializing, setIsInitializing] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    userName: null,
    token: null,
    userId: null,
  });

  // Check if current route is an auth page
  const isAuthPage = location.pathname.startsWith('/auth');

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          isAuthenticated: true,
          userRole: user.role,
          userName: user.name,
          token: token,
          userId: user.id,
        });
      } catch (error) {
        // Invalid data in localStorage, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    // Set a small delay for better UX
    setTimeout(() => setIsInitializing(false), 500);
  }, []);

  const handleLogin = (role: UserRole, name: string, token: string, userId: string) => {
    setAuthState({
      isAuthenticated: true,
      userRole: role,
      userName: name,
      token: token,
      userId: userId,
    });

    // Navigate to appropriate dashboard
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      userName: null,
      token: null,
      userId: null,
    });
    navigate('/');
  };

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-emerald-50">
        <div className="text-center">
          <div className="mb-8">
            <div className="text-6xl mb-4">🍴</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Waste Management</h1>
            <p className="text-gray-600">Connecting communities, reducing waste</p>
          </div>
          <Loader size="lg" variant="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && (
        <Navbar
          isAuthenticated={authState.isAuthenticated}
          userRole={authState.userRole}
          userName={authState.userName}
          onLogout={handleLogout}
        />
      )}
      <main className="grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />

          {/* Auth Routes - Generic */}
          <Route
            path="/auth/signin"
            element={
              authState.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage onLogin={handleLogin} initialMode="signin" />
              )
            }
          />
          <Route
            path="/auth/signup"
            element={
              authState.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage onLogin={handleLogin} initialMode="signup" />
              )
            }
          />

          {/* Auth Routes - Sign In with Role */}
          <Route
            path="/auth/signin/user"
            element={
              authState.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage onLogin={handleLogin} initialMode="signin" initialRole="USER" />
              )
            }
          />
          <Route
            path="/auth/signin/restaurant"
            element={
              authState.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage onLogin={handleLogin} initialMode="signin" initialRole="RESTAURANT" />
              )
            }
          />
          <Route
            path="/auth/signin/admin"
            element={
              authState.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage onLogin={handleLogin} initialMode="signin" initialRole="ADMIN" />
              )
            }
          />

          {/* Auth Routes - Sign Up with Role */}
          <Route
            path="/auth/signup/user"
            element={
              authState.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage onLogin={handleLogin} initialMode="signup" initialRole="USER" />
              )
            }
          />
          <Route
            path="/auth/signup/restaurant"
            element={
              authState.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage onLogin={handleLogin} initialMode="signup" initialRole="RESTAURANT" />
              )
            }
          />
          <Route
            path="/auth/signup/admin"
            element={
              authState.isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage onLogin={handleLogin} initialMode="signup" initialRole="ADMIN" />
              )
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={authState.isAuthenticated}>
                {authState.userRole === 'USER' && (
                  <UserDashboard userName={authState.userName || 'User'} />
                )}
                {authState.userRole === 'RESTAURANT' && (
                  <RestaurantDashboard restaurantName={authState.userName || 'Restaurant'} />
                )}
                {authState.userRole === 'ADMIN' && (
                  <AdminDashboard />
                )}
                {!authState.userRole && <Navigate to="/" replace />}
              </ProtectedRoute>
            }
          />

          {/* Notifications Page - Protected */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute isAuthenticated={authState.isAuthenticated}>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Role-specific Routes */}
          <Route
            path="/user/dashboard"
            element={
              <RoleRoute
                isAuthenticated={authState.isAuthenticated}
                userRole={authState.userRole}
                allowedRoles={['USER']}
              >
                <UserDashboard userName={authState.userName || 'User'} />
              </RoleRoute>
            }
          />

          <Route
            path="/restaurant/dashboard"
            element={
              <RoleRoute
                isAuthenticated={authState.isAuthenticated}
                userRole={authState.userRole}
                allowedRoles={['RESTAURANT']}
              >
                <RestaurantDashboard restaurantName={authState.userName || 'Restaurant'} />
              </RoleRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute
                isAuthenticated={authState.isAuthenticated}
                userRole={authState.userRole}
                allowedRoles={['ADMIN']}
              >
                <AdminDashboard />
              </RoleRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
