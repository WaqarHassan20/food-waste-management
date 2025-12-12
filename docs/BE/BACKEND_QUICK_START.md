# Quick Start Guide - Backend Development

Fast track guide to get the backend running and understand the codebase.

## Table of Contents
1. [5-Minute Setup](#5-minute-setup)
2. [Project Structure Explained](#project-structure-explained)
3. [Understanding the Code](#understanding-the-code)
4. [Common Tasks](#common-tasks)
5. [Debugging Tips](#debugging-tips)

---

## 5-Minute Setup

### Prerequisites
- Node.js v18+ installed
- PostgreSQL installed and running
- npm or yarn

### Step 1: Install Dependencies
```bash
cd backend
npm install bcryptjs jsonwebtoken dotenv  # Install missing packages
npm install
```

### Step 2: Setup Environment
Create `backend/src/db/.env`:
```env
PORT=3000
JWT_SECRET=dev-secret-key-change-in-prod
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:password@localhost:5432/food_waste_db
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 3: Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates database and tables)
npx prisma migrate dev --name init

# (Optional) Seed database with test data
npx prisma db seed
```

### Step 4: Start Server
```bash
npm run dev
```

✅ Backend running at `http://localhost:3000`
✅ API available at `http://localhost:3000/api/v1`

---

## Project Structure Explained

```
backend/src/
├── index.ts                          # Main Express app setup
│   ├── CORS configuration
│   ├── Routes registration
│   └── Error middleware setup
│
├── controllers/                       # Business logic
│   ├── authController.ts            # Login/Register/Profile
│   ├── restaurantController.ts      # Restaurant CRUD
│   ├── foodController.ts            # Food listing CRUD
│   ├── requestController.ts         # Food requests handling
│   ├── adminController.ts           # Admin functions
│   └── notificationController.ts    # Notifications
│
├── routes/                           # API endpoint definitions
│   ├── authRoute.ts                 # /api/v1/auth/*
│   ├── restaurantRoute.ts           # /api/v1/restaurants/*
│   ├── foodRoute.ts                 # /api/v1/food/*
│   ├── requestRoute.ts              # /api/v1/requests/*
│   ├── adminRoute.ts                # /api/v1/admin/*
│   └── notificationRoute.ts         # /api/v1/notifications/*
│
├── middleware/                       # Request processing
│   ├── auth.ts                      # JWT verification & role authorization
│   ├── errorHandler.ts              # Error response formatting
│   └── validation.ts                # Input validation
│
├── utils/                            # Helper functions
│   ├── jwt.ts                       # Token generation/verification
│   ├── password.ts                  # Password hashing
│   ├── response.ts                  # Standard response format
│   └── validators.ts                # Input validators
│
└── db/                               # Database
    ├── prisma.config.ts            # Prisma client instance
    └── prisma/
        └── schema.prisma           # Database schema definition
```

---

## Understanding the Code

### 1. Authentication Flow

**Request comes in:**
```
User → POST /api/v1/auth/login
     {email, password}
```

**Route handler:**
```typescript
// routes/authRoute.ts
authRouter.post('/login', validateLogin, login);
//                       ↓            ↓
//           Validation    Controller
```

**Controller processes:**
```typescript
// controllers/authController.ts
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // 1. Find user in database
  const user = await prisma.user.findUnique({ where: { email } });
  
  // 2. Compare password
  const isValid = await comparePassword(password, user.password);
  
  // 3. Generate token
  const token = generateToken({ userId: user.id, email, role: user.role });
  
  // 4. Return response
  return successResponse(res, { user, token }, 'Login successful');
};
```

**Response format (always):**
```typescript
{
  success: true/false,
  message: "User-friendly message",
  data: { /* response data */ }
}
```

### 2. Role-Based Access Control

```typescript
// middleware/auth.ts
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(res, 'Permission denied', 403);
    }
    next();
  };
};

// Usage in routes:
router.post(
  '/create',
  authenticate,           // ← Verify JWT token
  authorize('RESTAURANT'), // ← Check if user is RESTAURANT
  createFoodListing       // ← Controller
);
```

### 3. Database Queries with Prisma

```typescript
// Simple query
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// Query with relations
const restaurant = await prisma.restaurant.findUnique({
  where: { id: restaurantId },
  include: {
    foodListings: true,  // Include related food listings
    user: true           // Include related user
  }
});

// Paginated list
const { skip, take } = getPaginationParams(page, limit);
const [items, total] = await Promise.all([
  prisma.foodListing.findMany({ skip, take }),
  prisma.foodListing.count()
]);
```

### 4. Error Handling Pattern

**Try-catch in every controller:**
```typescript
export const someController = async (req, res) => {
  try {
    // 1. Validate inputs
    if (!req.body.required) {
      return errorResponse(res, 'Required field missing', 400);
    }
    
    // 2. Check permissions
    if (user.id !== req.user.userId) {
      return errorResponse(res, 'Permission denied', 403);
    }
    
    // 3. Database operation
    const result = await prisma.model.create({ data });
    
    // 4. Return success
    return successResponse(res, result, 'Operation successful', 201);
    
  } catch (error) {
    // 5. Handle unexpected errors
    return errorResponse(res, 'Failed to process', 500, error);
  }
};
```

### 5. Validation Pattern

**Input validation middleware:**
```typescript
export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { email, password, name } = req.body;

  // Check required fields
  if (!email || !password || !name) {
    return errorResponse(res, 'Required fields missing', 400);
  }

  // Validate format
  if (!validateEmail(email)) {
    return errorResponse(res, 'Invalid email format', 400);
  }

  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) {
    return errorResponse(res, passwordCheck.message!, 400);
  }

  // All valid, proceed to controller
  next();
};
```

---

## Common Tasks

### Task 1: Add a New API Endpoint

**Example: Get all food by restaurant**

**Step 1:** Add controller in `controllers/foodController.ts`
```typescript
export const getRestaurantFoodListings = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { restaurantId } = req.params;
    
    const foodListings = await prisma.foodListing.findMany({
      where: { restaurantId },
      include: { restaurant: true }
    });
    
    return successResponse(res, foodListings, 'Success');
  } catch (error) {
    return errorResponse(res, 'Failed', 500, error);
  }
};
```

**Step 2:** Add route in `routes/foodRoute.ts`
```typescript
foodRouter.get(
  '/restaurant/:restaurantId',
  getRestaurantFoodListings
);
```

**Step 3:** Test with API call
```javascript
fetch('http://localhost:3000/api/v1/food/restaurant/uuid')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

### Task 2: Modify Database Schema

**Example: Add `description` to FoodListing**

**Step 1:** Edit `schema.prisma`
```prisma
model FoodListing {
  id          String   @id @default(uuid())
  restaurantId String
  title       String
  description String  // ← Add this
  // ... rest of fields
}
```

**Step 2:** Create migration
```bash
npx prisma migrate dev --name add_description_to_food_listing
```

**Step 3:** Update controller to use new field
```typescript
const foodListing = await prisma.foodListing.create({
  data: {
    title: req.body.title,
    description: req.body.description,  // ← Now available
    // ...
  }
});
```

---

### Task 3: Fix a Bug

**Example: User can see other users' passwords**

**Step 1:** Find the problematic code
```typescript
// BAD - returns password
const user = await prisma.user.findUnique({ where: { id } });
return successResponse(res, user);
```

**Step 2:** Fix by selecting specific fields
```typescript
// GOOD - excludes password
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    phone: true,
    role: true,
    address: true,
    createdAt: true,
    // password is NOT selected
  }
});
return successResponse(res, user);
```

**Step 3:** Test
```bash
# Make API call and verify password is not in response
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer <token>"
```

---

### Task 4: Add a New Validation Rule

**Example: Restaurant name must be at least 3 characters**

**Step 1:** Add to `utils/validators.ts`
```typescript
export const validateRestaurantName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 100;
};
```

**Step 2:** Use in validation middleware `middleware/validation.ts`
```typescript
export const validateRestaurant = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { restaurantName } = req.body;

  if (!validateRestaurantName(restaurantName)) {
    return errorResponse(
      res, 
      'Restaurant name must be 3-100 characters long',
      400
    );
  }

  next();
};
```

**Step 3:** Route already uses validation
```typescript
restaurantRouter.post(
  '/',
  authenticate,
  validateRestaurant,  // ← Uses updated validation
  createRestaurant
);
```

---

### Task 5: Debug an Issue

**Example: Food request returns 404**

```typescript
// Enable Prisma logging in prisma.config.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],  // ← Shows all queries
});

// Check console output:
// prisma:query SELECT ... FROM "food_listings" WHERE "id" = ...

// If query looks wrong, the issue is in your code
// If query looks right but returns nothing, check:
// - Is the ID correct?
// - Does the record exist in database?
// - Check database directly: psql → SELECT * FROM food_listings;
```

---

## Debugging Tips

### 1. Enable Detailed Logging
```typescript
// src/db/prisma.config.ts
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error']  // Shows SQL queries
    : ['error']
});
```

### 2. Check Database Directly
```bash
# Connect to PostgreSQL
psql -U postgres -d food_waste_db

# View all users
SELECT * FROM users;

# View all food listings
SELECT * FROM food_listings;

# Check if relations work
SELECT * FROM restaurants WHERE "userId" = 'some-uuid';
```

### 3. Test Endpoints with Curl
```bash
# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234","name":"Test"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test1234"}'

# Protected endpoint (with token)
curl http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

### 4. Use Browser DevTools
```javascript
// In frontend console
// Make API call and see full response
fetch('http://localhost:3000/api/v1/food', {
  headers: { 'Authorization': 'Bearer ' + localStorage.authToken }
})
.then(r => r.json())
.then(console.log)
```

### 5. Check Error Messages
All endpoints return structured errors:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Detailed error for debugging"
}
```

The `error` field contains technical details that help identify the issue.

---

## Useful Commands

```bash
# Development
npm run dev                 # Start with auto-reload

# Database
npx prisma studio         # Open database GUI at localhost:5555
npx prisma migrate dev    # Run migrations
npx prisma generate       # Regenerate Prisma client

# Testing
npm test                   # Run tests (if configured)

# Production
npm run build             # Compile TypeScript
npm start                 # Run compiled version
```

---

## Next Steps

1. ✅ Setup backend and test it's running
2. ✅ Read [BACKEND_OVERVIEW.md](./BACKEND_OVERVIEW.md) to understand architecture
3. ✅ Review [BACKEND_API_REFERENCE.md](./BACKEND_API_REFERENCE.md) for all endpoints
4. ✅ Check [BACKEND_BUGS_AND_IMPLEMENTATION.md](./BACKEND_BUGS_AND_IMPLEMENTATION.md) for what needs to be fixed
5. ✅ Follow [FRONTEND_BACKEND_INTEGRATION.md](./FRONTEND_BACKEND_INTEGRATION.md) to connect frontend
6. ✅ Start contributing!

---

## Getting Help

**Still confused?**
1. Check the relevant documentation file above
2. Search the code for similar patterns
3. Check database schema in `schema.prisma`
4. Review error message in response
5. Check Prisma logs in console
6. Use browser DevTools Network tab to see API responses

**Found a bug?**
1. Document the exact error
2. Check [BACKEND_BUGS_AND_IMPLEMENTATION.md](./BACKEND_BUGS_AND_IMPLEMENTATION.md)
3. If not listed, create an issue with:
   - API endpoint that's failing
   - Request body/params
   - Expected vs actual response
   - Error message/logs

