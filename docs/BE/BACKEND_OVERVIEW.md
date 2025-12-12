# Backend Architecture Overview

## Project Overview
This is a **Food Waste Reduction API** built with **Express.js**, **TypeScript**, and **Prisma ORM**. It enables restaurants to share surplus food with users, creating a platform for reducing food waste.

## Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Language**: TypeScript
- **Database ORM**: Prisma 7.1.0
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **CORS**: Enabled for frontend integration

## Project Structure
```
backend/
├── src/
│   ├── index.ts                 # Main server entry point
│   ├── controllers/             # Business logic for each feature
│   │   ├── authController.ts
│   │   ├── restaurantController.ts
│   │   ├── foodController.ts
│   │   ├── requestController.ts
│   │   ├── adminController.ts
│   │   └── notificationController.ts
│   ├── routes/                  # API endpoint definitions
│   │   ├── authRoute.ts
│   │   ├── restaurantRoute.ts
│   │   ├── foodRoute.ts
│   │   ├── requestRoute.ts
│   │   ├── adminRoute.ts
│   │   ├── notificationRoute.ts
│   │   └── userRoute.ts
│   ├── middleware/              # Express middleware
│   │   ├── auth.ts              # JWT authentication & authorization
│   │   ├── errorHandler.ts      # Centralized error handling
│   │   └── validation.ts        # Request validation
│   ├── utils/                   # Helper functions
│   │   ├── jwt.ts               # Token generation & verification
│   │   ├── password.ts          # Password hashing & comparison
│   │   ├── response.ts          # Standardized API response format
│   │   └── validators.ts        # Input validation functions
│   └── db/
│       ├── prisma.config.ts     # Prisma client initialization
│       └── prisma/
│           └── schema.prisma    # Database schema definition
├── package.json
└── tsconfig.json
```

## Database Models

### User
```
{
  id: UUID (primary key)
  email: String (unique)
  password: String (hashed)
  name: String
  phone: String (optional)
  role: UserRole (USER | RESTAURANT | ADMIN)
  address: String (optional)
  isVerified: Boolean (default: false)
  isActive: Boolean (default: true)
  createdAt: DateTime
  updatedAt: DateTime
  
  Relations:
  - restaurant: One-to-One with Restaurant
  - foodRequests: One-to-Many with FoodRequest
  - notifications: One-to-Many with Notification
}
```

### Restaurant
```
{
  id: UUID (primary key)
  userId: UUID (unique, foreign key to User)
  restaurantName: String
  description: String (optional)
  address: String
  latitude: Float (optional, for geolocation)
  longitude: Float (optional, for geolocation)
  phone: String
  businessLicense: String (optional)
  rating: Float (default: 0)
  totalRatings: Int (default: 0)
  isVerified: Boolean (default: false) - Admin verification
  createdAt: DateTime
  updatedAt: DateTime
  
  Relations:
  - user: One-to-One with User
  - foodListings: One-to-Many with FoodListing
}
```

### FoodListing
```
{
  id: UUID (primary key)
  restaurantId: UUID (foreign key to Restaurant)
  title: String
  description: String
  quantity: Int
  unit: String (e.g., "kg", "plates", "servings")
  expiryDate: DateTime
  pickupTime: String (e.g., "5:00 PM - 8:00 PM")
  status: FoodStatus (AVAILABLE | RESERVED | CLAIMED | EXPIRED)
  imageUrl: String (optional)
  category: String (optional - e.g., "prepared food", "raw ingredients")
  createdAt: DateTime
  updatedAt: DateTime
  
  Relations:
  - restaurant: Many-to-One with Restaurant
  - foodRequests: One-to-Many with FoodRequest
}
```

### FoodRequest
```
{
  id: UUID (primary key)
  userId: UUID (foreign key to User)
  foodListingId: UUID (foreign key to FoodListing)
  quantity: Int
  message: String (optional)
  status: RequestStatus (PENDING | APPROVED | REJECTED | COMPLETED | CANCELLED)
  pickupDate: DateTime (optional)
  createdAt: DateTime
  updatedAt: DateTime
  
  Relations:
  - user: Many-to-One with User
  - foodListing: Many-to-One with FoodListing
}
```

### Notification
```
{
  id: UUID (primary key)
  userId: UUID (foreign key to User)
  title: String
  message: String
  isRead: Boolean (default: false)
  type: String (e.g., "request_approved", "new_food_available")
  createdAt: DateTime
  
  Relations:
  - user: Many-to-One with User
}
```

## User Roles

### USER (Regular User)
- Can browse available food listings
- Can create food requests for available food
- Can manage their own food requests
- Can view notifications
- Cannot create restaurants or food listings

### RESTAURANT
- Can create and manage restaurant profiles
- Can create and manage food listings
- Can view food requests for their listings
- Can approve/reject/complete food requests
- Can update request status and set pickup dates

### ADMIN
- Full access to all users and restaurants
- Can view all food requests
- Can verify/unverify restaurants
- Can activate/deactivate user accounts
- Can view dashboard statistics

## API Endpoints Overview

### Authentication (`/api/v1/auth`)
- `POST /register` - Register new user
- `POST /login` - Login and get JWT token
- `GET /profile` - Get current user profile (Protected)
- `PUT /profile` - Update user profile (Protected)

### Restaurants (`/api/v1/restaurants`)
- `GET /` - Get all verified restaurants (Public, paginated)
- `GET /:id` - Get restaurant details (Public)
- `POST /` - Create restaurant profile (Protected, USER/RESTAURANT)
- `GET /my/profile` - Get my restaurant (Protected, RESTAURANT)
- `PUT /` - Update restaurant (Protected, RESTAURANT)

### Food Listings (`/api/v1/food`)
- `GET /` - Get all available food listings (Public, paginated, filterable)
- `GET /:id` - Get specific food listing (Public)
- `POST /` - Create food listing (Protected, RESTAURANT)
- `GET /my/listings` - Get my food listings (Protected, RESTAURANT)
- `PUT /:id` - Update food listing (Protected, RESTAURANT)
- `DELETE /:id` - Delete food listing (Protected, RESTAURANT)

### Food Requests (`/api/v1/requests`)
- `POST /` - Create food request (Protected, USER)
- `GET /my` - Get my food requests (Protected, USER)
- `PUT /:id/cancel` - Cancel food request (Protected, USER)
- `GET /restaurant` - Get requests for my restaurant (Protected, RESTAURANT)
- `PUT /:id/status` - Update request status (Protected, RESTAURANT)

### Notifications (`/api/v1/notifications`)
- `GET /` - Get my notifications (Protected)
- `PUT /:id/read` - Mark notification as read (Protected)
- `PUT /read-all` - Mark all as read (Protected)
- `DELETE /:id` - Delete notification (Protected)

### Admin (`/api/v1/admin`)
- `GET /dashboard/stats` - Get dashboard statistics (Protected, ADMIN)
- `GET /users` - Get all users (Protected, ADMIN, paginated)
- `GET /users/:id` - Get user details (Protected, ADMIN)
- `PUT /users/:id/status` - Update user status (Protected, ADMIN)
- `DELETE /users/:id` - Delete user (Protected, ADMIN)
- `PUT /restaurants/:id/verify` - Verify restaurant (Protected, ADMIN)
- `GET /requests` - Get all food requests (Protected, ADMIN)

## Authentication Flow

1. **User Registration**
   - User provides email, password, name, and optional phone/address
   - Password is hashed using bcryptjs
   - User created in database with default role = USER

2. **User Login**
   - User provides email and password
   - Password is compared with stored hash
   - JWT token is generated with userId, email, and role
   - Token has expiration set by JWT_EXPIRES_IN (default: 7 days)

3. **Protected Routes**
   - Client sends token in Authorization header: `Bearer <token>`
   - Middleware verifies token signature and expiration
   - Token payload is attached to `req.user`
   - Route handler can access user info from `req.user`

## Error Handling

All endpoints return standardized response format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Additional error details (optional)"
}
```

## Environment Variables Required

```
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:password@localhost:5432/food_waste_db
NODE_ENV=development
```

## Key Features

1. **JWT Authentication** - Secure token-based authentication
2. **Role-Based Authorization** - Different access levels for USER, RESTAURANT, ADMIN
3. **Food Waste Reduction** - Restaurants can share surplus food
4. **Real-time Notifications** - Users get notified of request status changes
5. **Admin Dashboard** - Statistics and user management
6. **Pagination** - All list endpoints support pagination
7. **Filtering & Search** - Food listings and restaurants can be filtered and searched
8. **Input Validation** - Comprehensive validation for all inputs
9. **Error Handling** - Centralized error handling with proper HTTP status codes
10. **CORS Support** - Configured for frontend integration

## Running the Backend

```bash
# Install dependencies
npm install

# Setup database
npx prisma migrate dev

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Server runs on `http://localhost:3000` with API base at `/api/v1`
