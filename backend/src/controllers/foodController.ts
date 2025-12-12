import { successResponse, errorResponse } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';
import { prisma } from '../db';

export const createFoodListing = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const {
      title,
      description,
      quantity,
      unit,
      expiryDate,
      pickupTime,
      imageUrl,
      category,
    } = req.body;

    // Check if user has a restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return errorResponse(
        res,
        'You need to create a restaurant profile first',
        403
      );
    }

    // Create food listing
    const foodListing = await prisma.foodListing.create({
      data: {
        restaurantId: restaurant.id,
        title,
        description,
        quantity,
        unit,
        expiryDate: new Date(expiryDate),
        pickupTime,
        imageUrl,
        category,
      },
      include: {
        restaurant: {
          select: {
            id: true,
            restaurantName: true,
            address: true,
            phone: true,
          },
        },
      },
    });

    return successResponse(
      res,
      foodListing,
      'Food listing created successfully',
      201
    );
  } catch (error) {
    console.error('Create food listing error:', error);
    return errorResponse(res, 'Failed to create food listing', 500, error);
  }
};

export const getAllFoodListings = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { page = 1, limit = 10, category, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      expiryDate: {
        gte: new Date(),
      },
    };

    if (category) {
      where.category = category as string;
    }

    if (status) {
      where.status = status as string;
    } else {
      where.status = 'AVAILABLE';
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [foodListings, total] = await Promise.all([
      prisma.foodListing.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          restaurant: {
            select: {
              id: true,
              restaurantName: true,
              address: true,
              phone: true,
              rating: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.foodListing.count({ where }),
    ]);

    return successResponse(
      res,
      {
        foodListings,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      'Food listings fetched successfully'
    );
  } catch (error) {
    console.error('Get all food listings error:', error);
    return errorResponse(res, 'Failed to fetch food listings', 500, error);
  }
};

export const getFoodListing = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const foodListing = await prisma.foodListing.findUnique({
      where: { id },
      include: {
        restaurant: {
          select: {
            id: true,
            restaurantName: true,
            address: true,
            phone: true,
            rating: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!foodListing) {
      return errorResponse(res, 'Food listing not found', 404);
    }

    return successResponse(res, foodListing, 'Food listing fetched successfully');
  } catch (error) {
    console.error('Get food listing error:', error);
    return errorResponse(res, 'Failed to fetch food listing', 500, error);
  }
};

export const updateFoodListing = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const {
      title,
      description,
      quantity,
      unit,
      expiryDate,
      pickupTime,
      status,
      imageUrl,
      category,
    } = req.body;

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 403);
    }

    // Check if food listing belongs to this restaurant
    const foodListing = await prisma.foodListing.findUnique({
      where: { id },
    });

    if (!foodListing) {
      return errorResponse(res, 'Food listing not found', 404);
    }

    if (foodListing.restaurantId !== restaurant.id) {
      return errorResponse(
        res,
        'You do not have permission to update this listing',
        403
      );
    }

    // Update food listing
    const updatedFoodListing = await prisma.foodListing.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(quantity && { quantity }),
        ...(unit && { unit }),
        ...(expiryDate && { expiryDate: new Date(expiryDate) }),
        ...(pickupTime && { pickupTime }),
        ...(status && { status }),
        ...(imageUrl && { imageUrl }),
        ...(category && { category }),
      },
      include: {
        restaurant: {
          select: {
            id: true,
            restaurantName: true,
            address: true,
          },
        },
      },
    });

    return successResponse(
      res,
      updatedFoodListing,
      'Food listing updated successfully'
    );
  } catch (error) {
    console.error('Update food listing error:', error);
    return errorResponse(res, 'Failed to update food listing', 500, error);
  }
};

export const deleteFoodListing = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 403);
    }

    // Check if food listing belongs to this restaurant
    const foodListing = await prisma.foodListing.findUnique({
      where: { id },
    });

    if (!foodListing) {
      return errorResponse(res, 'Food listing not found', 404);
    }

    if (foodListing.restaurantId !== restaurant.id) {
      return errorResponse(
        res,
        'You do not have permission to delete this listing',
        403
      );
    }

    // Delete food listing
    await prisma.foodListing.delete({
      where: { id },
    });

    return successResponse(res, null, 'Food listing deleted successfully');
  } catch (error) {
    console.error('Delete food listing error:', error);
    return errorResponse(res, 'Failed to delete food listing', 500, error);
  }
};

export const getMyFoodListings = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;

    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    const foodListings = await prisma.foodListing.findMany({
      where: {
        restaurantId: restaurant.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(res, foodListings, 'Food listings fetched successfully');
  } catch (error) {
    console.error('Get my food listings error:', error);
    return errorResponse(res, 'Failed to fetch food listings', 500, error);
  }
};
