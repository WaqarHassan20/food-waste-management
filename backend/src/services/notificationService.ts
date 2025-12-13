import { prisma } from '../db';
import { NotificationType } from '../db/generated/prisma';

interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: any;
  actionUrl?: string;
}

interface CreateRestaurantNotificationData {
  restaurantId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: any;
  actionUrl?: string;
}

export class NotificationService {
  /**
   * Create a notification for a user
   */
  static async createUserNotification(data: CreateNotificationData) {
    try {
      return await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          metadata: data.metadata || {},
          actionUrl: data.actionUrl,
        },
      });
    } catch (error) {
      console.error('Error creating user notification:', error);
      throw error;
    }
  }

  /**
   * Create a notification for a restaurant
   */
  static async createRestaurantNotification(data: CreateRestaurantNotificationData) {
    try {
      return await prisma.restaurantNotification.create({
        data: {
          restaurantId: data.restaurantId,
          title: data.title,
          message: data.message,
          type: data.type,
          metadata: data.metadata || {},
          actionUrl: data.actionUrl,
        },
      });
    } catch (error) {
      console.error('Error creating restaurant notification:', error);
      throw error;
    }
  }

  /**
   * Notify restaurant when a new request is created
   */
  static async notifyRestaurantNewRequest(
    restaurantId: string,
    userName: string,
    foodTitle: string,
    quantity: number,
    unit: string,
    requestId: string
  ) {
    return this.createRestaurantNotification({
      restaurantId,
      title: '🔔 New Food Request',
      message: `${userName} requested ${quantity} ${unit} of ${foodTitle}`,
      type: NotificationType.REQUEST_CREATED,
      metadata: { requestId, userName, foodTitle, quantity, unit },
      actionUrl: `/restaurant/requests`,
    });
  }

  /**
   * Notify user when their request is approved
   */
  static async notifyUserRequestApproved(
    userId: string,
    restaurantName: string,
    foodTitle: string,
    pickupDate: string | null,
    requestId: string
  ) {
    const pickupInfo = pickupDate
      ? ` for pickup on ${new Date(pickupDate).toLocaleDateString()}`
      : '';

    return this.createUserNotification({
      userId,
      title: '✅ Request Approved!',
      message: `${restaurantName} approved your request for ${foodTitle}${pickupInfo}`,
      type: NotificationType.REQUEST_APPROVED,
      metadata: { requestId, restaurantName, foodTitle, pickupDate },
      actionUrl: `/user/requests`,
    });
  }

  /**
   * Notify user when their request is rejected
   */
  static async notifyUserRequestRejected(
    userId: string,
    restaurantName: string,
    foodTitle: string,
    requestId: string
  ) {
    return this.createUserNotification({
      userId,
      title: '❌ Request Declined',
      message: `${restaurantName} declined your request for ${foodTitle}. Don't worry, there are other options available!`,
      type: NotificationType.REQUEST_REJECTED,
      metadata: { requestId, restaurantName, foodTitle },
      actionUrl: `/food/browse`,
    });
  }

  /**
   * Notify restaurant when a request is cancelled by user
   */
  static async notifyRestaurantRequestCancelled(
    restaurantId: string,
    userName: string,
    foodTitle: string,
    requestId: string
  ) {
    return this.createRestaurantNotification({
      restaurantId,
      title: '🔄 Request Cancelled',
      message: `${userName} cancelled their request for ${foodTitle}`,
      type: NotificationType.REQUEST_CANCELLED,
      metadata: { requestId, userName, foodTitle },
      actionUrl: `/restaurant/requests`,
    });
  }

  /**
   * Notify user when their request is marked as completed
   */
  static async notifyUserRequestCompleted(
    userId: string,
    restaurantName: string,
    foodTitle: string,
    requestId: string
  ) {
    return this.createUserNotification({
      userId,
      title: '🎉 Pickup Confirmed!',
      message: `Your pickup of ${foodTitle} from ${restaurantName} has been completed. Thank you for helping reduce food waste!`,
      type: NotificationType.REQUEST_COMPLETED,
      metadata: { requestId, restaurantName, foodTitle },
      actionUrl: `/user/history`,
    });
  }

  /**
   * Notify restaurant when food listing is expiring soon
   */
  static async notifyRestaurantListingExpiringSoon(
    restaurantId: string,
    foodTitle: string,
    expiryDate: Date,
    listingId: string
  ) {
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return this.createRestaurantNotification({
      restaurantId,
      title: '⏰ Food Expiring Soon',
      message: `Your listing "${foodTitle}" expires in ${daysUntilExpiry} day(s). Consider updating or removing it.`,
      type: NotificationType.LISTING_EXPIRING_SOON,
      metadata: { listingId, foodTitle, expiryDate, daysUntilExpiry },
      actionUrl: `/restaurant/listings`,
    });
  }

  /**
   * Notify user when restaurant is verified
   */
  static async notifyRestaurantVerified(restaurantId: string, restaurantName: string) {
    // Note: This would need admin functionality to convert restaurant to user notification
    // For now, we'll keep it as a placeholder
    return this.createRestaurantNotification({
      restaurantId,
      title: '✨ Restaurant Verified!',
      message: `Congratulations! ${restaurantName} has been verified. You can now list food items.`,
      type: NotificationType.RESTAURANT_VERIFIED,
      metadata: { restaurantName },
      actionUrl: `/restaurant/dashboard`,
    });
  }

  /**
   * Notify restaurant when verification is revoked by admin
   */
  static async notifyRestaurantUnverified(restaurantId: string, restaurantName: string) {
    return this.createRestaurantNotification({
      restaurantId,
      title: '⚠️ Verification Revoked',
      message: `${restaurantName} has been unverified by an administrator. You will not be able to list food items until re-verification. Please contact support if you believe this is an error.`,
      type: NotificationType.RESTAURANT_UNVERIFIED,
      metadata: { restaurantName },
      actionUrl: `/restaurant/dashboard`,
    });
  }

  /**
   * Notify all users about new food available (nearby or matching preferences)
   * This is a batch operation - call it when creating new listings
   */
  static async notifyUsersNewFoodAvailable(
    userIds: string[],
    restaurantName: string,
    foodTitle: string,
    category: string,
    listingId: string
  ) {
    const notifications = userIds.map(userId => ({
      userId,
      title: '🍽️ New Food Available',
      message: `${restaurantName} just listed ${foodTitle} (${category})`,
      type: NotificationType.NEW_FOOD_AVAILABLE,
      metadata: { listingId, restaurantName, foodTitle, category },
      actionUrl: `/food/${listingId}`,
    }));

    // Batch create notifications
    return Promise.all(
      notifications.map(notification => this.createUserNotification(notification))
    );
  }

  /**
   * Get unread count for user
   */
  static async getUnreadCountForUser(userId: string): Promise<number> {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Get unread count for restaurant
   */
  static async getUnreadCountForRestaurant(restaurantId: string): Promise<number> {
    return prisma.restaurantNotification.count({
      where: {
        restaurantId,
        isRead: false,
      },
    });
  }

  /**
   * Mark all notifications as read for user
   */
  static async markAllAsReadForUser(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Mark all notifications as read for restaurant
   */
  static async markAllAsReadForRestaurant(restaurantId: string) {
    return prisma.restaurantNotification.updateMany({
      where: {
        restaurantId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  /**
   * Get all admin users
   */
  static async getAdminUsers() {
    return prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
      select: {
        id: true,
      },
    });
  }

  /**
   * Notify all admins (helper function)
   */
  static async notifyAllAdmins(
    title: string,
    message: string,
    type: NotificationType,
    metadata?: any,
    actionUrl?: string
  ) {
    const admins = await this.getAdminUsers();

    return Promise.all(
      admins.map(admin =>
        this.createUserNotification({
          userId: admin.id,
          title,
          message,
          type,
          metadata: metadata || {},
          actionUrl,
        })
      )
    );
  }

  /**
   * Notify admins about new user registration
   */
  static async notifyAdminsNewUserRegistration(
    userName: string,
    userEmail: string,
    userId: string
  ) {
    return this.notifyAllAdmins(
      '👤 New User Registration',
      `${userName} (${userEmail}) just registered`,
      NotificationType.NEW_USER_REGISTRATION,
      { userId, userName, userEmail },
      `/admin/users`
    );
  }

  /**
   * Notify admins about new restaurant registration
   */
  static async notifyAdminsNewRestaurantRegistration(
    restaurantName: string,
    restaurantEmail: string,
    restaurantId: string
  ) {
    return this.notifyAllAdmins(
      '🏪 New Restaurant Registration',
      `${restaurantName} (${restaurantEmail}) registered and needs verification`,
      NotificationType.NEW_RESTAURANT_REGISTRATION,
      { restaurantId, restaurantName, restaurantEmail },
      `/admin/restaurants`
    );
  }

  /**
   * Notify admins about suspicious activity or reports
   */
  static async notifyAdminsSuspiciousActivity(
    activityType: string,
    description: string,
    metadata?: any
  ) {
    return this.notifyAllAdmins(
      '⚠️ Suspicious Activity Detected',
      description,
      NotificationType.SYSTEM_ALERT,
      { activityType, ...metadata },
      `/admin/dashboard`
    );
  }

  /**
   * Notify admins about system issues
   */
  static async notifyAdminsSystemAlert(
    alertTitle: string,
    alertMessage: string,
    metadata?: any
  ) {
    return this.notifyAllAdmins(
      `🚨 System Alert: ${alertTitle}`,
      alertMessage,
      NotificationType.SYSTEM_ALERT,
      metadata,
      `/admin/dashboard`
    );
  }

  /**
   * Notify admins about daily activity summary
   */
  static async notifyAdminsDailySummary(stats: {
    newUsers: number;
    newRestaurants: number;
    newListings: number;
    completedRequests: number;
  }) {
    const message = `Today's activity: ${stats.newUsers} new users, ${stats.newRestaurants} new restaurants, ${stats.newListings} listings, ${stats.completedRequests} completed requests`;

    return this.notifyAllAdmins(
      '📊 Daily Activity Summary',
      message,
      NotificationType.SYSTEM_ALERT,
      stats,
      `/admin/dashboard`
    );
  }

  /**
   * Notify admins when a restaurant needs verification
   */
  static async notifyAdminsRestaurantNeedsVerification(
    restaurantName: string,
    restaurantId: string,
    daysSinceRegistration: number
  ) {
    return this.notifyAllAdmins(
      '⏰ Restaurant Pending Verification',
      `${restaurantName} has been waiting for verification for ${daysSinceRegistration} days`,
      NotificationType.NEW_RESTAURANT_REGISTRATION,
      { restaurantId, restaurantName, daysSinceRegistration },
      `/admin/restaurants`
    );
  }
}
