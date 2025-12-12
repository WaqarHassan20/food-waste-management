# Authentication & State Management - Complete Guide

## Overview
The FoodShare app uses **client-side state management** with React's `useState` hook to manage authentication and navigation. Currently, **there is NO backend authentication** - it's a mock system for UI demo purposes.

---

## State Structure in App.tsx

The root component (`App.tsx`) manages all state:

```typescript
interface AuthState {
  isAuthenticated: boolean;  // Is user logged in?
  userRole: UserRole | null; // USER | RESTAURANT | ADMIN | null
  userName: string | null;   // Display name of logged-in user
}

type Page = 'home' | 'auth' | 'browse' | 'dashboard';
```

### Three Main State Variables:

```typescript
const [currentPage, setCurrentPage] = useState<Page>('home');
const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
const [authState, setAuthState] = useState<AuthState>({
  isAuthenticated: false,
  userRole: null,
  userName: null,
});
```

| State Variable | Purpose | Initial Value |
|---|---|---|
| `currentPage` | Controls which page is displayed | `'home'` |
| `authMode` | Whether auth form is in signin or signup mode | `'signin'` |
| `authState` | User authentication info (nested object) | All falsy/null |

---

## Auth Flow - Step by Step

### 1. **User Not Logged In (Initial State)**
```
AuthState: {
  isAuthenticated: false,
  userRole: null,
  userName: null
}
CurrentPage: 'home'
```

**What the UI shows:**
- Navbar displays "Sign In" and "Sign Up" buttons
- HomePage is rendered
- Dashboard is inaccessible

---

### 2. **User Clicks "Sign Up" Button**
```typescript
// HomePage.tsx triggers this:
<Button onClick={() => onNavigateToAuth('signup')} />

// Which calls in App.tsx:
const navigateToAuth = (mode: 'signin' | 'signup' = 'signin') => {
  setAuthMode(mode);        // 'signin' → 'signup'
  setCurrentPage('auth');   // 'home' → 'auth'
};
```

**State after:**
```
authMode: 'signup'
currentPage: 'auth'
(authState remains unchanged)
```

**What the UI shows:**
- AuthPage appears with signup form
- Extra "Full Name" field visible (signup only)
- Role selection buttons: User, Restaurant, Admin

---

### 3. **User Fills Form & Selects Role**
```typescript
// In AuthPage.tsx:
const [selectedRole, setSelectedRole] = useState<UserRole>('USER');
const [formData, setFormData] = useState({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

// When user types, formData updates (local state in AuthPage, not global)
// When user clicks role button:
setSelectedRole('RESTAURANT');  // e.g., user chose restaurant role
```

**Important Note:**
Form data stays LOCAL in AuthPage component. It's not sent to global auth state yet.

---

### 4. **User Submits Form**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (isSignUp && formData.password !== formData.confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  // ✨ THIS IS THE KEY CALL ✨
  onLogin(selectedRole, formData.name || formData.email.split('@')[0]);
};
```

**What is `onLogin`?**
It's a prop passed from App.tsx to AuthPage:

```typescript
// In App.tsx:
const handleLogin = (role: UserRole, name: string) => {
  setAuthState({
    isAuthenticated: true,
    userRole: role,      // e.g., 'RESTAURANT'
    userName: name,      // e.g., 'My Restaurant'
  });
  setCurrentPage('dashboard');  // Navigate to dashboard
};

// Passed down:
<AuthPage onLogin={handleLogin} ... />
```

---

### 5. **After Successful Login**

**State becomes:**
```typescript
AuthState: {
  isAuthenticated: true,
  userRole: 'RESTAURANT',
  userName: 'My Restaurant'
}
CurrentPage: 'dashboard'
```

**What the UI shows:**
1. Page switches to dashboard via `renderPage()` switch statement
2. App checks: `if (authState.isAuthenticated)` ✅ true
3. Checks `authState.userRole` ✅ 'RESTAURANT'
4. Renders `<RestaurantDashboard restaurantName={authState.userName} />`
5. Navbar now shows:
   - "Dashboard" button
   - User info: "My Restaurant (RESTAURANT)"
   - "Logout" button

---

## Navigation Flow - Complete Map

### From HomePage:
```
┌─────────────────────────┐
│     HomePage            │
└─────────────────────────┘
          ↓ clicks "Get Started Free"
          ↓ onNavigateToAuth('signup')
┌─────────────────────────┐
│     AuthPage (SIGNUP)   │
│  - Role selection       │
│  - Email, Password      │
│  - Name field           │
└─────────────────────────┘
          ↓ submits form
          ↓ onLogin(role, name)
┌─────────────────────────┐
│   Dashboard             │
│  (depends on role)      │
├─────────────────────────┤
│ USER    → UserDashboard        │
│ RESTAURANT → RestaurantDashboard │
│ ADMIN   → AdminDashboard       │
└─────────────────────────┘
```

### Navigation Functions:
```typescript
navigateToAuth(mode?: 'signin' | 'signup')     // home → auth
navigateToHome()                                // any page → home
navigateToBrowse()                              // any page → browse
handleLogin(role, name)                         // auth → dashboard
handleLogout()                                  // dashboard → home
```

---

## Logout Flow

**When user clicks "Logout" in Navbar:**

```typescript
const handleLogout = () => {
  setAuthState({
    isAuthenticated: false,
    userRole: null,
    userName: null,
  });
  setCurrentPage('home');
};
```

**State becomes:**
```
Same as initial state - back to square one!
```

**Effect:**
- User is removed from auth
- Navbar shows "Sign In" and "Sign Up" buttons again
- User returns to HomePage

---

## Page Rendering Logic

```typescript
const renderPage = () => {
  switch (currentPage) {
    case 'home':
      return <HomePage />;
    
    case 'auth':
      return <AuthPage initialMode={authMode} onLogin={handleLogin} />;
    
    case 'browse':
      return <FoodBrowsePage />;
    
    case 'dashboard':
      // Protected route - check if user is logged in
      if (!authState.isAuthenticated) {
        setCurrentPage('home');  // Redirect to home if not authenticated
        return <HomePage />;
      }
      
      // Now render dashboard based on role
      switch (authState.userRole) {
        case 'USER':
          return <UserDashboard userName={authState.userName || 'User'} />;
        case 'RESTAURANT':
          return <RestaurantDashboard restaurantName={authState.userName || 'Restaurant'} />;
        case 'ADMIN':
          return <AdminDashboard />;
        default:
          return <HomePage />;
      }
    
    default:
      return <HomePage />;
  }
};
```

---

## AuthPage Component Details

### Local State (stays in AuthPage):
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

### Props (from App.tsx):
```typescript
interface AuthPageProps {
  onLogin: (role: UserRole, name: string) => void;
  onNavigateToHome: () => void;
  initialMode?: 'signin' | 'signup';
}
```

### Form Features:
- **Role Selection**: 3 buttons (USER, RESTAURANT, ADMIN) - visual selection
- **Toggle Mode**: "Don't have an account?" link switches between signin/signup
- **Validation**: 
  - Checks password match on signup
  - Uses basic HTML5 validation (required fields)
- **Demo Auth**: No actual backend call - just takes form values and logs user in

---

## Navbar Component

### Props Received:
```typescript
interface NavbarProps {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userName: string | null;
  onNavigateToAuth: (mode?: 'signin' | 'signup') => void;
  onNavigateToHome: () => void;
  onNavigateToDashboard: () => void;
  onLogout: () => void;
}
```

### Conditional Rendering:
```typescript
{isAuthenticated ? (
  <>
    <Dashboard Button />
    <span>{userName} ({userRole})</span>
    <Logout Button />
  </>
) : (
  <>
    <SignIn Button />
    <SignUp Button />
  </>
)}
```

**If authenticated:** Shows user info and logout
**If not:** Shows sign in/up buttons

---

## Issues & Limitations ⚠️

### Current Issues:
1. **No Persistence** - Refresh page = logged out (auth state lost)
2. **No Backend Integration** - No actual API calls to validate credentials
3. **No Token Management** - No JWT tokens or session storage
4. **No Error Handling** - No network error handling
5. **Password Security** - Passwords sent as plain text (demo only)
6. **No Protected Routes** - Users can manipulate state directly

### What Needs to Happen for Production:

```
✅ CURRENT (Demo)              vs    ❌ NEEDED (Production)
├─ Client-side state only      ├─ Backend API for auth
├─ Mock login                  ├─ Real credential validation
├─ No persistence              ├─ JWT tokens + localStorage
├─ No error handling           ├─ Proper error messages
└─ No real dashboards          └─ Backend data integration
```

---

## Data Flow Summary

```
┌──────────────────────────────────────────────────────┐
│                    App.tsx (Root)                    │
│  ┌───────────────────────────────────────────────┐  │
│  │ State:                                        │  │
│  │ - currentPage: 'home'|'auth'|'browse'|'dash' │  │
│  │ - authMode: 'signin'|'signup'                 │  │
│  │ - authState: {isAuthenticated, role, name}   │  │
│  └───────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────┐  │
│  │  Navbar      │  │  Pages       │  │ Footer  │  │
│  │              │  │              │  │         │  │
│  │ Receives:    │  │ Receive:     │  │         │  │
│  │ - authState  │  │ - callbacks  │  │         │  │
│  │ - callbacks  │  │ - authState  │  │         │  │
│  │              │  │              │  │         │  │
│  │ Shows auth   │  │ AuthPage has │  │ Static  │  │
│  │ buttons or   │  │ local form   │  │         │  │
│  │ user info    │  │ state        │  │         │  │
│  └──────────────┘  └──────────────┘  └─────────┘  │
│                                                      │
│  ┌───────────────────────────────────────────────┐  │
│  │ Callback Functions (passed to children):      │  │
│  │ - handleLogin()      → updates authState      │  │
│  │ - handleLogout()     → clears authState       │  │
│  │ - navigateToAuth()   → changes currentPage    │  │
│  │ - navigateToHome()   → changes currentPage    │  │
│  │ - navigateToBrowse() → changes currentPage    │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘

                    PARENT → CHILD
              (Props & Callbacks Flow)
```

---

## Key Takeaways

1. **Single Source of Truth**: All auth state in App.tsx
2. **Props Drilling**: State and callbacks passed down to children
3. **No Context API**: Would be cleaner with Context, but works with props for this size app
4. **Demo-Only**: Currently no real backend integration
5. **Role-Based UI**: Dashboard changes based on `authState.userRole`
6. **Page-Based Routing**: No React Router, just state-based page switching

---

## Next Steps for Production

1. **Add React Router** for proper URL routing
2. **Create Auth Context** to avoid prop drilling
3. **Implement Backend API** with real authentication
4. **Add localStorage** for token persistence
5. **Add Error Boundaries** for crash prevention
6. **Implement JWT token** handling
7. **Add proper error handling** for failed API calls
