# Auth & State Code Examples

## Quick Reference: How Everything Connects

### 1. The Auth State Definition

**File: `src/App.tsx`**

```typescript
// Type definition
interface AuthState {
  isAuthenticated: boolean;  // true = logged in, false = logged out
  userRole: UserRole | null; // 'USER' | 'RESTAURANT' | 'ADMIN' | null
  userName: string | null;   // Display name or null
}

// Page types
type Page = 'home' | 'auth' | 'browse' | 'dashboard';

// In the App component:
function App() {
  // Create three separate state variables
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userRole: null,
    userName: null,
  });
  // ... rest of component
}
```

---

### 2. Login Handler

**File: `src/App.tsx`**

```typescript
// This is called when user submits the auth form
const handleLogin = (role: UserRole, name: string) => {
  // Update the auth state
  setAuthState({
    isAuthenticated: true,    // Mark user as logged in
    userRole: role,           // Store selected role
    userName: name,           // Store user's name
  });
  
  // Redirect to dashboard
  setCurrentPage('dashboard');
  
  // In a real app, this would:
  // 1. Send credentials to backend
  // 2. Receive JWT token
  // 3. Store token in localStorage
  // 4. Set Authorization header for future requests
  // But for now it's just updating local state
};
```

---

### 3. Logout Handler

**File: `src/App.tsx`**

```typescript
// This is called when user clicks logout button
const handleLogout = () => {
  // Clear all auth state
  setAuthState({
    isAuthenticated: false,
    userRole: null,
    userName: null,
  });
  
  // Redirect to home
  setCurrentPage('home');
  
  // In a real app, this would:
  // 1. Send logout request to backend
  // 2. Remove token from localStorage
  // 3. Clear Authorization headers
};
```

---

### 4. Navigation Handlers

**File: `src/App.tsx`**

```typescript
// Navigate to auth page with specific mode
const navigateToAuth = (mode: 'signin' | 'signup' = 'signin') => {
  setAuthMode(mode);        // Set whether we're signing in or up
  setCurrentPage('auth');   // Show auth page
};

// Go back home
const navigateToHome = () => {
  setCurrentPage('home');
};

// Go to food browse page
const navigateToBrowse = () => {
  setCurrentPage('browse');
};
```

---

### 5. Page Rendering Logic

**File: `src/App.tsx`**

```typescript
const renderPage = () => {
  switch (currentPage) {
    case 'home':
      return <HomePage onNavigateToAuth={navigateToAuth} onNavigateToBrowse={navigateToBrowse} />;
    
    case 'auth':
      // Pass in login callback and current mode
      return <AuthPage onLogin={handleLogin} onNavigateToHome={navigateToHome} initialMode={authMode} />;
    
    case 'browse':
      return <FoodBrowsePage />;
    
    case 'dashboard':
      // PROTECTED ROUTE CHECK
      if (!authState.isAuthenticated) {
        // User not logged in, redirect home
        setCurrentPage('home');
        return <HomePage onNavigateToAuth={navigateToAuth} onNavigateToBrowse={navigateToBrowse} />;
      }
      
      // User is logged in, render based on role
      switch (authState.userRole) {
        case 'USER':
          return <UserDashboard userName={authState.userName || 'User'} />;
        
        case 'RESTAURANT':
          return <RestaurantDashboard restaurantName={authState.userName || 'Restaurant'} />;
        
        case 'ADMIN':
          return <AdminDashboard />;
        
        default:
          // Unknown role, show home
          return <HomePage onNavigateToAuth={navigateToAuth} onNavigateToBrowse={navigateToBrowse} />;
      }
    
    default:
      return <HomePage onNavigateToAuth={navigateToAuth} onNavigateToBrowse={navigateToBrowse} />;
  }
};
```

---

### 6. Navbar Conditional Rendering

**File: `src/components/layout/Navbar.tsx`**

```typescript
export const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  userRole,
  userName,
  onNavigateToAuth,
  onNavigateToHome,
  onNavigateToDashboard,
  onLogout,
}) => {
  return (
    <nav>
      {/* Logo */}
      <button onClick={onNavigateToHome}>
        <span>FoodShare</span>
      </button>

      {/* Right side buttons - changes based on auth status */}
      {isAuthenticated ? (
        <>
          {/* LOGGED IN VIEW */}
          <button onClick={onNavigateToDashboard}>
            Dashboard
          </button>
          
          {/* Show username and role */}
          <span>
            {userName} ({userRole})
          </span>
          
          {/* Logout button */}
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </>
      ) : (
        <>
          {/* NOT LOGGED IN VIEW */}
          <Button 
            variant="outline" 
            onClick={() => onNavigateToAuth('signin')}
          >
            Sign In
          </Button>
          
          <Button onClick={() => onNavigateToAuth('signup')}>
            Sign Up
          </Button>
        </>
      )}
    </nav>
  );
};
```

**Key Point:** The `isAuthenticated` prop determines which buttons show. It's passed from `App.tsx`:

```typescript
<Navbar 
  isAuthenticated={authState.isAuthenticated}  // ← from state
  userRole={authState.userRole}                // ← from state
  userName={authState.userName}                // ← from state
  onLogout={handleLogout}                      // ← callback
  // ... other props
/>
```

---

### 7. AuthPage Form Handling

**File: `src/pages/AuthPage.tsx`**

```typescript
export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onNavigateToHome,
  initialMode = 'signin'
}) => {
  // LOCAL state - only in this component
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (isSignUp && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Call parent's login handler with role and name
    // This updates authState in App.tsx
    onLogin(selectedRole, formData.name || formData.email.split('@')[0]);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update local form state
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {/* Back button */}
      <button onClick={onNavigateToHome}>
        ← Back to Home
      </button>

      {/* Role Selection - LOCAL STATE */}
      <div>
        <label>Select your role:</label>
        <button
          onClick={() => setSelectedRole('USER')}
          className={selectedRole === 'USER' ? 'active' : ''}
        >
          👤 User
        </button>
        
        <button
          onClick={() => setSelectedRole('RESTAURANT')}
          className={selectedRole === 'RESTAURANT' ? 'active' : ''}
        >
          🍽️ Restaurant
        </button>
        
        <button
          onClick={() => setSelectedRole('ADMIN')}
          className={selectedRole === 'ADMIN' ? 'active' : ''}
        >
          ⚙️ Admin
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Show name field only in signup mode */}
        {isSignUp && (
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter your password"
          required
        />

        {/* Show confirm password only in signup mode */}
        {isSignUp && (
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            required
          />
        )}

        {/* Button text changes based on mode */}
        <Button type="submit" className="w-full">
          {isSignUp ? '🚀 Create Account' : '🔓 Sign In'}
        </Button>
      </form>

      {/* Toggle between signin and signup */}
      <div>
        <p>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        </p>
        <button onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
};
```

**Important:** Notice that `formData` is LOCAL to AuthPage. When the user submits:
1. `handleSubmit()` extracts values from `formData`
2. Calls `onLogin(selectedRole, name)`
3. This calls `handleLogin()` in `App.tsx`
4. Which updates the GLOBAL `authState`
5. Form state is left behind and eventually cleared

---

### 8. HomePage Sign Up Flow

**File: `src/pages/HomePage.tsx`**

```typescript
export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToAuth,
  onNavigateToBrowse
}) => {
  return (
    <div>
      {/* Hero section */}
      <section>
        <h1>Reduce Food Waste, Feed Communities</h1>
        <p>Connect restaurants with surplus food...</p>
        
        {/* Sign up button */}
        <Button onClick={() => onNavigateToAuth('signup')}>
          🚀 Get Started Free
        </Button>
        
        {/* Browse button - no auth required */}
        <Button onClick={onNavigateToBrowse}>
          🍽️ Browse Food Listings
        </Button>
      </section>

      {/* Rest of page */}
    </div>
  );
};
```

When user clicks "Get Started Free":
1. `onNavigateToAuth('signup')` is called
2. This is the `navigateToAuth()` function from `App.tsx`
3. Which does:
   ```typescript
   setAuthMode('signup')     // Set mode
   setCurrentPage('auth')    // Change page
   ```
4. App re-renders with `currentPage='auth'`
5. `renderPage()` returns `<AuthPage initialMode='signup' />`
6. AuthPage shows with signup form

---

### 9. Complete User Journey - Code Style

```typescript
// USER ACTION: Clicks "Get Started Free" in HomePage
// ============================================

// 1. HomePage calls callback
onClick={() => onNavigateToAuth('signup')}

// 2. This triggers App.tsx:
const navigateToAuth = (mode: 'signin' | 'signup' = 'signin') => {
  setAuthMode(mode);        // 'signup'
  setCurrentPage('auth');   // 'auth'
};

// 3. App re-renders. renderPage() returns:
<AuthPage 
  onLogin={handleLogin}           // callback to login
  onNavigateToHome={navigateToHome}
  initialMode={authMode}          // 'signup'
/>

// 4. AuthPage renders signup form with:
const [isSignUp, setIsSignUp] = useState(initialMode === 'signup'); // true
const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// 5. User fills form:
// - Name: "John Doe"
// - Email: "john@example.com"
// - Password: "secure123"
// - Confirm: "secure123"

// 6. User selects "RESTAURANT" role:
onClick={() => setSelectedRole('RESTAURANT')}

// 7. User submits form:
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  // Password validation
  if (formData.password !== formData.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  // Call parent's login function
  // This is App.tsx's handleLogin()
  onLogin('RESTAURANT', 'John Doe');
};

// 8. Back in App.tsx, handleLogin executes:
const handleLogin = (role: UserRole, name: string) => {
  setAuthState({
    isAuthenticated: true,      // Login successful!
    userRole: 'RESTAURANT',     // Extracted from role
    userName: 'John Doe',       // Extracted from name
  });
  
  setCurrentPage('dashboard');  // Redirect
};

// 9. App re-renders. renderPage() returns:
case 'dashboard':
  if (!authState.isAuthenticated) {  // true, so pass this check
    setCurrentPage('home');
    return <HomePage />;
  }
  switch (authState.userRole) {       // 'RESTAURANT'
    case 'RESTAURANT':
      return <RestaurantDashboard restaurantName="John Doe" />;
    // ...
  }

// 10. RestaurantDashboard renders!
// User sees: "Welcome John Doe's Restaurant"
```

---

### 10. What Happens On Page Refresh

```typescript
// PROBLEM: User is logged in, navigates away, comes back

// Before refresh:
authState = {
  isAuthenticated: true,
  userRole: 'RESTAURANT',
  userName: 'John Doe'
}

// User hits F5 (refresh)
// ↓
// React component unmounts and remounts
// ↓
// useState runs again with INITIAL values:
const [authState, setAuthState] = useState<AuthState>({
  isAuthenticated: false,  // ← RESET!
  userRole: null,
  userName: null,
});

// ↓
// User is logged out! ❌

// SOLUTION (not yet implemented):
// Use localStorage or Context API to persist state

const [authState, setAuthState] = useState<AuthState>(() => {
  // Check localStorage first
  const saved = localStorage.getItem('authState');
  if (saved) {
    return JSON.parse(saved);  // Use saved state
  }
  // Default if nothing saved
  return {
    isAuthenticated: false,
    userRole: null,
    userName: null,
  };
});

// Save whenever auth state changes:
useEffect(() => {
  localStorage.setItem('authState', JSON.stringify(authState));
}, [authState]);
```

---

## Summary: State Flow Sequence

```
┌─────────────────────────────────────────────────────────┐
│  SEQUENCE OF EVENTS                                    │
├─────────────────────────────────────────────────────────┤
│                                                        │
│  1. User Opens App                                    │
│     └─ App renders with initial state                │
│        authState: { isAuthenticated: false, ... }    │
│                                                        │
│  2. Navbar Renders                                    │
│     └─ Sees isAuthenticated=false                    │
│        Shows "Sign In" and "Sign Up" buttons         │
│                                                        │
│  3. User Clicks "Sign Up"                            │
│     └─ Calls onNavigateToAuth('signup')              │
│        App state updates:                            │
│        authMode: 'signup'                            │
│        currentPage: 'auth'                           │
│                                                        │
│  4. AuthPage Renders                                 │
│     └─ Receives initialMode='signup'                 │
│        Creates local form state                      │
│        Shows signup form with role buttons           │
│                                                        │
│  5. User Selects Role & Fills Form                   │
│     └─ Local state updates in AuthPage               │
│        selectedRole: 'RESTAURANT'                    │
│        formData: { email: '...', password: '...' }   │
│        (This is still LOCAL, not in App yet)         │
│                                                        │
│  6. User Submits Form                                │
│     └─ AuthPage.handleSubmit() runs                  │
│        Validates passwords                           │
│        Calls onLogin('RESTAURANT', 'John')           │
│                                                        │
│  7. App.handleLogin() Executes                       │
│     └─ Updates GLOBAL authState:                     │
│        isAuthenticated: true                         │
│        userRole: 'RESTAURANT'                        │
│        userName: 'John'                              │
│        Changes currentPage to 'dashboard'            │
│                                                        │
│  8. App Re-renders                                   │
│     └─ renderPage() checks currentPage              │
│        Runs protected route check ✓                 │
│        Checks authState.userRole                    │
│        Returns <RestaurantDashboard />               │
│                                                        │
│  9. Navbar Re-renders                                │
│     └─ Sees isAuthenticated=true                     │
│        Hides Sign In/Sign Up buttons                │
│        Shows Dashboard, user info, Logout            │
│                                                        │
│  10. User Clicks Logout                              │
│      └─ Navbar calls onLogout()                      │
│         App.handleLogout() runs:                     │
│         Clears authState                            │
│         Sets currentPage='home'                      │
│         Back to initial state                       │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

This is the complete auth flow! Pretty straightforward when you see it step by step.
