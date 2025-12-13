import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  verifyRestaurant,
  deleteRestaurant,
  getDashboardStats,
  getAllFoodRequests,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const adminRouter = Router();

// All routes are protected - Admin only
adminRouter.use(authenticate, authorize('ADMIN'));

// Dashboard
adminRouter.get('/dashboard/stats', getDashboardStats);

// User management
adminRouter.get('/users', getAllUsers);
adminRouter.get('/users/:id', getUserById);
adminRouter.put('/users/:id/status', updateUserStatus);
adminRouter.delete('/users/:id', deleteUser);

// Restaurant verification
adminRouter.put('/restaurants/:id/verify', verifyRestaurant);
adminRouter.delete('/restaurants/:id', deleteRestaurant);

// Food requests
adminRouter.get('/requests', getAllFoodRequests);

export default adminRouter;
