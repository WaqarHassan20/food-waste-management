# Backend API Reference

Complete guide to all backend endpoints with request/response examples.

## Authentication Endpoints

### 1. Register User
**Endpoint:** `POST /api/v1/auth/register`

**Public:** ✅ No authentication required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe",
  "phone": "+1234567890",      // optional
  "address": "123 Main St",    // optional
  "role": "USER"                // optional (USER, RESTAURANT, ADMIN - default: USER)
}
```

**Validation Rules:**
- Email must be valid format
- Password must be:
  - At least 8 characters
  - Contains uppercase letter
  - Contains lowercase letter
  - Contains number
- Name is required
- Role must be one of: USER, RESTAURANT, ADMIN

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": "USER",
      "address": "123 Main St",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (400/409):**
```json
{
  "success": false,
  "message": "User with this email already exists",
  "error": "Details about the error"
}
```

---

### 2. Login
**Endpoint:** `POST /api/v1/auth/login`

**Public:** ✅ No authentication required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+1234567890",
      "role": "USER",
      "address": "123 Main St",
      "isVerified": false,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z",
      "restaurant": null  // null for USER role, populated for RESTAURANT role
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### 3. Get Current User Profile
**Endpoint:** `GET /api/v1/auth/profile`

**Protected:** 🔒 Requires JWT token

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile fetched successfully",
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "USER",
    "address": "123 Main St",
    "isVerified": false,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "restaurant": null
  }
}
```

---

### 4. Update User Profile
**Endpoint:** `PUT /api/v1/auth/profile`

**Protected:** 🔒 Requires JWT token

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body (all optional):**
```json
{
  "name": "Jane Doe",
  "phone": "+0987654321",
  "address": "456 Oak Ave"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid-here",
    "email": "user@example.com",
    "name": "Jane Doe",
    "phone": "+0987654321",
    "role": "USER",
    "address": "456 Oak Ave",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

---

## Restaurant Endpoints

### 1. Create Restaurant Profile
**Endpoint:** `POST /api/v1/restaurants`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** USER, RESTAURANT

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "restaurantName": "Pizza Palace",
  "description": "Best pizza in town",
  "address": "789 Food Street",
  "latitude": 40.7128,           // optional
  "longitude": -74.0060,         // optional
  "phone": "+1-555-0100",
  "businessLicense": "BP-2024-001" // optional
}
```

**Validation Rules:**
- restaurantName, address, phone are required
- User role is automatically updated to RESTAURANT

**Success Response (201):**
```json
{
  "success": true,
  "message": "Restaurant created successfully",
  "data": {
    "id": "uuid-here",
    "userId": "user-uuid",
    "restaurantName": "Pizza Palace",
    "description": "Best pizza in town",
    "address": "789 Food Street",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "phone": "+1-555-0100",
    "businessLicense": "BP-2024-001",
    "rating": 0,
    "totalRatings": 0,
    "isVerified": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "user": {
      "id": "user-uuid",
      "email": "owner@example.com",
      "name": "John Doe"
    }
  }
}
```

---

### 2. Get All Restaurants (Public)
**Endpoint:** `GET /api/v1/restaurants`

**Public:** ✅ No authentication required

**Query Parameters:**
```
?page=1&limit=10&search=pizza
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Restaurants fetched successfully",
  "data": {
    "restaurants": [
      {
        "id": "uuid-here",
        "restaurantName": "Pizza Palace",
        "description": "Best pizza in town",
        "address": "789 Food Street",
        "phone": "+1-555-0100",
        "rating": 4.5,
        "totalRatings": 125,
        "isVerified": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "user": { "id": "...", "email": "..." },
        "_count": {
          "foodListings": 5
        }
      }
    ],
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 3. Get Restaurant Details (Public)
**Endpoint:** `GET /api/v1/restaurants/:id`

**Public:** ✅ No authentication required

**Path Parameters:**
```
/api/v1/restaurants/uuid-here
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Restaurant fetched successfully",
  "data": {
    "id": "uuid-here",
    "restaurantName": "Pizza Palace",
    "address": "789 Food Street",
    "phone": "+1-555-0100",
    "rating": 4.5,
    "latitude": 40.7128,
    "longitude": -74.0060,
    "user": { "id": "...", "email": "...", "name": "..." },
    "foodListings": [
      {
        "id": "food-uuid",
        "title": "Pizza Slices",
        "description": "5 slices of pepperoni pizza",
        "quantity": 5,
        "unit": "slices",
        "expiryDate": "2024-01-15T22:00:00Z",
        "pickupTime": "5:00 PM - 9:00 PM",
        "status": "AVAILABLE",
        "category": "prepared food"
      }
    ]
  }
}
```

---

### 4. Get My Restaurant (Protected)
**Endpoint:** `GET /api/v1/restaurants/my/profile`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** RESTAURANT

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Restaurant fetched successfully",
  "data": {
    "id": "uuid-here",
    "restaurantName": "Pizza Palace",
    "description": "Best pizza in town",
    "address": "789 Food Street",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "phone": "+1-555-0100",
    "businessLicense": "BP-2024-001",
    "rating": 4.5,
    "totalRatings": 125,
    "isVerified": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "foodListings": [
      { "id": "...", "title": "...", ... }
    ]
  }
}
```

---

### 5. Update Restaurant
**Endpoint:** `PUT /api/v1/restaurants`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** RESTAURANT

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body (all optional):**
```json
{
  "restaurantName": "Pizza Palace Updated",
  "description": "Even better pizza now",
  "address": "789 Food Street",
  "latitude": 40.7130,
  "longitude": -74.0062,
  "phone": "+1-555-0100",
  "businessLicense": "BP-2024-001"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Restaurant updated successfully",
  "data": {
    "id": "uuid-here",
    "restaurantName": "Pizza Palace Updated",
    "description": "Even better pizza now",
    "updatedAt": "2024-01-15T11:30:00Z",
    ...
  }
}
```

---

## Food Listing Endpoints

### 1. Create Food Listing
**Endpoint:** `POST /api/v1/food`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** RESTAURANT

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Pizza Slices",
  "description": "5 slices of pepperoni pizza - fresh from oven",
  "quantity": 5,
  "unit": "slices",
  "expiryDate": "2024-01-15T22:00:00Z",
  "pickupTime": "5:00 PM - 9:00 PM",
  "imageUrl": "https://example.com/pizza.jpg",  // optional
  "category": "prepared food"                     // optional
}
```

**Validation Rules:**
- All fields except imageUrl and category are required
- quantity must be > 0
- expiryDate must be in future
- Restaurant profile must exist

**Success Response (201):**
```json
{
  "success": true,
  "message": "Food listing created successfully",
  "data": {
    "id": "food-uuid",
    "restaurantId": "restaurant-uuid",
    "title": "Pizza Slices",
    "description": "5 slices of pepperoni pizza - fresh from oven",
    "quantity": 5,
    "unit": "slices",
    "expiryDate": "2024-01-15T22:00:00Z",
    "pickupTime": "5:00 PM - 9:00 PM",
    "status": "AVAILABLE",
    "imageUrl": "https://example.com/pizza.jpg",
    "category": "prepared food",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "restaurant": {
      "id": "restaurant-uuid",
      "restaurantName": "Pizza Palace",
      "address": "789 Food Street",
      "phone": "+1-555-0100"
    }
  }
}
```

---

### 2. Get All Food Listings (Public)
**Endpoint:** `GET /api/v1/food`

**Public:** ✅ No authentication required

**Query Parameters:**
```
?page=1&limit=10&category=prepared_food&status=AVAILABLE&search=pizza
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food listings fetched successfully",
  "data": {
    "foodListings": [
      {
        "id": "food-uuid",
        "title": "Pizza Slices",
        "description": "5 slices of pepperoni pizza",
        "quantity": 5,
        "unit": "slices",
        "expiryDate": "2024-01-15T22:00:00Z",
        "pickupTime": "5:00 PM - 9:00 PM",
        "status": "AVAILABLE",
        "imageUrl": "https://example.com/pizza.jpg",
        "category": "prepared food",
        "createdAt": "2024-01-15T10:30:00Z",
        "restaurant": {
          "id": "restaurant-uuid",
          "restaurantName": "Pizza Palace",
          "address": "789 Food Street",
          "phone": "+1-555-0100",
          "rating": 4.5
        }
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "totalPages": 15
    }
  }
}
```

---

### 3. Get Food Listing Details (Public)
**Endpoint:** `GET /api/v1/food/:id`

**Public:** ✅ No authentication required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food listing fetched successfully",
  "data": {
    "id": "food-uuid",
    "title": "Pizza Slices",
    "description": "5 slices of pepperoni pizza",
    "quantity": 5,
    "unit": "slices",
    "expiryDate": "2024-01-15T22:00:00Z",
    "pickupTime": "5:00 PM - 9:00 PM",
    "status": "AVAILABLE",
    "imageUrl": "https://example.com/pizza.jpg",
    "category": "prepared food",
    "createdAt": "2024-01-15T10:30:00Z",
    "restaurant": {
      "id": "restaurant-uuid",
      "restaurantName": "Pizza Palace",
      "address": "789 Food Street",
      "phone": "+1-555-0100",
      "rating": 4.5,
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  }
}
```

---

### 4. Get My Food Listings
**Endpoint:** `GET /api/v1/food/my/listings`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** RESTAURANT

**Query Parameters:**
```
?page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food listings fetched successfully",
  "data": {
    "foodListings": [ ... ],
    "pagination": { ... }
  }
}
```

---

### 5. Update Food Listing
**Endpoint:** `PUT /api/v1/food/:id`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** RESTAURANT (owner only)

**Request Body (all optional):**
```json
{
  "title": "Updated Pizza Slices",
  "description": "6 slices now!",
  "quantity": 6,
  "unit": "slices",
  "expiryDate": "2024-01-15T23:00:00Z",
  "pickupTime": "5:00 PM - 10:00 PM",
  "status": "RESERVED",
  "imageUrl": "https://example.com/pizza-new.jpg",
  "category": "prepared food"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food listing updated successfully",
  "data": { ... }
}
```

---

### 6. Delete Food Listing
**Endpoint:** `DELETE /api/v1/food/:id`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** RESTAURANT (owner only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food listing deleted successfully",
  "data": null
}
```

---

## Food Request Endpoints

### 1. Create Food Request
**Endpoint:** `POST /api/v1/requests`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** USER

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "foodListingId": "food-uuid",
  "quantity": 3,
  "message": "I'm interested in these slices for my community center"
}
```

**Validation Rules:**
- foodListingId and quantity are required
- quantity must be > 0
- quantity must not exceed available quantity
- Cannot have two PENDING requests for same listing
- Food listing must be AVAILABLE

**Success Response (201):**
```json
{
  "success": true,
  "message": "Food request created successfully",
  "data": {
    "id": "request-uuid",
    "userId": "user-uuid",
    "foodListingId": "food-uuid",
    "quantity": 3,
    "message": "I'm interested in these slices for my community center",
    "status": "PENDING",
    "pickupDate": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    "foodListing": {
      "id": "food-uuid",
      "title": "Pizza Slices",
      "description": "...",
      "quantity": 5,
      "unit": "slices",
      "expiryDate": "2024-01-15T22:00:00Z",
      "restaurant": {
        "id": "restaurant-uuid",
        "restaurantName": "Pizza Palace",
        "address": "789 Food Street",
        "phone": "+1-555-0100"
      }
    },
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890"
    }
  }
}
```

**Note:** A notification is automatically created for the restaurant owner

---

### 2. Get My Food Requests
**Endpoint:** `GET /api/v1/requests/my`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** USER

**Query Parameters:**
```
?status=PENDING
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food requests fetched successfully",
  "data": [
    {
      "id": "request-uuid",
      "userId": "user-uuid",
      "foodListingId": "food-uuid",
      "quantity": 3,
      "message": "...",
      "status": "PENDING",
      "pickupDate": null,
      "createdAt": "2024-01-15T10:30:00Z",
      "foodListing": {
        "id": "food-uuid",
        "title": "Pizza Slices",
        "restaurant": { ... }
      }
    }
  ]
}
```

---

### 3. Cancel Food Request
**Endpoint:** `PUT /api/v1/requests/:id/cancel`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** USER (request creator only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food request cancelled successfully",
  "data": {
    "id": "request-uuid",
    "status": "CANCELLED",
    ...
  }
}
```

---

### 4. Get Restaurant Food Requests
**Endpoint:** `GET /api/v1/requests/restaurant`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** RESTAURANT

**Query Parameters:**
```
?status=PENDING
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food requests fetched successfully",
  "data": [
    {
      "id": "request-uuid",
      "userId": "user-uuid",
      "foodListingId": "food-uuid",
      "quantity": 3,
      "message": "...",
      "status": "PENDING",
      "createdAt": "2024-01-15T10:30:00Z",
      "foodListing": {
        "id": "food-uuid",
        "title": "Pizza Slices",
        ...
      },
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "address": "123 Main St"
      }
    }
  ]
}
```

---

### 5. Update Food Request Status
**Endpoint:** `PUT /api/v1/requests/:id/status`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** RESTAURANT (owner only)

**Request Body:**
```json
{
  "status": "APPROVED",
  "pickupDate": "2024-01-15T17:00:00Z"  // optional
}
```

**Allowed Status Transitions:**
- PENDING → APPROVED, REJECTED, COMPLETED
- APPROVED → COMPLETED, REJECTED
- REJECTED → CANCELLED (system)
- COMPLETED → (terminal state)
- CANCELLED → (terminal state)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food request status updated successfully",
  "data": {
    "id": "request-uuid",
    "status": "APPROVED",
    "pickupDate": "2024-01-15T17:00:00Z",
    ...
  }
}
```

---

## Notification Endpoints

### 1. Get My Notifications
**Endpoint:** `GET /api/v1/notifications`

**Protected:** 🔒 Requires JWT token

**Query Parameters:**
```
?unreadOnly=true
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": [
    {
      "id": "notification-uuid",
      "userId": "user-uuid",
      "title": "New Food Request",
      "message": "John Doe has requested 3 slices of Pizza Slices",
      "isRead": false,
      "type": "new_food_request",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Mark Notification as Read
**Endpoint:** `PUT /api/v1/notifications/:id/read`

**Protected:** 🔒 Requires JWT token

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "notification-uuid",
    "isRead": true,
    ...
  }
}
```

---

### 3. Mark All Notifications as Read
**Endpoint:** `PUT /api/v1/notifications/read-all`

**Protected:** 🔒 Requires JWT token

**Success Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": null
}
```

---

### 4. Delete Notification
**Endpoint:** `DELETE /api/v1/notifications/:id`

**Protected:** 🔒 Requires JWT token

**Success Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": null
}
```

---

## Admin Endpoints

All admin endpoints are protected and require ADMIN role.

### 1. Get Dashboard Statistics
**Endpoint:** `GET /api/v1/admin/dashboard/stats`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** ADMIN

**Success Response (200):**
```json
{
  "success": true,
  "message": "Dashboard statistics fetched successfully",
  "data": {
    "totalUsers": 150,
    "totalRestaurants": 25,
    "totalFoodListings": 87,
    "totalRequests": 320,
    "requestsCompleted": 250,
    "requestsPending": 45,
    "requestsRejected": 25,
    "averageRequestFulfillmentRate": 78.1
  }
}
```

---

### 2. Get All Users
**Endpoint:** `GET /api/v1/admin/users`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** ADMIN

**Query Parameters:**
```
?page=1&limit=10&role=USER&search=john
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "email": "john@example.com",
        "name": "John Doe",
        "phone": "+1234567890",
        "role": "USER",
        "address": "123 Main St",
        "isVerified": false,
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00Z",
        "restaurant": null
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "totalPages": 15
    }
  }
}
```

---

### 3. Get User Details
**Endpoint:** `GET /api/v1/admin/users/:id`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** ADMIN

**Success Response (200):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "USER",
    "isVerified": false,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "restaurant": null,
    "foodRequests": [
      {
        "id": "request-uuid",
        "quantity": 3,
        "status": "PENDING",
        "foodListing": { ... }
      }
    ]
  }
}
```

---

### 4. Update User Status
**Endpoint:** `PUT /api/v1/admin/users/:id/status`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** ADMIN

**Request Body:**
```json
{
  "isActive": false,
  "isVerified": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "user-uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "isActive": false,
    "isVerified": true
  }
}
```

---

### 5. Delete User
**Endpoint:** `DELETE /api/v1/admin/users/:id`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** ADMIN

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

### 6. Verify Restaurant
**Endpoint:** `PUT /api/v1/admin/restaurants/:id/verify`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** ADMIN

**Request Body:**
```json
{
  "isVerified": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Restaurant verified successfully",
  "data": { ... }
}
```

---

### 7. Get All Food Requests
**Endpoint:** `GET /api/v1/admin/requests`

**Protected:** 🔒 Requires JWT token
**Roles Allowed:** ADMIN

**Query Parameters:**
```
?page=1&limit=10&status=PENDING
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Food requests fetched successfully",
  "data": {
    "requests": [ ... ],
    "pagination": { ... }
  }
}
```

---

## Common HTTP Status Codes

- **200** - OK (success)
- **201** - Created (resource created successfully)
- **400** - Bad Request (validation error)
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **409** - Conflict (duplicate resource, constraint violation)
- **500** - Internal Server Error

## Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <jwt-token>
```

Token is obtained from login/register endpoints and should be stored securely in the frontend (httpOnly cookie recommended).

## Pagination

All list endpoints support pagination with:
- `page` - Page number (default: 1, 1-indexed)
- `limit` - Items per page (default: 10)

Response includes pagination metadata:
```json
{
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

## Error Handling

All errors follow this format:
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Optional technical error details"
}
```

Common error scenarios:
- Missing required fields → 400
- Invalid input format → 400
- User not found → 404
- Permission denied → 403
- Authentication failed → 401
- Resource already exists → 409
- Server error → 500
