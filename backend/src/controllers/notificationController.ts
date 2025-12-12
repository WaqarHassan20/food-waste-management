import { successResponse, errorResponse } from '../utils/response';
import type { AuthRequest } from '../middleware/auth';
import type  { Response } from 'express';
import { prisma } from '../db';

export const getMyNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { unreadOnly } = req.query;

    const where: any = { userId };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

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

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response
): Promise<Response> => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

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

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

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
    const { id } = req.params;

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

    return successResponse(res, null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    return errorResponse(res, 'Failed to delete notification', 500, error);
  }
};
