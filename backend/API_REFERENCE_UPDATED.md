# Backend API Reference - Updated Endpoints

## Authentication Endpoints

### User Authentication

#### Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "USER",
  "address": "123 Main St"
}

Response: 201 Created
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-12-12T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "User registered successfully"
}
```

#### Login User
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "data": {
    "user": { /* user object */ },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

#### Get User Profile
```
GET /api/v1/auth/profile
Authorization: Bearer <user-token>

Response: 200 OK
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "USER",
    "address": "123 Main St",
    "isVerified": false,
    "isActive": true,
    "createdAt": "2025-12-12T..."
  },
  "message": "Profile fetched successfully"
}
```

#### Update User Profile
```
PUT /api/v1/auth/profile
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "name": "Jane Doe",
  "phone": "+1234567890",
  "address": "456 Oak Ave"
}

Response: 200 OK
{
  "data": { /* updated user object */ },
  "message": "Profile updated successfully"
}
```

### Restaurant Authentication ⭐ NEW

#### Register Restaurant
```
POST /api/v1/auth/restaurant/register
Content-Type: application/json

{
  "email": "restaurant@example.com",
  "password": "securePassword123",
  "restaurantName": "Pizza Palace",
  "description": "Best pizza in town",
  "address": "123 Food St",
  "phone": "+1987654321",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "businessLicense": "LICENSE123"
}

Response: 201 Created
{
  "data": {
    "restaurant": {
      "id": "uuid",
      "email": "restaurant@example.com",
      "restaurantName": "Pizza Palace",
      "address": "123 Food St",
      "phone": "+1987654321",
      "createdAt": "2025-12-12T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Restaurant registered successfully"
}
```

#### Login Restaurant
```
POST /api/v1/auth/restaurant/login
Content-Type: application/json

{
  "email": "restaurant@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "data": {
    "restaurant": { /* restaurant object */ },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

#### Get Restaurant Profile
```
GET /api/v1/auth/restaurant/profile
Authorization: Bearer <restaurant-token>

Response: 200 OK
{
  "data": {
    "id": "uuid",
    "email": "restaurant@example.com",
    "restaurantName": "Pizza Palace",
    "description": "Best pizza in town",
    "address": "123 Food St",
    "phone": "+1987654321",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "isVerified": false,
    "rating": 4.5,
    "totalRatings": 10,
    "createdAt": "2025-12-12T..."
  },
  "message": "Restaurant profile fetched successfully"
}
```

#### Update Restaurant Profile
```
PUT /api/v1/auth/restaurant/profile
Authorization: Bearer <restaurant-token>
Content-Type: application/json

{
  "restaurantName": "Pizza Palace Premium",
  "description": "Best pizza in town!",
  "address": "456 Food Ave",
  "phone": "+1987654321",
  "latitude": 40.7140,
  "longitude": -74.0070
}

Response: 200 OK
{
  "data": { /* updated restaurant object */ },
  "message": "Restaurant profile updated successfully"
}
```

## Food Listing Endpoints

### Create Food Listing (Restaurant Only)
```
POST /api/v1/food
Authorization: Bearer <restaurant-token>
Content-Type: application/json

{
  "title": "Pizza Slices",
  "description": "Leftover pepperoni pizza from today",
  "quantity": 20,
  "unit": "slices",
  "expiryDate": "2025-12-13T21:00:00Z",
  "pickupTime": "5:00 PM - 8:00 PM",
  "category": "prepared-food",
  "imageUrl": "https://example.com/image.jpg"
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "restaurantId": "uuid",
    "title": "Pizza Slices",
    "quantity": 20,
    "unit": "slices",
    "status": "AVAILABLE",
    "expiryDate": "2025-12-13T21:00:00Z",
    "pickupTime": "5:00 PM - 8:00 PM",
    "restaurant": {
      "id": "uuid",
      "restaurantName": "Pizza Palace",
      "address": "123 Food St",
      "phone": "+1987654321"
    },
    "createdAt": "2025-12-12T..."
  },
  "message": "Food listing created successfully"
}
```

### Get All Food Listings (Public)
```
GET /api/v1/food?page=1&limit=10&category=prepared-food&search=pizza

Response: 200 OK
{
  "data": {
    "listings": [ /* array of food listings */ ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  },
  "message": "Food listings fetched successfully"
}
```

### Get My Food Listings (Restaurant Only)
```
GET /api/v1/food/my/listings
Authorization: Bearer <restaurant-token>

Response: 200 OK
{
  "data": [ /* array of restaurant's food listings */ ],
  "message": "Food listings fetched successfully"
}
```

### Update Food Listing (Restaurant Only)
```
PUT /api/v1/food/:id
Authorization: Bearer <restaurant-token>
Content-Type: application/json

{
  "title": "Updated Pizza Slices",
  "quantity": 15,
  "status": "AVAILABLE"
}

Response: 200 OK
{
  "data": { /* updated food listing */ },
  "message": "Food listing updated successfully"
}
```

### Delete Food Listing (Restaurant Only)
```
DELETE /api/v1/food/:id
Authorization: Bearer <restaurant-token>

Response: 200 OK
{
  "data": null,
  "message": "Food listing deleted successfully"
}
```

## Food Request Endpoints

### Create Food Request (User Only)
```
POST /api/v1/requests
Authorization: Bearer <user-token>
Content-Type: application/json

{
  "foodListingId": "uuid",
  "quantity": 5,
  "message": "I need this for my family dinner"
}

Response: 201 Created
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "foodListingId": "uuid",
    "quantity": 5,
    "status": "PENDING",
    "message": "I need this for my family dinner",
    "createdAt": "2025-12-12T...",
    "foodListing": { /* food listing object */ },
    "user": { /* user object */ }
  },
  "message": "Food request created successfully"
}
```

### Get My Food Requests (User Only)
```
GET /api/v1/requests/my?status=PENDING
Authorization: Bearer <user-token>

Response: 200 OK
{
  "data": [ /* array of user's food requests */ ],
  "message": "Food requests fetched successfully"
}
```

### Get Restaurant's Food Requests (Restaurant Only)
```
GET /api/v1/requests/restaurant?status=PENDING
Authorization: Bearer <restaurant-token>

Response: 200 OK
{
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "foodListingId": "uuid",
      "quantity": 5,
      "status": "PENDING",
      "message": "I need this for my family dinner",
      "createdAt": "2025-12-12T...",
      "foodListing": { /* food listing object */ },
      "user": {
        "id": "uuid",
        "name": "John Doe",
        "email": "user@example.com",
        "phone": "+1234567890",
        "address": "123 Main St"
      }
    }
  ],
  "message": "Food requests fetched successfully"
}
```

### Update Request Status (Restaurant Only)
```
PUT /api/v1/requests/:id/status
Authorization: Bearer <restaurant-token>
Content-Type: application/json

{
  "status": "APPROVED",
  "pickupDate": "2025-12-13T18:00:00Z"
}

Response: 200 OK
{
  "data": { /* updated food request */ },
  "message": "Food request status updated"
}
```

### Cancel Food Request (User Only)
```
PUT /api/v1/requests/:id/cancel
Authorization: Bearer <user-token>

Response: 200 OK
{
  "data": { /* updated food request */ },
  "message": "Food request cancelled successfully"
}
```

## Restaurant Management Endpoints

### Get All Restaurants (Public)
```
GET /api/v1/restaurants?page=1&limit=10&search=pizza

Response: 200 OK
{
  "data": {
    "restaurants": [ /* array of verified restaurants */ ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  },
  "message": "Restaurants fetched successfully"
}
```

### Get Restaurant Details (Public)
```
GET /api/v1/restaurants/:id

Response: 200 OK
{
  "data": {
    "id": "uuid",
    "restaurantName": "Pizza Palace",
    "description": "Best pizza in town",
    "address": "123 Food St",
    "phone": "+1987654321",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "rating": 4.5,
    "totalRatings": 10,
    "isVerified": true,
    "createdAt": "2025-12-12T...",
    "foodListings": [ /* available food listings */ ]
  },
  "message": "Restaurant fetched successfully"
}
```

### Get My Restaurant Profile (Restaurant Only)
```
GET /api/v1/restaurants/my/profile
Authorization: Bearer <restaurant-token>

Response: 200 OK
{
  "data": {
    "id": "uuid",
    "restaurantName": "Pizza Palace",
    "description": "Best pizza in town",
    "address": "123 Food St",
    "phone": "+1987654321",
    "email": "restaurant@example.com",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "rating": 4.5,
    "totalRatings": 10,
    "isVerified": false,
    "createdAt": "2025-12-12T...",
    "foodListings": [ /* all restaurant's listings */ ]
  },
  "message": "Restaurant profile fetched successfully"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "data": null,
  "message": "Error description",
  "statusCode": 400
}
```

Common HTTP Status Codes:
- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Token Usage

Include token in `Authorization` header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

Token payload contains:
```json
{
  "userId": "uuid (users only)",
  "restaurantId": "uuid (restaurants only)",
  "email": "email@example.com",
  "role": "USER | RESTAURANT | ADMIN",
  "type": "user | restaurant"
}
```
