# 🔙 Backend - Food Waste Management API

A robust RESTful API server built with Express.js, TypeScript, and Prisma ORM to power the Food Waste Management System.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)

## 🎯 Overview

The backend server provides a complete API for managing food waste reduction operations, including:
- User and restaurant authentication
- Food listing management
- Request handling and tracking
- Admin operations
- Real-time notifications
- Database management with Prisma ORM

## 🛠️ Tech Stack

- **Runtime**: Bun (Node.js compatible)
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon DB)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod
- **Password Hashing**: bcryptjs
- **Development**: Nodemon for hot reload

## 📁 Project Structure

```
backend/
├── src/
│   ├── controllers/           # Request handlers
│   │   ├── adminController.ts
│   │   ├── authController.ts
│   │   ├── foodController.ts
│   │   ├── notificationController.ts
│   │   ├── requestController.ts
│   │   └── restaurantController.ts
│   ├── routes/               # API routes
│   │   ├── adminRoute.ts
│   │   ├── authRoute.ts
│   │   ├── foodRoute.ts
│   │   ├── notificationRoute.ts
│   │   ├── requestRoute.ts
│   │   ├── restaurantRoute.ts
│   │   └── userRoute.ts
│   ├── middleware/           # Custom middleware
│   │   ├── auth.ts          # JWT authentication
│   │   ├── errorHandler.ts  # Error handling
│   │   ├── validation.ts    # Request validation
│   │   └── zodValidation.ts # Zod schema validation
│   ├── services/             # Business logic
│   │   └── notificationService.ts
│   ├── db/                   # Database configuration
│   │   ├── index.ts
│   │   ├── prisma.config.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── generated/        # Prisma generated files
│   ├── utils/                # Helper functions
│   │   ├── jwt.ts           # JWT utilities
│   │   ├── password.ts      # Password hashing
│   │   ├── response.ts      # Response formatting
│   │   └── validators.ts    # Custom validators
│   └── index.ts              # Application entry point
├── .env                      # Environment variables
├── .env.example              # Environment template
├── nodemon.json              # Nodemon configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
├── setup-neon-db.sh          # Database setup script
└── test-api.sh               # API testing script
```

## 🚀 Getting Started

### Prerequisites

- **Bun** (>= 1.0.0)
- **PostgreSQL** database (Neon DB or local)
- **Node.js** (>= 18.0.0) for compatibility

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   PORT=3000
   FRONTEND_URL="http://localhost:5173"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   bun run prisma:generate
   
   # Run database migrations
   bun run prisma:migrate
   
   # (Optional) Open Prisma Studio to view data
   bun run prisma:studio
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

   The server will start on `http://localhost:3000`

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register User/Restaurant
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "USER" | "RESTAURANT",
  "phone": "+1234567890",
  "address": "123 Main St",
  // For restaurants only:
  "restaurantName": "Restaurant Name",
  "description": "Description",
  "businessLicense": "LICENSE123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  }
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "isVerified": true
  }
}
```

### Food Listing Endpoints

#### Get All Food Listings
```http
GET /food?category=PREPARED_FOOD&status=AVAILABLE&page=1&limit=10
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Fresh Sandwiches",
      "description": "10 fresh sandwiches",
      "quantity": 10,
      "category": "PREPARED_FOOD",
      "expiryDate": "2025-12-14T10:00:00Z",
      "pickupLocation": "123 Main St",
      "status": "AVAILABLE",
      "restaurant": {
        "id": "uuid",
        "restaurantName": "Joe's Diner"
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
```

#### Create Food Listing (Restaurant Only)
```http
POST /food
Authorization: Bearer {restaurant-token}
Content-Type: application/json

{
  "title": "Fresh Pizza",
  "description": "5 large pizzas",
  "quantity": 5,
  "category": "PREPARED_FOOD",
  "expiryDate": "2025-12-14T20:00:00Z",
  "pickupLocation": "456 Pizza St",
  "imageUrl": "https://example.com/image.jpg" // optional
}
```

#### Update Food Listing
```http
PUT /food/:id
Authorization: Bearer {restaurant-token}
Content-Type: application/json

{
  "quantity": 3,
  "status": "AVAILABLE"
}
```

#### Delete Food Listing
```http
DELETE /food/:id
Authorization: Bearer {restaurant-token}
```

### Request Endpoints

#### Create Food Request
```http
POST /requests
Authorization: Bearer {user-token}
Content-Type: application/json

{
  "foodListingId": "food-uuid",
  "quantity": 2,
  "requestedDate": "2025-12-14T15:00:00Z",
  "message": "Can I pick up around 3 PM?"
}
```

#### Get User Requests
```http
GET /requests
Authorization: Bearer {user-token}

Response:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "quantity": 2,
      "status": "PENDING",
      "requestedDate": "2025-12-14T15:00:00Z",
      "foodListing": {
        "title": "Fresh Pizza",
        "restaurant": {
          "restaurantName": "Joe's Pizza"
        }
      }
    }
  ]
}
```

#### Update Request Status (Restaurant)
```http
PUT /requests/:id/status
Authorization: Bearer {restaurant-token}
Content-Type: application/json

{
  "status": "APPROVED" | "REJECTED" | "COMPLETED"
}
```

### Admin Endpoints

#### Get All Restaurants
```http
GET /admin/restaurants?isVerified=false
Authorization: Bearer {admin-token}
```

#### Verify Restaurant
```http
PUT /admin/restaurants/:id/verify
Authorization: Bearer {admin-token}
```

#### Get Platform Statistics
```http
GET /admin/stats
Authorization: Bearer {admin-token}

Response:
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalRestaurants": 25,
    "totalFoodListings": 100,
    "totalRequests": 450,
    "activeListings": 45
  }
}
```

### Notification Endpoints

#### Get Notifications
```http
GET /notifications?unreadOnly=true
Authorization: Bearer {token}
```

#### Mark Notification as Read
```http
PUT /notifications/:id/read
Authorization: Bearer {token}
```

#### Mark All as Read
```http
PUT /notifications/read-all
Authorization: Bearer {token}
```

## 🗄️ Database Schema

### User Roles
- `USER` - Regular users who can request food
- `RESTAURANT` - Restaurant accounts that list food
- `ADMIN` - Administrators who manage the platform

### Food Status
- `AVAILABLE` - Food is available for requests
- `RESERVED` - Food has been requested
- `CLAIMED` - Food has been picked up
- `EXPIRED` - Food listing has expired

### Request Status
- `PENDING` - Request awaiting restaurant approval
- `APPROVED` - Request approved by restaurant
- `REJECTED` - Request rejected by restaurant
- `COMPLETED` - Food has been picked up
- `CANCELLED` - Request cancelled by user

### Food Categories
- `PREPARED_FOOD` - Ready-to-eat meals
- `RAW_INGREDIENTS` - Uncooked ingredients
- `BAKERY` - Bread, pastries, etc.
- `DAIRY` - Milk, cheese, etc.
- `FRUITS_VEGETABLES` - Fresh produce
- `BEVERAGES` - Drinks
- `PACKAGED_FOOD` - Packaged items
- `FROZEN_FOOD` - Frozen items
- `OTHER` - Other categories

### Main Tables
- `users` - User accounts
- `restaurants` - Restaurant accounts
- `food_listings` - Food items listed by restaurants
- `food_requests` - User requests for food
- `notifications` - User notifications
- `restaurant_notifications` - Restaurant notifications

For complete schema details, see [src/db/prisma/schema.prisma](./src/db/prisma/schema.prisma).

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### How it works:
1. User/Restaurant logs in via `/auth/login`
2. Server returns JWT token
3. Client includes token in `Authorization` header: `Bearer {token}`
4. Server validates token on protected routes

### Protected Routes
All routes except `/auth/login` and `/auth/register` require authentication.

### Role-Based Access Control
- **USER**: Can browse food, create requests
- **RESTAURANT**: Can manage food listings, handle requests
- **ADMIN**: Full access to all operations

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes | - |
| `JWT_SECRET` | Secret key for JWT signing | ✅ Yes | - |
| `PORT` | Server port | ❌ No | 3000 |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ Yes | - |
| `NODE_ENV` | Environment (development/production) | ❌ No | development |

### Example .env
```env
DATABASE_URL="postgresql://username:password@host:5432/foodwaste_db"
JWT_SECRET="your-256-bit-secret-key-change-this-in-production"
PORT=3000
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

## 💻 Development

### Available Scripts

```bash
# Start development server with hot reload
bun run dev

# Start production server
bun run start

# Generate Prisma client
bun run prisma:generate

# Create and run database migrations
bun run prisma:migrate

# Open Prisma Studio (GUI for database)
bun run prisma:studio
```

### Code Structure Guidelines

**Controllers**: Handle HTTP requests and responses
```typescript
// controllers/foodController.ts
export const getAllFood = async (req: Request, res: Response) => {
  // Handle request
};
```

**Routes**: Define API endpoints
```typescript
// routes/foodRoute.ts
router.get('/', authenticate, getAllFood);
```

**Middleware**: Process requests before they reach controllers
```typescript
// middleware/auth.ts
export const authenticate = (req, res, next) => {
  // Verify JWT token
};
```

**Services**: Contain business logic
```typescript
// services/notificationService.ts
export const createNotification = async (data) => {
  // Business logic
};
```

## 🧪 Testing

### Run API Tests
```bash
# Make the test script executable
chmod +x test-api.sh

# Run all API tests
./test-api.sh

# View test results
cat TEST_RESULTS.md
```

### Manual Testing with curl

```bash
# Health check
curl http://localhost:3000/

# Register user
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","role":"USER"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

## 🚀 Deployment

### Prepare for Production

1. **Set environment variables**
   ```bash
   export DATABASE_URL="your-production-db-url"
   export JWT_SECRET="your-production-secret"
   export FRONTEND_URL="https://your-frontend-domain.com"
   export NODE_ENV="production"
   ```

2. **Run migrations**
   ```bash
   bun run prisma:migrate
   ```

3. **Start the server**
   ```bash
   bun run start
   ```

### Deployment Platforms

- **Railway**: Easy deployment with PostgreSQL
- **Render**: Free tier available
- **Fly.io**: Global edge deployment
- **AWS/GCP/Azure**: Traditional cloud platforms
- **DigitalOcean**: Simple VPS hosting

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Test database connection
bun run prisma:studio

# Reset database (caution: deletes all data)
bunx prisma migrate reset
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
bun run prisma:generate
```

### Port Already in Use
```bash
# Find process on port 3000
lsof -ti:3000

# Kill process
kill -9 <PID>
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript best practices
- All routes are properly authenticated
- Input validation is implemented
- Error handling is comprehensive

## 📞 Support

For issues or questions:
- Open an issue in the repository
- Check existing documentation
- Review test files for examples

---

**Built with ❤️ using Bun, Express, and Prisma**
