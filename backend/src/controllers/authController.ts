import { hashPassword, comparePassword } from '../utils/password';
import { successResponse, errorResponse } from '../utils/response';
import type { Request, Response } from 'express';
import { generateToken } from '../utils/jwt';
import { prisma } from '../db';


export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password, name, phone, role, address } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return errorResponse(res, 'User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: role || 'USER',
        address,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        address: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'user',
    });

    return successResponse(
      res,
      { user, token },
      'User registered successfully',
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return errorResponse(res, 'Failed to register user', 500, error);
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse(res, 'Your account has been deactivated', 403);
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'user',
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return successResponse(
      res,
      { user: userWithoutPassword, token },
      'Login successful'
    );
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Failed to login', 500, error);
  }
};

export const getProfile = async (req: any, res: Response): Promise<Response> => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        address: true,
        isVerified: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'Profile fetched successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to fetch profile', 500, error);
  }
};

export const updateProfile = async (req: any, res: Response): Promise<Response> => {
  try {
    const userId = req.user.userId;
    const { name, phone, address } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        address: true,
        updatedAt: true,
      },
    });

    return successResponse(res, updatedUser, 'Profile updated successfully');
  } catch (error) {
    console.error('Update profile error:', error);
    return errorResponse(res, 'Failed to update profile', 500, error);
  }
};

// ==================== RESTAURANT AUTH ====================

export const restaurantRegister = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      email,
      password,
      restaurantName,
      description,
      address,
      phone,
      latitude,
      longitude,
      businessLicense,
    } = req.body;

    // Check if restaurant already exists
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { email },
    });

    if (existingRestaurant) {
      return errorResponse(
        res,
        'Restaurant with this email already exists',
        409
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        email,
        password: hashedPassword,
        restaurantName,
        description,
        address,
        phone,
        latitude,
        longitude,
        businessLicense,
      },
      select: {
        id: true,
        email: true,
        restaurantName: true,
        address: true,
        phone: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = generateToken({
      restaurantId: restaurant.id,
      email: restaurant.email,
      role: 'RESTAURANT',
      type: 'restaurant',
    });

    return successResponse(
      res,
      { restaurant, token },
      'Restaurant registered successfully',
      201
    );
  } catch (error) {
    console.error('Restaurant registration error:', error);
    return errorResponse(res, 'Failed to register restaurant', 500, error);
  }
};

export const restaurantLogin = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { email, password } = req.body;

    // Find restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { email },
    });

    if (!restaurant) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await comparePassword(
      password,
      restaurant.password
    );

    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken({
      restaurantId: restaurant.id,
      email: restaurant.email,
      role: 'RESTAURANT',
      type: 'restaurant',
    });

    // Remove password from response
    const { password: _, ...restaurantWithoutPassword } = restaurant;

    return successResponse(
      res,
      { restaurant: restaurantWithoutPassword, token },
      'Login successful'
    );
  } catch (error) {
    console.error('Restaurant login error:', error);
    return errorResponse(res, 'Failed to login', 500, error);
  }
};

export const getRestaurantProfile = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const restaurantId = req.user.restaurantId;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: {
        id: true,
        email: true,
        restaurantName: true,
        description: true,
        address: true,
        phone: true,
        latitude: true,
        longitude: true,
        isVerified: true,
        rating: true,
        totalRatings: true,
        createdAt: true,
      },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    return successResponse(res, restaurant, 'Restaurant profile fetched successfully');
  } catch (error) {
    console.error('Get restaurant profile error:', error);
    return errorResponse(res, 'Failed to fetch restaurant profile', 500, error);
  }
};

export const updateRestaurantProfile = async (
  req: any,
  res: Response
): Promise<Response> => {
  try {
    const restaurantId = req.user.restaurantId;
    const {
      restaurantName,
      description,
      address,
      phone,
      latitude,
      longitude,
    } = req.body;

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
      data: {
        ...(restaurantName && { restaurantName }),
        ...(description && { description }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
      },
      select: {
        id: true,
        email: true,
        restaurantName: true,
        description: true,
        address: true,
        phone: true,
        latitude: true,
        longitude: true,
        updatedAt: true,
      },
    });

    return successResponse(
      res,
      updatedRestaurant,
      'Restaurant profile updated successfully'
    );
  } catch (error) {
    console.error('Update restaurant profile error:', error);
    return errorResponse(res, 'Failed to update restaurant profile', 500, error);
  }
};
