import { Router } from 'express';
import {
  createRestaurant,
  getRestaurant,
  getAllRestaurants,
  updateRestaurant,
  getMyRestaurant,
} from '../controllers/restaurantController';
import { authenticate, authorize } from '../middleware/auth';
import { validateRestaurant } from '../middleware/validation';

const restaurantRouter = Router();

// Public routes
restaurantRouter.get('/', getAllRestaurants);

// Protected routes (must be before /:id to avoid route conflicts)
restaurantRouter.get('/my/profile', authenticate, authorize('RESTAURANT'), getMyRestaurant);
restaurantRouter.post('/', authenticate, authorize('USER', 'RESTAURANT'), validateRestaurant, createRestaurant);
restaurantRouter.put('/', authenticate, authorize('RESTAURANT'), updateRestaurant);

// Public route with ID (must come after specific routes)
restaurantRouter.get('/:id', getRestaurant);

export default restaurantRouter;
