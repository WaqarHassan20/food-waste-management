// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data.data;
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
    address?: string;
  }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getProfile: () => apiRequest('/auth/profile'),

  updateProfile: (data: { name?: string; phone?: string; address?: string }) =>
    apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Food API
export const foodAPI = {
  getAllFood: (params?: { page?: number; limit?: number; category?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    
    return apiRequest(`/food?${queryParams.toString()}`);
  },

  getFoodById: (id: string) => apiRequest(`/food/${id}`),

  getMyListings: () => apiRequest('/food/my/listings'),

  createListing: (data: {
    title: string;
    description: string;
    quantity: number;
    unit: string;
    expiryDate: string;
    pickupTime: string;
    category?: string;
    imageUrl?: string;
  }) =>
    apiRequest('/food', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateListing: (id: string, data: any) =>
    apiRequest(`/food/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteListing: (id: string) =>
    apiRequest(`/food/${id}`, {
      method: 'DELETE',
    }),
};

// Request API
export const requestAPI = {
  createRequest: (data: {
    foodListingId: string;
    quantity: number;
    message?: string;
  }) =>
    apiRequest('/requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMyRequests: (status?: string) => {
    const queryParams = status ? `?status=${status}` : '';
    return apiRequest(`/requests/my${queryParams}`);
  },

  getRestaurantRequests: (status?: string) => {
    const queryParams = status ? `?status=${status}` : '';
    return apiRequest(`/requests/restaurant${queryParams}`);
  },

  updateRequestStatus: (id: string, status: string, pickupDate?: string) =>
    apiRequest(`/requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, pickupDate }),
    }),

  cancelRequest: (id: string) =>
    apiRequest(`/requests/${id}/cancel`, {
      method: 'PUT',
    }),
};

// Restaurant API
export const restaurantAPI = {
  getAllRestaurants: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    return apiRequest(`/restaurants?${queryParams.toString()}`);
  },

  getRestaurantById: (id: string) => apiRequest(`/restaurants/${id}`),

  getMyRestaurant: () => apiRequest('/restaurants/my/profile'),

  createRestaurant: (data: {
    restaurantName: string;
    description?: string;
    address: string;
    phone: string;
    latitude?: number;
    longitude?: number;
    businessLicense?: string;
  }) =>
    apiRequest('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRestaurant: (data: any) =>
    apiRequest('/restaurants', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Notification API
export const notificationAPI = {
  getNotifications: (unreadOnly?: boolean) => {
    const queryParams = unreadOnly ? '?unreadOnly=true' : '';
    return apiRequest(`/notifications${queryParams}`);
  },

  markAsRead: (id: string) =>
    apiRequest(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllAsRead: () =>
    apiRequest('/notifications/read-all', {
      method: 'PUT',
    }),

  deleteNotification: (id: string) =>
    apiRequest(`/notifications/${id}`, {
      method: 'DELETE',
    }),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => apiRequest('/admin/dashboard/stats'),

  getAllUsers: (params?: { page?: number; limit?: number; role?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.role) queryParams.append('role', params.role);
    if (params?.search) queryParams.append('search', params.search);
    
    return apiRequest(`/admin/users?${queryParams.toString()}`);
  },

  getUserById: (id: string) => apiRequest(`/admin/users/${id}`),

  updateUserStatus: (id: string, data: { isActive?: boolean; isVerified?: boolean }) =>
    apiRequest(`/admin/users/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteUser: (id: string) =>
    apiRequest(`/admin/users/${id}`, {
      method: 'DELETE',
    }),

  verifyRestaurant: (id: string, isVerified: boolean) =>
    apiRequest(`/admin/restaurants/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ isVerified }),
    }),

  getAllRequests: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    
    return apiRequest(`/admin/requests?${queryParams.toString()}`);
  },
};

export default {
  auth: authAPI,
  food: foodAPI,
  request: requestAPI,
  restaurant: restaurantAPI,
  notification: notificationAPI,
  admin: adminAPI,
};
