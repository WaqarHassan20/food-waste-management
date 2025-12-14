import { successResponse, errorResponse } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';
import { prisma } from '../db';

// Helper function to convert Buffer to base64
const convertImageDataToBase64 = (listing: any) => {
  if (listing.imageData) {
    // Handle Buffer (Node.js/Bun)
    if (Buffer.isBuffer(listing.imageData)) {
      return {
        ...listing,
        imageData: listing.imageData.toString('base64'),
      };
    }
    // Handle Uint8Array (alternative format)
    if (listing.imageData instanceof Uint8Array) {
      return {
        ...listing,
        imageData: Buffer.from(listing.imageData).toString('base64'),
      };
    }
    // Handle if it's already a base64 string
    if (typeof listing.imageData === 'string') {
      return listing;
    }
  }
  return listing;
};

const convertListingsImageData = (listings: any[]) => {
  return listings.map(convertImageDataToBase64);
};

export const createFoodListing = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const restaurantId = req.user!.restaurantId;

    // Validate that the token is from a restaurant
    if (!restaurantId || req.user!.type !== 'restaurant') {
      return errorResponse(
        res,
        'Only restaurants can create food listings',
        403
      );
    }

    const {
      title,
      description,
      quantity,
      unit,
      expiryDate,
      pickupTime,
      imageData,
      imageMimeType,
      imageUrl,
      category,
    } = req.body;

    // Verify restaurant exists
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant) {
      return errorResponse(res, 'Restaurant not found', 404);
    }

    // Check if restaurant is verified
    if (!restaurant.isVerified) {
      return errorResponse(
        res,
        'Your restaurant needs to be verified by an admin before you can list food. Please wait for admin approval.',
        403
      );
    }

    // Convert base64 image to Buffer if provided
    let imageBuffer: Buffer | undefined;
    if (imageData) {
      try {
        // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } catch (error) {
        return errorResponse(res, 'Invalid image data', 400);
      }
    }

    // Create food listing
    const foodListing = await prisma.foodListing.create({
      data: {
        restaurantId,
        title,
        description,
        quantity,
        unit,
        expiryDate: new Date(expiryDate),
        pickupTime,
        imageData: imageBuffer as any, // Buffer is compatible with Prisma Bytes type
        imageMimeType: imageMimeType || 'image/jpeg',
        imageUrl: imageUrl || undefined, // Use URL if provided instead of binary
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

    // Convert imageData Buffer to base64 for response
    const foodListingWithBase64 = convertImageDataToBase64(foodListing);

    return successResponse(
      res,
      foodListingWithBase64,
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

    // Convert imageData Buffer to base64
    const foodListingsWithBase64 = convertListingsImageData(foodListings);

    return successResponse(
      res,
      {
        foodListings: foodListingsWithBase64,
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

    // Convert imageData Buffer to base64
    const foodListingWithBase64 = convertImageDataToBase64(foodListing);

    return successResponse(res, foodListingWithBase64, 'Food listing fetched successfully');
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
    const restaurantId = req.user!.restaurantId;

    // Validate that the token is from a restaurant
    if (!restaurantId || req.user!.type !== 'restaurant') {
      return errorResponse(
        res,
        'Only restaurants can update food listings',
        403
      );
    }

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

    // Check if food listing belongs to this restaurant
    const foodListing = await prisma.foodListing.findUnique({
      where: { id },
    });

    if (!foodListing) {
      return errorResponse(res, 'Food listing not found', 404);
    }

    if (foodListing.restaurantId !== restaurantId) {
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
    const restaurantId = req.user!.restaurantId;

    // Validate that the token is from a restaurant
    if (!restaurantId || req.user!.type !== 'restaurant') {
      return errorResponse(
        res,
        'Only restaurants can delete food listings',
        403
      );
    }

    const { id } = req.params;

    // Check if food listing belongs to this restaurant
    const foodListing = await prisma.foodListing.findUnique({
      where: { id },
    });

    if (!foodListing) {
      return errorResponse(res, 'Food listing not found', 404);
    }

    if (foodListing.restaurantId !== restaurantId) {
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
    const restaurantId = req.user!.restaurantId;

    // Validate that the token is from a restaurant
    if (!restaurantId || req.user!.type !== 'restaurant') {
      return errorResponse(
        res,
        'Only restaurants can view their food listings',
        403
      );
    }

    const foodListings = await prisma.foodListing.findMany({
      where: {
        restaurantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Convert imageData Buffer to base64
    const foodListingsWithBase64 = convertListingsImageData(foodListings);

    return successResponse(res, foodListingsWithBase64, 'Food listings fetched successfully');
  } catch (error) {
    console.error('Get my food listings error:', error);
    return errorResponse(res, 'Failed to fetch food listings', 500, error);
  }
};

// Get food listing image
export const getFoodImage = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { id } = req.params;

    const foodListing = await prisma.foodListing.findUnique({
      where: { id },
      select: {
        imageData: true,
        imageMimeType: true,
      },
    });

    if (!foodListing || !foodListing.imageData) {
      return errorResponse(res, 'Image not found', 404);
    }

    // Set content type and send image
    res.setHeader('Content-Type', foodListing.imageMimeType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
    return res.send(foodListing.imageData);
  } catch (error) {
    console.error('Get food image error:', error);
    return errorResponse(res, 'Failed to fetch image', 500, error);
  }
};
