import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  console.error('Error:', err);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 400);
  }

  if (err.name === 'UnauthorizedError') {
    return errorResponse(res, 'Unauthorized access', 401);
  }

  if (err.code === 'P2002') {
    // Prisma unique constraint violation
    return errorResponse(res, 'A record with this value already exists', 409);
  }

  if (err.code === 'P2025') {
    // Prisma record not found
    return errorResponse(res, 'Record not found', 404);
  }

  // Default error response
  return errorResponse(
    res,
    err.message || 'Internal server error',
    err.statusCode || 500
  );
};

export const notFound = (req: Request, res: Response): Response => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
