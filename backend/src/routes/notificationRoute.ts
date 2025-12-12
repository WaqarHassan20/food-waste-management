import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const notificationRouter = Router();

// All routes are protected
notificationRouter.use(authenticate);

// Specific routes must come before parameterized routes
notificationRouter.put('/read-all', markAllNotificationsAsRead);
notificationRouter.get('/', getMyNotifications);
notificationRouter.put('/:id/read', markNotificationAsRead);
notificationRouter.delete('/:id', deleteNotification);

export default notificationRouter;
