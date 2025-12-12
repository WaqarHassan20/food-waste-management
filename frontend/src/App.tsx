import { useState } from 'react';
import { Navbar, Footer } from './components';
import { HomePage, AuthPage, FoodBrowsePage, UserDashboard, RestaurantDashboard, AdminDashboard } from './pages';
import type { UserRole } from './types';

type Page = 'home' | 'auth' | 'browse' | 'dashboard';

interface AuthState {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userName: string | null;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    userName: null,
  });

  const handleLogin = (role: UserRole, name: string) => {
    setAuthState({
      isAuthenticated: true,
      userRole: role,
      userName: name,
    });
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      userRole: null,
      userName: null,
    });
    setCurrentPage('home');
  };

  const navigateToAuth = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setCurrentPage('auth');
  };

  const navigateToHome = () => {
    setCurrentPage('home');
  };

  const navigateToBrowse = () => {
    setCurrentPage('browse');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigateToAuth={navigateToAuth} onNavigateToBrowse={navigateToBrowse} />;
      case 'auth':
        return <AuthPage onLogin={handleLogin} onNavigateToHome={navigateToHome} initialMode={authMode} />;
      case 'browse':
        return <FoodBrowsePage />;
      case 'dashboard':
        if (!authState.isAuthenticated) {
          setCurrentPage('home');
          return <HomePage onNavigateToAuth={navigateToAuth} onNavigateToBrowse={navigateToBrowse} />;
        }
        switch (authState.userRole) {
          case 'USER':
            return <UserDashboard userName={authState.userName || 'User'} />;
          case 'RESTAURANT':
            return <RestaurantDashboard restaurantName={authState.userName || 'Restaurant'} />;
          case 'ADMIN':
            return <AdminDashboard />;
          default:
            return <HomePage onNavigateToAuth={navigateToAuth} onNavigateToBrowse={navigateToBrowse} />;
        }
      default:
        return <HomePage onNavigateToAuth={navigateToAuth} onNavigateToBrowse={navigateToBrowse} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        isAuthenticated={authState.isAuthenticated}
        userRole={authState.userRole}
        userName={authState.userName}
        onNavigateToAuth={navigateToAuth}
        onNavigateToHome={navigateToHome}
        onNavigateToDashboard={() => setCurrentPage('dashboard')}
        onLogout={handleLogout}
      />
      <main className="grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
