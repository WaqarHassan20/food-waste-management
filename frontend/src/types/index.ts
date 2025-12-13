export type UserRole = 'USER' | 'RESTAURANT' | 'ADMIN';
export type FoodStatus = 'AVAILABLE' | 'RESERVED' | 'CLAIMED' | 'EXPIRED';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
export type FoodCategory =
  | 'PREPARED_FOOD'
  | 'RAW_INGREDIENTS'
  | 'BAKERY'
  | 'DAIRY'
  | 'FRUITS_VEGETABLES'
  | 'BEVERAGES'
  | 'PACKAGED_FOOD'
  | 'FROZEN_FOOD'
  | 'OTHER';

// Helper function to get human-readable category names
export const getCategoryLabel = (category: FoodCategory): string => {
  const labels: Record<FoodCategory, string> = {
    PREPARED_FOOD: 'Prepared Food',
    RAW_INGREDIENTS: 'Raw Ingredients',
    BAKERY: 'Bakery Items',
    DAIRY: 'Dairy Products',
    FRUITS_VEGETABLES: 'Fruits & Vegetables',
    BEVERAGES: 'Beverages',
    PACKAGED_FOOD: 'Packaged Food',
    FROZEN_FOOD: 'Frozen Food',
    OTHER: 'Other',
  };
  return labels[category] || category;
};

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
  imageData?: any; // Binary data indicating image exists
  imageMimeType?: string;
  imageUrl?: string; // URL to external image
  category: FoodCategory;
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

export type NotificationType =
  | 'REQUEST_CREATED'
  | 'REQUEST_APPROVED'
  | 'REQUEST_REJECTED'
  | 'REQUEST_CANCELLED'
  | 'REQUEST_COMPLETED'
  | 'NEW_FOOD_AVAILABLE'
  | 'LISTING_EXPIRING_SOON'
  | 'RESTAURANT_VERIFIED'
  | 'RESTAURANT_UNVERIFIED'
  | 'USER_VERIFIED'
  | 'SYSTEM_ANNOUNCEMENT';

export interface Notification {
  id: string;
  userId?: string;
  restaurantId?: string;
  title: string;
  message: string;
  isRead: boolean;
  type: NotificationType;
  metadata?: any;
  actionUrl?: string;
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
  read: boolean;
  createdAt: string;
}
