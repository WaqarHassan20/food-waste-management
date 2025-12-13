# Backend API Routes Documentation

**Base URL:** `http://localhost:3000/api/v1`

**Response Format:** All responses follow this structure:
```json
{
  "success": true/false,
  "message": "Description of the result",
  "data": { ... }  // Present on success
}
```

---

## 🔐 Authentication Routes (`/auth`)

### 1. User Registration
**POST** `/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",          // Required, valid email
  "password": "password123",            // Required, min 8 characters
  "name": "John Doe",                   // Required, min 2 characters
  "role": "USER",                       // Optional, "USER" or "ADMIN" (default: USER)
  "phone": "1234567890",               // Optional
  "address": "123 Main St"             // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "phone": "1234567890",
      "address": "123 Main St",
      "createdAt": "2025-12-12T..."
    },
    "token": "jwt-token-here"
  }
}
```

---

### 2. User Login
**POST** `/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "user@example.com",     // Required
  "password": "password123"        // Required
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "jwt-token-here"
  }
}
```

---

### 3. Get User Profile
**GET** `/auth/profile`

**Access:** Protected (requires token)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "phone": "1234567890",
    "address": "123 Main St",
    "createdAt": "2025-12-12T..."
  }
}
```

---

### 4. Update User Profile
**PUT** `/auth/profile`

**Access:** Protected (requires token)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",          // Optional, min 2 characters
  "phone": "9876543210",       // Optional
  "address": "456 Oak Ave"     // Optional
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "phone": "9876543210",
    "address": "456 Oak Ave"
  }
}
```

---

### 5. Restaurant Registration
**POST** `/auth/restaurant/register`

**Access:** Public

**Request Body:**
```json
{
  "email": "restaurant@example.com",        // Required, valid email
  "password": "password123",                // Required, min 8 characters
  "restaurantName": "Pizza Palace",         // Required, min 2 characters
  "description": "Best pizza in town",      // Optional
  "address": "789 Restaurant Row",          // Optional, min 5 characters
  "phone": "1234567890",                   // Optional, min 10 characters
  "latitude": 40.7128,                     // Optional, -90 to 90
  "longitude": -74.0060,                   // Optional, -180 to 180
  "businessLicense": "LICENSE123"          // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Restaurant registered successfully",
  "data": {
    "restaurant": {
      "id": "uuid",
      "email": "restaurant@example.com",
      "restaurantName": "Pizza Palace",
      "address": "789 Restaurant Row",
      "phone": "1234567890",
      "createdAt": "2025-12-12T..."
    },
    "token": "jwt-token-here"
  }
}
```

---

### 6. Restaurant Login
**POST** `/auth/restaurant/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "restaurant@example.com",     // Required
  "password": "password123"              // Required
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "restaurant": {
      "id": "uuid",
      "email": "restaurant@example.com",
      "restaurantName": "Pizza Palace"
    },
    "token": "jwt-token-here"
  }
}
```

---

### 7. Get Restaurant Profile
**GET** `/auth/restaurant/profile`

**Access:** Protected (requires restaurant token)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Restaurant profile fetched successfully",
  "data": {
    "id": "uuid",
    "email": "restaurant@example.com",
    "restaurantName": "Pizza Palace",
    "description": "Best pizza in town",
    "address": "789 Restaurant Row",
    "phone": "1234567890",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "rating": 4.5,
    "totalRatings": 100,
    "isVerified": true,
    "createdAt": "2025-12-12T..."
  }
}
```

---

### 8. Update Restaurant Profile
**PUT** `/auth/restaurant/profile`

**Access:** Protected (requires restaurant token)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "restaurantName": "New Pizza Palace",    // Optional, min 2 characters
  "description": "Best pizza ever",        // Optional
  "address": "New Location",               // Optional, min 5 characters
  "phone": "9876543210",                   // Optional, min 10 characters
  "latitude": 40.7128,                     // Optional, -90 to 90
  "longitude": -74.0060                    // Optional, -180 to 180
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Restaurant profile updated successfully",
  "data": {
    "id": "uuid",
    "restaurantName": "New Pizza Palace",
    "description": "Best pizza ever",
    "address": "New Location"
  }
}
```

---

## 🍕 Food Listing Routes (`/food`)

### 1. Get All Food Listings
**GET** `/food`

**Access:** Public

**Query Parameters:**
```
?page=1              // Optional, default: 1
&limit=10            // Optional, default: 10
&category=Pizza      // Optional
&search=pizza        // Optional
```

**Response (200):**
```json
{
  "success": true,
  "message": "Food listings fetched successfully",
  "data": {
    "foodListings": [
      {
        "id": "uuid",
        "title": "Fresh Pizza Slices",
        "description": "Delicious leftover pizza",
        "quantity": 10,
        "unit": "slices",
        "category": "Pizza",
        "expiryDate": "2025-12-13T12:00:00Z",
        "pickupTime": "5 PM - 8 PM",
        "status": "AVAILABLE",
        "imageUrl": "https://example.com/pizza.jpg",
        "restaurant": {
          "id": "uuid",
          "restaurantName": "Pizza Palace",
          "address": "789 Restaurant Row"
        },
        "createdAt": "2025-12-12T..."
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Single Food Listing
**GET** `/food/:id`

**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "message": "Food listing fetched successfully",
  "data": {
    "id": "uuid",
    "title": "Fresh Pizza Slices",
    "description": "Delicious leftover pizza",
    "quantity": 10,
    "unit": "slices",
    "category": "Pizza",
    "expiryDate": "2025-12-13T12:00:00Z",
    "pickupTime": "5 PM - 8 PM",
    "status": "AVAILABLE",
    "imageUrl": "https://example.com/pizza.jpg",
    "restaurant": {
      "id": "uuid",
      "restaurantName": "Pizza Palace",
      "address": "789 Restaurant Row",
      "phone": "1234567890"
    },
    "createdAt": "2025-12-12T..."
  }
}
```

---

### 3. Create Food Listing
**POST** `/food`

**Access:** Protected (Restaurant only)

**Headers:**
```
Authorization: Bearer <restaurant-jwt-token>
```

**Request Body:**
```json
{
  "title": "Fresh Pizza Slices",                    // Required, min 3 characters
  "description": "Delicious leftover pizza",        // Required, min 10 characters
  "quantity": 10,                                   // Required, positive number
  "unit": "slices",                                 // Required
  "expiryDate": "2025-12-13T12:00:00Z",            // Required, ISO datetime
  "pickupTime": "5 PM - 8 PM",                     // Required
  "category": "Pizza",                              // Optional
  "imageUrl": "https://example.com/pizza.jpg"      // Optional, valid URL
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Food listing created successfully",
  "data": {
    "id": "uuid",
    "title": "Fresh Pizza Slices",
    "quantity": 10,
    "status": "AVAILABLE",
    "createdAt": "2025-12-12T..."
  }
}
```

---

### 4. Get My Listings (Restaurant)
**GET** `/food/my/listings`

**Access:** Protected (Restaurant only)

**Headers:**
```
Authorization: Bearer <restaurant-jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Your food listings fetched successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Fresh Pizza Slices",
      "quantity": 10,
      "status": "AVAILABLE",
      "createdAt": "2025-12-12T...",
      "_count": {
        "requests": 5
      }
    }
  ]
}
```

---

### 5. Update Food Listing
**PUT** `/food/:id`

**Access:** Protected (Restaurant only, own listing)

**Headers:**
```
Authorization: Bearer <restaurant-jwt-token>
```

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Pizza Slices",
  "description": "New description",
  "quantity": 15,
  "unit": "slices",
  "expiryDate": "2025-12-14T12:00:00Z",
  "pickupTime": "6 PM - 9 PM",
  "category": "Pizza",
  "imageUrl": "https://example.com/new-pizza.jpg",
  "status": "RESERVED"                    // AVAILABLE, RESERVED, CLAIMED, EXPIRED
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Food listing updated successfully",
  "data": {
    "id": "uuid",
    "title": "Updated Pizza Slices",
    "status": "RESERVED"
  }
}
```

---

### 6. Delete Food Listing
**DELETE** `/food/:id`

**Access:** Protected (Restaurant only, own listing)

**Headers:**
```
Authorization: Bearer <restaurant-jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Food listing deleted successfully",
  "data": null
}
```

---

## 📋 Food Request Routes (`/requests`)

### 1. Create Food Request
**POST** `/requests`

**Access:** Protected (User only)

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Request Body:**
```json
{
  "foodListingId": "uuid",        // Required, valid UUID
  "quantity": 5,                   // Required, positive number
  "message": "I need this food"    // Optional
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Food request created successfully",
  "data": {
    "id": "uuid",
    "foodListingId": "uuid",
    "userId": "uuid",
    "quantity": 5,
    "status": "PENDING",
    "message": "I need this food",
    "createdAt": "2025-12-12T..."
  }
}
```

---

### 2. Get My Requests (User)
**GET** `/requests/my`

**Access:** Protected (User only)

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Your requests fetched successfully",
  "data": [
    {
      "id": "uuid",
      "quantity": 5,
      "status": "PENDING",
      "message": "I need this food",
      "foodListing": {
        "id": "uuid",
        "title": "Fresh Pizza Slices",
        "restaurant": {
          "restaurantName": "Pizza Palace"
        }
      },
      "createdAt": "2025-12-12T..."
    }
  ]
}
```

---

### 3. Get Restaurant Requests
**GET** `/requests/restaurant`

**Access:** Protected (Restaurant only)

**Headers:**
```
Authorization: Bearer <restaurant-jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Requests for your listings fetched successfully",
  "data": [
    {
      "id": "uuid",
      "quantity": 5,
      "status": "PENDING",
      "message": "I need this food",
      "user": {
        "name": "John Doe",
        "email": "user@example.com",
        "phone": "1234567890"
      },
      "foodListing": {
        "title": "Fresh Pizza Slices"
      },
      "createdAt": "2025-12-12T..."
    }
  ]
}
```

---

### 4. Update Request Status (Restaurant)
**PUT** `/requests/:id/status`

**Access:** Protected (Restaurant only)

**Headers:**
```
Authorization: Bearer <restaurant-jwt-token>
```

**Request Body:**
```json
{
  "status": "APPROVED",                      // Required: APPROVED, REJECTED, COMPLETED
  "pickupDate": "2025-12-13T15:00:00Z"      // Optional, ISO datetime
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request status updated successfully",
  "data": {
    "id": "uuid",
    "status": "APPROVED",
    "pickupDate": "2025-12-13T15:00:00Z"
  }
}
```

---

### 5. Cancel Request (User)
**PUT** `/requests/:id/cancel`

**Access:** Protected (User only)

**Headers:**
```
Authorization: Bearer <user-jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Request cancelled successfully",
  "data": {
    "id": "uuid",
    "status": "CANCELLED"
  }
}
```

---

## 🏪 Restaurant Routes (`/restaurants`)

### 1. Get All Restaurants
**GET** `/restaurants`

**Access:** Public

**Query Parameters:**
```
?page=1              // Optional, default: 1
&limit=10            // Optional, default: 10
&search=pizza        // Optional
```

**Response (200):**
```json
{
  "success": true,
  "message": "Restaurants fetched successfully",
  "data": {
    "restaurants": [
      {
        "id": "uuid",
        "restaurantName": "Pizza Palace",
        "description": "Best pizza in town",
        "address": "789 Restaurant Row",
        "phone": "1234567890",
        "rating": 4.5,
        "totalRatings": 100,
        "isVerified": true,
        "_count": {
          "foodListings": 15
        }
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  }
}
```

---

### 2. Get Single Restaurant
**GET** `/restaurants/:id`

**Access:** Public

**Response (200):**
```json
{
  "success": true,
  "message": "Restaurant fetched successfully",
  "data": {
    "id": "uuid",
    "email": "restaurant@example.com",
    "restaurantName": "Pizza Palace",
    "description": "Best pizza in town",
    "address": "789 Restaurant Row",
    "phone": "1234567890",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "rating": 4.5,
    "totalRatings": 100,
    "isVerified": true,
    "foodListings": [
      {
        "id": "uuid",
        "title": "Fresh Pizza Slices",
        "status": "AVAILABLE",
        "expiryDate": "2025-12-13T12:00:00Z"
      }
    ],
    "createdAt": "2025-12-12T..."
  }
}
```

---

### 3. Get My Restaurant Profile
**GET** `/restaurants/my/profile`

**Access:** Protected (Restaurant only)

**Headers:**
```
Authorization: Bearer <restaurant-jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Your restaurant profile fetched successfully",
  "data": {
    "id": "uuid",
    "restaurantName": "Pizza Palace",
    "email": "restaurant@example.com",
    "description": "Best pizza in town",
    "address": "789 Restaurant Row",
    "phone": "1234567890",
    "isVerified": true,
    "_count": {
      "foodListings": 15
    }
  }
}
```

---

### 4. Update Restaurant
**PUT** `/restaurants`

**Access:** Protected (Restaurant only)

**Headers:**
```
Authorization: Bearer <restaurant-jwt-token>
```

**Request Body:** (All fields optional)
```json
{
  "restaurantName": "New Name",
  "description": "New description",
  "address": "New address",
  "phone": "9876543210"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Restaurant updated successfully",
  "data": {
    "id": "uuid",
    "restaurantName": "New Name",
    "description": "New description"
  }
}
```

---

## 🔔 Notification Routes (`/notifications`)

### 1. Get My Notifications
**GET** `/notifications`

**Access:** Protected (User or Restaurant)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notifications fetched successfully",
  "data": [
    {
      "id": "uuid",
      "type": "REQUEST_APPROVED",
      "title": "Request Approved",
      "message": "Your request for Fresh Pizza has been approved",
      "isRead": false,
      "createdAt": "2025-12-12T..."
    }
  ]
}
```

---

### 2. Mark Notification as Read
**PUT** `/notifications/:id/read`

**Access:** Protected (User or Restaurant)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "id": "uuid",
    "isRead": true
  }
}
```

---

### 3. Mark All Notifications as Read
**PUT** `/notifications/read-all`

**Access:** Protected (User or Restaurant)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read",
  "data": {
    "count": 15
  }
}
```

---

### 4. Delete Notification
**DELETE** `/notifications/:id`

**Access:** Protected (User or Restaurant)

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": null
}
```

---

## 👑 Admin Routes (`/admin`)

**Note:** All admin routes require authentication and ADMIN role.

**Headers Required:**
```
Authorization: Bearer <admin-jwt-token>
```

---

### 1. Get Dashboard Stats
**GET** `/admin/dashboard/stats`

**Access:** Protected (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "Dashboard stats fetched successfully",
  "data": {
    "totalUsers": 1000,
    "totalRestaurants": 50,
    "totalFoodListings": 500,
    "totalRequests": 2000,
    "activeListings": 300,
    "completedRequests": 1500
  }
}
```

---

### 2. Get All Users
**GET** `/admin/users`

**Access:** Protected (Admin only)

**Query Parameters:**
```
?page=1              // Optional, default: 1
&limit=10            // Optional, default: 10
&search=john         // Optional
```

**Response (200):**
```json
{
  "success": true,
  "message": "Users fetched successfully",
  "data": {
    "users": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "user@example.com",
        "role": "USER",
        "isActive": true,
        "createdAt": "2025-12-12T..."
      }
    ],
    "pagination": {
      "total": 1000,
      "page": 1,
      "limit": 10,
      "totalPages": 100
    }
  }
}
```

---

### 3. Get User by ID
**GET** `/admin/users/:id`

**Access:** Protected (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "USER",
    "phone": "1234567890",
    "address": "123 Main St",
    "isActive": true,
    "_count": {
      "foodRequests": 25
    },
    "createdAt": "2025-12-12T..."
  }
}
```

---

### 4. Update User Status
**PUT** `/admin/users/:id/status`

**Access:** Protected (Admin only)

**Request Body:**
```json
{
  "isActive": false    // Required, boolean
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "uuid",
    "isActive": false
  }
}
```

---

### 5. Delete User
**DELETE** `/admin/users/:id`

**Access:** Protected (Admin only)

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

---

### 6. Verify Restaurant
**PUT** `/admin/restaurants/:id/verify`

**Access:** Protected (Admin only)

**Request Body:**
```json
{
  "isVerified": true    // Required, boolean
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Restaurant verification updated successfully",
  "data": {
    "id": "uuid",
    "restaurantName": "Pizza Palace",
    "isVerified": true
  }
}
```

---

### 7. Get All Food Requests
**GET** `/admin/requests`

**Access:** Protected (Admin only)

**Query Parameters:**
```
?page=1              // Optional, default: 1
&limit=10            // Optional, default: 10
&status=PENDING      // Optional
```

**Response (200):**
```json
{
  "success": true,
  "message": "All food requests fetched successfully",
  "data": {
    "requests": [
      {
        "id": "uuid",
        "quantity": 5,
        "status": "PENDING",
        "user": {
          "name": "John Doe",
          "email": "user@example.com"
        },
        "foodListing": {
          "title": "Fresh Pizza Slices",
          "restaurant": {
            "restaurantName": "Pizza Palace"
          }
        },
        "createdAt": "2025-12-12T..."
      }
    ],
    "pagination": {
      "total": 2000,
      "page": 1,
      "limit": 10,
      "totalPages": 200
    }
  }
}
```

---

## 🔑 Authentication

### JWT Token Structure
```json
{
  "userId": "uuid",              // For users
  "restaurantId": "uuid",        // For restaurants
  "email": "email@example.com",
  "role": "USER/RESTAURANT/ADMIN",
  "type": "user/restaurant",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Token Usage
Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## ❌ Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details (optional)"
}
```

### Common Error Codes

- **400 Bad Request** - Validation error or invalid input
- **401 Unauthorized** - Missing or invalid token
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **409 Conflict** - Resource already exists (e.g., email already registered)
- **500 Internal Server Error** - Server error

### Example Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

---

## 📝 Notes

1. **Date Format:** All dates should be in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`
2. **Pagination:** Default page size is 10, maximum is 100
3. **Token Expiration:** JWT tokens expire after 7 days
4. **Rate Limiting:** Not currently implemented
5. **CORS:** Enabled for `http://localhost:5173` and `http://localhost:5174`

---

## 🚀 Quick Start Example

```bash
# 1. Register a restaurant
curl -X POST http://localhost:3000/api/v1/auth/restaurant/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pizza@example.com",
    "password": "password123",
    "restaurantName": "Pizza Palace",
    "address": "123 Main St",
    "phone": "1234567890"
  }'

# 2. Login as restaurant
curl -X POST http://localhost:3000/api/v1/auth/restaurant/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "pizza@example.com",
    "password": "password123"
  }'

# 3. Create food listing (use token from login)
curl -X POST http://localhost:3000/api/v1/food \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Fresh Pizza Slices",
    "description": "Delicious leftover pizza from today",
    "quantity": 10,
    "unit": "slices",
    "expiryDate": "2025-12-13T20:00:00Z",
    "pickupTime": "5 PM - 8 PM",
    "category": "Pizza"
  }'
```

---

**Last Updated:** December 12, 2025  
**Version:** 1.0.0  
**Backend Port:** 3000  
**Frontend Port:** 5173/5174
