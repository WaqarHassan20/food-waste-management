import { successResponse, errorResponse } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';
import { prisma } from '../db';
import { NotificationService } from '../services/notificationService';

export const createFoodRequest = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;

    // Only users can create food requests
    if (req.user!.type !== 'user') {
      return errorResponse(
        res,
        'Only users can request food',
        403
      );
    }

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

    // Create food request and update food listing in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Calculate new quantity
      const newQuantity = foodListing.quantity - quantity;
      const newStatus = newQuantity <= 0 ? 'RESERVED' : 'AVAILABLE';

      // Update food listing quantity and status
      await tx.foodListing.update({
        where: { id: foodListingId },
        data: {
          quantity: newQuantity,
          status: newStatus,
        },
      });

      // Create food request
      const foodRequest = await tx.foodRequest.create({
        data: {
          userId: userId!,
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
                  email: true,
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

      return foodRequest;
    });

    // Create notification for restaurant
    await NotificationService.notifyRestaurantNewRequest(
      foodListing.restaurant.id,
      result.user.name,
      foodListing.title,
      quantity,
      foodListing.unit,
      result.id
    );

    return successResponse(
      res,
      result,
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
    const restaurantId = req.user!.restaurantId;

    // Validate that the token is from a restaurant
    if (!restaurantId || req.user!.type !== 'restaurant') {
      return errorResponse(
        res,
        'Only restaurants can view food requests',
        403
      );
    }

    const { status } = req.query;

    const where: any = {
      foodListing: {
        restaurantId,
      },
    };

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
                isVerified: true,
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
    const restaurantId = req.user!.restaurantId;

    // Validate that the token is from a restaurant
    if (!restaurantId || req.user!.type !== 'restaurant') {
      return errorResponse(
        res,
        'Only restaurants can update food requests',
        403
      );
    }

    const { id } = req.params;
    const { status, pickupDate } = req.body;

    // Get food request with food listing
    const foodRequest = await prisma.foodRequest.findUnique({
      where: { id },
      include: {
        foodListing: {
          include: {
            restaurant: true,
          },
        },
        user: true,
      },
    });

    if (!foodRequest) {
      return errorResponse(res, 'Food request not found', 404);
    }

    // Check if food listing belongs to this restaurant
    if (foodRequest.foodListing.restaurantId !== restaurantId) {
      return errorResponse(
        res,
        'You do not have permission to update this request',
        403
      );
    }

    // Update food request and handle quantity restoration if rejected
    const updatedFoodRequest = await prisma.$transaction(async (tx) => {
      // If rejecting, restore the quantity back to food listing
      if (status === 'REJECTED' && foodRequest.status === 'PENDING') {
        const newQuantity = foodRequest.foodListing.quantity + foodRequest.quantity;

        await tx.foodListing.update({
          where: { id: foodRequest.foodListingId },
          data: {
            quantity: newQuantity,
            status: 'AVAILABLE', // Make it available again
          },
        });
      }

      // If approving, mark the food listing as RESERVED/CLAIMED
      if (status === 'APPROVED' && foodRequest.status === 'PENDING') {
        await tx.foodListing.update({
          where: { id: foodRequest.foodListingId },
          data: {
            status: 'RESERVED', // Reserve the food for this user
          },
        });
      }

      // If completing (picked up), mark the food listing as CLAIMED
      if (status === 'COMPLETED' && foodRequest.status === 'APPROVED') {
        await tx.foodListing.update({
          where: { id: foodRequest.foodListingId },
          data: {
            status: 'CLAIMED', // Food has been picked up
          },
        });
      }

      // Update food request
      const updated = await tx.foodRequest.update({
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

      return updated;
    });

    // Create appropriate notification for user based on status
    if (status === 'APPROVED') {
      await NotificationService.notifyUserRequestApproved(
        foodRequest.userId,
        foodRequest.foodListing.restaurant.restaurantName,
        foodRequest.foodListing.title,
        pickupDate,
        foodRequest.id
      );
    } else if (status === 'REJECTED') {
      await NotificationService.notifyUserRequestRejected(
        foodRequest.userId,
        foodRequest.foodListing.restaurant.restaurantName,
        foodRequest.foodListing.title,
        foodRequest.id
      );
    } else if (status === 'COMPLETED') {
      await NotificationService.notifyUserRequestCompleted(
        foodRequest.userId,
        foodRequest.foodListing.restaurant.restaurantName,
        foodRequest.foodListing.title,
        foodRequest.id
      );
    }

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
        foodListing: {
          include: {
            restaurant: true,
          },
        },
        user: true,
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

    // Update request status and restore food listing quantity in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Restore the quantity back to food listing
      const newQuantity = foodRequest.foodListing.quantity + foodRequest.quantity;

      await tx.foodListing.update({
        where: { id: foodRequest.foodListingId },
        data: {
          quantity: newQuantity,
          status: 'AVAILABLE', // Make it available again
        },
      });

      // Update request status
      const updatedRequest = await tx.foodRequest.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      return updatedRequest;
    });

    // Notify restaurant about the cancellation
    await NotificationService.notifyRestaurantRequestCancelled(
      foodRequest.foodListing.restaurant.id,
      foodRequest.user.name,
      foodRequest.foodListing.title,
      foodRequest.id
    );

    return successResponse(
      res,
      result,
      'Food request cancelled successfully'
    );
  } catch (error) {
    console.error('Cancel food request error:', error);
    return errorResponse(res, 'Failed to cancel food request', 500, error);
  }
};
