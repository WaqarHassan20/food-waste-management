# 🍽️ Food Waste Management System

A full-stack web application designed to reduce food waste by connecting restaurants with surplus food to users who can claim it. The platform facilitates the redistribution of excess food, helping reduce environmental impact while addressing food insecurity.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Food Waste Management System is a comprehensive platform that enables:
- **Restaurants** to list surplus food items that would otherwise go to waste
- **Users** to browse and request available food items
- **Admins** to manage the platform, verify restaurants, and oversee operations

This system helps reduce food waste, supports sustainability efforts, and provides access to food for those in need.

## ✨ Features

### For Restaurants
- 🏪 Restaurant registration and profile management
- 📝 List surplus food items with details (title, description, quantity, expiry)
- 📦 Manage food listings (create, update, delete)
- 📊 Track food requests and status
- 🔔 Real-time notifications for requests and updates
- ⭐ Rating system

### For Users
- 👤 User registration and authentication
- 🔍 Browse available food listings
- 📍 Location-based food search
- 🛒 Request food items
- 📬 Track request status
- 🔔 Notifications for request updates
- 📜 View request history

### For Admins
- 🛡️ Admin dashboard for platform management
- ✅ Verify restaurant accounts
- 📊 Monitor platform statistics
- 🗑️ Manage listings and users
- 📈 View analytics and reports

## 🛠️ Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **TailwindCSS 4** for styling
- **React Router** for navigation
- **Axios** for API requests
- **Lucide React** for icons

### Backend
- **Node.js** with **Bun** runtime
- **Express.js** for API
- **TypeScript** for type safety
- **Prisma ORM** with PostgreSQL
- **JWT** for authentication
- **Zod** for validation
- **bcryptjs** for password hashing

### Database
- **PostgreSQL** (via Neon DB)
- **Prisma** for database management and migrations

## 📁 Project Structure

```
food-waste-management/
├── backend/           # Backend API server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Custom middleware
│   │   ├── services/       # Business logic
│   │   ├── db/            # Database and Prisma
│   │   └── utils/         # Helper functions
│   └── package.json
├── frontend/          # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   ├── hooks/         # Custom React hooks
│   │   └── types/         # TypeScript types
│   └── package.json
└── package.json       # Root package with scripts
```

## 🚀 Getting Started

### Prerequisites

- **Bun** (>= 1.0.0) - [Install Bun](https://bun.sh/)
- **Node.js** (>= 18.0.0) - for compatibility
- **PostgreSQL** database (or use Neon DB)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aliabbaschadhar/food-waste-management.git
   cd food-waste-management
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   bun install

   # Install backend dependencies
   cd backend
   bun install

   # Install frontend dependencies
   cd ../frontend
   bun install
   ```

3. **Set up environment variables**
   
   Create `.env` files in both backend and frontend directories:
   
   **Backend (.env)**
   ```env
   DATABASE_URL="postgresql://user:password@host/database"
   JWT_SECRET="your-secret-key"
   PORT=3000
   FRONTEND_URL="http://localhost:5173"
   ```
   
   **Frontend (.env)**
   ```env
   VITE_API_URL="http://localhost:3000/api/v1"
   ```

4. **Set up the database**
   ```bash
   cd backend
   
   # Generate Prisma client
   bun run prisma:generate
   
   # Run migrations
   bun run prisma:migrate
   ```

5. **Start the development servers**
   ```bash
   # From root directory
   cd ..
   bun run dev
   ```

   This will start both backend (port 3000) and frontend (port 5173) concurrently.

## ⚡ Quick Start

For a quick start guide with detailed step-by-step instructions, see [QUICK_START.md](./QUICK_START.md).

### Development Commands

```bash
# Start both frontend and backend
bun run dev

# Start backend only
bun run dev:backend

# Start frontend only
bun run dev:frontend

# Build frontend for production
bun run build

# Start production servers
bun run start:backend
bun run start:frontend
```

### Backend Commands

```bash
cd backend

# Development with hot reload
bun run dev

# Start server
bun run start

# Generate Prisma client
bun run prisma:generate

# Run database migrations
bun run prisma:migrate

# Open Prisma Studio
bun run prisma:studio
```

### Frontend Commands

```bash
cd frontend

# Development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint
```

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ Yes |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ Yes |
| `PORT` | Server port (default: 3000) | ❌ No |
| `FRONTEND_URL` | Frontend URL for CORS | ✅ Yes |

### Frontend Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | ✅ Yes |

## 📚 API Documentation

The API follows RESTful conventions and is organized into the following modules:

### Authentication
- `POST /api/v1/auth/register` - Register new user/restaurant
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/profile` - Get user profile

### Food Listings
- `GET /api/v1/food` - Get all available food listings
- `POST /api/v1/food` - Create food listing (Restaurant only)
- `PUT /api/v1/food/:id` - Update food listing
- `DELETE /api/v1/food/:id` - Delete food listing

### Food Requests
- `GET /api/v1/requests` - Get user's requests
- `POST /api/v1/requests` - Create food request
- `PUT /api/v1/requests/:id` - Update request status

### Admin
- `GET /api/v1/admin/restaurants` - Get all restaurants
- `PUT /api/v1/admin/restaurants/:id/verify` - Verify restaurant
- `GET /api/v1/admin/stats` - Get platform statistics

### Notifications
- `GET /api/v1/notifications` - Get user notifications
- `PUT /api/v1/notifications/:id/read` - Mark notification as read

For detailed API documentation, see [backend/README.md](./backend/README.md).

## 🏗️ Architecture

### Frontend Architecture
- **Component-Based**: Modular, reusable React components
- **Type-Safe**: Full TypeScript implementation
- **State Management**: React hooks and context
- **Routing**: React Router for navigation
- **API Layer**: Axios-based service layer with interceptors

### Backend Architecture
- **MVC Pattern**: Separation of concerns (Controllers, Routes, Services)
- **Middleware Pipeline**: Authentication, validation, error handling
- **Database Layer**: Prisma ORM for type-safe database access
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Zod schemas for request validation

## 🧪 Testing

```bash
# Backend testing
cd backend
bun run test-api.sh

# Check test results
cat TEST_RESULTS.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the existing code style and includes appropriate tests.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Ali Abbas Chadhar** - [@aliabbaschadhar](https://github.com/aliabbaschadhar)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Built with modern web technologies and best practices
- Inspired by the need to reduce food waste and support communities

## 📞 Support

For support, email aliabbaschadhar@example.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Real-time chat between users and restaurants
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Payment integration for donations
- [ ] Email notifications
- [ ] SMS notifications via Twilio
- [ ] Image upload for food listings
- [ ] Map integration for location-based search
- [ ] Rating and review system
- [ ] Social media integration

---

**Made with ❤️ to reduce food waste and support communities**
