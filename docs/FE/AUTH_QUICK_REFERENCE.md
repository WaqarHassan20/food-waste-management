# Auth System - Quick Reference Card

Keep this handy while reading the code!

---

## State Variables (App.tsx)

```typescript
currentPage          // Which page: 'home' | 'auth' | 'browse' | 'dashboard'
authMode             // Form mode: 'signin' | 'signup'
authState.isAuthenticated    // Is user logged in? true | false
authState.userRole           // User role: 'USER' | 'RESTAURANT' | 'ADMIN' | null
authState.userName           // User's name: string | null
```

---

## Functions (App.tsx)

```typescript
handleLogin(role, name)        // Called after form submit → updates auth state
handleLogout()                 // Called on logout button → clears auth state
navigateToAuth(mode)           // Go to auth page with mode
navigateToHome()               // Go to home page
navigateToBrowse()             // Go to browse page
renderPage()                   // Returns JSX for current page
```

---

## Components & Their Responsibilities

| Component | File | Props? | State? | Renders |
|-----------|------|--------|--------|---------|
| **App** | App.tsx | NO | YES (all) | Navbar + Page + Footer |
| **Navbar** | Navbar.tsx | YES | NO | Auth buttons OR user info |
| **HomePage** | HomePage.tsx | YES | NO | Landing page |
| **AuthPage** | AuthPage.tsx | YES | YES (form) | Login/signup form |
| **UserDashboard** | UserDashboard.tsx | YES | ? | User dashboard |
| **RestaurantDashboard** | RestaurantDashboard.tsx | YES | ? | Restaurant dashboard |
| **AdminDashboard** | AdminDashboard.tsx | NO | ? | Admin dashboard |

---

## When User Clicks...

| Action | Calls | Updates | Result |
|--------|-------|---------|--------|
| "Sign Up" button (home) | `onNavigateToAuth('signup')` | currentPage, authMode | AuthPage shows |
| "Sign In" button (home) | `onNavigateToAuth('signin')` | currentPage, authMode | AuthPage shows |
| "Sign In" link (auth) | `setIsSignUp(false)` | isSignUp (local) | Signup form hides |
| "Sign Up" link (auth) | `setIsSignUp(true)` | isSignUp (local) | Name field shows |
| Role button (auth) | `setSelectedRole()` | selectedRole (local) | Button highlights |
| "Submit" button (auth) | `handleSubmit()` → `onLogin()` | authState, currentPage | Dashboard loads |
| "Logout" button (navbar) | `onLogout()` | authState, currentPage | Homepage shows |
| "Dashboard" button (navbar) | `setCurrentPage('dashboard')` | currentPage | Dashboard shows |

---

## State Diagram

```
LOGIN PROCESS:
┌─────────────┐
│ NOT LOGGED  │  isAuthenticated=false
│ HOME PAGE   │  currentPage='home'
└──────┬──────┘
       │ click "Sign Up"
       ↓
┌─────────────┐
│    AUTH     │  currentPage='auth'
│    FORM     │  authMode='signup'
└──────┬──────┘
       │ submit form
       ↓
┌─────────────┐
│   LOGGED    │  isAuthenticated=true
│  DASHBOARD  │  userRole='RESTAURANT'
│ currentPage │  currentPage='dashboard'
│ ='dashboard'│  userName='John Doe'
└──────┬──────┘
       │ click "Logout"
       ↓
┌─────────────┐
│ NOT LOGGED  │  isAuthenticated=false
│ HOME PAGE   │  currentPage='home'
└─────────────┘
```

---

## Props Cheatsheet

```typescript
// Navbar receives:
<Navbar
  isAuthenticated={authState.isAuthenticated}      ← Show auth buttons?
  userRole={authState.userRole}                    ← Show user role
  userName={authState.userName}                    ← Show user name
  onNavigateToAuth={navigateToAuth}                ← Go to auth page
  onNavigateToHome={navigateToHome}                ← Go to home
  onNavigateToDashboard={() => setCurrentPage('dashboard')}  ← Go to dashboard
  onLogout={handleLogout}                          ← Clear auth state
/>

// HomePage receives:
<HomePage
  onNavigateToAuth={navigateToAuth}                ← "Sign Up" button
  onNavigateToBrowse={navigateToBrowse}            ← "Browse" button
/>

// AuthPage receives:
<AuthPage
  onLogin={handleLogin}                            ← Form submit
  onNavigateToHome={navigateToHome}                ← "Back" button
  initialMode={authMode}                           ← 'signin' or 'signup'
/>

// Dashboards receive:
<UserDashboard userName={authState.userName || 'User'} />
<RestaurantDashboard restaurantName={authState.userName || 'Restaurant'} />
<AdminDashboard />
```

---

## Key Conditional Logic

```typescript
// In Navbar:
{isAuthenticated ? (
  <>Show Dashboard, Username, Logout</>
) : (
  <>Show Sign In, Sign Up</>
)}

// In App renderPage():
case 'dashboard':
  if (!authState.isAuthenticated) {
    redirect to home;  // PROTECTED ROUTE
  }
  switch (authState.userRole) {
    case 'USER': return UserDashboard
    case 'RESTAURANT': return RestaurantDashboard
    case 'ADMIN': return AdminDashboard
  }

// In AuthPage:
{isSignUp && (
  <>Show name field, confirm password</>
)}
```

---

## Form Data (AuthPage only)

```typescript
// LocalState - temporary, only in AuthPage:
formData = {
  name: '',                // User's name
  email: '',               // User's email
  password: '',            // User's password
  confirmPassword: ''      // Verify password
}

selectedRole = 'USER'      // Which role selected
isSignUp = true            // Signup or signin mode

// When submitted:
// These are extracted and passed to App's handleLogin()
// Then form state is left behind
```

---

## URL Route Mapping (Current - No React Router)

```
Home Page:          currentPage === 'home'
Auth Page:          currentPage === 'auth' + authMode
Browse Page:        currentPage === 'browse'
User Dashboard:     currentPage === 'dashboard' + role === 'USER'
Restaurant Dashboard: currentPage === 'dashboard' + role === 'RESTAURANT'
Admin Dashboard:    currentPage === 'dashboard' + role === 'ADMIN'
```

---

## Role Capabilities (Implemented)

```
USER Role:
├─ Browse food listings
├─ Request food
└─ View requests (maybe)

RESTAURANT Role:
├─ Create food listings
├─ View requests
├─ Approve/reject requests
└─ Manage inventory

ADMIN Role:
├─ View all users
├─ View all restaurants
├─ View all requests
├─ Manage system
└─ Analytics (maybe)
```

---

## Most Used Code Patterns

### Pattern 1: State in Parent
```typescript
const [authState, setAuthState] = useState(initialValue);
```

### Pattern 2: Pass Down to Child
```typescript
<ChildComponent authData={authState} onAction={handler} />
```

### Pattern 3: Child Uses Callback
```typescript
<button onClick={() => onAction(data)}>Click Me</button>
```

### Pattern 4: Parent Callback Function
```typescript
const handler = (data) => {
  setAuthState(data);
};
```

### Pattern 5: Conditional Rendering
```typescript
{condition ? <IfTrue /> : <IfFalse />}
```

### Pattern 6: Protected Routes
```typescript
if (!authState.isAuthenticated) {
  redirect or return fallback;
}
// Show protected content
```

---

## Redux/Context Alternative (Future)

Current (Props Drilling):
```
App State → Navbar Props
         → HomePage Props
         → AuthPage Props
         → Dashboard Props
```

Better (With Context):
```
App Context Provider
    ↓
Any component can access:
    ├─ useAuth() → get authState
    └─ useAuth() → get callbacks
```

---

## Testing Checklist

```
[ ] Can navigate from Home to Auth (Sign Up mode)
[ ] Can toggle between Sign In and Sign Up
[ ] Can select different roles
[ ] Can submit form and log in
[ ] Navbar shows user info when logged in
[ ] Dashboard loads based on role
[ ] Can click logout
[ ] Logout clears all auth state
[ ] Navbar shows auth buttons again
[ ] Refresh page logs user out (no persistence)
```

---

## Common Issues

| Issue | Why | Fix |
|-------|-----|-----|
| Refresh logs user out | No localStorage | Add localStorage persistence |
| Props drilling gets messy | Too many levels | Use Context API |
| No real auth | Demo only | Connect to backend API |
| Can't verify passwords | No validation | Add server-side auth |
| No error handling | No try/catch | Add error states |

---

## Files You'll Need to Edit to Add Features

| Feature | File |
|---------|------|
| Add another role type | types/index.ts, AuthPage.tsx, App.tsx |
| Add navbar items | Navbar.tsx |
| Add new page | pages/NewPage.tsx, App.tsx |
| Add dashboard features | pages/Dashboard.tsx |
| Add form fields | AuthPage.tsx |
| Add API calls | pages/*.tsx, new utils/api.ts |
| Add error handling | pages/*.tsx, add error state to App.tsx |
| Add localStorage | App.tsx useEffect hook |

---

## One-Liner Explanations

- **App.tsx** = Heart of auth system, holds all state
- **Navbar.tsx** = Shows different buttons based on auth state
- **AuthPage.tsx** = Form that collects user data and logs them in
- **HomePage.tsx** = Landing page, entry point to auth
- **Dashboard components** = Protected pages shown after login
- **currentPage** = Controls which component renders
- **authState** = Stores is-logged-in info
- **Props drilling** = Passing state down through multiple levels
- **Protected routes** = Check auth before showing page
- **Form state** = Temporary data that becomes global when submitted

---

## Copy-Paste: Full Login Flow

```
User clicks "Sign Up"
  └─ HomePage → onNavigateToAuth('signup')
     └─ App.navigateToAuth()
        └─ setAuthMode('signup'), setCurrentPage('auth')
           └─ AuthPage renders

User fills form & selects role
  └─ AuthPage local state updates
     (formData, selectedRole)

User submits form
  └─ AuthPage.handleSubmit()
     └─ onLogin('RESTAURANT', 'John')
        └─ App.handleLogin()
           └─ setAuthState({isAuthenticated: true, userRole: 'RESTAURANT', userName: 'John'})
           └─ setCurrentPage('dashboard')
              └─ RestaurantDashboard renders
                 └─ Navbar updates: shows "John (RESTAURANT)" + "Logout"
```

---

That's your quick reference! 🚀 Keep this page open while learning.
