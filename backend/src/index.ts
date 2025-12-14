import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRouter from './routes/authRoute';
import restaurantRouter from './routes/restaurantRoute';
import foodRouter from './routes/foodRoute';
import requestRouter from './routes/requestRoute';
import adminRouter from './routes/adminRoute';
import notificationRouter from './routes/notificationRoute';

import { errorHandler, notFound } from './middleware/errorHandler';
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5173',
  ],
  credentials: true,
}));
// Increase payload limit to 10MB for image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Food Waste Reduction API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/restaurants', restaurantRouter);
app.use('/api/v1/food', foodRouter);
app.use('/api/v1/requests', requestRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/notifications', notificationRouter);

// Debug: List all registered routes
console.log('\n=== Registered Auth Routes ===');
authRouter.stack.forEach((r: any) => {
  if (r.route) {
    console.log(`${Object.keys(r.route.methods).join(', ').toUpperCase()} /api/v1/auth${r.route.path}`);
  }
});
console.log('===========================\n');

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Base URL: http://localhost:${PORT}/api/v1`);
});