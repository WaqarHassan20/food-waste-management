import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw,
  PartyPopper,
  UtensilsCrossed,
  Clock,
  Sparkles,
  UserCheck,
  Megaphone,
  Mail,
  AlertCircle,
  Filter,
  Inbox,
  RefreshCw,
  LayoutDashboard,
  ArrowLeft
} from 'lucide-react';
import { notificationAPI } from '../services/api';
import type { Notification, NotificationType } from '../types';

const getNotificationIcon = (type: NotificationType): React.ReactNode => {
  const iconClass = "w-6 h-6";

  const icons: Record<NotificationType, React.ReactNode> = {
    REQUEST_CREATED: <Bell className={`${iconClass} text-blue-600`} />,
    REQUEST_APPROVED: <CheckCircle className={`${iconClass} text-green-600`} />,
    REQUEST_REJECTED: <XCircle className={`${iconClass} text-red-600`} />,
    REQUEST_CANCELLED: <RotateCcw className={`${iconClass} text-orange-600`} />,
    REQUEST_COMPLETED: <PartyPopper className={`${iconClass} text-purple-600`} />,
    NEW_FOOD_AVAILABLE: <UtensilsCrossed className={`${iconClass} text-emerald-600`} />,
    LISTING_EXPIRING_SOON: <Clock className={`${iconClass} text-amber-600`} />,
    RESTAURANT_VERIFIED: <Sparkles className={`${iconClass} text-yellow-600`} />,
    RESTAURANT_UNVERIFIED: <AlertCircle className={`${iconClass} text-red-600`} />,
    USER_VERIFIED: <UserCheck className={`${iconClass} text-teal-600`} />,
    SYSTEM_ANNOUNCEMENT: <Megaphone className={`${iconClass} text-indigo-600`} />,
  };

  return icons[type] || <Mail className={`${iconClass} text-gray-600`} />;
};

const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showClearDialog, setShowClearDialog] = useState(false);

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, [filter]);

  const loadUnreadCount = async () => {
    try {
      const response: any = await notificationAPI.getUnreadCount();
      const data = response.data || response;
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response: any = await notificationAPI.getNotifications(filter === 'unread');
      const data = response.data || response;

      let filteredData = data || [];
      if (filter === 'read') {
        filteredData = filteredData.filter((n: Notification) => n.isRead);
      }

      setNotifications(filteredData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadNotifications(), loadUnreadCount()]);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
      setUnreadCount(0);
      setShowClearDialog(false);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const handleDeleteNotification = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      loadUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id, { stopPropagation: () => { } } as any);
    }
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Dashboard Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-3 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                title="Go to Dashboard"
              >
                <LayoutDashboard className="w-6 h-6" />
              </button>
              <Bell className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
            <button
              onClick={() => setShowClearDialog(true)}
              disabled={notifications.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Filter by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              All Notifications
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === 'read'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              Read
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <Inbox className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'unread' ? 'No unread notifications' : filter === 'read' ? 'No read notifications' : 'No notifications yet'}
              </p>
              <p className="text-gray-500 text-center">
                {filter === 'unread'
                  ? "You're all caught up! Check back later for updates."
                  : filter === 'read'
                    ? "You haven't read any notifications yet."
                    : "You'll see all your notifications here when you receive them."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => {
                const icon = getNotificationIcon(notification.type);

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                      }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className="shrink-0 flex items-center justify-center w-12 h-12 rounded-full bg-gray-100">
                        {icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <span className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          <div className="flex gap-2">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                                Mark as read
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDeleteNotification(notification.id, e)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Clear All Confirmation Dialog */}
      {showClearDialog && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Clear All Notifications?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete all notifications? This action cannot be undone and all your notifications will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearDialog(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
