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
      include: {
        restaurant: true,
      },
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
        restaurant: true,
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
