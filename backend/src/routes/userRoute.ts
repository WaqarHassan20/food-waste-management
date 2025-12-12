import { Router } from 'express';

const userRouter = Router();

// This route is kept for backward compatibility
// User-related functionality is now handled by authRoute.ts
userRouter.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'User routes have been moved to /api/v1/auth',
    endpoints: {
      register: 'POST /api/v1/auth/register',
      login: 'POST /api/v1/auth/login',
      profile: 'GET /api/v1/auth/profile',
      updateProfile: 'PUT /api/v1/auth/profile',
    },
  });
});

export default userRouter;