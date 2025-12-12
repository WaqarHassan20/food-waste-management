# Component Props & Callbacks Map

## Complete Props Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        App.tsx (Root)                            │
│                                                                  │
│  State Variables:                                                │
│  • currentPage: 'home' | 'auth' | 'browse' | 'dashboard'        │
│  • authMode: 'signin' | 'signup'                                │
│  • authState: { isAuthenticated, userRole, userName }           │
│                                                                  │
│  Callback Functions:                                             │
│  • handleLogin(role, name)                                       │
│  • handleLogout()                                                │
│  • navigateToAuth(mode)                                          │
│  • navigateToHome()                                              │
│  • navigateToBrowse()                                            │
│  • renderPage() ← Determines what to show                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
    │
    ├───────────────────────────┬──────────────────┬──────────┐
    ↓                           ↓                  ↓          ↓
┌────────────────┐      ┌────────────────────┐  ┌────────┐  │
│   Navbar.tsx   │      │  renderPage()      │  │ Footer │  │
│                │      │  Output            │  │        │  │
├────────────────┤      │                    │  └────────┘  │
│ Props:         │      ├────────────────────┤              │
│                │      │                    │              │
│ isAuthenticated│      │ if home:           │              │
│ userRole       │      │ <HomePage />       │              │
│ userName       │      │                    │              │
│                │      │ if auth:           │              │
│ onNavigateToAuth   │ <AuthPage />       │
│ onNavigateToHome   │                    │              │
│ onNavigateToDash   │ if browse:         │
│ onLogout           │ <FoodBrowsePage /> │
│                    │                    │
│ Functions used:    │ if dashboard:      │
│ • Shows auth       │ <UserDashboard />  │
│   buttons or       │ <RestaurantDash /> │
│   user info        │ <AdminDashboard /> │
│ • Allows logout    │                    │
│ • Nav to auth      │                    │
└────────────────┘  └────────────────────┘

     NAVBAR                    MAIN CONTENT
```

---

## Detailed Component Props

### 1. Navbar Component

**File**: `src/components/layout/Navbar.tsx`

**Props Received from App**:
```typescript
interface NavbarProps {
  isAuthenticated: boolean;           // true/false
  userRole: UserRole | null;          // 'USER' | 'RESTAURANT' | 'ADMIN' | null
  userName: string | null;            // e.g., 'John Doe'
  
  // Callback functions
  onNavigateToAuth: (mode?: 'signin' | 'signup') => void;
  onNavigateToHome: () => void;
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}
```

**How it's called in App.tsx**:
```typescript
<Navbar 
  isAuthenticated={authState.isAuthenticated}
  userRole={authState.userRole}
  userName={authState.userName}
  onNavigateToAuth={navigateToAuth}
  onNavigateToHome={navigateToHome}
  onNavigateToDashboard={() => setCurrentPage('dashboard')}
  onLogout={handleLogout}
/>
```

**What Navbar Does**:
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
      {/* Logo - always shown */}
      <button onClick={onNavigateToHome}>
        FoodShare
      </button>

      {/* Conditional content based on isAuthenticated */}
      <div>
        {isAuthenticated ? (
          <>
            {/* LOGGED IN */}
            <button onClick={onNavigateToDashboard}>
              Dashboard
            </button>
            
            <span>
              {userName} ({userRole})
            </span>
            
            <Button onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            {/* NOT LOGGED IN */}
            <Button onClick={() => onNavigateToAuth('signin')}>
              Sign In
            </Button>
            
            <Button onClick={() => onNavigateToAuth('signup')}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </nav>
  );
};
```

---

### 2. HomePage Component

**File**: `src/pages/HomePage.tsx`

**Props Received from App**:
```typescript
interface HomePageProps {
  onNavigateToAuth: (mode?: 'signin' | 'signup') => void;
  onNavigateToBrowse: () => void;
}
```

**How it's called in App.tsx**:
```typescript
<HomePage 
  onNavigateToAuth={navigateToAuth}
  onNavigateToBrowse={navigateToBrowse}
/>
```

**Key Usage**:
```typescript
export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToAuth,
  onNavigateToBrowse
}) => {
  return (
    <div>
      {/* Hero Section */}
      <section>
        <h1>Reduce Food Waste, Feed Communities</h1>
        
        {/* When user clicks this button */}
        <Button onClick={() => onNavigateToAuth('signup')}>
          🚀 Get Started Free
        </Button>
        
        <Button onClick={onNavigateToBrowse}>
          🍽️ Browse Food Listings
        </Button>
      </section>

      {/* How It Works Section */}
      {/* Benefits Section */}
      {/* Testimonials Section */}
      {/* Call to Action Section */}
      
      <Button 
        onClick={() => onNavigateToAuth('signup')}
      >
        🎯 Sign Up Now - It's Free
      </Button>
    </div>
  );
};
```

---

### 3. AuthPage Component

**File**: `src/pages/AuthPage.tsx`

**Props Received from App**:
```typescript
interface AuthPageProps {
  onLogin: (role: UserRole, name: string) => void;
  onNavigateToHome: () => void;
  initialMode?: 'signin' | 'signup';
}
```

**How it's called in App.tsx**:
```typescript
<AuthPage 
  onLogin={handleLogin}
  onNavigateToHome={navigateToHome}
  initialMode={authMode}
/>
```

**Local State (stays in AuthPage)**:
```typescript
const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});
```

**Key Functionality**:
```typescript
export const AuthPage: React.FC<AuthPageProps> = ({
  onLogin,
  onNavigateToHome,
  initialMode = 'signin'
}) => {
  // ... state declarations above ...

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (isSignUp && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Extract name from form or email
    const nameToUse = formData.name || formData.email.split('@')[0];
    
    // Call parent's login function
    // This updates authState in App.tsx!
    onLogin(selectedRole, nameToUse);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {/* Back Button */}
      <button onClick={onNavigateToHome}>
        ← Back to Home
      </button>

      {/* Role Selection Buttons */}
      <div>
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
        {/* Name - only in signup */}
        {isSignUp && (
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        )}

        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
        />

        {/* Confirm Password - only in signup */}
        {isSignUp && (
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />
        )}

        <Button type="submit">
          {isSignUp ? '🚀 Create Account' : '🔓 Sign In'}
        </Button>
      </form>

      {/* Toggle between signin and signup */}
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Sign In' : 'Sign Up'}
      </button>
    </div>
  );
};
```

---

### 4. Dashboard Components

#### UserDashboard

**File**: `src/pages/UserDashboard.tsx`

**Props Received from App**:
```typescript
interface UserDashboardProps {
  userName: string;
}

// Called as:
<UserDashboard userName={authState.userName || 'User'} />
```

#### RestaurantDashboard

**File**: `src/pages/RestaurantDashboard.tsx`

**Props Received from App**:
```typescript
interface RestaurantDashboardProps {
  restaurantName: string;
}

// Called as:
<RestaurantDashboard restaurantName={authState.userName || 'Restaurant'} />
```

#### AdminDashboard

**File**: `src/pages/AdminDashboard.tsx`

**Props Received from App**:
```typescript
// No specific props needed - admin dashboard is singular

// Called as:
<AdminDashboard />
```

---

## Complete Callback Chain

```
USER INTERACTION:

HomePage
└─ User clicks "Sign Up" button
   └─ calls: onNavigateToAuth('signup')
      └─ which is: App.navigateToAuth()
         └─ setAuthMode('signup')
         └─ setCurrentPage('auth')

AuthPage
└─ User fills form
└─ User selects role
└─ User clicks submit button
   └─ calls: onLogin('RESTAURANT', 'John')
      └─ which is: App.handleLogin()
         └─ setAuthState({ isAuthenticated: true, userRole: 'RESTAURANT', userName: 'John' })
         └─ setCurrentPage('dashboard')

Navbar
└─ User clicks Logout button
   └─ calls: onLogout()
      └─ which is: App.handleLogout()
         └─ setAuthState({ isAuthenticated: false, ... })
         └─ setCurrentPage('home')
```

---

## Props Summary Table

| Component | Props Received | Used For | Called From |
|-----------|---|---|---|
| **Navbar** | isAuthenticated, userRole, userName, onNavigateToAuth, onNavigateToHome, onNavigateToDashboard, onLogout | Rendering auth buttons or user info | handleLogin, handleLogout, navigateToAuth |
| **HomePage** | onNavigateToAuth, onNavigateToBrowse | Navigation buttons | navigateToAuth, navigateToBrowse |
| **AuthPage** | onLogin, onNavigateToHome, initialMode | Form submission, role selection | handleLogin, navigateToHome |
| **UserDashboard** | userName | Greeting/welcome | Auth state |
| **RestaurantDashboard** | restaurantName | Greeting/welcome | Auth state |
| **AdminDashboard** | none | Admin functions | Direct render |

---

## Data Flow Summary

```
App.tsx (Single Source of Truth)
  │
  ├─ authState ──┬─→ Navbar (conditional rendering)
  │              ├─→ Dashboard selection
  │              └─→ Protected route checks
  │
  ├─ currentPage ──→ renderPage() (what to show)
  │
  ├─ authMode ──→ AuthPage (which form mode)
  │
  └─ Callbacks ──┬─→ handleLogin (from AuthPage)
                 ├─→ handleLogout (from Navbar)
                 ├─→ navigateToAuth (from HomePage/Navbar)
                 ├─→ navigateToHome (from AuthPage/Navbar)
                 └─→ navigateToBrowse (from HomePage)
```

---

## Key Points

1. **All state lives in App.tsx** - single source of truth
2. **Props flow down** - state and callbacks passed to children
3. **Callbacks flow up** - children call parent functions to update state
4. **Conditional rendering** - what shows depends on state values
5. **Local state in components** - form data stays in AuthPage until submitted
6. **Global state in App** - auth info shared across entire app

