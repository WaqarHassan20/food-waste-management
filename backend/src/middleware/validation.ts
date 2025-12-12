import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/response';
import { validateEmail, validatePassword, validatePhone } from '../utils/validators';

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { email, password, name, role } = req.body;

  if (!email || !password || !name) {
    return errorResponse(res, 'Email, password, and name are required', 400);
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 'Invalid email format', 400);
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return errorResponse(res, passwordValidation.message!, 400);
  }

  if (role && !['USER', 'RESTAURANT', 'ADMIN'].includes(role)) {
    return errorResponse(res, 'Invalid role specified', 400);
  }

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 'Email and password are required', 400);
  }

  if (!validateEmail(email)) {
    return errorResponse(res, 'Invalid email format', 400);
  }

  next();
};

export const validateFoodListing = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { title, description, quantity, unit, expiryDate, pickupTime } = req.body;

  if (!title || !description || !quantity || !unit || !expiryDate || !pickupTime) {
    return errorResponse(
      res,
      'Title, description, quantity, unit, expiry date, and pickup time are required',
      400
    );
  }

  if (quantity <= 0) {
    return errorResponse(res, 'Quantity must be greater than 0', 400);
  }

  const expiry = new Date(expiryDate);
  if (isNaN(expiry.getTime()) || expiry <= new Date()) {
    return errorResponse(res, 'Expiry date must be a valid future date', 400);
  }

  next();
};

export const validateFoodRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { foodListingId, quantity } = req.body;

  if (!foodListingId || !quantity) {
    return errorResponse(res, 'Food listing ID and quantity are required', 400);
  }

  if (quantity <= 0) {
    return errorResponse(res, 'Quantity must be greater than 0', 400);
  }

  next();
};

export const validateRestaurant = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response => {
  const { restaurantName, address, phone } = req.body;

  if (!restaurantName || !address || !phone) {
    return errorResponse(res, 'Restaurant name, address, and phone are required', 400);
  }

  if (!validatePhone(phone)) {
    return errorResponse(res, 'Invalid phone number format', 400);
  }

  next();
};
