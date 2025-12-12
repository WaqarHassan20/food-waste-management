# Backend Bugs & Implementation Checklist

Comprehensive guide to existing bugs, missing features, and what needs to be implemented to fully connect with the frontend.

## Table of Contents
1. [Critical Bugs](#critical-bugs)
2. [Minor Issues](#minor-issues)
3. [Missing Features](#missing-features)
4. [Implementation Checklist](#implementation-checklist)
5. [Code Quality Improvements](#code-quality-improvements)

---

## Critical Bugs

### 1. ❌ CORS Configuration Issue
**Severity:** HIGH
**Location:** `src/index.ts`

**Problem:**
```typescript
// Current implementation
app.use(cors());
```

This allows requests from ANY origin, which is a security risk.

**Fix:**
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Also Add to .env:**
```
FRONTEND_URL=http://localhost:5173
```

---

### 2. ❌ Password Hashing Library Missing
**Severity:** HIGH
**Location:** `package.json`

**Problem:**
The `bcryptjs` library is imported in `src/utils/password.ts` but not listed in `package.json` dependencies.

**Current package.json (incomplete):**
```json
{
  "dependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "cors": "^2.8.5",
    "express": "^5.2.1",
    "prisma": "^7.1.0"
  }
}
```

**Missing Dependencies:**
- bcryptjs
- jsonwebtoken
- dotenv

**Fix:**
```bash
npm install bcryptjs jsonwebtoken dotenv
npm install --save-dev @types/bcryptjs @types/jsonwebtoken
```

**Updated package.json:**
```json
{
  "dependencies": {
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.1.2",
    "prisma": "^7.1.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/bun": "latest",
    "typescript": "^5"
  }
}
```

---

### 3. ❌ Missing Environment Variables
**Severity:** HIGH
**Location:** Various files importing from `.env`

**Problem:**
The backend loads `.env` from `src/db/.env` but several required variables are not defined:
- `JWT_SECRET` - Used in token generation
- `JWT_EXPIRES_IN` - Token expiration time
- `DATABASE_URL` - PostgreSQL connection string

**Fix:**
Create `backend/src/db/.env`:
```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-production-use-strong-random-string
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:password@localhost:5432/food_waste_db
NODE_ENV=development
```

---

### 4. ❌ Prisma Client Not Generated
**Severity:** HIGH
**Location:** `src/db/prisma.config.ts`

**Problem:**
```typescript
import { PrismaClient } from './generated/prisma';
```

The generated Prisma client directory doesn't exist until migrations are run.

**Fix:**
```bash
# Run from backend directory
npx prisma generate
npx prisma migrate dev --name init
```

---

### 5. ❌ Missing Error Handler Middleware Registration
**Severity:** HIGH
**Location:** `src/index.ts`

**Problem:**
Error handler middleware is imported but might not be catching all errors properly, especially async errors in route handlers.

**Fix:**
Ensure async errors are caught:
```typescript
// Wrap async route handlers
const asyncHandler = (fn: any) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage in routes:
router.post('/login', asyncHandler(login));
```

Or use `express-async-errors`:
```bash
npm install express-async-errors
```

```typescript
import 'express-async-errors';
```

---

## Minor Issues

### 1. ⚠️ Missing Validation in Routes
**Severity:** MEDIUM
**Location:** `src/routes/foodRoute.ts`, `src/routes/restaurantRoute.ts`

**Problem:**
Not all routes have validation middleware attached.

**Example - Food Route:**
```typescript
// Missing validation
foodRouter.get('/my/listings', authenticate, authorize('RESTAURANT'), getMyFoodListings);

// Should be:
foodRouter.get('/my/listings', authenticate, authorize('RESTAURANT'), validateFoodListing, getMyFoodListings);
```

**Fix:** Add appropriate validation middleware to all POST/PUT routes.

---

### 2. ⚠️ Incomplete Admin Controller
**Severity:** MEDIUM
**Location:** `src/controllers/adminController.ts`

**Problem:**
Several controller functions are incomplete or missing:
- `deleteUser` - Function signature exists but implementation is cut off
- `verifyRestaurant` - Not implemented
- `getDashboardStats` - Not implemented
- `getAllFoodRequests` - Not implemented

**Fix:** Complete all controller functions (see below under Missing Features).

---

### 3. ⚠️ Missing Restaurant Update Route Validation
**Severity:** MEDIUM
**Location:** `src/routes/restaurantRoute.ts`

**Problem:**
```typescript
restaurantRouter.put('/', authenticate, authorize('RESTAURANT'), updateRestaurant);
```

Should have validation but doesn't call `validateRestaurant`.

**Fix:**
```typescript
restaurantRouter.put('/', 
  authenticate, 
  authorize('RESTAURANT'), 
  validateRestaurant,
  updateRestaurant
);
```

---

### 4. ⚠️ Incomplete Food Listing Deletion
**Severity:** LOW
**Location:** `src/controllers/foodController.ts`

**Problem:**
The `deleteFoodListing` function exists in routes but implementation is incomplete.

**Fix:** Complete the implementation.

---

### 5. ⚠️ Notification Deletion Missing Implementation
**Severity:** LOW
**Location:** `src/controllers/notificationController.ts`

**Problem:**
The `deleteNotification` function is imported in routes but not fully implemented.

**Fix:** Add implementation.

---

## Missing Features

### 1. 🔴 Dashboard Statistics (Admin)
**Severity:** HIGH
**Location:** `src/controllers/adminController.ts`

**Missing Implementation:**
```typescript
export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const [totalUsers, totalRestaurants, totalFoodListings, totalRequests, completedRequests, pendingRequests, rejectedRequests] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.foodListing.count(),
      prisma.foodRequest.count(),
      prisma.foodRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.foodRequest.count({ where: { status: 'PENDING' } }),
      prisma.foodRequest.count({ where: { status: 'REJECTED' } }),
    ]);

    const requestFulfillmentRate = totalRequests > 0 
      ? ((completedRequests + rejectedRequests) / totalRequests * 100).toFixed(1)
      : 0;

    return successResponse(
      res,
      {
        totalUsers,
        totalRestaurants,
        totalFoodListings,
        totalRequests,
        completedRequests,
        pendingRequests,
        rejectedRequests,
        requestFulfillmentRate: parseFloat(requestFulfillmentRate as string),
      },
      'Dashboard statistics fetched successfully'
    );
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse(res, 'Failed to fetch dashboard statistics', 500, error);
  }
};
```

---

### 2. 🔴 Restaurant Verification (Admin)
**Severity:** HIGH
**Location:** `src/controllers/adminController.ts`

**Missing Implementation:**
```typescript
export const verifyRestaurant = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: { isVerified },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // Create notification for restaurant owner
    await prisma.notification.create({
      data: {
        userId: restaurant.userId,
        title: isVerified ? 'Restaurant Verified' : 'Restaurant Unverified',
        message: isVerified 
          ? 'Your restaurant has been verified and is now visible to users'
          : 'Your restaurant verification has been revoked',
        type: 'restaurant_verification_status',
      },
    });

    return successResponse(
      res,
      updatedRestaurant,
      'Restaurant verification status updated successfully'
    );
  } catch (error) {
    console.error('Verify restaurant error:', error);
    return errorResponse(res, 'Failed to verify restaurant', 500, error);
  }
};
```

---

### 3. 🔴 Complete Admin Get All Requests
**Severity:** MEDIUM
**Location:** `src/controllers/adminController.ts`

**Missing Implementation:**
```typescript
export const getAllFoodRequests = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (status) {
      where.status = status as string;
    }

    const [foodRequests, total] = await Promise.all([
      prisma.foodRequest.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          foodListing: {
            include: {
              restaurant: {
                select: {
                  id: true,
                  restaurantName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.foodRequest.count({ where }),
    ]);

    return successResponse(
      res,
      {
        foodRequests,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      'Food requests fetched successfully'
    );
  } catch (error) {
    console.error('Get all food requests error:', error);
    return errorResponse(res, 'Failed to fetch food requests', 500, error);
  }
};
```

---

### 4. 🔴 Complete Delete User (Admin)
**Severity:** HIGH
**Location:** `src/controllers/adminController.ts`

**Missing Implementation:**
```typescript
export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Delete user and all related data (cascade delete in schema)
    await prisma.user.delete({
      where: { id },
    });

    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse(res, 'Failed to delete user', 500, error);
  }
};
```

---

### 5. 🔴 Complete Delete Food Listing
**Severity:** MEDIUM
**Location:** `src/controllers/foodController.ts`

**Missing Implementation:**
```typescript
export const deleteFoodListing = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 403);
    }

    // Check if food listing belongs to this restaurant
    const foodListing = await prisma.foodListing.findUnique({
      where: { id },
    });

    if (!foodListing) {
      return errorResponse(res, 'Food listing not found', 404);
    }

    if (foodListing.restaurantId !== restaurant.id) {
      return errorResponse(
        res,
        'You do not have permission to delete this listing',
        403
      );
    }

    // Delete food listing (cascade delete removes related food requests)
    await prisma.foodListing.delete({
      where: { id },
    });

    return successResponse(res, null, 'Food listing deleted successfully');
  } catch (error) {
    console.error('Delete food listing error:', error);
    return errorResponse(res, 'Failed to delete food listing', 500, error);
  }
};
```

---

### 6. 🔴 Complete Cancel Food Request
**Severity:** MEDIUM
**Location:** `src/controllers/requestController.ts`

**Missing Implementation:**
```typescript
export const cancelFoodRequest = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const foodRequest = await prisma.foodRequest.findUnique({
      where: { id },
    });

    if (!foodRequest) {
      return errorResponse(res, 'Food request not found', 404);
    }

    if (foodRequest.userId !== userId) {
      return errorResponse(
        res,
        'You do not have permission to cancel this request',
        403
      );
    }

    if (!['PENDING', 'APPROVED'].includes(foodRequest.status)) {
      return errorResponse(
        res,
        'Cannot cancel a request that is already completed or rejected',
        400
      );
    }

    const updatedFoodRequest = await prisma.foodRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        foodListing: {
          include: {
            restaurant: true,
          },
        },
        user: true,
      },
    });

    // Notify restaurant owner
    await prisma.notification.create({
      data: {
        userId: updatedFoodRequest.foodListing.restaurant.userId,
        title: 'Food Request Cancelled',
        message: `${updatedFoodRequest.user.name} has cancelled their request for ${updatedFoodRequest.foodListing.title}`,
        type: 'food_request_cancelled',
      },
    });

    return successResponse(
      res,
      updatedFoodRequest,
      'Food request cancelled successfully'
    );
  } catch (error) {
    console.error('Cancel food request error:', error);
    return errorResponse(res, 'Failed to cancel food request', 500, error);
  }
};
```

---

### 7. 🔴 Complete Update Food Request Status
**Severity:** HIGH
**Location:** `src/controllers/requestController.ts`

**Missing Implementation:**
```typescript
export const updateFoodRequestStatus = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status, pickupDate } = req.body;

    // Validate status
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status value', 400);
    }

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 403);
    }

    // Get food request with food listing
    const foodRequest = await prisma.foodRequest.findUnique({
      where: { id },
      include: {
        foodListing: true,
        user: true,
      },
    });

    if (!foodRequest) {
      return errorResponse(res, 'Food request not found', 404);
    }

    // Check if food listing belongs to this restaurant
    if (foodRequest.foodListing.restaurantId !== restaurant.id) {
      return errorResponse(
        res,
        'You do not have permission to update this request',
        403
      );
    }

    // Update food request
    const updatedFoodRequest = await prisma.foodRequest.update({
      where: { id },
      data: {
        status,
        ...(pickupDate && { pickupDate: new Date(pickupDate) }),
      },
      include: {
        foodListing: true,
        user: true,
      },
    });

    // Create notification for user
    const notificationMessages = {
      APPROVED: `Your request for ${foodRequest.foodListing.title} has been approved!`,
      REJECTED: `Your request for ${foodRequest.foodListing.title} has been rejected.`,
      COMPLETED: `Your request for ${foodRequest.foodListing.title} has been completed. Thank you!`,
      CANCELLED: `Your request for ${foodRequest.foodListing.title} has been cancelled.`,
    };

    await prisma.notification.create({
      data: {
        userId: foodRequest.userId,
        title: `Food Request ${status}`,
        message: notificationMessages[status as keyof typeof notificationMessages],
        type: `food_request_${status.toLowerCase()}`,
      },
    });

    return successResponse(
      res,
      updatedFoodRequest,
      'Food request status updated successfully'
    );
  } catch (error) {
    console.error('Update food request status error:', error);
    return errorResponse(res, 'Failed to update food request status', 500, error);
  }
};
```

---

### 8. 🔴 Complete Delete Notification
**Severity:** LOW
**Location:** `src/controllers/notificationController.ts`

**Missing Implementation:**
```typescript
export const deleteNotification = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    if (notification.userId !== userId) {
      return errorResponse(
        res,
        'You do not have permission to delete this notification',
        403
      );
    }

    await prisma.notification.delete({
      where: { id },
    });

    return successResponse(res, null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse(res, 'Failed to delete notification', 500, error);
  }
};
```

---

## Implementation Checklist

### Database Setup
- [ ] Install PostgreSQL locally or use cloud provider
- [ ] Create `.env` file in `backend/src/db/` with all required variables
- [ ] Run `npm install` to install all dependencies
- [ ] Run `npx prisma generate` to generate Prisma client
- [ ] Run `npx prisma migrate dev --name init` to set up database

### Fix Critical Bugs
- [ ] Add missing dependencies (bcryptjs, jsonwebtoken, dotenv)
- [ ] Update CORS configuration to be restrictive
- [ ] Fix environment variable loading
- [ ] Ensure Prisma client is generated
- [ ] Add express-async-errors or error wrapper

### Complete Missing Implementations
- [ ] Implement `getDashboardStats` in admin controller
- [ ] Implement `verifyRestaurant` in admin controller
- [ ] Implement `deleteUser` in admin controller
- [ ] Implement `getAllFoodRequests` in admin controller
- [ ] Implement `deleteFoodListing` in food controller
- [ ] Implement `cancelFoodRequest` in request controller
- [ ] Implement `updateFoodRequestStatus` in request controller (complete)
- [ ] Implement `deleteNotification` in notification controller

### Add Validation
- [ ] Add validation middleware to all POST/PUT routes
- [ ] Add validation for admin routes
- [ ] Add custom error messages

### Testing
- [ ] Test all endpoints with Postman
- [ ] Test authentication flow
- [ ] Test role-based access control
- [ ] Test error handling
- [ ] Test pagination
- [ ] Test search and filtering

### Security
- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS in production
- [ ] Add rate limiting
- [ ] Add request size limits
- [ ] Implement input sanitization

### Deployment
- [ ] Setup production database
- [ ] Update environment variables for production
- [ ] Test all features in production
- [ ] Setup monitoring and logging
- [ ] Setup automated backups

---

## Code Quality Improvements

### 1. Add Request Logging
```typescript
import morgan from 'morgan';

// In index.ts
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
```

---

### 2. Add Input Sanitization
```typescript
import xss from 'xss-clean';
import mongoSanitize from 'mongo-sanitize';

app.use(xss());
app.use(mongoSanitize());
```

---

### 3. Add Request Validation with Zod
```typescript
import { z } from 'zod';

const userRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['USER', 'RESTAURANT', 'ADMIN']).optional(),
});

// Middleware
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      return errorResponse(res, error.errors[0].message, 400);
    }
  };
};
```

---

### 4. Add Proper Logging
```typescript
const logger = {
  info: (msg: string) => console.log(`[INFO] ${new Date().toISOString()}: ${msg}`),
  error: (msg: string, err?: any) => console.error(`[ERROR] ${new Date().toISOString()}: ${msg}`, err),
  warn: (msg: string) => console.warn(`[WARN] ${new Date().toISOString()}: ${msg}`),
};
```

---

### 5. Add Type Safety
Create proper TypeScript interfaces:
```typescript
// src/types/index.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'USER' | 'RESTAURANT' | 'ADMIN';
  address?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Priority Implementation Order

1. **Phase 1 (Critical):** Fix bugs and missing dependencies
2. **Phase 2 (High):** Complete admin functions and request handling
3. **Phase 3 (Medium):** Add validation and error handling
4. **Phase 4 (Low):** Code quality and security improvements
5. **Phase 5:** Testing and deployment

