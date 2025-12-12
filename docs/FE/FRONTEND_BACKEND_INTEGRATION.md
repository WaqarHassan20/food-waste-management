# Frontend-Backend Integration Guide

Complete guide for integrating the frontend with the backend API.

## Table of Contents
1. [Setup Instructions](#setup-instructions)
2. [Authentication Flow](#authentication-flow)
3. [Making API Calls](#making-api-calls)
4. [Error Handling](#error-handling)
5. [Environment Configuration](#environment-configuration)
6. [Common Integration Patterns](#common-integration-patterns)
7. [Testing the Integration](#testing-the-integration)

---

## Setup Instructions

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file in backend/src/db/.env
# Add the following variables:
PORT=3000
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://user:password@localhost:5432/food_waste_db
NODE_ENV=development

# Setup database
npx prisma migrate dev --name init

# Start the backend server
npm run dev
```

**Backend will be available at:** `http://localhost:3000`
**API Base URL:** `http://localhost:3000/api/v1`

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file in frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Start frontend development server
npm run dev
```

**Frontend will be available at:** `http://localhost:5173`

---

## Authentication Flow

### 1. User Registration

```javascript
// Frontend: Register a new user
const registerUser = async (userData) => {
  try {
    const response = await fetch(
      `${process.env.VITE_API_BASE_URL}/auth/register`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          role: userData.role || 'USER', // USER, RESTAURANT, or ADMIN
        }),
      }
    );

    const data = await response.json();
    
    if (data.success) {
      // Store token in localStorage or secure cookie
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};
```

### 2. User Login

```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch(
      `${process.env.VITE_API_BASE_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      // Redirect to dashboard based on user role
      redirectToDashboard(data.data.user.role);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### 3. Protected API Calls (With Token)

```javascript
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    // Redirect to login if no token
    window.location.href = '/login';
    return;
  }

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(
    `${process.env.VITE_API_BASE_URL}${endpoint}`,
    options
  );

  // If 401, token is invalid/expired - redirect to login
  if (response.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return await response.json();
};
```

### 4. Logout

```javascript
const logoutUser = () => {
  // Clear token and user from storage
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  
  // Redirect to home or login
  window.location.href = '/';
};
```

---

## Making API Calls

### Create Reusable API Service

```javascript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async request(endpoint: string, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getAuthHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API request failed');
    }

    return data.data;
  }

  // Auth endpoints
  register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  getProfile() {
    return this.request('/auth/profile');
  }

  updateProfile(data: any) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Restaurant endpoints
  createRestaurant(data: any) {
    return this.request('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getAllRestaurants(page = 1, limit = 10, search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search }),
    });
    return this.request(`/restaurants?${params}`);
  }

  getRestaurant(id: string) {
    return this.request(`/restaurants/${id}`);
  }

  getMyRestaurant() {
    return this.request('/restaurants/my/profile');
  }

  updateRestaurant(data: any) {
    return this.request('/restaurants', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Food listing endpoints
  createFoodListing(data: any) {
    return this.request('/food', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getAllFoodListings(
    page = 1,
    limit = 10,
    category = '',
    status = 'AVAILABLE',
    search = ''
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      status,
      ...(category && { category }),
      ...(search && { search }),
    });
    return this.request(`/food?${params}`);
  }

  getFoodListing(id: string) {
    return this.request(`/food/${id}`);
  }

  getMyFoodListings(page = 1, limit = 10) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request(`/food/my/listings?${params}`);
  }

  updateFoodListing(id: string, data: any) {
    return this.request(`/food/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteFoodListing(id: string) {
    return this.request(`/food/${id}`, {
      method: 'DELETE',
    });
  }

  // Food request endpoints
  createFoodRequest(data: any) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getMyFoodRequests(status = '') {
    const params = status ? `?status=${status}` : '';
    return this.request(`/requests/my${params}`);
  }

  cancelFoodRequest(id: string) {
    return this.request(`/requests/${id}/cancel`, {
      method: 'PUT',
    });
  }

  getRestaurantFoodRequests(status = '') {
    const params = status ? `?status=${status}` : '';
    return this.request(`/requests/restaurant${params}`);
  }

  updateFoodRequestStatus(id: string, data: any) {
    return this.request(`/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Notification endpoints
  getNotifications(unreadOnly = false) {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    return this.request(`/notifications${params}`);
  }

  markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  markAllNotificationsAsRead() {
    return this.request('/notifications/read-all', {
      method: 'PUT',
    });
  }

  deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  getDashboardStats() {
    return this.request('/admin/dashboard/stats');
  }

  getAllUsers(page = 1, limit = 10, role = '', search = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(role && { role }),
      ...(search && { search }),
    });
    return this.request(`/admin/users?${params}`);
  }

  getUserById(id: string) {
    return this.request(`/admin/users/${id}`);
  }

  updateUserStatus(id: string, data: any) {
    return this.request(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  verifyRestaurant(id: string, isVerified: boolean) {
    return this.request(`/admin/restaurants/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ isVerified }),
    });
  }

  getAllFoodRequests(page = 1, limit = 10, status = '') {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    return this.request(`/admin/requests?${params}`);
  }
}

export default new ApiService();
```

---

## Error Handling

### Global Error Handler

```javascript
// src/utils/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error instanceof TypeError) {
    if (error.message === 'Failed to fetch') {
      return 'Network error. Please check your connection.';
    }
  }

  if (error.message === 'Unauthorized') {
    return 'Your session has expired. Please login again.';
  }

  return error.message || 'An unexpected error occurred. Please try again.';
};

// In components:
try {
  await apiService.login(email, password);
} catch (error) {
  const errorMessage = handleApiError(error);
  setError(errorMessage);
  // Show error toast/notification
}
```

### Create Error Boundary Component

```javascript
// src/components/ErrorBoundary.tsx
export function ErrorBoundary({ children }) {
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    const handler = (event: ErrorEvent) => {
      console.error('API Error:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handler);
    return () => window.removeEventListener('error', handler);
  }, []);

  if (hasError) {
    return (
      <div className="error-container">
        <h2>Something went wrong</h2>
        <button onClick={() => setHasError(false)}>Try again</button>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## Environment Configuration

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Food Waste Reduction
VITE_APP_DESCRIPTION=Reduce food waste, help the community
```

### Backend (.env in src/db/)

```env
PORT=3000
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
DATABASE_URL=postgresql://postgres:password@localhost:5432/food_waste_db
NODE_ENV=development
```

---

## Common Integration Patterns

### 1. Food Browsing Flow (Public User)

```javascript
// HomePage.tsx
import { useEffect, useState } from 'react';
import apiService from '../services/api';

export function HomePage() {
  const [foodListings, setFoodListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchFoodListings();
  }, [page]);

  const fetchFoodListings = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllFoodListings(page);
      setFoodListings(data.foodListings);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Available Food</h1>
      {foodListings.map(food => (
        <div key={food.id} className="food-card">
          <h3>{food.title}</h3>
          <p>{food.description}</p>
          <p>Quantity: {food.quantity} {food.unit}</p>
          <p>Expires: {new Date(food.expiryDate).toLocaleDateString()}</p>
          <p>Restaurant: {food.restaurant.restaurantName}</p>
          <button onClick={() => requestFood(food.id)}>Request This Food</button>
        </div>
      ))}
      {/* Pagination */}
    </div>
  );
}
```

### 2. Restaurant Registration Flow

```javascript
// RestaurantOnboarding.tsx
export function RestaurantOnboarding() {
  const [step, setStep] = useState(1); // 1: Create user, 2: Create restaurant
  const [userData, setUserData] = useState({});
  const [restaurantData, setRestaurantData] = useState({});

  const handleUserRegistration = async (data) => {
    try {
      const user = await apiService.register({
        ...data,
        role: 'RESTAURANT',
      });
      setUserData(user);
      setStep(2);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleRestaurantCreation = async (data) => {
    try {
      const restaurant = await apiService.createRestaurant(data);
      // Redirect to restaurant dashboard
      window.location.href = '/restaurant-dashboard';
    } catch (error) {
      console.error('Restaurant creation failed:', error);
    }
  };

  return (
    <div>
      {step === 1 && (
        <UserRegistrationForm onSubmit={handleUserRegistration} />
      )}
      {step === 2 && (
        <RestaurantSetupForm onSubmit={handleRestaurantCreation} />
      )}
    </div>
  );
}
```

### 3. Restaurant Food Management

```javascript
// RestaurantDashboard.tsx
export function RestaurantDashboard() {
  const [foodListings, setFoodListings] = useState([]);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    loadRestaurantData();
  }, []);

  const loadRestaurantData = async () => {
    try {
      const [foodData, requestsData] = await Promise.all([
        apiService.getMyFoodListings(),
        apiService.getRestaurantFoodRequests(),
      ]);
      setFoodListings(foodData.foodListings);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const createListing = async (data) => {
    try {
      const newListing = await apiService.createFoodListing(data);
      setFoodListings([newListing, ...foodListings]);
    } catch (error) {
      console.error('Failed to create listing:', error);
    }
  };

  const handleRequest = async (requestId, status) => {
    try {
      const updated = await apiService.updateFoodRequestStatus(requestId, {
        status,
      });
      // Update local state
      setRequests(requests.map(r => r.id === requestId ? updated : r));
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  return (
    <div>
      <section>
        <h2>Your Food Listings</h2>
        {/* List and manage food */}
      </section>
      <section>
        <h2>Food Requests</h2>
        {requests.map(request => (
          <div key={request.id}>
            <p>{request.user.name} requested {request.quantity}</p>
            {request.status === 'PENDING' && (
              <div>
                <button onClick={() => handleRequest(request.id, 'APPROVED')}>
                  Approve
                </button>
                <button onClick={() => handleRequest(request.id, 'REJECTED')}>
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
```

### 4. User Food Requests

```javascript
// FoodRequestFlow.tsx
export function RequestFoodModal({ foodId, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const request = await apiService.createFoodRequest({
        foodListingId: foodId,
        quantity: parseInt(quantity),
        message,
      });
      // Show success notification
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog>
      <h2>Request Food</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Any special requests or context?"
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Requesting...' : 'Request Food'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </dialog>
  );
}
```

### 5. Notifications

```javascript
// NotificationCenter.tsx
export function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiService.markNotificationAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ));
      setUnreadCount(unreadCount - 1);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="notification-center">
      <h2>Notifications ({unreadCount})</h2>
      {notifications.map(notification => (
        <div key={notification.id} className={notification.isRead ? 'read' : 'unread'}>
          <h4>{notification.title}</h4>
          <p>{notification.message}</p>
          <time>{new Date(notification.createdAt).toLocaleDateString()}</time>
          {!notification.isRead && (
            <button onClick={() => markAsRead(notification.id)}>Mark as Read</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## Testing the Integration

### 1. Manual Testing with Postman

1. Import the backend API collection into Postman
2. Set up environment variables:
   - `base_url` = `http://localhost:3000/api/v1`
   - `token` = (will be set after login)
3. Test each endpoint:
   - Register user
   - Login (copy token to Authorization header)
   - Create restaurant
   - Create food listing
   - Create food request

### 2. Frontend Testing

```javascript
// src/__tests__/integration.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import apiService from '../services/api';

describe('Backend Integration', () => {
  let token: string;
  let userId: string;

  it('should register a user', async () => {
    const response = await apiService.register({
      email: `test${Date.now()}@example.com`,
      password: 'TestPass123',
      name: 'Test User',
    });
    expect(response.token).toBeDefined();
    expect(response.user.id).toBeDefined();
    token = response.token;
    userId = response.user.id;
  });

  it('should login user', async () => {
    const response = await apiService.login(
      'test@example.com',
      'TestPass123'
    );
    expect(response.token).toBeDefined();
  });

  it('should get user profile', async () => {
    const profile = await apiService.getProfile();
    expect(profile.id).toBeDefined();
    expect(profile.email).toBeDefined();
  });

  it('should fetch food listings', async () => {
    const response = await apiService.getAllFoodListings();
    expect(Array.isArray(response.foodListings)).toBe(true);
    expect(response.pagination).toBeDefined();
  });
});
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Error
**Problem:** `Access to XMLHttpRequest blocked by CORS policy`
**Solution:** 
- Check backend CORS configuration in `index.ts`
- Ensure `app.use(cors())` is present
- Verify frontend URL matches CORS allowed origins

#### 2. 401 Unauthorized
**Problem:** All protected requests return 401
**Solution:**
- Check if token is being sent in `Authorization` header
- Verify token format: `Bearer <token>`
- Ensure token hasn't expired
- Check `JWT_SECRET` matches between backend and token generation

#### 3. Database Connection Error
**Problem:** `P2002` or `P2025` errors from Prisma
**Solution:**
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Run migrations: `npx prisma migrate dev`
- Check database exists

#### 4. Token Storage Issue
**Problem:** Token lost on page refresh
**Solution:**
- Use `httpOnly` cookies instead of localStorage (more secure)
- Or manually restore token from localStorage on app load
- Check browser's developer tools → Application → Storage

```javascript
// Restore token on app mount
useEffect(() => {
  const token = localStorage.getItem('authToken');
  if (token) {
    // Set token in API service
    apiService.setToken(token);
  }
}, []);
```

---

## Security Considerations

1. **HTTPS in Production:** Always use HTTPS
2. **Token Storage:** Use httpOnly cookies instead of localStorage
3. **Password Validation:** Frontend should validate before sending
4. **Rate Limiting:** Implement on backend to prevent brute force
5. **Input Sanitization:** Never trust user input
6. **CORS:** Restrict to specific domains in production
7. **JWT Secret:** Use strong secret, never commit to repo
8. **Environment Variables:** Never expose API keys

---

## Next Steps

1. ✅ Implement authentication pages (login, register)
2. ✅ Implement food browsing page
3. ✅ Implement user dashboard
4. ✅ Implement restaurant dashboard
5. ✅ Implement admin dashboard
6. ✅ Add real-time notifications (WebSocket)
7. ✅ Add image upload for food listings
8. ✅ Add ratings and reviews
9. ✅ Add location-based filtering
10. ✅ Deploy frontend and backend

