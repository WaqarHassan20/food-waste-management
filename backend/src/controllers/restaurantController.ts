import { successResponse, errorResponse } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';
import { prisma } from '../db';

export const createRestaurant = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const {
      restaurantName,
      description,
      address,
      latitude,
      longitude,
      phone,
      businessLicense,
    } = req.body;

    // Check if user already has a restaurant
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (existingRestaurant) {
      return errorResponse(res, 'Restaurant profile already exists for this user', 409);
    }

    // Update user role to RESTAURANT
    await prisma.user.update({
      where: { id: userId },
      data: { role: 'RESTAURANT' },
    });

    // Create restaurant
    const restaurant = await prisma.restaurant.create({
      data: {
        userId,
        restaurantName,
        description,
        address,
        latitude,
        longitude,
        phone,
        businessLicense,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return successResponse(
      res,
      restaurant,
      'Restaurant created successfully',
      201
    );
  } catch (error) {
    console.error('Create restaurant error:', error);
    return errorResponse(res, 'Failed to create restaurant', 500, error);
  }
};

export const getRestaurant = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        foodListings: {
          where: {
            status: 'AVAILABLE',
            expiryDate: {
              gte: new Date(),
            },
          },
        },
      },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    return successResponse(res, restaurant, 'Restaurant fetched successfully');
  } catch (error) {
    console.error('Get restaurant error:', error);
    return errorResponse(res, 'Failed to fetch restaurant', 500, error);
  }
};

export const getAllRestaurants = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      isVerified: true,
    };

    if (search) {
      where.OR = [
        { restaurantName: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          _count: {
            select: {
              foodListings: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.restaurant.count({ where }),
    ]);

    return successResponse(
      res,
      {
        restaurants,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      'Restaurants fetched successfully'
    );
  } catch (error) {
    console.error('Get all restaurants error:', error);
    return errorResponse(res, 'Failed to fetch restaurants', 500, error);
  }
};

export const updateRestaurant = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const {
      restaurantName,
      description,
      address,
      latitude,
      longitude,
      phone,
      businessLicense,
    } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { userId },
      data: {
        ...(restaurantName && { restaurantName }),
        ...(description && { description }),
        ...(address && { address }),
        ...(latitude && { latitude }),
        ...(longitude && { longitude }),
        ...(phone && { phone }),
        ...(businessLicense && { businessLicense }),
      },
    });

    return successResponse(
      res,
      updatedRestaurant,
      'Restaurant updated successfully'
    );
  } catch (error) {
    console.error('Update restaurant error:', error);
    return errorResponse(res, 'Failed to update restaurant', 500, error);
  }
};

export const getMyRestaurant = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
      include: {
        foodListings: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    return successResponse(res, restaurant, 'Restaurant fetched successfully');
  } catch (error) {
    console.error('Get my restaurant error:', error);
    return errorResponse(res, 'Failed to fetch restaurant', 500, error);
  }
};
