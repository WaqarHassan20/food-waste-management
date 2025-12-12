# Auth Flow Visual Diagrams

## 1. Complete State Update Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTION FLOW                        │
└─────────────────────────────────────────────────────────────────┘

INITIAL STATE:
┌─────────────────────────────────────────────────┐
│ currentPage: 'home'                             │
│ authState: {                                    │
│   isAuthenticated: false,                       │
│   userRole: null,                               │
│   userName: null                                │
│ }                                               │
└─────────────────────────────────────────────────┘
            ↓
            ↓ User clicks "Sign Up" button
            ↓
STEP 1: Navigate to Auth
┌─────────────────────────────────────────────────┐
│ navigateToAuth('signup')                        │
│   ├─ setAuthMode('signup')                      │
│   └─ setCurrentPage('auth')                     │
└─────────────────────────────────────────────────┘
  RESULT:
  ┌─────────────────────────────────────────────┐
  │ currentPage: 'auth'  ← Page switches!        │
  │ authMode: 'signup'   ← Form type changes     │
  │ authState: unchanged                        │
  └─────────────────────────────────────────────┘
            ↓
            ↓ AuthPage renders with signup form
            ↓ User selects "RESTAURANT" role
            ↓ User fills in email, password, name
            ↓ User clicks "Create Account"
            ↓
STEP 2: Submit Form
┌─────────────────────────────────────────────────┐
│ AuthPage.handleSubmit()                         │
│   └─ onLogin('RESTAURANT', 'My Restaurant')    │
│      (calls the handleLogin callback)           │
└─────────────────────────────────────────────────┘
  RESULT:
  ┌─────────────────────────────────────────────┐
  │ authState: {                                │
  │   isAuthenticated: true,      ← NOW LOGGED! │
  │   userRole: 'RESTAURANT',                   │
  │   userName: 'My Restaurant'                 │
  │ }                                           │
  │ currentPage: 'dashboard'  ← Redirected!     │
  └─────────────────────────────────────────────┘
            ↓
            ↓ App.renderPage() runs:
            ↓ currentPage === 'dashboard' ✓
            ↓ authState.isAuthenticated === true ✓
            ↓ authState.userRole === 'RESTAURANT' ✓
            ↓
STEP 3: Render Dashboard
┌─────────────────────────────────────────────────┐
│ <RestaurantDashboard                            │
│   restaurantName="My Restaurant"                │
│ />                                              │
└─────────────────────────────────────────────────┘
            ↓
            ↓ Navbar sees isAuthenticated=true
            ↓
STEP 4: Navbar Updates
┌─────────────────────────────────────────────────┐
│ Shows:                                          │
│  ├─ "Dashboard" button                          │
│  ├─ "My Restaurant (RESTAURANT)"               │
│  └─ "Logout" button                            │
│                                                 │
│ Hides:                                          │
│  ├─ "Sign In" button                           │
│  └─ "Sign Up" button                           │
└─────────────────────────────────────────────────┘
            ↓
            ↓ User clicks "Logout"
            ↓
STEP 5: Logout
┌─────────────────────────────────────────────────┐
│ Navbar.onLogout()                               │
│   └─ handleLogout() callback                    │
└─────────────────────────────────────────────────┘
  RESULT:
  ┌─────────────────────────────────────────────┐
  │ authState: {                                │
  │   isAuthenticated: false,   ← LOGGED OUT!   │
  │   userRole: null,                           │
  │   userName: null                            │
  │ }                                           │
  │ currentPage: 'home'  ← Back to home         │
  └─────────────────────────────────────────────┘
            ↓
            ↓ Navbar renders signup buttons again
            ↓ HomePage displays
            ↓ [FLOW REPEATS]

```

---

## 2. Component Prop Flow

```
┌──────────────────────────────────────────────────────────────┐
│                         App.tsx                              │
│  State: authState, currentPage, authMode                    │
│  Callbacks: handleLogin, handleLogout, navigate*()          │
└──────────────────────────────────────────────────────────────┘
    │
    ├──────────────────────────────┬──────────────────┬──────────┐
    ↓                              ↓                  ↓          ↓
┌─────────────┐          ┌──────────────────┐    ┌────────┐  ┌──────┐
│   Navbar    │          │   Main Content   │    │ Footer │  │ etc  │
│             │          │   (renderPage)   │    │        │  │      │
├─────────────┤          │                  │    └────────┘  └──────┘
│ Props:      │          │  ├─ HomePage    │
│ ├─ isAuth   │          │  ├─ AuthPage    │
│ ├─ role     │          │  ├─ Browse      │
│ ├─ userName │          │  └─ Dashboard   │
│ └─ callbacks│          │                  │
│             │          │ (which page?)   │
│ Renders:    │          │                  │
│ ├─ If NOT   │          │ (which role?)   │
│ │ authed:   │          │                  │
│ │ SignIn/   │          └──────────────────┘
│ │ SignUp    │                 ↓
│ │ buttons   │          ┌─────────────────────┐
│ │           │          │   AuthPage.tsx      │
│ ├─ If       │          ├─────────────────────┤
│ │ authed:   │          │ Local State:        │
│ │ User Info │          │ ├─ isSignUp         │
│ │ Dashboard │          │ ├─ selectedRole     │
│ │ Logout    │          │ ├─ formData         │
│ │ buttons   │          │                     │
│ └─────────────┘          │ Props: onLogin()   │
│                          │ Calls: onLogin()   │
│ Callbacks used:          │ with (role, name)  │
│ ├─ onNavigateToHome()    │                     │
│ ├─ onNavigateToAuth()    │ Renders:            │
│ ├─ onNavigateToDashboard │ ├─ Role buttons     │
│ └─ onLogout()            │ ├─ Email input      │
└────────────┘          │ ├─ Password input   │
                          │ ├─ Name input       │
                          │ │  (signup only)    │
                          │ └─ Submit button    │
                          └─────────────────────┘
```

---

## 3. AuthState vs Form State

```
┌─────────────────────────────────────────────────────────┐
│         WHAT'S GLOBAL vs LOCAL STATE?                  │
└─────────────────────────────────────────────────────────┘

GLOBAL STATE (App.tsx - used everywhere):
┌──────────────────────────────────────────────────────┐
│ authState = {                                        │
│   isAuthenticated: true/false   ← determines UI      │
│   userRole: 'USER'|'RESTAURANT'|'ADMIN'|null        │
│   userName: 'John'|null         ← shows in navbar   │
│ }                                                    │
│                                                      │
│ Affects:                                            │
│ ✓ What page renders (dashboard vs home)            │
│ ✓ Which buttons show in navbar                     │
│ ✓ Which dashboard component loads                  │
│ ✓ Whether user can access protected pages         │
└──────────────────────────────────────────────────────┘

LOCAL STATE (AuthPage only - temporary):
┌──────────────────────────────────────────────────────┐
│ formData = {                                         │
│   name: 'John Doe'      ← user typing              │
│   email: 'john@ex.com'  ← user typing              │
│   password: '****'      ← user typing              │
│   confirmPassword: '*'  ← user typing              │
│ }                                                    │
│                                                      │
│ selectedRole = 'RESTAURANT'  ← button clicked      │
│                                                      │
│ isSignUp = true|false   ← toggle clicked           │
│                                                      │
│ These are TEMPORARY:                               │
│ - Only exist while on auth page                    │
│ - Reset when navigating away                       │
│ - Only sent to authState when form submitted       │
└──────────────────────────────────────────────────────┘

FLOW:
┌─────────────┐
│  formData   │  ← User types in inputs
│  (local)    │
└──────┬──────┘
       ↓
       ↓ User submits form
       ↓
┌─────────────────────────────────────────┐
│ onLogin('RESTAURANT', 'John')           │
│          ↓                              │
│      Extracts selected values           │
└──────────┬──────────────────────────────┘
           ↓
      ┌─────────────┐
      │ authState   │  ← Now in GLOBAL state
      │ (global)    │     Persists across pages
      └─────────────┘
```

---

## 4. Role-Based Dashboard Routing

```
User submits login with selectedRole = 'RESTAURANT'
            ↓
    onLogin('RESTAURANT', name)
            ↓
    authState.userRole = 'RESTAURANT'
    authState.isAuthenticated = true
    currentPage = 'dashboard'
            ↓
    App.renderPage() is called
            ↓
    ┌─────────────────────────────────────────────┐
    │ if (currentPage === 'dashboard') {           │
    │   if (!isAuthenticated) {                    │
    │     redirect to home    ← Protection!       │
    │   }                                         │
    │                                             │
    │   switch (authState.userRole) {             │
    │     case 'USER':                            │
    │       return <UserDashboard />              │
    │       break;                                │
    │                                             │
    │     case 'RESTAURANT':                      │
    │       return <RestaurantDashboard />  ✓     │
    │       break;                                │
    │                                             │
    │     case 'ADMIN':                           │
    │       return <AdminDashboard />             │
    │       break;                                │
    │   }                                         │
    │ }                                           │
    └─────────────────────────────────────────────┘
            ↓
    RestaurantDashboard renders with:
    restaurantName="John's Restaurant"
            ↓
    ┌─────────────────────────────────┐
    │  Restaurant Dashboard UI        │
    │  ├─ Add new food listing        │
    │  ├─ View pending requests       │
    │  ├─ Approve/Reject requests     │
    │  └─ Analytics (if implemented)  │
    └─────────────────────────────────┘
```

---

## 5. Sign In vs Sign Up Mode

```
User clicks "Sign Up" in HomePage
            ↓
    navigateToAuth('signup')
            ↓
    setAuthMode('signup')  ← Important!
    setCurrentPage('auth')
            ↓
    AuthPage receives: initialMode='signup'
            ↓
    ┌─────────────────────────────────────┐
    │ useEffect or useState:              │
    │ setIsSignUp(initialMode === 'signup')
    │           ↓                         │
    │ isSignUp = true                     │
    └─────────────────────────────────────┘
            ↓
    Conditional rendering:
    
    ┌──────────────────────────────────────┐
    │ {isSignUp ? (                        │
    │   <Input                             │
    │     label="Full Name"                │
    │     name="name"                      │
    │     ...                              │
    │   />                                 │
    │ ) : null}                            │
    │ ← This shows ONLY in signup mode     │
    └──────────────────────────────────────┘
    
    ┌──────────────────────────────────────┐
    │ {isSignUp ? (                        │
    │   <Input                             │
    │     label="Confirm Password"         │
    │     ...                              │
    │   />                                 │
    │ ) : null}                            │
    │ ← This shows ONLY in signup mode     │
    └──────────────────────────────────────┘
    
    Button text changes:
    ┌──────────────────────────────────────┐
    │ <Button type="submit">               │
    │   {isSignUp ?                        │
    │     '🚀 Create Account'  ← SignUp    │
    │     : '🔓 Sign In'        ← SignIn   │
    │   }                                  │
    │ </Button>                            │
    └──────────────────────────────────────┘
    
    Toggle link at bottom:
    ┌──────────────────────────────────────┐
    │ <button                              │
    │   onClick={() => setIsSignUp(!isSignUp)}
    │ >                                    │
    │   {isSignUp                          │
    │     ? 'Sign In'       ← Show if in signup
    │     : 'Sign Up'       ← Show if in signin
    │   }                                  │
    │ </button>                            │
    └──────────────────────────────────────┘
```

---

## 6. Protected Route Pattern (Dashboard)

```
User tries to access /dashboard without being logged in
            ↓
    setCurrentPage('dashboard')
            ↓
    renderPage() is called
            ↓
    currentPage === 'dashboard' ? YES
            ↓
    ┌──────────────────────────────────┐
    │ if (!authState.isAuthenticated) {│
    │   setCurrentPage('home')          │
    │   return <HomePage />             │
    │   // ↑ PROTECTION!               │
    │ }                                 │
    └──────────────────────────────────┘
            ↓
    User is redirected to HomePage
    Dashboard never renders
    Navbar shows Sign In/Sign Up buttons
    
    
BUT if user IS authenticated:
            ↓
    authState.isAuthenticated === true
            ↓
    switch (authState.userRole) { ... }
            ↓
    Dashboard renders based on role
```

---

## 7. State Persistence Problem (Current Issue)

```
Current Behavior:
┌──────────────────────────────────────────┐
│ User Signs In                            │
│ authState loaded in memory (App.tsx)     │
│ Application works perfectly              │
│                                          │
│ User refreshes page (F5)                 │
│ ↓                                        │
│ React component re-mounts                │
│ useState(() => ({                        │
│   isAuthenticated: false,  ← RESET!      │
│   userRole: null,                        │
│   userName: null                         │
│ }))                                      │
│                                          │
│ User is logged out ❌                    │
└──────────────────────────────────────────┘

Solution (Not Yet Implemented):
┌──────────────────────────────────────────┐
│ User Signs In                            │
│ authState loaded in memory               │
│ Save to localStorage:                    │
│ localStorage.setItem(                    │
│   'authState',                           │
│   JSON.stringify(authState)              │
│ )                                        │
│                                          │
│ User refreshes page                      │
│ ↓                                        │
│ React component mounts                   │
│ Read from localStorage:                  │
│ const saved = localStorage.getItem(...)  │
│ useState(() => saved || defaultState)    │
│                                          │
│ User stays logged in ✓                   │
└──────────────────────────────────────────┘
```

---

## 8. Authentication Callback Chain

```
HomePage Component
├─ User clicks "Sign Up"
└─ calls: onNavigateToAuth('signup')
          ↓
          This is a reference to:
          navigateToAuth() in App.tsx
          ↓
App.tsx navigateToAuth()
├─ setAuthMode('signup')
├─ setCurrentPage('auth')
└─ AuthPage renders
          ↓
AuthPage Component
├─ User fills form
├─ User selects role
├─ User clicks submit
└─ calls: onLogin('RESTAURANT', 'John')
          ↓
          This is a reference to:
          handleLogin() in App.tsx
          ↓
App.tsx handleLogin()
├─ setAuthState({
│   isAuthenticated: true,
│   userRole: 'RESTAURANT',
│   userName: 'John'
│ })
├─ setCurrentPage('dashboard')
└─ RestaurantDashboard renders
          ↓
RestaurantDashboard Component
├─ Receives userName="John" as prop
└─ Uses it to display personalized content

This entire chain is called:
"LIFTING STATE UP"
- State changes happen in parent (App)
- Children trigger callbacks that change parent state
- Parent re-renders with new props
- Children update to reflect new state
```

---

## Key Concepts Summary

| Concept | Where | When | Purpose |
|---------|-------|------|---------|
| `authState` | App.tsx | Always | Tracks login status globally |
| `currentPage` | App.tsx | Always | Controls which page renders |
| `formData` | AuthPage | In auth page | Temporary form values |
| `selectedRole` | AuthPage | In auth page | Which role user selected |
| `isSignUp` | AuthPage | In auth page | Sign in vs sign up mode |
| Props drilling | App → children | Always | Pass state and callbacks down |
| Callbacks | Children → App | User interaction | Modify parent state |
| `renderPage()` | App.tsx | On render | Conditional page rendering |
| Protected routes | Dashboard | Access attempt | Prevent unauthorized access |

