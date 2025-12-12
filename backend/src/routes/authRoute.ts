import { Router } from "express"
import {
  register,
  login,
  getProfile,
  updateProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRegistration, validateLogin } from '../middleware/validation';

const authRouter = Router();

// Public routes
authRouter.post('/register', validateRegistration, register);
authRouter.post('/login', validateLogin, login);

// Protected routes
authRouter.get('/profile', authenticate, getProfile);
authRouter.put('/profile', authenticate, updateProfile);

export default authRouter;
