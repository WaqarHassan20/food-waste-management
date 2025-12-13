import React, { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { notificationAPI } from '../../services/api';
import type { Notification } from '../../types';
import { Card } from './Card';
import { Button } from './Button';

interface NotificationPanelProps {
  limit?: number;
  showActions?: boolean;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  limit = 5,
  showActions = true,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response: any = await notificationAPI.getNotifications();
      const data = response.data || response;
      setNotifications((data || []).slice(0, limit));
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all notifications? This action cannot be undone.')) {
      return;
    }
    try {
      await notificationAPI.clearAll();
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
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

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          Recent Notifications
        </h3>
        <div className="flex items-center gap-3">
          {notifications.length > 0 && (
            <>
              <span className="text-sm text-gray-500">
                {notifications.filter(n => !n.isRead).length} unread
              </span>
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                title="Clear all notifications"
              >
                <Trash2 className="w-3 h-3" />
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${!notification.isRead
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-gray-200'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {notification.message}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </span>
                </div>

                {showActions && (
                  <div className="flex gap-1 shrink-0">
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Navigate to full notifications page or modal
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            View All Notifications
          </Button>
        </div>
      )}
    </Card>
  );
};
