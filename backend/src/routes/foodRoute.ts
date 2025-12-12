import { Router } from 'express';
import {
  createFoodListing,
  getAllFoodListings,
  getFoodListing,
  updateFoodListing,
  deleteFoodListing,
  getMyFoodListings,
  getFoodImage,
} from '../controllers/foodController';
import { authenticate, authorize } from '../middleware/auth';
import { validateFoodListing, validateFoodListingUpdate } from '../middleware/zodValidation';

const foodRouter = Router();

// Public routes
foodRouter.get('/', getAllFoodListings);

// Protected routes - Restaurant only (must be before /:id to avoid route conflicts)
foodRouter.get('/my/listings', authenticate, authorize('RESTAURANT'), getMyFoodListings);
foodRouter.post('/', authenticate, authorize('RESTAURANT'), validateFoodListing, createFoodListing);

// Public route for image (must come before /:id)
foodRouter.get('/:id/image', getFoodImage);

// Public route with ID (must come after specific routes)
foodRouter.get('/:id', getFoodListing);

// Protected routes - Restaurant only
foodRouter.put('/:id', authenticate, authorize('RESTAURANT'), validateFoodListingUpdate, updateFoodListing);
foodRouter.delete('/:id', authenticate, authorize('RESTAURANT'), deleteFoodListing);

export default foodRouter;
