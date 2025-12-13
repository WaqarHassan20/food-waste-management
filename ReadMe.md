# Food Waste Management System

A full-stack web application to reduce food waste by connecting restaurants with surplus food to users who can claim it.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun runtime
- PostgreSQL database running on localhost:5432
- Git

### Installation & Setup

1. **Install all dependencies**
```bash
# From root directory
bun install
cd backend && bun install && cd ..
cd frontend && bun install && cd ..
```

2. **Configure Environment**

Backend `.env` is already configured. Default settings:
```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/food_waste_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

Frontend `.env` is configured for local development:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

3. **Setup Database**
```bash
cd backend
npx prisma migrate deploy
cd ..
```

### Running the Application

**Easiest way - Run both servers:**
```bash
npm run dev
```

This starts:
- Backend API: http://localhost:3000
- Frontend: http://localhost:5173 (or 5174 if 5173 is busy)

**Or run separately:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

## 🎯 Using the Application

1. **Open** http://localhost:5173 (or 5174) in your browser
2. **Sign Up** with a new account (choose role: User, Restaurant, or Admin)
3. **Sign In** with your credentials
4. **Explore** the dashboard based on your role

### Test Accounts
After signup, you can create test accounts with different roles:
- **User**: Browse and request food
- **Restaurant**: Create food listings
- **Admin**: Manage users and restaurants

## 📚 Features

### Users
- Browse available food listings
- Request food items
- Track request status
- Receive notifications

### Restaurants  
- Create/manage food listings
- Handle incoming requests
- Update profile
- View analytics

### Admins
- Manage users & restaurants
- Verify restaurants
- System monitoring
- Dashboard statistics

## 🏗️ Tech Stack

**Backend**: Express.js, Prisma, PostgreSQL, JWT, Bun  
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4

## 📁 Structure

```
├── backend/          # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── db/
│   │   └── utils/
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
└── docs/            # Documentation
```

## 🔌 Key API Endpoints

- `POST /api/v1/auth/register` - Register
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/food` - List food
- `POST /api/v1/food` - Create listing
- `POST /api/v1/requests` - Request food
- `GET /api/v1/restaurants` - List restaurants

## 🧪 Test the API

```bash
# Health check
curl http://localhost:3000/

# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","role":"USER"}'
```

## 🔧 Troubleshooting

**Database connection failed?**
- Make sure PostgreSQL is running on localhost:5432
- Check credentials in `backend/.env`

**Port already in use?**
- Frontend will auto-switch to 5174 if 5173 is busy
- Backend needs port 3000 free

**CORS errors?**
- Backend is configured for ports 5173 and 5174
- Check browser console for exact error

## 📖 More Documentation

See `/docs` folder for detailed guides (though we try to keep .md files minimal!)