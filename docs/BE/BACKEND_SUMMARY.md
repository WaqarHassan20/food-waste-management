# 🍽️ Food Waste Reduction Platform - Complete Backend Summary

## Project Vision
A platform connecting restaurants with surplus food to users who need it, reducing food waste while helping communities.

---

## 🏗️ Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React/Vite)                   │
│         Running on http://localhost:5173                     │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST API
                     │ JSON Requests/Responses
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                        │
│         Running on http://localhost:3000/api/v1             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           REQUEST PROCESSING PIPELINE                │   │
│  │                                                      │   │
│  │  Request → Validation → Authentication → Controller  │   │
│  │                         ↓                            │   │
│  │                    Authorization                     │   │
│  │                         ↓                            │   │
│  │                   Business Logic                     │   │
│  │                         ↓                            │   │
│  │                 Database Queries                     │   │
│  │                         ↓                            │   │
│  │              Response → Client                       │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Routes:                                                     │
│  ├─ /api/v1/auth/*                                          │
│  ├─ /api/v1/restaurants/*                                   │
│  ├─ /api/v1/food/*                                          │
│  ├─ /api/v1/requests/*                                      │
│  ├─ /api/v1/notifications/*                                 │
│  └─ /api/v1/admin/*                                         │
└────────────────┬─────────────────────────────────────────────┘
                 │ SQL Queries (Prisma ORM)
                 │
┌────────────────▼────────────────────────────────────────────┐
│              POSTGRESQL DATABASE                             │
│                                                              │
│  Tables:                                                     │
│  ├─ users          (email, password, name, role)            │
│  ├─ restaurants    (restaurantName, address, phone)         │
│  ├─ food_listings  (title, quantity, expiryDate, status)    │
│  ├─ food_requests  (userId, foodListingId, status)          │
│  └─ notifications  (userId, title, message, type)           │
└──────────────────────────────────────────────────────────────┘
```

---

## 👥 User Flows

### 1️⃣ Regular User (USER Role)
```
┌─────────────┐
│  HOMEPAGE   │
└──────┬──────┘
       │
       ├─→ Browse Food Listings (GET /food)
       │   └─→ Filter, Search, Paginate
       │
       ├─→ View Food Details (GET /food/:id)
       │   └─→ See restaurant info, pickup time
       │
       ├─→ Request Food (POST /requests)
       │   ├─→ Quantity validation
       │   └─→ Notification sent to restaurant
       │
       ├─→ View My Requests (GET /requests/my)
       │   ├─→ PENDING - Waiting for restaurant
       │   ├─→ APPROVED - Pickup time confirmed
       │   ├─→ COMPLETED - Food picked up
       │   └─→ Can cancel if PENDING/APPROVED
       │
       ├─→ View Notifications (GET /notifications)
       │   ├─→ Request approved ✅
       │   ├─→ Request rejected ❌
       │   └─→ Request completed 🏁
       │
       └─→ Manage Profile (GET/PUT /auth/profile)
           └─→ Edit name, phone, address
```

### 2️⃣ Restaurant User (RESTAURANT Role)
```
┌──────────────────┐
│  RESTAURANT DASH │
└────────┬─────────┘
         │
         ├─→ Create Restaurant (POST /restaurants)
         │   └─→ Name, address, phone, business license
         │
         ├─→ Create Food Listing (POST /food)
         │   ├─→ Title, description, quantity
         │   ├─→ Unit (kg, servings, plates)
         │   ├─→ Expiry date & time
         │   ├─→ Pickup time window
         │   └─→ Image & category (optional)
         │
         ├─→ Manage Listings (GET /food/my/listings)
         │   ├─→ View all listings
         │   ├─→ Edit listing
         │   ├─→ Delete listing
         │   └─→ See request count per item
         │
         ├─→ View Incoming Requests (GET /requests/restaurant)
         │   ├─→ See all requests for my food
         │   ├─→ User info (name, email, phone, address)
         │   ├─→ User message
         │   └─→ Filter by status
         │
         ├─→ Respond to Requests (PUT /requests/:id/status)
         │   ├─→ APPROVE → Set pickup date/time
         │   ├─→ REJECT → Send rejection notification
         │   └─→ COMPLETE → Mark as completed
         │
         ├─→ View Notifications
         │   ├─→ New request received
         │   ├─→ Restaurant verified ✅
         │   └─→ Food expiring soon ⏰
         │
         └─→ Manage Profile
             └─→ Edit restaurant info
```

### 3️⃣ Admin User (ADMIN Role)
```
┌────────────────┐
│  ADMIN DASH    │
└────────┬───────┘
         │
         ├─→ View Statistics (GET /admin/dashboard/stats)
         │   ├─→ Total users (breakdown by role)
         │   ├─→ Total restaurants
         │   ├─→ Total food listings
         │   ├─→ Total requests (by status)
         │   └─→ Fulfillment rate
         │
         ├─→ Manage Users (GET/PUT/DELETE /admin/users)
         │   ├─→ List all users
         │   ├─→ View user details
         │   ├─→ Activate/deactivate users
         │   ├─→ Verify/unverify users
         │   └─→ Delete users
         │
         ├─→ Verify Restaurants (PUT /admin/restaurants/:id/verify)
         │   ├─→ Review business license
         │   ├─→ View restaurant details
         │   ├─→ Approve (make visible to public)
         │   └─→ Reject (request more info)
         │
         ├─→ Monitor All Requests (GET /admin/requests)
         │   ├─→ View all food requests
         │   ├─→ Filter by status
         │   └─→ See request fulfillment metrics
         │
         └─→ System Management
             ├─→ Ban users
             ├─→ Monitor spam
             └─→ View audit logs (optional)
```

---

## 📊 Data Models

### User
```typescript
{
  id: UUID,
  email: string,
  password: string (hashed),
  name: string,
  phone?: string,
  role: 'USER' | 'RESTAURANT' | 'ADMIN',
  address?: string,
  isVerified: boolean,
  isActive: boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Restaurant
```typescript
{
  id: UUID,
  userId: UUID,           // Link to User
  restaurantName: string,
  description?: string,
  address: string,
  latitude?: number,
  longitude?: number,
  phone: string,
  businessLicense?: string,
  rating: number,
  totalRatings: number,
  isVerified: boolean,    // Admin must verify
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### FoodListing
```typescript
{
  id: UUID,
  restaurantId: UUID,     // Link to Restaurant
  title: string,
  description: string,
  quantity: number,
  unit: string,           // "kg", "plates", "servings"
  expiryDate: DateTime,
  pickupTime: string,     // "5:00 PM - 9:00 PM"
  status: 'AVAILABLE' | 'RESERVED' | 'CLAIMED' | 'EXPIRED',
  imageUrl?: string,
  category?: string,      // "prepared food", "bakery"
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### FoodRequest
```typescript
{
  id: UUID,
  userId: UUID,           // Link to User
  foodListingId: UUID,    // Link to FoodListing
  quantity: number,
  message?: string,       // User message to restaurant
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED',
  pickupDate?: DateTime,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Notification
```typescript
{
  id: UUID,
  userId: UUID,
  title: string,
  message: string,
  isRead: boolean,
  type: string,           // "request_approved", "new_request"
  createdAt: DateTime
}
```

---

## 🔐 Authentication & Authorization

### How It Works

```
1. User Registers/Logs In
   ├─ POST /auth/register or POST /auth/login
   └─ Server returns JWT token

2. Client Stores Token
   └─ localStorage.setItem('authToken', token)

3. Client Makes Protected Request
   ├─ Includes header: "Authorization: Bearer <token>"
   └─ GET /api/v1/auth/profile

4. Server Verifies Token
   ├─ Decode JWT
   ├─ Check signature
   ├─ Check expiration
   └─ Extract userId, email, role

5. Server Authorizes Action
   ├─ Check if user has required role
   ├─ Check if user owns resource
   └─ Proceed if authorized, reject if not

6. Server Returns Response
   └─ User can see/modify only their own data
```

### Token Structure
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "user-uuid",
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234654290  // 7 days later
}

Signature: HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  "your-secret-key"
)
```

### Role-Based Access

```
PUBLIC ENDPOINTS (No Auth)
├─ POST /auth/register
├─ POST /auth/login
├─ GET /restaurants           (list all)
├─ GET /restaurants/:id       (details)
├─ GET /food                  (list all)
└─ GET /food/:id              (details)

USER ENDPOINTS (USER role)
├─ GET /auth/profile
├─ PUT /auth/profile
├─ POST /requests             (create request)
├─ GET /requests/my           (view my requests)
├─ PUT /requests/:id/cancel   (cancel request)
└─ GET /notifications         (view notifications)

RESTAURANT ENDPOINTS (RESTAURANT role)
├─ POST /restaurants          (create profile)
├─ GET /restaurants/my/profile
├─ PUT /restaurants           (update)
├─ POST /food                 (create listing)
├─ GET /food/my/listings
├─ PUT /food/:id              (update)
├─ DELETE /food/:id           (delete)
├─ GET /requests/restaurant   (incoming requests)
└─ PUT /requests/:id/status   (approve/reject)

ADMIN ENDPOINTS (ADMIN role)
├─ GET /admin/dashboard/stats
├─ GET /admin/users           (list all)
├─ GET /admin/users/:id
├─ PUT /admin/users/:id/status
├─ DELETE /admin/users/:id
├─ PUT /admin/restaurants/:id/verify
└─ GET /admin/requests        (all requests)
```

---

## 🔄 Request/Response Flow Example

### Example: User Requests Food

```
STEP 1: Frontend sends request
POST /api/v1/requests
Headers: {
  "Content-Type": "application/json",
  "Authorization": "Bearer eyJhbGc..."
}
Body: {
  "foodListingId": "food-uuid-123",
  "quantity": 3,
  "message": "Needed for community event"
}

STEP 2: Backend validates
├─ Check token is valid ✅
├─ Extract userId from token
├─ Check user role is USER ✅
├─ Check food listing exists ✅
├─ Check quantity available ✅
└─ Check no pending request exists ✅

STEP 3: Backend creates request
├─ Create FoodRequest in database
│  ├─ userId: extracted from token
│  ├─ foodListingId: from request
│  ├─ quantity: from request
│  ├─ status: PENDING
│  └─ createdAt: now()
│
└─ Create Notification for restaurant owner
   ├─ userId: restaurant owner's ID
   ├─ title: "New Food Request"
   ├─ message: "John requested 3 plates of pizza"
   └─ type: "new_food_request"

STEP 4: Backend returns response
HTTP 201 Created
{
  "success": true,
  "message": "Food request created successfully",
  "data": {
    "id": "request-uuid",
    "userId": "user-uuid",
    "foodListingId": "food-uuid",
    "quantity": 3,
    "message": "Needed for community event",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "foodListing": { ... },
    "user": { ... }
  }
}

STEP 5: Frontend handles response
├─ Check if success: true ✅
├─ Store request data
├─ Show success toast
├─ Redirect to "My Requests" page
└─ Request appears in user's list with PENDING status
```

---

## 📋 Current Status

### ✅ What's Complete
- [x] Database schema designed
- [x] All models created (User, Restaurant, FoodListing, FoodRequest, Notification)
- [x] Authentication routes (register, login, profile)
- [x] Restaurant CRUD operations
- [x] Food listing CRUD operations (except delete)
- [x] Food request creation
- [x] Food request viewing (user & restaurant)
- [x] Notification system basic
- [x] Role-based access control
- [x] Error handling middleware
- [x] Standard response format
- [x] Input validation

### ⚠️ What Needs Fixes (8 items)
1. [ ] Missing npm dependencies (bcryptjs, jsonwebtoken, dotenv)
2. [ ] CORS configuration too permissive
3. [ ] `getDashboardStats` not implemented
4. [ ] `verifyRestaurant` not implemented
5. [ ] `deleteUser` not fully implemented
6. [ ] `deleteFoodListing` not implemented
7. [ ] `updateFoodRequestStatus` not complete
8. [ ] `deleteNotification` not implemented

### ❌ What's Missing (To Connect Frontend)
- [ ] Frontend API service (copy from FRONTEND_BACKEND_INTEGRATION.md)
- [ ] Frontend pages (see FRONTEND_BACKEND_REQUIREMENTS.md)
- [ ] Frontend authentication flow
- [ ] Frontend state management
- [ ] Frontend form validation
- [ ] Frontend error handling

---

## 🚀 Getting Started

### 1. Backend Setup (5 minutes)
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

**Check:** http://localhost:3000 returns "Food Waste Reduction API is running"

### 2. Test One Endpoint
```bash
# Register a user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Test1234",
    "name": "Test User"
  }'
```

### 3. Read Documentation
- Start: **BACKEND_QUICK_START.md**
- Understand: **BACKEND_OVERVIEW.md**
- Reference: **BACKEND_API_REFERENCE.md**
- Fix Issues: **BACKEND_BUGS_AND_IMPLEMENTATION.md**

---

## 🎯 Next Priorities

### Week 1: Fix & Setup
- [ ] Fix all critical bugs
- [ ] Install missing dependencies
- [ ] Setup database
- [ ] Verify all endpoints work
- [ ] Backend ready for integration

### Week 2: Missing Implementations
- [ ] Implement 8 missing functions
- [ ] Add validation to all routes
- [ ] Complete admin features
- [ ] Test all endpoints

### Week 3: Frontend Integration
- [ ] Create API service
- [ ] Build authentication pages
- [ ] Build food browsing
- [ ] Build user dashboard

### Week 4: Polish & Deploy
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Security review
- [ ] Deploy frontend & backend

---

## 📞 Need Help?

**Document to check first:**
1. **BACKEND_QUICK_START.md** - Setup, debugging, common tasks
2. **BACKEND_OVERVIEW.md** - Architecture, models, features
3. **BACKEND_API_REFERENCE.md** - Exact endpoint specs
4. **BACKEND_BUGS_AND_IMPLEMENTATION.md** - Known issues & solutions

**Most common issues:**
1. "Cannot find module" → Run `npm install bcryptjs jsonwebtoken dotenv`
2. "Port already in use" → Change PORT in .env
3. "Database connection error" → Check PostgreSQL is running
4. "CORS error" → Read BACKEND_BUGS_AND_IMPLEMENTATION.md (Bug #1)
5. "API returns 401" → Check Authorization header has "Bearer " prefix

---

## 📁 File Structure

```
docs/
├── BACKEND_DOCUMENTATION_INDEX.md    ← You are here
├── BACKEND_QUICK_START.md            ← Start here
├── BACKEND_OVERVIEW.md
├── BACKEND_API_REFERENCE.md
├── BACKEND_BUGS_AND_IMPLEMENTATION.md
├── FRONTEND_BACKEND_INTEGRATION.md
└── FRONTEND_BACKEND_REQUIREMENTS.md

backend/
├── src/
│   ├── index.ts                 (Express setup)
│   ├── controllers/             (Business logic)
│   ├── routes/                  (API endpoints)
│   ├── middleware/              (Auth, validation, errors)
│   ├── utils/                   (JWT, password, response)
│   └── db/
│       └── prisma/
│           └── schema.prisma    (Database models)
└── package.json
```

---

## 🎓 Tech Stack

**Runtime:** Node.js + TypeScript
**Framework:** Express.js 5.2.1
**Database:** PostgreSQL with Prisma ORM
**Authentication:** JWT (JSON Web Tokens)
**Password Security:** bcryptjs
**API Format:** REST with JSON

---

**Last Updated:** January 15, 2024
**Documentation Version:** 1.0
**Backend Version:** 1.0.0-dev

---

## 🏁 Ready?

1. ✅ Read **BACKEND_QUICK_START.md** (5 min)
2. ✅ Get backend running
3. ✅ Read **BACKEND_OVERVIEW.md** (15 min)
4. ✅ Fix issues in **BACKEND_BUGS_AND_IMPLEMENTATION.md**
5. ✅ Start contributing!

**Let's reduce food waste together! 🌱**
