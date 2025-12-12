# Auth & State Management - QUICK SUMMARY

## The Big Picture

This is a **React app** with **client-side state management** (no backend auth yet). The app tracks whether a user is logged in and what role they have using React's `useState` hook.

---

## Three Key State Variables (All in App.tsx)

```typescript
const [currentPage, setCurrentPage] = useState<Page>('home');
const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
const [authState, setAuthState] = useState<AuthState>({
  isAuthenticated: false,
  userRole: null,
  userName: null,
});
```

| Variable | Tracks | Affects |
|----------|--------|---------|
| `currentPage` | Which page (home/auth/browse/dashboard) | What gets rendered |
| `authMode` | Sign in OR sign up mode | Form fields shown |
| `authState` | User login info (is logged in? role? name?) | Navbar buttons + dashboard access |

---

## 5-Step Auth Flow

### Step 1: Initial State
```
Not logged in → authState = { isAuthenticated: false, ... }
→ Navbar shows "Sign In" and "Sign Up" buttons
```

### Step 2: Click "Sign Up"
```
HomePage → onNavigateToAuth('signup')
→ App state: currentPage='auth', authMode='signup'
→ AuthPage renders
```

### Step 3: Fill Form & Select Role
```
User types in AuthPage inputs
→ formData updates (LOCAL state in AuthPage only)
→ User clicks role button: selectedRole='RESTAURANT'
```

### Step 4: Submit Form
```
AuthPage.handleSubmit()
→ Calls onLogin('RESTAURANT', 'John Doe')
→ This is App.handleLogin() from parent
```

### Step 5: Update Global State
```
App.handleLogin() runs:
→ setAuthState({ isAuthenticated: true, userRole: 'RESTAURANT', userName: 'John Doe' })
→ setCurrentPage('dashboard')
→ App re-renders → RestaurantDashboard shows
→ Navbar updates → shows "John Doe (RESTAURANT)" + Logout button
```

---

## Key Concepts

### Props Drilling
State/callbacks flow downward from parent to children:
```
App (state + callbacks)
├─ Navbar (uses authState, calls onLogout)
├─ HomePage (calls onNavigateToAuth)
├─ AuthPage (calls onLogin)
└─ [Current Dashboard] (uses authState props)
```

### Local vs Global State
```
LOCAL STATE (AuthPage only - temporary):
- formData { name, email, password, ... }
- selectedRole
- isSignUp

GLOBAL STATE (App.tsx - permanent):
- authState { isAuthenticated, userRole, userName }
- currentPage
- authMode
```

### Conditional Rendering
```typescript
// Navbar shows different buttons based on auth state
{isAuthenticated ? (
  <>Dashboard | John Doe (RESTAURANT) | Logout</>
) : (
  <>Sign In | Sign Up</>
)}

// Dashboard only accessible if authenticated
if (!authState.isAuthenticated) redirect to home
```

---

## The Problem: No Persistence

```
✅ User logs in → Works perfectly
❌ User refreshes page → LOGGED OUT!
   (React state reset, localStorage not used)
```

---

## Current Limitations

| Limitation | Current | What's Needed |
|-----------|---------|---------------|
| Authentication | Client-side mock | Real backend API |
| Credentials | Never validated | Sent to server |
| Tokens | None | JWT or session |
| Persistence | Lost on refresh | localStorage |
| State Management | Props drilling | Context API or Redux |
| Routes | Page state switch | React Router |
| API Calls | None | Fetch/axios for data |

---

## Dashboard Pages (Role-Based)

When user logs in with role `'RESTAURANT'`:
```
renderPage() → 'dashboard' page
→ Protected route check (are you authenticated?)
→ Switch on authState.userRole
→ case 'RESTAURANT': return <RestaurantDashboard />
```

Three different dashboards:
- **USER**: Browse & request food
- **RESTAURANT**: Manage food listings, approve requests
- **ADMIN**: Manage all users & requests

---

## Component Tree

```
App
├─ Navbar
│  ├─ "Sign In" / "Sign Up" (if !isAuthenticated)
│  └─ "Dashboard" / "Logout" (if isAuthenticated)
├─ main
│  └─ [One of these]:
│     ├─ HomePage
│     ├─ AuthPage (with Form)
│     ├─ FoodBrowsePage
│     └─ Dashboard (User/Restaurant/Admin)
└─ Footer
```

---

## Files to Read (In Order)

1. **Auth Logic**: `/src/App.tsx` - Lines 1-102 (state + handlers)
2. **Auth Form**: `/src/pages/AuthPage.tsx` - Complete file
3. **Navigation**: `/src/components/layout/Navbar.tsx` - Complete file
4. **Home Page**: `/src/pages/HomePage.tsx` - First 100 lines for nav

---

## Remember

- **Single source of truth**: All auth state lives in `App.tsx`
- **Props-based**: State flows down, callbacks flow up
- **Demo only**: No real authentication yet
- **Client-side**: Everything happens in browser, no backend
- **No persistence**: Refresh = logout
- **Role-based access**: Different dashboards for different roles

---

## Most Important Code Patterns

### Pattern 1: State in Parent
```typescript
// App.tsx
const [authState, setAuthState] = useState(initialState);
```

### Pattern 2: Callback Function
```typescript
// App.tsx
const handleLogin = (role, name) => {
  setAuthState({ isAuthenticated: true, userRole: role, userName: name });
};
```

### Pattern 3: Pass Down to Children
```typescript
// App.tsx
<Navbar isAuthenticated={authState.isAuthenticated} onLogout={handleLogout} />
<AuthPage onLogin={handleLogin} />
```

### Pattern 4: Child Uses State + Callback
```typescript
// Navbar.tsx
{isAuthenticated ? (
  <LogoutButton onClick={onLogout} />
) : (
  <SignInButton onClick={() => onNavigateToAuth('signin')} />
)}
```

---

## Quick Walkthrough

```javascript
// 1. App starts
App mounts
→ authState = { isAuthenticated: false, ... }
→ currentPage = 'home'
→ HomePage renders

// 2. User clicks "Sign Up"
onClick={() => onNavigateToAuth('signup')}
→ authMode = 'signup'
→ currentPage = 'auth'
→ AuthPage renders

// 3. User fills form and clicks submit
formData = { email: '...', password: '...' }
selectedRole = 'RESTAURANT'
→ handleSubmit() validates
→ calls onLogin('RESTAURANT', name)

// 4. handleLogin runs in App
setAuthState({ isAuthenticated: true, ... })
setCurrentPage('dashboard')
→ App re-renders
→ renderPage() returns RestaurantDashboard

// 5. User sees dashboard
→ Navbar shows "Logout" button
→ Dashboard shows restaurant tools

// 6. User clicks Logout
handleLogout() runs
→ authState reset to initial
→ currentPage = 'home'
→ Back to start!
```

---

## Visual: What Gets Rendered When

```
authState.isAuthenticated = false, currentPage = 'home'
→ Shows: HomePage with "Sign Up" button

authState.isAuthenticated = false, currentPage = 'auth'
→ Shows: AuthPage with login form

authState.isAuthenticated = true, currentPage = 'dashboard', role = 'USER'
→ Shows: UserDashboard (request food)

authState.isAuthenticated = true, currentPage = 'dashboard', role = 'RESTAURANT'
→ Shows: RestaurantDashboard (manage food)

authState.isAuthenticated = true, currentPage = 'dashboard', role = 'ADMIN'
→ Shows: AdminDashboard (manage system)

authState.isAuthenticated = true, currentPage = 'home'
→ Shows: HomePage (user can log out from navbar)
```

---

## That's It!

The auth system is actually quite simple:
1. Store auth info in App's state
2. Pass it down to components that need it
3. Pass callbacks back up to update state
4. Render different UIs based on auth state
5. Protect routes by checking `isAuthenticated`

No framework magic, just basic React patterns! 🎉

