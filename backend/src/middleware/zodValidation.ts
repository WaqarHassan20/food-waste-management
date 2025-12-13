import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { errorResponse } from '../utils/response';

// ==================== SCHEMAS ====================

// User Registration Schema
export const userRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  phone: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  address: z.string().optional(),
});

// Restaurant Registration Schema
export const restaurantRegistrationSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  restaurantName: z.string().min(2, 'Restaurant name must be at least 2 characters long'),
  description: z.string().optional(),
  // address: z.string().min(5, 'Address must be at least 5 characters long'),
  address: z.string().optional(),
  // phone: z.string().min(10, 'Phone number must be at least 10 characters long'),
  phone: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  businessLicense: z.string().optional(),
});

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Food Listing Schema
export const foodListingSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  description: z.string().min(10, 'Description must be at least 10 characters long'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  expiryDate: z.string().datetime('Invalid expiry date format'),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  category: z.string().optional(),
  imageData: z.string().optional(), // Base64 encoded image
  imageMimeType: z.string().optional(),
  imageUrl: z.string().url().optional(), // Image URL as alternative to binary storage
});

// Food Listing Update Schema (all fields optional)
export const foodListingUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  quantity: z.number().positive().optional(),
  unit: z.string().min(1).optional(),
  expiryDate: z.string().datetime().optional(),
  pickupTime: z.string().min(1).optional(),
  category: z.string().optional(),
  imageData: z.string().optional(), // Base64 encoded image
  imageMimeType: z.string().optional(),
  imageUrl: z.string().url().optional(), // Image URL as alternative to binary storage
  status: z.enum(['AVAILABLE', 'RESERVED', 'CLAIMED', 'EXPIRED']).optional(),
});

// Food Request Schema
export const foodRequestSchema = z.object({
  foodListingId: z.string().uuid('Invalid food listing ID'),
  quantity: z.number().positive('Quantity must be greater than 0'),
  message: z.string().optional(),
});

// Request Status Update Schema
export const requestStatusUpdateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED']),
  pickupDate: z.string().datetime().optional(),
});

// User Profile Update Schema
export const userProfileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

// Restaurant Profile Update Schema
export const restaurantProfileUpdateSchema = z.object({
  restaurantName: z.string().min(2).optional(),
  description: z.string().optional(),
  address: z.string().min(5).optional(),
  phone: z.string().min(10).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

// ==================== MIDDLEWARE ====================

export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return errorResponse(
          res,
          errors[0]?.message || 'Validation failed',
          400
        );
      }
      return errorResponse(res, 'Validation failed', 400);
    }
  };
};

// Export validation middlewares
export const validateUserRegistration = validate(userRegistrationSchema);
export const validateRestaurantRegistration = validate(restaurantRegistrationSchema);
export const validateLogin = validate(loginSchema);
export const validateFoodListing = validate(foodListingSchema);
export const validateFoodListingUpdate = validate(foodListingUpdateSchema);
export const validateFoodRequest = validate(foodRequestSchema);
export const validateRequestStatusUpdate = validate(requestStatusUpdateSchema);
export const validateUserProfileUpdate = validate(userProfileUpdateSchema);
export const validateRestaurantProfileUpdate = validate(restaurantProfileUpdateSchema);
