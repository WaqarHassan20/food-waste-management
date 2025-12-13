# Backend Migration Summary - Separate Restaurant Authentication

## Overview
Successfully migrated the backend to support completely separate restaurant authentication from user authentication. Restaurants now have their own registration, login, and management flow independent of the user system.

## Key Changes

### 1. **Database Schema Changes** ✅
**File:** `src/db/prisma/schema.prisma`

- **Removed** `userId` foreign key from `Restaurant` model
- **Added** `email` and `password` fields to `Restaurant` model
- **Removed** `restaurant` relation from `User` model
- Restaurants are now standalone entities with independent authentication

### 2. **JWT Payload Update** ✅
**File:** `src/utils/jwt.ts`

```typescript
interface JwtPayload {
  userId?: string;          // For users
  restaurantId?: string;    // For restaurants
  email: string;
  role: string;             // USER, RESTAURANT, ADMIN
  type: 'user' | 'restaurant'; // Identify token type
}
```

**Benefits:**
- Supports both user and restaurant tokens
- Clear identification of token type
- All tokens contain email and role for authorization checks

### 3. **Authentication Controller** ✅
**File:** `src/controllers/authController.ts`

#### User Authentication (Existing)
- `register()` - Register new users
- `login()` - Login users
- `getProfile()` - Get user profile
- `updateProfile()` - Update user profile

#### Restaurant Authentication (New)
- `restaurantRegister()` - Register new restaurants with:
  - `email`, `password`
  - `restaurantName`, `description`
  - `address`, `phone`, `latitude`, `longitude`
  - `businessLicense` (optional)
- `restaurantLogin()` - Login restaurants
- `getRestaurantProfile()` - Get restaurant profile
- `updateRestaurantProfile()` - Update restaurant profile

### 4. **Food Controller Updates** ✅
**File:** `src/controllers/foodController.ts`

All food listing operations now use `restaurantId` from JWT token instead of looking up via `userId`:

```typescript
// Old approach
const restaurant = await prisma.restaurant.findUnique({
  where: { userId }
});

// New approach
const restaurantId = req.user!.restaurantId;
if (!restaurantId || req.user!.type !== 'restaurant') {
  return errorResponse(res, 'Only restaurants can create food listings', 403);
}
```

**Updated Functions:**
- `createFoodListing()` - Create food listing (restaurant only)
- `updateFoodListing()` - Update listing (restaurant only)
- `deleteFoodListing()` - Delete listing (restaurant only)
- `getMyFoodListings()` - Get restaurant's listings (restaurant only)

### 5. **Restaurant Controller Updates** ✅
**File:** `src/controllers/restaurantController.ts`

- **Removed** `createRestaurant()` - Restaurants now register directly via auth endpoint
- **Updated** `getRestaurant()` - Removed user relation
- **Updated** `updateRestaurant()` - Now uses `restaurantId` from JWT
- **Updated** `getMyRestaurant()` - Now uses `restaurantId` from JWT
- **Updated** `getAllRestaurants()` - Removed user includes

### 6. **Request Controller Updates** ✅
**File:** `src/controllers/requestController.ts`

**User Food Requests:**
- `createFoodRequest()` - Users create requests (user only)
- `getMyFoodRequests()` - Users view their requests (user only)
- `cancelFoodRequest()` - Users cancel requests (user only)

**Restaurant Request Management:**
- `getRestaurantFoodRequests()` - Get requests for restaurant's listings (restaurant only)
  - Now uses `restaurantId` from JWT instead of looking up via `userId`
- `updateFoodRequestStatus()` - Approve/reject requests (restaurant only)
  - Now uses `restaurantId` from JWT for authorization

### 7. **Authentication Routes** ✅
**File:** `src/routes/authRoute.ts`

```
# User Routes
POST   /auth/register              - Register new user
POST   /auth/login                 - Login user
GET    /auth/profile               - Get user profile (protected)
PUT    /auth/profile               - Update user profile (protected)

# Restaurant Routes (New)
POST   /auth/restaurant/register   - Register new restaurant
POST   /auth/restaurant/login      - Login restaurant
GET    /auth/restaurant/profile    - Get restaurant profile (protected)
PUT    /auth/restaurant/profile    - Update restaurant profile (protected)
```

### 8. **Authorization Pattern**

All endpoints that require a specific token type now validate:

```typescript
// Only users
if (req.user!.type !== 'user') {
  return errorResponse(res, 'Only users can perform this action', 403);
}

// Only restaurants
if (!restaurantId || req.user!.type !== 'restaurant') {
  return errorResponse(res, 'Only restaurants can perform this action', 403);
}
```

## Migration Checklist

✅ Updated JWT payload structure
✅ Created restaurant authentication endpoints
✅ Updated food listing operations to use restaurantId
✅ Updated restaurant profile management
✅ Updated request management for restaurants
✅ Removed userId dependency from Restaurant model
✅ Updated all authorization checks
✅ Regenerated Prisma Client
✅ All TypeScript errors resolved
✅ Backward compatible with existing user authentication

## Testing Endpoints

### Restaurant Registration & Login
```bash
# Register restaurant
POST /auth/restaurant/register
{
  "email": "pizza.place@example.com",
  "password": "securePassword123",
  "restaurantName": "Pizza Palace",
  "address": "123 Main St",
  "phone": "555-1234"
}

# Login restaurant
POST /auth/restaurant/login
{
  "email": "pizza.place@example.com",
  "password": "securePassword123"
}
```

### Create Food Listing (Restaurant)
```bash
POST /food
Authorization: Bearer <restaurant-token>
{
  "title": "Pizza Slices",
  "description": "Leftover pizza",
  "quantity": 20,
  "unit": "slices",
  "expiryDate": "2025-12-13T21:00:00Z",
  "pickupTime": "5:00 PM",
  "category": "prepared-food"
}
```

### Get Restaurant Requests
```bash
GET /requests/restaurant?status=PENDING
Authorization: Bearer <restaurant-token>
```

### Update Request Status
```bash
PUT /requests/:id/status
Authorization: Bearer <restaurant-token>
{
  "status": "APPROVED",
  "pickupDate": "2025-12-13T19:00:00Z"
}
```

## Database Notes

**Migration Command:**
```bash
bunx prisma migrate dev --name seperate-resturants
```

This creates a new migration that:
1. Removes `userId` column from `restaurants` table
2. Adds `email` and `password` columns to `restaurants` table
3. Regenerates Prisma Client

## Breaking Changes

⚠️ **For Frontend/Clients:**

1. **Restaurant Authentication:**
   - Use `/auth/restaurant/register` for restaurant signup
   - Use `/auth/restaurant/login` for restaurant login
   - Store separate tokens for users vs restaurants

2. **Authorization:**
   - Include token type awareness (check JWT payload for `type`)
   - Users cannot create/manage food listings
   - Only restaurants can approve/reject requests

3. **Data Structure:**
   - Restaurant profile no longer includes `userId`
   - Food requests always include `user` and `restaurant` relations
   - Request routes remain the same, but require restaurant token

## Future Enhancements

- [ ] Implement separate notification system for restaurants (currently logged)
- [ ] Add email notification endpoints for both users and restaurants
- [ ] Implement refresh token mechanism
- [ ] Add rate limiting for auth endpoints
- [ ] Add two-factor authentication support
- [ ] Add restaurant verification workflow

## Files Modified

1. `src/utils/jwt.ts` - JWT payload structure
2. `src/controllers/authController.ts` - Added restaurant auth functions
3. `src/controllers/foodController.ts` - Updated to use restaurantId
4. `src/controllers/restaurantController.ts` - Removed userId dependency
5. `src/controllers/requestController.ts` - Updated restaurant request handling
6. `src/routes/authRoute.ts` - Added restaurant auth endpoints
7. `src/routes/restaurantRoute.ts` - Removed createRestaurant endpoint
8. `src/db/prisma/schema.prisma` - Schema changes

## Status

✅ **MIGRATION COMPLETE** - All endpoints are functional and tested
