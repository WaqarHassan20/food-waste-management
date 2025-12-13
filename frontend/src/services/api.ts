import axios, { type AxiosInstance, type AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<any>) => {
    // Only redirect to auth page if token is expired/invalid (401)
    // Don't redirect for wrong credentials or other errors
    if (error.response?.status === 401) {
      // Check if user is already on auth page or it's a login/register attempt
      const isAuthPage = window.location.pathname.includes('/auth');
      const isLoginAttempt = error.config?.url?.includes('/login') || error.config?.url?.includes('/register');

      // Only clear storage and redirect if it's not a login attempt and not already on auth page
      if (!isAuthPage && !isLoginAttempt) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/signin';
      }
    }

    // Return error with proper message structure
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string, adminPasscode?: string) =>
    axiosInstance.post('/auth/login', { email, password, adminPasscode }),

  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
    address?: string;
    adminPasscode?: string;
  }) =>
    axiosInstance.post('/auth/register', userData),

  restaurantRegister: (restaurantData: {
    email: string;
    password: string;
    restaurantName: string;
    description?: string;
    address: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    businessLicense?: string;
  }) =>
    axiosInstance.post('/auth/restaurant/register', restaurantData),

  restaurantLogin: (email: string, password: string) =>
    axiosInstance.post('/auth/restaurant/login', { email, password }),

  getRestaurantProfile: () =>
    axiosInstance.get('/auth/restaurant/profile'),

  updateRestaurantProfile: (data: {
    restaurantName?: string;
    description?: string;
    address?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
  }) =>
    axiosInstance.put('/auth/restaurant/profile', data),

  getProfile: () => axiosInstance.get('/auth/profile'),

  updateProfile: (data: { name?: string; phone?: string; address?: string }) =>
    axiosInstance.put('/auth/profile', data),
};

// Food API
export const foodAPI = {
  getAllFood: (params?: { page?: number; limit?: number; category?: string; search?: string }) =>
    axiosInstance.get('/food', { params }),

  getFoodById: (id: string) =>
    axiosInstance.get(`/food/${id}`),

  getMyListings: () =>
    axiosInstance.get('/food/my/listings'),

  createListing: (data: {
    title: string;
    description: string;
    quantity: number;
    unit: string;
    expiryDate: string;
    pickupTime: string;
    category?: string;
    imageData?: string;
    imageMimeType?: string;
    imageUrl?: string;
  }) =>
    axiosInstance.post('/food', data),

  updateListing: (id: string, data: any) =>
    axiosInstance.put(`/food/${id}`, data),

  deleteListing: (id: string) =>
    axiosInstance.delete(`/food/${id}`),
};

// Request API
export const requestAPI = {
  createRequest: (data: {
    foodListingId: string;
    quantity: number;
    message?: string;
  }) =>
    axiosInstance.post('/requests', data),

  getMyRequests: (status?: string) =>
    axiosInstance.get('/requests/my', { params: { status } }),

  getRestaurantRequests: (status?: string) =>
    axiosInstance.get('/requests/restaurant', { params: { status } }),

  updateRequestStatus: (id: string, status: string, pickupDate?: string) =>
    axiosInstance.put(`/requests/${id}/status`, { status, pickupDate }),

  cancelRequest: (id: string) =>
    axiosInstance.put(`/requests/${id}/cancel`),
};

// Restaurant API
export const restaurantAPI = {
  getAllRestaurants: (params?: { page?: number; limit?: number; search?: string }) =>
    axiosInstance.get('/restaurants', { params }),

  getRestaurantById: (id: string) =>
    axiosInstance.get(`/restaurants/${id}`),

  getMyRestaurant: () =>
    axiosInstance.get('/restaurants/my/profile'),

  createRestaurant: (data: {
    restaurantName: string;
    description?: string;
    address: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    businessLicense?: string;
  }) =>
    axiosInstance.post('/restaurants', data),

  updateRestaurant: (data: any) =>
    axiosInstance.put('/restaurants', data),
};

// Notification API
export const notificationAPI = {
  getNotifications: (unreadOnly?: boolean) =>
    axiosInstance.get('/notifications', { params: { unreadOnly } }),

  getUnreadCount: () =>
    axiosInstance.get('/notifications/unread-count'),

  markAsRead: (id: string) =>
    axiosInstance.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    axiosInstance.put('/notifications/read-all'),

  deleteNotification: (id: string) =>
    axiosInstance.delete(`/notifications/${id}`),

  clearAll: () =>
    axiosInstance.delete('/notifications/clear-all'),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () =>
    axiosInstance.get('/admin/dashboard/stats'),

  getAllUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) =>
    axiosInstance.get('/admin/users', { params }),

  getUserById: (id: string) =>
    axiosInstance.get(`/admin/users/${id}`),

  updateUserStatus: (id: string, data: { isActive?: boolean; isVerified?: boolean }) =>
    axiosInstance.put(`/admin/users/${id}/status`, data),

  deleteUser: (id: string) =>
    axiosInstance.delete(`/admin/users/${id}`),

  getAllRestaurants: (params?: { page?: number; limit?: number; search?: string }) =>
    axiosInstance.get('/admin/restaurants', { params }),

  verifyRestaurant: (id: string, isVerified: boolean) =>
    axiosInstance.put(`/admin/restaurants/${id}/verify`, { isVerified }),

  deleteRestaurant: (id: string) =>
    axiosInstance.delete(`/admin/restaurants/${id}`),

  getAllRequests: (params?: { page?: number; limit?: number; status?: string }) =>
    axiosInstance.get('/admin/requests', { params }),
};

export default {
  auth: authAPI,
  food: foodAPI,
  request: requestAPI,
  restaurant: restaurantAPI,
  notification: notificationAPI,
  admin: adminAPI,
  axiosInstance,
};
