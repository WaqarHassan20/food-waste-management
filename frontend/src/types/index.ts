export type UserRole = 'USER' | 'RESTAURANT' | 'ADMIN';
export type FoodStatus = 'AVAILABLE' | 'RESERVED' | 'CLAIMED' | 'EXPIRED';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  restaurant?: Restaurant;
}

export interface Restaurant {
  id: string;
  userId: string;
  restaurantName: string;
  description?: string;
  address: string;
  phone: string;
  latitude?: number;
  longitude?: number;
  businessLicense?: string;
  rating: number;
  totalRatings: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  foodListings?: FoodListing[];
}

export interface FoodListing {
  id: string;
  restaurantId: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  pickupTime: string;
  status: FoodStatus;
  imageUrl?: string;
  category?: string;
  createdAt: string;
  updatedAt: string;
  restaurant?: {
    id: string;
    restaurantName: string;
    address: string;
    phone: string;
    rating?: number;
    latitude?: number;
    longitude?: number;
  };
  foodRequests?: FoodRequest[];
}

export interface FoodRequest {
  id: string;
  userId: string;
  foodListingId: string;
  quantity: number;
  message?: string;
  status: RequestStatus;
  pickupDate?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
  foodListing?: FoodListing & {
    restaurant?: {
      id: string;
      restaurantName: string;
      address: string;
      phone: string;
    };
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalRestaurants: number;
  totalFoodListings: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
}
  read: boolean;
  createdAt: string;
}
