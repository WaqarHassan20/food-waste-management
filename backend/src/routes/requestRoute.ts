import { Router } from 'express';
import {
  createFoodRequest,
  getMyFoodRequests,
  getRestaurantFoodRequests,
  updateFoodRequestStatus,
  cancelFoodRequest,
} from '../controllers/requestController';
import { authenticate, authorize } from '../middleware/auth';
import { validateFoodRequest } from '../middleware/validation';

const requestRouter = Router();

// Protected routes - User
requestRouter.post(
  '/',
  authenticate,
  authorize('USER'),
  validateFoodRequest,
  createFoodRequest
);
requestRouter.get('/my', authenticate, authorize('USER'), getMyFoodRequests);
requestRouter.put('/:id/cancel', authenticate, authorize('USER'), cancelFoodRequest);

// Protected routes - Restaurant
requestRouter.get(
  '/restaurant',
  authenticate,
  authorize('RESTAURANT'),
  getRestaurantFoodRequests
);
requestRouter.put(
  '/:id/status',
  authenticate,
  authorize('RESTAURANT'),
  updateFoodRequestStatus
);

export default requestRouter;
