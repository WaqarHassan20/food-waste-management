# 🎨 Frontend - Food Waste Management System

A modern, responsive React application built with TypeScript, Vite, and TailwindCSS for managing food waste reduction operations.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Available Pages](#available-pages)
- [Components](#components)
- [API Integration](#api-integration)
- [Styling](#styling)
- [Development](#development)
- [Build & Deployment](#build--deployment)

## 🎯 Overview

The frontend application provides an intuitive interface for users, restaurants, and administrators to interact with the food waste management platform. Built with modern web technologies, it offers a responsive, accessible, and performant user experience.

## ✨ Features

### User Features
- 🔐 User authentication and registration
- 🍽️ Browse available food listings
- 🔍 Filter food by category and status
- 📱 Responsive mobile-first design
- 🛒 Request food items
- 📊 Track request history and status
- 🔔 Real-time notifications
- 👤 User profile management

### Restaurant Features
- 🏪 Restaurant dashboard
- ➕ Create and manage food listings
- 📦 View and manage incoming requests
- ✅ Approve/reject food requests
- 📈 View statistics and analytics
- 🔔 Notification management

### Admin Features
- 🛡️ Admin dashboard
- ✓ Verify restaurant accounts
- 👥 User management
- 📊 Platform statistics
- 🗂️ Manage all listings and requests

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icon library
- **ESLint** - Code linting

## 📁 Project Structure

```
frontend/
├── public/                    # Static assets
├── src/
│   ├── components/           # Reusable components
│   │   ├── layout/          # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/              # UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       ├── Toast.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── NotificationPanel.tsx
│   │       └── NotificationDropdown.tsx
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── FoodBrowsePage.tsx
│   │   ├── UserDashboard.tsx
│   │   ├── RestaurantDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── NotificationsPage.tsx
│   ├── services/            # API services
│   │   └── api.ts
│   ├── hooks/               # Custom React hooks
│   │   └── useToast.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   ├── assets/              # Images and static files
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── .env                     # Environment variables
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # TailwindCSS configuration
└── package.json             # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- **Bun** (>= 1.0.0) or **Node.js** (>= 18.0.0)
- **Backend API** running (see [backend README](../backend/README.md))

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   ```

4. **Start the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

## 📄 Available Pages

### Public Pages

#### Home Page (`/`)
- Landing page with platform overview
- Features showcase
- Call-to-action buttons
- Navigation to auth and browse pages

#### Auth Page (`/auth`)
- User/Restaurant login
- User/Restaurant registration
- Form validation
- Role selection (User/Restaurant)

#### Food Browse Page (`/browse`)
- Browse all available food listings
- Filter by category
- Search functionality
- View food details
- Request food items (authenticated users)

### Protected Pages (Require Authentication)

#### User Dashboard (`/user/dashboard`)
- View active and past food requests
- Track request status
- View user profile
- Access notifications

#### Restaurant Dashboard (`/restaurant/dashboard`)
- Manage food listings (create, edit, delete)
- View incoming food requests
- Approve/reject requests
- View statistics
- Access notifications

#### Admin Dashboard (`/admin/dashboard`)
- Verify restaurants
- View platform statistics
- Manage users and restaurants
- Monitor all listings and requests
- System analytics

#### Notifications Page (`/notifications`)
- View all notifications
- Mark as read/unread
- Filter by type
- Real-time updates

## 🧩 Components

### Layout Components

#### Navbar
```typescript
// Responsive navigation with role-based menu items
- Logo and branding
- Navigation links
- User menu dropdown
- Notification bell
- Mobile menu
```

#### Footer
```typescript
// Site footer with links and information
- Quick links
- Contact information
- Social media links
- Copyright notice
```

### UI Components

#### Button
```typescript
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>

// Variants: primary, secondary, danger, ghost
// Sizes: sm, md, lg
```

#### Card
```typescript
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

#### Input
```typescript
<Input
  type="text"
  label="Email"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
/>
```

#### Modal
```typescript
<Modal isOpen={isOpen} onClose={handleClose}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>Actions</Modal.Footer>
</Modal>
```

#### Badge
```typescript
<Badge variant="success">Available</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Expired</Badge>

// Variants: success, warning, danger, info, default
```

#### Toast
```typescript
// Using useToast hook
const { showToast } = useToast();

showToast({
  message: "Success!",
  type: "success",
  duration: 3000
});

// Types: success, error, warning, info
```

## 🔌 API Integration

### API Service (`services/api.ts`)

The application uses Axios for API requests with the following structure:

```typescript
// API client setup
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  }
);
```

### API Methods

```typescript
// Authentication
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Food Listings
export const foodAPI = {
  getAll: (params) => api.get('/food', { params }),
  getById: (id) => api.get(`/food/${id}`),
  create: (data) => api.post('/food', data),
  update: (id, data) => api.put(`/food/${id}`, data),
  delete: (id) => api.delete(`/food/${id}`),
};

// Food Requests
export const requestAPI = {
  getAll: () => api.get('/requests'),
  create: (data) => api.post('/requests', data),
  updateStatus: (id, status) => api.put(`/requests/${id}/status`, { status }),
};

// Notifications
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};
```

## 🎨 Styling

The application uses **TailwindCSS 4** for styling with a custom configuration:

### Color Palette
```css
/* Primary colors */
--color-primary: #10b981;    /* Green */
--color-secondary: #6366f1;  /* Indigo */

/* Status colors */
--color-success: #22c55e;    /* Green */
--color-warning: #f59e0b;    /* Amber */
--color-error: #ef4444;      /* Red */
--color-info: #3b82f6;       /* Blue */
```

### Custom Utilities
```typescript
// In tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
};
```

### Responsive Design
- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Responsive navigation with hamburger menu
- Adaptive card layouts

## 💻 Development

### Available Scripts

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint code
bun run lint

# Type check
bun run type-check
```

### Development Tips

1. **Hot Module Replacement (HMR)**
   - Changes are reflected instantly
   - State is preserved during updates

2. **TypeScript Support**
   - Full type checking
   - IntelliSense in IDE
   - Compile-time error detection

3. **Code Organization**
   - Keep components small and focused
   - Use custom hooks for reusable logic
   - Separate concerns (UI, logic, data)

4. **State Management**
   - React hooks (useState, useEffect, useContext)
   - Local storage for authentication
   - Context API for global state

## 🏗️ Build & Deployment

### Production Build

```bash
# Build the application
bun run build

# Output directory: dist/
# Contains optimized static files ready for deployment
```

### Preview Production Build

```bash
bun run preview
# Serves the production build locally on port 4173
```

### Environment Variables for Production

```env
VITE_API_URL=https://api.yourproductiondomain.com/api/v1
```

### Deployment Platforms

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Static Hosting
- Upload `dist/` folder to:
  - AWS S3 + CloudFront
  - GitHub Pages
  - DigitalOcean Spaces
  - Any static hosting service

### Build Optimization

The production build includes:
- ✅ Code minification
- ✅ Tree shaking
- ✅ Asset optimization
- ✅ CSS purging
- ✅ Gzip compression
- ✅ Source maps (optional)

## 🔧 Configuration Files

### Vite Configuration (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
});
```

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**API Connection Issues**
- Check if backend is running
- Verify `VITE_API_URL` in `.env`
- Check CORS settings in backend

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
bun install
bun run build
```

**TypeScript Errors**
```bash
# Restart TypeScript server in VS Code
# Command Palette: TypeScript: Restart TS Server
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## ♿ Accessibility

- Semantic HTML
- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support

## 🧪 Testing (Future)

```bash
# Unit tests (planned)
bun run test

# E2E tests (planned)
bun run test:e2e
```

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please ensure:
- Code follows TypeScript and React best practices
- Components are properly typed
- Responsive design is maintained
- Accessibility standards are met

## 📞 Support

For issues or questions:
- Check the main [README](../README.md)
- Review backend [API documentation](../backend/README.md)
- Open an issue in the repository

---

**Built with ❤️ using React, TypeScript, and TailwindCSS**