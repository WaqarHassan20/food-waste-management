import { Router } from "express"
import {
  register,
  login,
  getProfile,
  updateProfile,
  restaurantRegister,
  restaurantLogin,
  getRestaurantProfile,
  updateRestaurantProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import {
  validateUserRegistration,
  validateRestaurantRegistration,
  validateLogin,
  validateUserProfileUpdate,
  validateRestaurantProfileUpdate,
} from '../middleware/zodValidation';

const authRouter = Router();

// ==================== USER AUTH ====================

// Public routes
authRouter.post('/register', validateUserRegistration, register);
authRouter.post('/login', validateLogin, login);

// Protected routes
authRouter.get('/profile', authenticate, getProfile);
authRouter.put('/profile', authenticate, validateUserProfileUpdate, updateProfile);

// ==================== RESTAURANT AUTH ====================

// Public routes
authRouter.post('/restaurant/register', validateRestaurantRegistration, restaurantRegister);
authRouter.post('/restaurant/login', validateLogin, restaurantLogin);

// Protected routes
authRouter.get('/restaurant/profile', authenticate, getRestaurantProfile);
authRouter.put('/restaurant/profile', authenticate, validateRestaurantProfileUpdate, updateRestaurantProfile);

export default authRouter;
