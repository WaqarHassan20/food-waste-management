# 🚀 Quick Start Guide

## Starting the Application

### One Command to Rule Them All
```bash
cd /home/aliabbaschadhar/Work/food-waste-management
bun run dev
```

This starts both:
- 🔴 Backend: http://localhost:3000
- 🔵 Frontend: http://localhost:5174 (or 5173)

---

## 🧪 Test the Restaurant Fix

### 1. Open Browser
```
http://localhost:5174/
```

### 2. Click "Get Started" or "Sign Up"

### 3. Select "Restaurant" Role

### 4. Fill the Form
- **Full Name** → Will be used as Restaurant Name
- **Email** → your-restaurant@example.com
- **Password** → At least 8 characters
- **Phone** → Your phone number
- **Address** → Restaurant address

### 5. Click "Create Account"
- ✅ Should succeed (no validation error)
- ✅ Should redirect to /dashboard
- ✅ Should show RestaurantDashboard

---

## 🎯 User Journeys to Test

### Journey 1: Restaurant Owner
```
1. Visit: http://localhost:5174/auth/signup
2. Select: Restaurant
3. Register with restaurant details
4. → Redirects to /dashboard (RestaurantDashboard)
5. Create food listings
6. View and manage requests
```

### Journey 2: Regular User
```
1. Visit: http://localhost:5174/auth/signup
2. Select: User
3. Register with user details
4. → Redirects to /dashboard (UserDashboard)
5. Browse food at /browse
6. Create food requests
```

### Journey 3: Browse Without Login
```
1. Visit: http://localhost:5174/
2. Click: "Browse Food Listings"
3. → Navigate to /browse
4. View all available food
5. Must login to request
```

---

## 🔒 Test Protected Routes

### Try These URLs Directly (when not logged in):
```
http://localhost:5174/dashboard
http://localhost:5174/user/dashboard
http://localhost:5174/restaurant/dashboard
```

**Expected**: All should redirect to `/auth/signin`

### Try These After Login:
```
# As User → try to access:
http://localhost:5174/restaurant/dashboard
→ Should redirect to /

# As Restaurant → try to access:
http://localhost:5174/user/dashboard
→ Should redirect to /
```

---

## 📱 React Router Features to Test

### 1. Navigation
- ✅ Click navbar logo → Goes to home
- ✅ Click "Sign In" → Goes to /auth/signin
- ✅ Click "Sign Up" → Goes to /auth/signup
- ✅ Click "Browse Food" → Goes to /browse

### 2. Browser History
- ✅ Back button works correctly
- ✅ Forward button works correctly
- ✅ URL updates in address bar

### 3. Direct URL Access
- ✅ Can paste URL and navigate directly
- ✅ Protected routes check authentication
- ✅ Wrong role redirects to appropriate page

### 4. Auto-Redirect
- ✅ After login → redirects to /dashboard
- ✅ After logout → stays on current page or home
- ✅ If not authenticated → redirects to /auth/signin

---

## 🛠️ Development Commands

### Start Servers Separately
```bash
# Terminal 1: Backend
cd backend
bun run src/index.ts

# Terminal 2: Frontend
cd frontend
bun run dev
```

### Run Backend Tests
```bash
cd backend
./test-api.sh
```

### Check Backend Health
```bash
curl http://localhost:3000/
```

Expected response:
```json
{
  "success": true,
  "message": "Food Waste Reduction API is running",
  "timestamp": "2025-12-12T..."
}
```

---

## 🐛 Troubleshooting

### Problem: Port 5173 already in use
**Solution**: Frontend will auto-switch to 5174
```
Local: http://localhost:5174/
```

### Problem: Backend not responding
**Check**: Is backend running?
```bash
curl http://localhost:3000/
```

### Problem: CORS errors
**Check**: Backend .env has correct FRONTEND_URL
```env
FRONTEND_URL="http://localhost:5173"
```

### Problem: Auth not persisting
**Check**: Browser localStorage
1. Open DevTools → Application → Local Storage
2. Should see `token` and `userRole` keys

### Problem: Protected routes not working
**Check**: Token in localStorage
```javascript
// In browser console:
localStorage.getItem('token')
localStorage.getItem('userRole')
```

---

## 📊 Test Checklist

### Authentication
- [ ] User registration works
- [ ] Restaurant registration works (no validation error)
- [ ] User login works
- [ ] Restaurant login works
- [ ] Auto-redirect after login
- [ ] Token stored in localStorage
- [ ] Logout works

### Navigation
- [ ] Home page loads
- [ ] Can navigate to /browse
- [ ] Can navigate to /auth/signin
- [ ] Can navigate to /auth/signup
- [ ] Navbar updates based on auth state
- [ ] Browser back/forward buttons work
- [ ] Direct URL access works

### Protected Routes
- [ ] Cannot access /dashboard without login
- [ ] Cannot access /user/dashboard without login
- [ ] Cannot access /restaurant/dashboard without login
- [ ] Users cannot access /restaurant/dashboard
- [ ] Restaurants cannot access /user/dashboard
- [ ] Admins can access /admin/dashboard

### Forms
- [ ] Registration form validates input
- [ ] Login form validates input
- [ ] Error messages display correctly
- [ ] Loading states show during submission
- [ ] Success redirects to correct page

---

## 🎉 Success Indicators

You'll know everything is working when:

1. ✅ Restaurant signup completes without validation error
2. ✅ After registration, you see the correct dashboard
3. ✅ Navbar shows "Dashboard" button when logged in
4. ✅ Protected routes redirect when not authenticated
5. ✅ Role-based routes redirect for wrong roles
6. ✅ Browser URL updates as you navigate
7. ✅ Back/forward buttons work correctly
8. ✅ Direct URL access respects authentication

---

## 📝 API Endpoints Reference

### User Authentication
```
POST /api/v1/auth/register      - User registration
POST /api/v1/auth/login         - User login
GET  /api/v1/auth/profile       - Get user profile
```

### Restaurant Authentication
```
POST /api/v1/auth/restaurant/register  - Restaurant registration
POST /api/v1/auth/restaurant/login     - Restaurant login
GET  /api/v1/auth/restaurant/profile   - Get restaurant profile
```

### Food Listings
```
GET    /api/v1/food              - Get all food listings
POST   /api/v1/food              - Create listing (restaurant only)
GET    /api/v1/food/my/listings  - Get my listings (restaurant only)
PUT    /api/v1/food/:id          - Update listing (restaurant only)
DELETE /api/v1/food/:id          - Delete listing (restaurant only)
```

---

## 🆘 Need Help?

### Check These Files
- **Backend API Reference**: `backend/API_REFERENCE_UPDATED.md`
- **Test Results**: `backend/TEST_RESULTS.md`
- **Integration Details**: `INTEGRATION_COMPLETE.md`
- **Backend Docs**: `docs/BE/`
- **Frontend Docs**: `docs/FE/`

### Common Issues Document
See `INTEGRATION_COMPLETE.md` → Known Issues & Solutions section

---

*Happy Testing! 🎊*
