import { Router } from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const notificationRouter = Router();

// All routes are protected
notificationRouter.use(authenticate);

// Specific routes must come before parameterized routes
notificationRouter.get('/unread-count', getUnreadCount);
notificationRouter.put('/read-all', markAllNotificationsAsRead);
notificationRouter.delete('/clear-all', clearAllNotifications);
notificationRouter.get('/', getMyNotifications);
notificationRouter.put('/:id/read', markNotificationAsRead);
notificationRouter.delete('/:id', deleteNotification);

export default notificationRouter;
