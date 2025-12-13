import { successResponse, errorResponse } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type { Response } from 'express';
import { prisma } from '../db';
import { NotificationService } from '../services/notificationService';

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;
    const userType = req.user!.type;
    const { unreadOnly } = req.query;

    let notifications: any[] = [];

    if (userType === 'restaurant' && restaurantId) {
      // Get restaurant notifications
      const where: any = { restaurantId };

      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      notifications = await prisma.restaurantNotification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else if (userType === 'user' && userId) {
      // Get user notifications
      const where: any = { userId };

      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      notifications = await prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return successResponse(
      res,
      notifications,
      'Notifications fetched successfully'
    );
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse(res, 'Failed to fetch notifications', 500, error);
  }
};

export const getUnreadCount = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;
    const userType = req.user!.type;

    let count = 0;

    if (userType === 'restaurant' && restaurantId) {
      count = await NotificationService.getUnreadCountForRestaurant(restaurantId);
    } else if (userType === 'user' && userId) {
      count = await NotificationService.getUnreadCountForUser(userId);
    }

    return successResponse(
      res,
      { count },
      'Unread count fetched successfully'
    );
  } catch (error) {
    console.error('Get unread count error:', error);
    return errorResponse(res, 'Failed to fetch unread count', 500, error);
  }
};

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;
    const userType = req.user!.type;
    const { id } = req.params;

    if (userType === 'restaurant' && restaurantId) {
      // Update restaurant notification
      const notification = await prisma.restaurantNotification.findUnique({
        where: { id },
      });

      if (!notification) {
        return errorResponse(res, 'Notification not found', 404);
      }

      if (notification.restaurantId !== restaurantId) {
        return errorResponse(
          res,
          'You do not have permission to update this notification',
          403
        );
      }

      const updatedNotification = await prisma.restaurantNotification.update({
        where: { id },
        data: { isRead: true },
      });

      return successResponse(
        res,
        updatedNotification,
        'Notification marked as read'
      );
    } else if (userType === 'user' && userId) {
      // Update user notification
      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        return errorResponse(res, 'Notification not found', 404);
      }

      if (notification.userId !== userId) {
        return errorResponse(
          res,
          'You do not have permission to update this notification',
          403
        );
      }

      const updatedNotification = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
      });

      return successResponse(
        res,
        updatedNotification,
        'Notification marked as read'
      );
    }

    return errorResponse(res, 'Invalid user type', 400);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return errorResponse(res, 'Failed to mark notification as read', 500, error);
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;
    const userType = req.user!.type;

    if (userType === 'restaurant' && restaurantId) {
      await NotificationService.markAllAsReadForRestaurant(restaurantId);
    } else if (userType === 'user' && userId) {
      await NotificationService.markAllAsReadForUser(userId);
    }

    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return errorResponse(
      res,
      'Failed to mark all notifications as read',
      500,
      error
    );
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;
    const userType = req.user!.type;
    const { id } = req.params;

    if (userType === 'restaurant' && restaurantId) {
      const notification = await prisma.restaurantNotification.findUnique({
        where: { id },
      });

      if (!notification) {
        return errorResponse(res, 'Notification not found', 404);
      }

      if (notification.restaurantId !== restaurantId) {
        return errorResponse(
          res,
          'You do not have permission to delete this notification',
          403
        );
      }

      await prisma.restaurantNotification.delete({
        where: { id },
      });
    } else if (userType === 'user' && userId) {
      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        return errorResponse(res, 'Notification not found', 404);
      }

      if (notification.userId !== userId) {
        return errorResponse(
          res,
          'You do not have permission to delete this notification',
          403
        );
      }

      await prisma.notification.delete({
        where: { id },
      });
    }

    return successResponse(res, null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse(res, 'Failed to delete notification', 500, error);
  }
};

export const clearAllNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const restaurantId = req.user!.restaurantId;
    const userType = req.user!.type;

    if (userType === 'restaurant' && restaurantId) {
      await prisma.restaurantNotification.deleteMany({
        where: {
          restaurantId,
        },
      });
    } else if (userType === 'user' && userId) {
      await prisma.notification.deleteMany({
        where: {
          userId,
        },
      });
    }

    return successResponse(res, null, 'All notifications cleared successfully');
  } catch (error) {
    console.error('Clear all notifications error:', error);
    return errorResponse(res, 'Failed to clear all notifications', 500, error);
  }
};
