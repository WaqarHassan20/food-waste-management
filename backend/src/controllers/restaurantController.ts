import { successResponse, errorResponse } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';
import { prisma } from '../db';

// Note: Restaurant creation happens through restaurantRegister in authController
// This controller handles restaurant profile management and retrieval

export const getRestaurant = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        restaurantName: true,
        description: true,
        address: true,
        phone: true,
        latitude: true,
        longitude: true,
        businessLicense: true,
        rating: true,
        totalRatings: true,
        isVerified: true,
        createdAt: true,
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
    const restaurantId = req.user!.restaurantId;

    // Validate that the token is from a restaurant
    if (!restaurantId || req.user!.type !== 'restaurant') {
      return errorResponse(
        res,
        'Only restaurants can update their profile',
        403
      );
    }

    const {
      restaurantName,
      description,
      address,
      latitude,
      longitude,
      phone,
      businessLicense,
    } = req.body;

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id: restaurantId },
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
    const restaurantId = req.user!.restaurantId;

    // Validate that the token is from a restaurant
    if (!restaurantId || req.user!.type !== 'restaurant') {
      return errorResponse(
        res,
        'Only restaurants can view their profile',
        403
      );
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
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
