import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Navbar, Footer } from './components';
import { HomePage, AuthPage, FoodBrowsePage, UserDashboard, RestaurantDashboard, AdminDashboard } from './pages';
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
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    userName: null,
    token: null,
    userId: null,
  });

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isAuthenticated={authState.isAuthenticated}
        userRole={authState.userRole}
        userName={authState.userName}
        onLogout={handleLogout}
      />
      <main className="grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<FoodBrowsePage />} />

          {/* Auth Routes */}
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
      <Footer />
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
