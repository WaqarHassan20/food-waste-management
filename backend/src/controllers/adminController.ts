import type { Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import { prisma } from '../db';

export const getAllUsers = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (role) {
      where.role = role as string;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
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
          updatedAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    return successResponse(
      res,
      {
        users,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      'Users fetched successfully'
    );
  } catch (error) {
    console.error('Get all users error:', error);
    return errorResponse(res, 'Failed to fetch users', 500, error);
  }
};

export const getUserById = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
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
        updatedAt: true,
        foodRequests: {
          include: {
            foodListing: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    return successResponse(res, user, 'User fetched successfully');
  } catch (error) {
    console.error('Get user by id error:', error);
    return errorResponse(res, 'Failed to fetch user', 500, error);
  }
};

export const updateUserStatus = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { isActive, isVerified } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(typeof isActive === 'boolean' && { isActive }),
        ...(typeof isVerified === 'boolean' && { isVerified }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
      },
    });

    return successResponse(res, updatedUser, 'User status updated successfully');
  } catch (error) {
    console.error('Update user status error:', error);
    return errorResponse(res, 'Failed to update user status', 500, error);
  }
};

export const deleteUser = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    await prisma.user.delete({
      where: { id },
    });

    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return errorResponse(res, 'Failed to delete user', 500, error);
  }
};

export const verifyRestaurant = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    const updatedRestaurant = await prisma.restaurant.update({
      where: { id },
      data: { isVerified },
    });

    // Note: Restaurants have separate authentication and don't use the user notification system
    // Consider implementing a separate restaurant notification system if needed

    return successResponse(
      res,
      updatedRestaurant,
      'Restaurant verification status updated successfully'
    );
  } catch (error) {
    console.error('Verify restaurant error:', error);
    return errorResponse(res, 'Failed to verify restaurant', 500, error);
  }
};

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalRestaurants,
      totalFoodListings,
      activeFoodListings,
      totalRequests,
      pendingRequests,
      approvedRequests,
      completedRequests,
      usersLastWeek,
      restaurantsLastWeek,
      requestsLastWeek,
      listingsLastWeek,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.restaurant.count(),
      prisma.foodListing.count(),
      prisma.foodListing.count({ where: { status: 'AVAILABLE' } }),
      prisma.foodRequest.count(),
      prisma.foodRequest.count({ where: { status: 'PENDING' } }),
      prisma.foodRequest.count({ where: { status: 'APPROVED' } }),
      prisma.foodRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.user.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.restaurant.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.foodRequest.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.foodListing.count({ where: { createdAt: { gte: lastWeek } } }),
    ]);

    // Calculate growth percentages
    const calculateGrowth = (current: number, recent: number): string => {
      if (current === 0) return '+0%';
      const percentage = ((recent / current) * 100).toFixed(1);
      return `+${percentage}%`;
    };

    const stats = {
      totalUsers,
      usersGrowth: calculateGrowth(totalUsers, usersLastWeek),
      totalRestaurants,
      restaurantsGrowth: calculateGrowth(totalRestaurants, restaurantsLastWeek),
      mealsDonated: completedRequests, // Completed requests = meals donated
      mealsGrowth: calculateGrowth(completedRequests, requestsLastWeek),
      activeListings: activeFoodListings,
      listingsGrowth: calculateGrowth(totalFoodListings, listingsLastWeek),
      totalFoodListings,
      totalRequests,
      pendingRequests,
      approvedRequests,
    };

    return successResponse(res, stats, 'Dashboard stats fetched successfully');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse(res, 'Failed to fetch dashboard stats', 500, error);
  }
};

export const getAllFoodRequests = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (status) {
      where.status = status as string;
    }

    const [foodRequests, total] = await Promise.all([
      prisma.foodRequest.findMany({
        where,
        skip,
        take: Number(limit),
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          foodListing: {
            include: {
              restaurant: {
                select: {
                  id: true,
                  restaurantName: true,
                  address: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.foodRequest.count({ where }),
    ]);

    return successResponse(
      res,
      {
        foodRequests,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
      'Food requests fetched successfully'
    );
  } catch (error) {
    console.error('Get all food requests error:', error);
    return errorResponse(res, 'Failed to fetch food requests', 500, error);
  }
};

export const deleteRestaurant = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    // Check if restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    // Delete all food listings associated with this restaurant
    // This will cascade delete all related food requests
    await prisma.$transaction(async (tx) => {
      // Delete all food listings for this restaurant
      await tx.foodListing.deleteMany({
        where: { restaurantId: id },
      });

      // Delete the restaurant
      await tx.restaurant.delete({
        where: { id },
      });
    });

    return successResponse(
      res,
      null,
      'Restaurant and all its listings deleted successfully'
    );
  } catch (error) {
    console.error('Delete restaurant error:', error);
    return errorResponse(res, 'Failed to delete restaurant', 500, error);
  }
};
