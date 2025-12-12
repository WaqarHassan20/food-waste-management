import { successResponse, errorResponse } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';
import { prisma } from '../db';

export const createFoodRequest = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { foodListingId, quantity, message } = req.body;

    // Check if food listing exists and is available
    const foodListing = await prisma.foodListing.findUnique({
      where: { id: foodListingId },
      include: {
        restaurant: true,
      },
    });

    if (!foodListing) {
      return errorResponse(res, 'Food listing not found', 404);
    }

    if (foodListing.status !== 'AVAILABLE') {
      return errorResponse(res, 'Food listing is not available', 400);
    }

    if (foodListing.quantity < quantity) {
      return errorResponse(res, 'Requested quantity is not available', 400);
    }

    // Check if user already has a pending request for this listing
    const existingRequest = await prisma.foodRequest.findFirst({
      where: {
        userId,
        foodListingId,
        status: 'PENDING',
      },
    });

    if (existingRequest) {
      return errorResponse(
        res,
        'You already have a pending request for this food listing',
        409
      );
    }

    // Create food request
    const foodRequest = await prisma.foodRequest.create({
      data: {
        userId,
        foodListingId,
        quantity,
        message,
      },
      include: {
        foodListing: {
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
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Create notification for restaurant owner
    await prisma.notification.create({
      data: {
        userId: foodListing.restaurant.userId,
        title: 'New Food Request',
        message: `${foodRequest.user.name} has requested ${quantity} ${foodListing.unit} of ${foodListing.title}`,
        type: 'new_food_request',
      },
    });

    return successResponse(
      res,
      foodRequest,
      'Food request created successfully',
      201
    );
  } catch (error) {
    console.error('Create food request error:', error);
    return errorResponse(res, 'Failed to create food request', 500, error);
  }
};

export const getMyFoodRequests = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    const where: any = { userId };

    if (status) {
      where.status = status as string;
    }

    const foodRequests = await prisma.foodRequest.findMany({
      where,
      include: {
        foodListing: {
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
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(
      res,
      foodRequests,
      'Food requests fetched successfully'
    );
  } catch (error) {
    console.error('Get my food requests error:', error);
    return errorResponse(res, 'Failed to fetch food requests', 500, error);
  }
};

export const getRestaurantFoodRequests = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { status } = req.query;

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    const where: any = {
      foodListing: {
        restaurantId: restaurant.id,
      },
    };

    if (status) {
      where.status = status as string;
    }

    const foodRequests = await prisma.foodRequest.findMany({
      where,
      include: {
        foodListing: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(
      res,
      foodRequests,
      'Food requests fetched successfully'
    );
  } catch (error) {
    console.error('Get restaurant food requests error:', error);
    return errorResponse(res, 'Failed to fetch food requests', 500, error);
  }
};

export const updateFoodRequestStatus = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { status, pickupDate } = req.body;

    // Get restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 403);
    }

    // Get food request with food listing
    const foodRequest = await prisma.foodRequest.findUnique({
      where: { id },
      include: {
        foodListing: true,
        user: true,
      },
    });

    if (!foodRequest) {
      return errorResponse(res, 'Food request not found', 404);
    }

    // Check if food listing belongs to this restaurant
    if (foodRequest.foodListing.restaurantId !== restaurant.id) {
      return errorResponse(
        res,
        'You do not have permission to update this request',
        403
      );
    }

    // Update food request
    const updatedFoodRequest = await prisma.foodRequest.update({
      where: { id },
      data: {
        status,
        ...(pickupDate && { pickupDate: new Date(pickupDate) }),
      },
      include: {
        foodListing: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // If approved, update food listing quantity
    if (status === 'APPROVED') {
      const newQuantity = foodRequest.foodListing.quantity - foodRequest.quantity;

      await prisma.foodListing.update({
        where: { id: foodRequest.foodListingId },
        data: {
          quantity: newQuantity,
          status: newQuantity <= 0 ? 'RESERVED' : 'AVAILABLE',
        },
      });
    }

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: foodRequest.userId,
        title: `Food Request ${status}`,
        message: `Your request for ${foodRequest.foodListing.title} has been ${status.toLowerCase()}`,
        type: `request_${status.toLowerCase()}`,
      },
    });

    return successResponse(
      res,
      updatedFoodRequest,
      'Food request updated successfully'
    );
  } catch (error) {
    console.error('Update food request status error:', error);
    return errorResponse(res, 'Failed to update food request', 500, error);
  }
};

export const cancelFoodRequest = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    // Get food request
    const foodRequest = await prisma.foodRequest.findUnique({
      where: { id },
      include: {
        foodListing: true,
      },
    });

    if (!foodRequest) {
      return errorResponse(res, 'Food request not found', 404);
    }

    // Check if request belongs to user
    if (foodRequest.userId !== userId) {
      return errorResponse(
        res,
        'You do not have permission to cancel this request',
        403
      );
    }

    // Can only cancel pending requests
    if (foodRequest.status !== 'PENDING') {
      return errorResponse(
        res,
        'Only pending requests can be cancelled',
        400
      );
    }

    // Update request status
    const updatedRequest = await prisma.foodRequest.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    return successResponse(
      res,
      updatedRequest,
      'Food request cancelled successfully'
    );
  } catch (error) {
    console.error('Cancel food request error:', error);
    return errorResponse(res, 'Failed to cancel food request', 500, error);
  }
};
